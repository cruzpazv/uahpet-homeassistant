"""Push coordinator: holds the DP state reported by the device."""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_HOST
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .client import UahpetClient
from .const import CONF_DEVICE_ID, CONF_LOCAL_KEY, CONF_PROFILE, CONF_PROTOCOL, DOMAIN
from .profiles import PROFILES_BY_KEY

_LOGGER = logging.getLogger(__name__)

type UahpetConfigEntry = ConfigEntry[UahpetCoordinator]


class UahpetCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """DP state keyed by DP id as string (as Tuya sends it)."""

    config_entry: UahpetConfigEntry

    def __init__(self, hass: HomeAssistant, entry: UahpetConfigEntry) -> None:
        super().__init__(hass, _LOGGER, config_entry=entry, name=DOMAIN)
        self.device_id: str = entry.data[CONF_DEVICE_ID]
        self.profile = PROFILES_BY_KEY[entry.data.get(CONF_PROFILE, "litterbox")]
        self.first_data = asyncio.Event()
        self.client = UahpetClient(
            self.device_id,
            entry.data[CONF_HOST],
            entry.data[CONF_LOCAL_KEY],
            entry.data[CONF_PROTOCOL],
            on_dps=lambda dps: hass.loop.call_soon_threadsafe(self._push, dps),
            on_connection=lambda ok: hass.loop.call_soon_threadsafe(self._set_connected, ok),
        )

    @callback
    def _push(self, dps: dict[str, Any]) -> None:
        self.async_set_updated_data({**(self.data or {}), **dps})
        self.first_data.set()

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
