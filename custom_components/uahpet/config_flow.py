"""Config flow: device id + local key (+ optional IP and protocol). The device type is detected from its DPs."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.const import CONF_HOST, CONF_NAME
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    ColorRGBSelector,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
    TextSelectorConfig,
    TextSelectorType,
)

from .cats import DEFAULT_MIN_WEIGHT, DEFAULT_SMOOTHING, DEFAULT_TOLERANCE, UNIDENTIFIED
from .client import ProbeError, probe
from .const import (
    CONF_CAT_COLOR,
    CONF_CAT_NAME,
    CONF_CAT_PICTURE,
    CONF_CAT_WEIGHT,
    CONF_CATS,
    CONF_DEVICE_ID,
    CONF_LOCAL_KEY,
    CONF_MIN_WEIGHT,
    CONF_PROFILE,
    CONF_PROTOCOL,
    CONF_SMOOTHING,
    CONF_TOLERANCE,
    DOMAIN,
    PROTOCOL_AUTO,
    PROTOCOLS,
)
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

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return UahpetOptionsFlow()

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


def _kg(min_v: float, max_v: float, step: float) -> NumberSelector:
    return NumberSelector(NumberSelectorConfig(min=min_v, max=max_v, step=step, mode=NumberSelectorMode.BOX, unit_of_measurement="kg"))


class UahpetOptionsFlow(OptionsFlow):
    """Cat profiles: tell cats apart by weight, like the UAHPET app."""

    def __init__(self) -> None:
        self._cat: str | None = None

    @property
    def _cats(self) -> list[dict[str, Any]]:
        return list(self.config_entry.options.get(CONF_CATS, []))

    def _save(self, **changes: Any) -> ConfigFlowResult:
        return self.async_create_entry(data={**self.config_entry.options, **changes})

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        menu = ["add_cat"] + (["edit_cat", "remove_cat"] if self._cats else []) + ["identification"]
        return self.async_show_menu(step_id="init", menu_options=menu)

    def _cat_schema(self, cat: dict[str, Any] | None) -> vol.Schema:
        fields: dict[Any, Any] = {}
        if cat is None:
            fields[vol.Required(CONF_CAT_NAME)] = str
        fields[vol.Required(CONF_CAT_WEIGHT, default=(cat or {}).get(CONF_CAT_WEIGHT, 4.0))] = _kg(0.5, 15, 0.05)
        fields[vol.Optional(CONF_CAT_PICTURE, default=(cat or {}).get(CONF_CAT_PICTURE) or "")] = str
        fields[vol.Optional(CONF_CAT_COLOR, description={"suggested_value": (cat or {}).get(CONF_CAT_COLOR)})] = ColorRGBSelector()
        return vol.Schema(fields)

    async def async_step_add_cat(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            name = user_input[CONF_CAT_NAME].strip()
            taken = {c[CONF_CAT_NAME].casefold() for c in self._cats} | {UNIDENTIFIED}
            if not name:
                errors[CONF_CAT_NAME] = "invalid_name"
            elif name.casefold() in taken:
                errors[CONF_CAT_NAME] = "duplicate_name"
            else:
                cat = {CONF_CAT_NAME: name, CONF_CAT_WEIGHT: float(user_input[CONF_CAT_WEIGHT]),
                       CONF_CAT_PICTURE: user_input.get(CONF_CAT_PICTURE, "").strip() or None,
                       CONF_CAT_COLOR: user_input.get(CONF_CAT_COLOR)}
                return self._save(**{CONF_CATS: [*self._cats, cat]})
        return self.async_show_form(step_id="add_cat", data_schema=self._cat_schema(None), errors=errors)

    def _pick_schema(self) -> vol.Schema:
        names = [c[CONF_CAT_NAME] for c in self._cats]
        return vol.Schema({vol.Required(CONF_CAT_NAME): SelectSelector(SelectSelectorConfig(options=names, mode=SelectSelectorMode.LIST))})

    async def async_step_edit_cat(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            self._cat = user_input[CONF_CAT_NAME]
            return await self.async_step_edit_cat_details()
        return self.async_show_form(step_id="edit_cat", data_schema=self._pick_schema())

    async def async_step_edit_cat_details(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        cat = next(c for c in self._cats if c[CONF_CAT_NAME] == self._cat)
        if user_input is not None:
            cats = [
                {**c, CONF_CAT_WEIGHT: float(user_input[CONF_CAT_WEIGHT]), CONF_CAT_PICTURE: user_input.get(CONF_CAT_PICTURE, "").strip() or None,
                 CONF_CAT_COLOR: user_input.get(CONF_CAT_COLOR) or c.get(CONF_CAT_COLOR)}
                if c[CONF_CAT_NAME] == self._cat else c
                for c in self._cats
            ]
            return self._save(**{CONF_CATS: cats})
        return self.async_show_form(
            step_id="edit_cat_details", data_schema=self._cat_schema(cat), description_placeholders={"cat": self._cat}
        )

    async def async_step_remove_cat(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            return self._save(**{CONF_CATS: [c for c in self._cats if c[CONF_CAT_NAME] != user_input[CONF_CAT_NAME]]})
        return self.async_show_form(step_id="remove_cat", data_schema=self._pick_schema())

    async def async_step_identification(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            return self._save(**user_input)
        o = self.config_entry.options
        schema = vol.Schema({
            vol.Required(CONF_TOLERANCE, default=o.get(CONF_TOLERANCE, DEFAULT_TOLERANCE)): _kg(0.1, 5, 0.1),
            vol.Required(CONF_SMOOTHING, default=o.get(CONF_SMOOTHING, DEFAULT_SMOOTHING)): NumberSelector(
                NumberSelectorConfig(min=0, max=1, step=0.05, mode=NumberSelectorMode.SLIDER)),
            vol.Required(CONF_MIN_WEIGHT, default=o.get(CONF_MIN_WEIGHT, DEFAULT_MIN_WEIGHT)): _kg(0, 10, 0.1),
        })
        return self.async_show_form(step_id="identification", data_schema=schema)
