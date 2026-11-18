"""Push coordinator: holds the DP state reported by the device, plus derived values (tracker)."""

from __future__ import annotations

import asyncio
from datetime import timedelta
import logging
import time
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_HOST
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_call_later, async_track_time_change, async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from .cats import DEFAULT_MIN_WEIGHT, DEFAULT_SMOOTHING, DEFAULT_TOLERANCE, CatIdentifier
from .client import UahpetClient
from .const import (
    CONF_CAT_ALERT_HOURS,
    CONF_CAT_COLOR,
    CONF_CAT_NAME,
    CONF_CAT_NOTIFY_VISIT,
    CONF_CAT_PICTURE,
    CONF_CAT_WEIGHT,
    CONF_CATS,
    CONF_DEVICE_ID,
    CONF_LOCAL_KEY,
    CONF_MIN_WEIGHT,
    CONF_NOTIFY_HEALTH,
    CONF_NOTIFY_TARGETS,
    CONF_NOTIFY_UNIDENTIFIED,
    CONF_PROFILE,
    CONF_PROTOCOL,
    CONF_RECORD_UNIDENTIFIED,
    PENDING_CATS,
    CONF_SMOOTHING,
    CONF_TOLERANCE,
    DOMAIN,
)
from .messages import text
from .profiles import PROFILES_BY_KEY

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1
VISIT_PRE = 20  # s: weight / duration that changed this long before the visit counter belong to the visit
VISIT_TIMEOUT = 60  # s: fire the visit anyway if they never arrive (e.g. same values not re-sent)
VISIT_SETTLE = 1  # s: small debounce once everything arrived

type UahpetConfigEntry = ConfigEntry[UahpetCoordinator]


def signal_visit(entry_id: str) -> str:
    return f"{DOMAIN}_visit_{entry_id}"


class UahpetCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """DP state keyed by DP id as string (as Tuya sends it)."""

    config_entry: UahpetConfigEntry

    def __init__(self, hass: HomeAssistant, entry: UahpetConfigEntry) -> None:
        super().__init__(hass, _LOGGER, config_entry=entry, name=DOMAIN)
        self.device_id: str = entry.data[CONF_DEVICE_ID]
        self.profile = PROFILES_BY_KEY[entry.data.get(CONF_PROFILE, "litterbox")]
        self.tracker = self.profile.tracker_factory() if self.profile.tracker_factory else None
        self.cats = self._cats_from_options(entry.options) if self.profile.visit_data else None
        self.options = dict(entry.options)
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, f"{DOMAIN}.{entry.entry_id}")
        self.first_data = asyncio.Event()
        self._seen: dict[str, float] = {}  # DP id -> monotonic time it was last reported
        self._changed: dict[str, float] = {}  # DP id -> monotonic time its value last changed
        self._visit_at: float | None = None  # monotonic time of a visit waiting for its weight / duration
        self._visit_timer: Any = None
        self.client = UahpetClient(
            self.device_id,
            entry.data[CONF_HOST],
            entry.data[CONF_LOCAL_KEY],
            entry.data[CONF_PROTOCOL],
            on_dps=lambda dps: hass.loop.call_soon_threadsafe(self._push, dps),
            on_connection=lambda ok: hass.loop.call_soon_threadsafe(self._set_connected, ok),
        )

    @staticmethod
    def _cats_from_options(options: dict[str, Any]) -> CatIdentifier:
        return CatIdentifier(
            profiles={
                c[CONF_CAT_NAME]: {
                    "weight": float(c[CONF_CAT_WEIGHT]),
                    "picture": c.get(CONF_CAT_PICTURE) or None,
                    "color": "#{:02x}{:02x}{:02x}".format(*c[CONF_CAT_COLOR]) if c.get(CONF_CAT_COLOR) else None,
                    "notify_visit": bool(c.get(CONF_CAT_NOTIFY_VISIT, False)),
                    "alert_hours": float(c.get(CONF_CAT_ALERT_HOURS) or 0),
                }
                for c in options.get(CONF_CATS, [])
            },
            tolerance=float(options.get(CONF_TOLERANCE, DEFAULT_TOLERANCE)),
            smoothing=float(options.get(CONF_SMOOTHING, DEFAULT_SMOOTHING)),
            min_weight=float(options.get(CONF_MIN_WEIGHT, DEFAULT_MIN_WEIGHT)),
            record_unidentified=bool(options.get(CONF_RECORD_UNIDENTIFIED, True)),
        )

    def _as_dict(self) -> dict[str, Any]:
        return {
            "tracker": self.tracker.as_dict() if self.tracker else None,
            "cats": self.cats.as_dict() if self.cats else None,
        }

    @callback
    def _save(self) -> None:
        self._store.async_delay_save(self._as_dict, 2)

    async def async_flush(self) -> None:
        if self.tracker or self.cats:
            await self._store.async_save(self._as_dict())

    async def async_load(self) -> None:
        data = await self._store.async_load() or {}
        if "tracker" not in data:  # 0.2 stored the tracker alone
            data = {"tracker": data}
        if self.cats:
            # cats imported while setting the litter box up (no stored state yet)
            pending = self.hass.data.get(PENDING_CATS, {}).pop(self.device_id, None)
            self.cats.load(data.get("cats") or pending)
        if self.tracker:
            self.tracker.load(data.get("tracker"))
            # Day counters roll over at midnight even without device updates.
            self.config_entry.async_on_unload(
                async_track_time_change(self.hass, self._on_midnight, hour=0, minute=0, second=1)
            )
        if self.cats and any(p["alert_hours"] for p in self.cats.profiles.values()):
            self.config_entry.async_on_unload(
                async_track_time_interval(self.hass, self._check_inactivity, timedelta(minutes=10))
            )

    @callback
    def _on_midnight(self, _now: Any) -> None:
        if self.cats and self.cats.profiles:
            self._notify_health(self.cats.roll(dt_util.now()))
            self._save()
        self.async_update_listeners()

    # ---------- cat profiles: notifications and corrections ----------

    @callback
    def _send(self, message: str, picture: str | None = None) -> None:
        targets = self.options.get(CONF_NOTIFY_TARGETS) or []
        if targets:
            self.config_entry.async_create_background_task(
                self.hass, self._async_send(targets, message, picture), f"{DOMAIN}_notify"
            )

    async def _async_send(self, targets: list[str], message: str, picture: str | None) -> None:
        for target in targets:
            domain, _, service = target.partition(".")
            if not self.hass.services.has_service(domain, service):
                _LOGGER.warning("Notify service %s not found", target)
                continue
            data: dict[str, Any] = {"title": f"🐈 {self.config_entry.title}", "message": message}
            if picture and service.startswith("mobile_app_"):
                data["data"] = {"image": picture}
            try:
                await self.hass.services.async_call(domain, service, data, blocking=True)
            except Exception:  # noqa: BLE001 - one bad target must not stop the others
                _LOGGER.exception("Failed to notify %s", target)

    def _picture(self, cat: str | None) -> str | None:
        return (self.cats.profiles.get(cat) or {}).get("picture") if self.cats and cat else None

    @callback
    def _notify_health(self, alerts: list[tuple[str, str, Any]]) -> None:
        if self.options.get(CONF_NOTIFY_HEALTH, True):
            lang = self.hass.config.language
            for cat, reason, value in alerts:
                self._send(text(lang, f"health_{reason}", cat=cat, value=value), self._picture(cat))

    @callback
    def _notify_visit(self, visit: dict[str, Any]) -> None:
        lang, cat = self.hass.config.language, visit["cat"]
        if cat in self.cats.profiles:
            if self.cats.profiles[cat]["notify_visit"]:
                self._send(text(lang, "visit", cat=cat, weight=visit["weight"]), self._picture(cat))
        elif self.options.get(CONF_NOTIFY_UNIDENTIFIED) and visit.get("reason"):
            self._send(text(lang, f"unidentified_{visit['reason']}", weight=visit["weight"], cat=visit.get("likely_cat") or ""))
        self._notify_health(visit.get("health", []))

    @callback
    def _check_inactivity(self, _now: Any = None) -> None:
        hours = {n: p["alert_hours"] for n, p in self.cats.profiles.items()}
        lang = self.hass.config.language
        late = self.cats.inactive(dt_util.now(), hours)
        for cat, limit in late:
            self._send(text(lang, "inactive", cat=cat, hours=f"{limit:g}"), self._picture(cat))
        if late:
            self._save()

    @callback
    def async_cats_changed(self) -> None:
        """After a correction (reassign, recalibrate, clear): save and refresh the entities."""
        self._save()
        self.async_update_listeners()

    @callback
    def _push(self, dps: dict[str, Any]) -> None:
        old = self.data or {}
        new = {**old, **dps}
        now_m = time.monotonic()
        for dp, value in dps.items():
            self._seen[dp] = now_m
            # Full status polls re-send every DP: before the counter only a real change counts.
            if self.first_data.is_set() and old.get(dp) != value:
                self._changed[dp] = now_m
        if self.tracker and self.first_data.is_set():
            result = self.tracker.update(old, new, dt_util.now())
            if result.changed:
                self._save()
            if result.visit_ended and self.profile.visit_data:
                self._start_visit(now_m)
        self.async_set_updated_data(new)
        self.first_data.set()
        if self._visit_at is not None:
            self._check_visit()

    @callback
    def _start_visit(self, now_m: float) -> None:
        if self._visit_at is not None:  # previous visit still waiting: report it now
            self._visit_at = None
            self._emit_visit()
        self._cancel_visit_timeout()
        self._visit_at = now_m
        self._visit_timer = async_call_later(self.hass, VISIT_TIMEOUT, self._on_visit_timeout)

    @callback
    def _check_visit(self) -> None:
        """Fire once every visit DP (weight, duration) was reported around the counter tick."""
        at = self._visit_at
        if all(
            self._seen.get(dp, -1e9) >= at or self._changed.get(dp, -1e9) >= at - VISIT_PRE
            for dp in self.profile.visit_dps
        ):
            self._cancel_visit_timeout()
            self._visit_at = None
            async_call_later(self.hass, VISIT_SETTLE, self._emit_visit_later)

    @callback
    def _cancel_visit_timeout(self) -> None:
        if self._visit_timer:
            self._visit_timer()
            self._visit_timer = None

    @callback
    def _on_visit_timeout(self, _now: Any) -> None:
        self._visit_timer = None
        if self._visit_at is not None:
            self._visit_at = None
            self._emit_visit()

    @callback
    def _emit_visit_later(self, _now: Any) -> None:
        self._emit_visit()

    @callback
    def _emit_visit(self) -> None:
        dps = self.data or {}
        data = self.profile.visit_data(dps)
        if self.cats and self.cats.profiles:
            reason = self.profile.visit_reason(dps) if self.profile.visit_reason else None
            visit = self.cats.record(data.get("weight"), data.get("duration"), dt_util.now(), reason)
            if visit is not None:
                data = {**data, "cat": visit["cat"]}
                if "reason" in visit:
                    data["reason"] = visit["reason"]
                self._notify_visit(visit)
            self._save()
            self.async_update_listeners()
        async_dispatcher_send(self.hass, signal_visit(self.config_entry.entry_id), data)

    @callback
    def _set_connected(self, connected: bool) -> None:
        if not connected:
            self.async_set_update_error(ConnectionError("Device disconnected"))

    async def async_set_dp(self, dp: int, value: Any, optimistic: bool = True) -> None:
        if not self.last_update_success:
            raise HomeAssistantError("Device is offline")
        self.client.set_dp(dp, value)
        if optimistic:
            self._push({str(int(dp)): value})
