"""Config flow: device id + local key (+ optional IP and protocol). The device type is detected from its DPs."""

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
from .const import CONF_DEVICE_ID, CONF_LOCAL_KEY, CONF_PROFILE, CONF_PROTOCOL, DOMAIN, PROTOCOL_AUTO, PROTOCOLS
from .profiles import Profile, detect_profile

_LOGGER = logging.getLogger(__name__)

_PROTOCOL = SelectSelector(SelectSelectorConfig(options=PROTOCOLS, mode=SelectSelectorMode.DROPDOWN))
_SECRET = TextSelector(TextSelectorConfig(type=TextSelectorType.PASSWORD))

CONNECTION_SCHEMA = {
    vol.Required(CONF_LOCAL_KEY): _SECRET,
    vol.Optional(CONF_HOST, default=""): str,
    vol.Required(CONF_PROTOCOL, default=PROTOCOL_AUTO): _PROTOCOL,
}
USER_SCHEMA = vol.Schema({vol.Optional(CONF_NAME, default=""): str, vol.Required(CONF_DEVICE_ID): str, **CONNECTION_SCHEMA})
RECONFIGURE_SCHEMA = vol.Schema(CONNECTION_SCHEMA)


class UahpetConfigFlow(ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def _connect(
        self, device_id: str, user_input: dict[str, Any]
    ) -> tuple[dict[str, Any] | None, Profile | None, str | None]:
        """Probe the device. Returns (connection data, profile, error key)."""
        key = user_input[CONF_LOCAL_KEY].strip()
        try:
            host, version, dps = await self.hass.async_add_executor_job(
                probe, device_id, user_input.get(CONF_HOST, "").strip(), key, user_input[CONF_PROTOCOL]
            )
        except ProbeError as err:
            return None, None, err.reason
        except Exception:  # noqa: BLE001
            _LOGGER.exception("Unexpected error probing UAHPET device")
            return None, None, "unknown"
        profile = detect_profile(dps)
        if profile is None:
            _LOGGER.warning("Device %s is not a supported UAHPET device. Reported DPs: %s", device_id, dps)
            return None, None, "not_supported"
        return {CONF_HOST: host, CONF_LOCAL_KEY: key, CONF_PROTOCOL: version}, profile, None

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            device_id = user_input[CONF_DEVICE_ID].strip()
            await self.async_set_unique_id(device_id)
            self._abort_if_unique_id_configured()
            data, profile, error = await self._connect(device_id, user_input)
            if data and profile:
                return self.async_create_entry(
                    title=user_input.get(CONF_NAME, "").strip() or profile.default_name,
                    data={CONF_DEVICE_ID: device_id, CONF_PROFILE: profile.key, **data},
                )
            errors["base"] = error or "unknown"
        return self.async_show_form(
            step_id="user", data_schema=self.add_suggested_values_to_schema(USER_SCHEMA, user_input), errors=errors
        )

    async def async_step_reconfigure(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        entry = self._get_reconfigure_entry()
        errors: dict[str, str] = {}
        if user_input is not None:
            data, profile, error = await self._connect(entry.data[CONF_DEVICE_ID], user_input)
            if data and profile and profile.key != entry.data.get(CONF_PROFILE):
                error = "wrong_device"
            elif data:
                return self.async_update_reload_and_abort(entry, data_updates=data)
            errors["base"] = error or "unknown"
        suggested = user_input or {CONF_HOST: entry.data.get(CONF_HOST, "")}
        return self.async_show_form(
            step_id="reconfigure",
            data_schema=self.add_suggested_values_to_schema(RECONFIGURE_SCHEMA, suggested),
            errors=errors,
        )
