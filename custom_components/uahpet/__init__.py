"""UAHPET: local Tuya integration for UAHPET pet devices (every DP, not only the standard ones)."""

from __future__ import annotations

import asyncio

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.config_entries import ConfigEntryState
from homeassistant.const import CONF_HOST, Platform
from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.exceptions import ConfigEntryNotReady, ServiceValidationError
from homeassistant.helpers import config_validation as cv, device_registry as dr, entity_registry as er
from homeassistant.helpers.typing import ConfigType

from .const import CONF_DEVICE_ID, DOMAIN
from .coordinator import UahpetConfigEntry, UahpetCoordinator
from .cats import RECALIBRATE_SAMPLES
from .frontend import async_register_cards
from .pictures import async_register_static_path
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


ENTRY = "config_entry_id"
CAT_SCHEMA = vol.Schema({vol.Required("cat"): cv.string, vol.Optional(ENTRY): cv.string})
RECALIBRATE_SCHEMA = CAT_SCHEMA.extend({
    vol.Optional("weight"): vol.All(vol.Coerce(float), vol.Range(min=0.3, max=20)),
    vol.Optional("samples", default=RECALIBRATE_SAMPLES): vol.All(vol.Coerce(int), vol.Range(min=1, max=20)),
})
CLEAR_SCHEMA = vol.Schema({vol.Optional(ENTRY): cv.string})


def _cat_coordinator(hass: HomeAssistant, call: ServiceCall) -> UahpetCoordinator:
    entries = [
        e for e in hass.config_entries.async_entries(DOMAIN)
        if e.state is ConfigEntryState.LOADED and e.runtime_data.cats and e.runtime_data.cats.profiles
    ]
    if entry_id := call.data.get(ENTRY):
        entries = [e for e in entries if e.entry_id == entry_id]
    if len(entries) != 1:
        raise ServiceValidationError(
            "Specify config_entry_id when more than one UAHPET litter box has cats" if entries else "No UAHPET litter box with cats"
        )
    return entries[0].runtime_data


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    websocket_api.async_register_command(hass, ws_visits)

    async def _run(call: ServiceCall, action) -> None:
        coordinator = _cat_coordinator(hass, call)
        try:
            action(coordinator.cats)
        except ValueError as err:
            raise ServiceValidationError(str(err)) from err
        coordinator.async_cats_changed()

    async def _reassign(call: ServiceCall) -> None:
        await _run(call, lambda cats: cats.reassign_last(call.data["cat"]))

    async def _recalibrate(call: ServiceCall) -> None:
        await _run(call, lambda cats: cats.recalibrate(call.data["cat"], call.data.get("weight"), call.data["samples"]))

    async def _clear(call: ServiceCall) -> None:
        await _run(call, lambda cats: cats.clear_unidentified())

    hass.services.async_register(DOMAIN, "reassign_last_visit", _reassign, schema=CAT_SCHEMA)
    hass.services.async_register(DOMAIN, "recalibrate_weight", _recalibrate, schema=RECALIBRATE_SCHEMA)
    hass.services.async_register(DOMAIN, "clear_unidentified_visits", _clear, schema=CLEAR_SCHEMA)
    await async_register_static_path(hass)
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
        keep = {f"{device_id}_{k}" for k in ("last_visit", "unidentified_today", "show_unidentified", "clear_unidentified")}
        for name in coordinator.cats.names:
            keep |= {f"{device_id}_{s}" for s in cat_unique_suffixes(name)}
    reg = er.async_get(hass)
    for ent in er.async_entries_for_config_entry(reg, entry.entry_id):
        uid = ent.unique_id
        fixed = ("last_visit", "unidentified_today", "show_unidentified", "clear_unidentified")
        is_cat = uid.startswith(f"{device_id}_cat_") or uid in {f"{device_id}_{k}" for k in fixed}
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
