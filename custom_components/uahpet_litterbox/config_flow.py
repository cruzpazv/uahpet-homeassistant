"""Config flow: device id + local key (+ optional IP and protocol)."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from homeassistant.const import CONF_HOST, CONF_NAME
from homeassistant.helpers.selector import (
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
    TextSelectorConfig,
    TextSelectorType,
)

from .client import ProbeError, probe
from .const import (
    CONF_DEVICE_ID,
    CONF_LOCAL_KEY,
    CONF_PROTOCOL,
    DEFAULT_NAME,
    DOMAIN,
    PROTOCOL_AUTO,
    PROTOCOLS,
)
from .dps import DP

_LOGGER = logging.getLogger(__name__)

_PROTOCOL = SelectSelector(SelectSelectorConfig(options=PROTOCOLS, mode=SelectSelectorMode.DROPDOWN))
_SECRET = TextSelector(TextSelectorConfig(type=TextSelectorType.PASSWORD))

CONNECTION_SCHEMA = {
    vol.Required(CONF_LOCAL_KEY): _SECRET,
    vol.Optional(CONF_HOST, default=""): str,
    vol.Required(CONF_PROTOCOL, default=PROTOCOL_AUTO): _PROTOCOL,
}
USER_SCHEMA = vol.Schema(
    {vol.Required(CONF_NAME, default=DEFAULT_NAME): str, vol.Required(CONF_DEVICE_ID): str, **CONNECTION_SCHEMA}
)
RECONFIGURE_SCHEMA = vol.Schema(CONNECTION_SCHEMA)


class LitterboxConfigFlow(ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def _connect(self, device_id: str, user_input: dict[str, Any]) -> tuple[dict[str, Any] | None, str | None]:
        """Probe the device. Returns (connection data, error key)."""
        key = user_input[CONF_LOCAL_KEY].strip()
        try:
            host, version, dps = await self.hass.async_add_executor_job(
                probe, device_id, user_input.get(CONF_HOST, "").strip(), key, user_input[CONF_PROTOCOL]
            )
        except ProbeError as err:
            return None, err.reason
        except Exception:  # noqa: BLE001
            _LOGGER.exception("Unexpected error probing litter box")
            return None, "unknown"
        if str(DP.CAT_WEIGHT) not in dps and str(DP.WORK_STATUS) not in dps:
            _LOGGER.warning("Device %s does not look like a UAHPET litter box: %s", device_id, dps)
            return None, "not_supported"
        return {CONF_HOST: host, CONF_LOCAL_KEY: key, CONF_PROTOCOL: version}, None

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            device_id = user_input[CONF_DEVICE_ID].strip()
            await self.async_set_unique_id(device_id)
            self._abort_if_unique_id_configured()
            data, error = await self._connect(device_id, user_input)
            if data:
                return self.async_create_entry(title=user_input[CONF_NAME], data={CONF_DEVICE_ID: device_id, **data})
            errors["base"] = error or "unknown"
        return self.async_show_form(
            step_id="user", data_schema=self.add_suggested_values_to_schema(USER_SCHEMA, user_input), errors=errors
        )

    async def async_step_reconfigure(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        entry = self._get_reconfigure_entry()
        errors: dict[str, str] = {}
        if user_input is not None:
            data, error = await self._connect(entry.data[CONF_DEVICE_ID], user_input)
            if data:
                return self.async_update_reload_and_abort(entry, data_updates=data)
            errors["base"] = error or "unknown"
        suggested = user_input or {CONF_HOST: entry.data.get(CONF_HOST, "")}
        return self.async_show_form(
            step_id="reconfigure",
            data_schema=self.add_suggested_values_to_schema(RECONFIGURE_SCHEMA, suggested),
            errors=errors,
        )
