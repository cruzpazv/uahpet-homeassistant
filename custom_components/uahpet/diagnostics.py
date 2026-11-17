"""Diagnostics (local key redacted)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.core import HomeAssistant

from .const import CONF_LOCAL_KEY
from .coordinator import UahpetConfigEntry


async def async_get_config_entry_diagnostics(hass: HomeAssistant, entry: UahpetConfigEntry) -> dict[str, Any]:
    coordinator = entry.runtime_data
    return {
        "entry": async_redact_data(dict(entry.data), {CONF_LOCAL_KEY}),
        "profile": coordinator.profile.key,
        "connected": coordinator.last_update_success,
        "dps": coordinator.data,
    }
