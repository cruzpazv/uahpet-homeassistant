"""UAHPET Litterbox: local Tuya integration exposing every DP of the UAHPET litter box."""

from __future__ import annotations

import asyncio

from homeassistant.const import CONF_HOST, Platform
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .const import DOMAIN
from .coordinator import LitterboxConfigEntry, LitterboxCoordinator
from .frontend import async_register_cards

PLATFORMS = [
    Platform.BINARY_SENSOR,
    Platform.BUTTON,
    Platform.NUMBER,
    Platform.SELECT,
    Platform.SENSOR,
    Platform.SWITCH,
]
FIRST_DATA_TIMEOUT = 20

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    await async_register_cards(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: LitterboxConfigEntry) -> bool:
    coordinator = LitterboxCoordinator(hass, entry)
    coordinator.client.start()
    try:
        async with asyncio.timeout(FIRST_DATA_TIMEOUT):
            await coordinator.first_data.wait()
    except TimeoutError as err:
        await hass.async_add_executor_job(coordinator.client.stop)
        raise ConfigEntryNotReady(f"No response from litter box at {entry.data[CONF_HOST]}") from err

    entry.runtime_data = coordinator
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: LitterboxConfigEntry) -> bool:
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        await hass.async_add_executor_job(entry.runtime_data.client.stop)
    return unloaded
