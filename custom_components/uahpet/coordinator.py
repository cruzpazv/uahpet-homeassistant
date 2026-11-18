"""Push coordinator: holds the DP state reported by the device, plus derived values (tracker)."""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_HOST
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_call_later, async_track_time_change
from homeassistant.helpers.storage import Store
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from .client import UahpetClient
from .const import CONF_DEVICE_ID, CONF_LOCAL_KEY, CONF_PROFILE, CONF_PROTOCOL, DOMAIN
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

    async def async_load(self) -> None:
        if self.tracker:
            self.tracker.load(await self._store.async_load())
            # Day counters roll over at midnight even without device updates.
            self.config_entry.async_on_unload(
                async_track_time_change(self.hass, self._on_midnight, hour=0, minute=0, second=1)
            )

    @callback
    def _on_midnight(self, _now: Any) -> None:
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
                self._store.async_delay_save(self.tracker.as_dict, 2)
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
        data = self.profile.visit_data(self.data or {})
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
