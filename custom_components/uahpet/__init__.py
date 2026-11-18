"""UAHPET: local Tuya integration for UAHPET pet devices (every DP, not only the standard ones)."""

from __future__ import annotations

import asyncio

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.config_entries import ConfigEntryState
from homeassistant.const import CONF_HOST, Platform
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.helpers import config_validation as cv, device_registry as dr, entity_registry as er
from homeassistant.helpers.typing import ConfigType

from .const import CONF_DEVICE_ID, DOMAIN
from .coordinator import UahpetConfigEntry, UahpetCoordinator
from .frontend import async_register_cards
from .sensor import cat_unique_suffixes

PLATFORMS = [
    Platform.BINARY_SENSOR,
    Platform.BUTTON,
    Platform.EVENT,
    Platform.NUMBER,
    Platform.SELECT,
    Platform.SENSOR,
    Platform.SWITCH,
]
FIRST_DATA_TIMEOUT = 20

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    websocket_api.async_register_command(hass, ws_visits)
    await async_register_cards(hass)
    return True


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/visits",
        vol.Optional("device_id"): str,
        vol.Optional("offset", default=0): vol.All(int, vol.Range(min=0)),
        vol.Optional("limit", default=0): vol.All(int, vol.Range(min=0)),  # 0 = all
    }
)
@callback
def ws_visits(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    """Visits identified by the built-in cat profiles, newest first."""
    entries = [
        e for e in hass.config_entries.async_entries(DOMAIN)
        if e.state is ConfigEntryState.LOADED and e.runtime_data.cats
    ]
    if device_id := msg.get("device_id"):
        device = dr.async_get(hass).async_get(device_id)
        entries = [e for e in entries if device and e.entry_id in device.config_entries]
    if not entries:
        connection.send_error(msg["id"], "not_found", "No UAHPET litter box with cat profiles")
        return
    history = entries[0].runtime_data.cats.history
    end = msg["offset"] + msg["limit"] if msg["limit"] else None
    connection.send_result(msg["id"], {"total": len(history), "history": history[msg["offset"]:end]})


@callback
def _remove_stale_cat_entities(hass: HomeAssistant, entry: UahpetConfigEntry) -> None:
    """Entities of cats removed in the options (or all, when no cat is left)."""
    coordinator = entry.runtime_data
    device_id = entry.data[CONF_DEVICE_ID]
    keep: set[str] = set()
    if coordinator.cats and coordinator.cats.profiles:
        keep = {f"{device_id}_{k}" for k in ("last_visit", "unidentified_today")}
        for name in coordinator.cats.names:
            keep |= {f"{device_id}_{s}" for s in cat_unique_suffixes(name)}
    reg = er.async_get(hass)
    for ent in er.async_entries_for_config_entry(reg, entry.entry_id):
        uid = ent.unique_id
        is_cat = uid.startswith(f"{device_id}_cat_") or uid in (f"{device_id}_last_visit", f"{device_id}_unidentified_today")
        if is_cat and uid not in keep:
            reg.async_remove(ent.entity_id)


async def _async_options_updated(hass: HomeAssistant, entry: UahpetConfigEntry) -> None:
    if entry.options != entry.runtime_data.options:  # cat profiles changed (not a reconfigure)
        await hass.config_entries.async_reload(entry.entry_id)


async def async_setup_entry(hass: HomeAssistant, entry: UahpetConfigEntry) -> bool:
    coordinator = UahpetCoordinator(hass, entry)
    await coordinator.async_load()
    coordinator.client.start()
    try:
        async with asyncio.timeout(FIRST_DATA_TIMEOUT):
            await coordinator.first_data.wait()
    except TimeoutError as err:
        await hass.async_add_executor_job(coordinator.client.stop)
        raise ConfigEntryNotReady(f"No response from UAHPET device at {entry.data[CONF_HOST]}") from err

    entry.runtime_data = coordinator
    _remove_stale_cat_entities(hass, entry)
    entry.async_on_unload(entry.add_update_listener(_async_options_updated))
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: UahpetConfigEntry) -> bool:
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        await entry.runtime_data.async_flush()  # a reload must not lose the pending save
        await hass.async_add_executor_job(entry.runtime_data.client.stop)
    return unloaded
