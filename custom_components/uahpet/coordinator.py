"""Push coordinator: holds the DP state reported by the device, plus derived values (tracker)."""

from __future__ import annotations

import asyncio
import logging
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
VISIT_SETTLE = 5  # s: the device reports weight / duration around the visit counter, wait for both

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
        if self.tracker and self.first_data.is_set():
            result = self.tracker.update(old, new, dt_util.now())
            if result.changed:
                self._store.async_delay_save(self.tracker.as_dict, 2)
            if result.visit_ended:
                async_call_later(self.hass, VISIT_SETTLE, self._fire_visit)
        self.async_set_updated_data(new)
        self.first_data.set()

    @callback
    def _fire_visit(self, _now: Any) -> None:
        async_dispatcher_send(self.hass, signal_visit(self.config_entry.entry_id), self.profile.visit_data(self.data or {}))

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
