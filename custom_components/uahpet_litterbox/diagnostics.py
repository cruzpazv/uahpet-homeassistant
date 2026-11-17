"""Diagnostics (local key redacted)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.core import HomeAssistant

from .const import CONF_LOCAL_KEY
from .coordinator import LitterboxConfigEntry


async def async_get_config_entry_diagnostics(hass: HomeAssistant, entry: LitterboxConfigEntry) -> dict[str, Any]:
    coordinator = entry.runtime_data
    return {
        "entry": async_redact_data(dict(entry.data), {CONF_LOCAL_KEY}),
        "connected": coordinator.last_update_success,
        "dps": coordinator.data,
    }
