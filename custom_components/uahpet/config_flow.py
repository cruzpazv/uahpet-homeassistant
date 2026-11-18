"""Config flow: device id + local key (+ optional IP and protocol). The device type is detected from its DPs."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from pathlib import Path

from homeassistant.config_entries import ConfigEntry, ConfigEntryState, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.const import CONF_HOST, CONF_NAME
from homeassistant.core import callback
from homeassistant.helpers.storage import Store
from homeassistant.helpers.selector import (
    BooleanSelector,
    MediaSelector,
    MediaSelectorConfig,
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
from .pictures import PictureError, async_copy_picture, async_delete_pictures, async_store_picture
from .const import (
    CONF_CAT_ALERT_HOURS,
    CONF_CAT_COLOR,
    CONF_CAT_NAME,
    CONF_CAT_NOTIFY_VISIT,
    CONF_CAT_PICTURE,
    CONF_CAT_WEIGHT,
    CONF_CATS,
    CONF_DEVICE_ID,
    CONF_LOCAL_KEY,
    CONF_MIN_WEIGHT,
    CONF_NOTIFY_HEALTH,
    CONF_NOTIFY_TARGETS,
    CONF_NOTIFY_UNIDENTIFIED,
    CONF_PICTURE_MEDIA,
    CONF_PROFILE,
    CONF_PROTOCOL,
    CONF_RECORD_UNIDENTIFIED,
    CONF_REMOVE_PICTURE,
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


PHOTO = MediaSelector(MediaSelectorConfig(accept=["image/*"]))
LCI = "litter_cat_identifier"
LCI_PICTURES = f"/{LCI}_pictures/"


async def _resolve_picture(hass, user_input: dict[str, Any], current: str | None) -> str | None:
    """Media pick > typed URL/path > keep current (unless removed). Raises PictureError."""
    if user_input.get(CONF_REMOVE_PICTURE):
        return None
    media = user_input.get(CONF_PICTURE_MEDIA)
    if media and media.get("media_content_id"):
        return await async_store_picture(hass, media["media_content_id"])
    typed = (user_input.get(CONF_CAT_PICTURE) or "").strip()
    return typed or current


async def _import_lci(hass, lci) -> tuple[list[dict[str, Any]], dict[str, Any], dict[str, Any]]:
    """Cats, settings and state of a Litter Cat Identifier entry, in UAHPET's format."""
    if lci.state is ConfigEntryState.LOADED:
        data = lci.runtime_data._as_dict()  # freshest values
    else:
        data = await Store(hass, 1, f"{LCI}.{lci.entry_id}").async_load() or {}
    opts, cat_opts = lci.options, lci.options.get("cat_options", {})
    learned = data.get("learned", {})
    cats = []
    for c in lci.data.get("cats", []):
        name, o = c["name"], cat_opts.get(c["name"], {})
        picture = o.get("picture")
        if picture and picture.startswith(LCI_PICTURES):  # copy it: it must survive removing Litter Cat Identifier
            src = Path(hass.config.path(LCI)) / picture[len(LCI_PICTURES):].split("?", 1)[0]
            picture = await async_copy_picture(hass, src)
        cats.append({
            CONF_CAT_NAME: name, CONF_CAT_WEIGHT: round(float(learned.get(name, c["weight"])), 3),
            CONF_CAT_PICTURE: picture, CONF_CAT_COLOR: o.get("color"),
            CONF_CAT_NOTIFY_VISIT: bool(o.get("notify_visit", False)), CONF_CAT_ALERT_HOURS: float(o.get("alert_hours", 0) or 0),
        })
    settings = {
        CONF_TOLERANCE: opts.get("tolerance", DEFAULT_TOLERANCE), CONF_SMOOTHING: opts.get("smoothing", DEFAULT_SMOOTHING),
        CONF_MIN_WEIGHT: opts.get("min_weight", DEFAULT_MIN_WEIGHT), CONF_NOTIFY_TARGETS: list(opts.get("notify_targets", [])),
        CONF_NOTIFY_UNIDENTIFIED: bool(opts.get("notify_unidentified", False)), CONF_NOTIFY_HEALTH: bool(opts.get("notify_health", True)),
        CONF_RECORD_UNIDENTIFIED: bool(opts.get("record_unidentified", True)),
    }
    weights = {c[CONF_CAT_NAME]: c[CONF_CAT_WEIGHT] for c in cats}
    state = {
        "learned": weights, "initial": weights, "visits_today": data.get("visits_today", {}),
        "last_visit": data.get("last_visit", {}), "history": data.get("history", []), "day": data.get("day", ""),
        "daily": data.get("daily", {}), "weights": data.get("weights", {}), "health": data.get("health", {}),
        "alerted": data.get("alerted", {}),
    }
    return cats, settings, state


class UahpetOptionsFlow(OptionsFlow):
    """Cat profiles: tell cats apart by weight like the UAHPET app, notify, import from Litter Cat Identifier."""

    def __init__(self) -> None:
        self._cat: str | None = None

    @property
    def _cats(self) -> list[dict[str, Any]]:
        return list(self.config_entry.options.get(CONF_CATS, []))

    def _save(self, **changes: Any) -> ConfigFlowResult:
        return self.async_create_entry(data={**self.config_entry.options, **changes})

    def _lci_entries(self):
        return self.hass.config_entries.async_entries(LCI)

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        menu = ["add_cat"] + (["edit_cat", "remove_cat"] if self._cats else []) + ["identification", "notifications"]
        if self._lci_entries():
            menu.append("import_lci")
        return self.async_show_menu(step_id="init", menu_options=menu)

    def _cat_schema(self, cat: dict[str, Any] | None) -> vol.Schema:
        cat = cat or {}
        fields: dict[Any, Any] = {}
        if not cat:
            fields[vol.Required(CONF_CAT_NAME)] = str
        fields[vol.Required(CONF_CAT_WEIGHT, default=cat.get(CONF_CAT_WEIGHT, 4.0))] = _kg(0.5, 15, 0.05)
        fields[vol.Optional(CONF_PICTURE_MEDIA)] = PHOTO
        fields[vol.Optional(CONF_CAT_PICTURE, description={"suggested_value": cat.get(CONF_CAT_PICTURE)})] = TextSelector()
        if cat.get(CONF_CAT_PICTURE):
            fields[vol.Optional(CONF_REMOVE_PICTURE, default=False)] = BooleanSelector()
        fields[vol.Optional(CONF_CAT_COLOR, description={"suggested_value": cat.get(CONF_CAT_COLOR)})] = ColorRGBSelector()
        fields[vol.Required(CONF_CAT_NOTIFY_VISIT, default=cat.get(CONF_CAT_NOTIFY_VISIT, False))] = BooleanSelector()
        fields[vol.Required(CONF_CAT_ALERT_HOURS, default=cat.get(CONF_CAT_ALERT_HOURS, 0))] = NumberSelector(
            NumberSelectorConfig(min=0, max=168, step=1, mode=NumberSelectorMode.BOX, unit_of_measurement="h"))
        return vol.Schema(fields)

    def _cat_from_input(self, name: str, user_input: dict[str, Any], picture: str | None, current: dict[str, Any]) -> dict[str, Any]:
        return {
            CONF_CAT_NAME: name, CONF_CAT_WEIGHT: float(user_input[CONF_CAT_WEIGHT]), CONF_CAT_PICTURE: picture,
            CONF_CAT_COLOR: user_input.get(CONF_CAT_COLOR) or current.get(CONF_CAT_COLOR),
            CONF_CAT_NOTIFY_VISIT: bool(user_input.get(CONF_CAT_NOTIFY_VISIT, False)),
            CONF_CAT_ALERT_HOURS: float(user_input.get(CONF_CAT_ALERT_HOURS, 0) or 0),
        }

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
                try:
                    picture = await _resolve_picture(self.hass, user_input, None)
                except PictureError as err:
                    errors[CONF_PICTURE_MEDIA] = str(err)
                else:
                    return self._save(**{CONF_CATS: [*self._cats, self._cat_from_input(name, user_input, picture, {})]})
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
        current = next(c for c in self._cats if c[CONF_CAT_NAME] == self._cat)
        errors: dict[str, str] = {}
        if user_input is not None:
            old = current.get(CONF_CAT_PICTURE)
            try:
                picture = await _resolve_picture(self.hass, user_input, old)
            except PictureError as err:
                errors[CONF_PICTURE_MEDIA] = str(err)
            else:
                if picture != old:
                    await async_delete_pictures(self.hass, [old])
                cats = [self._cat_from_input(self._cat, user_input, picture, current) if c[CONF_CAT_NAME] == self._cat else c for c in self._cats]
                return self._save(**{CONF_CATS: cats})
        return self.async_show_form(
            step_id="edit_cat_details", data_schema=self._cat_schema(current), errors=errors, description_placeholders={"cat": self._cat}
        )

    async def async_step_remove_cat(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            gone = [c for c in self._cats if c[CONF_CAT_NAME] == user_input[CONF_CAT_NAME]]
            await async_delete_pictures(self.hass, [c.get(CONF_CAT_PICTURE) for c in gone])
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
            vol.Required(CONF_RECORD_UNIDENTIFIED, default=o.get(CONF_RECORD_UNIDENTIFIED, True)): BooleanSelector(),
        })
        return self.async_show_form(step_id="identification", data_schema=schema)

    async def async_step_notifications(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            return self._save(**user_input)
        o = self.config_entry.options
        current = list(o.get(CONF_NOTIFY_TARGETS, []))
        services = sorted({f"notify.{s}" for s in self.hass.services.async_services_for_domain("notify")} | set(current))
        schema = vol.Schema({
            vol.Optional(CONF_NOTIFY_TARGETS, default=current): SelectSelector(
                SelectSelectorConfig(options=services, multiple=True, custom_value=True, mode=SelectSelectorMode.DROPDOWN)),
            vol.Required(CONF_NOTIFY_UNIDENTIFIED, default=o.get(CONF_NOTIFY_UNIDENTIFIED, False)): BooleanSelector(),
            vol.Required(CONF_NOTIFY_HEALTH, default=o.get(CONF_NOTIFY_HEALTH, True)): BooleanSelector(),
        })
        return self.async_show_form(step_id="notifications", data_schema=schema)

    async def async_step_import_lci(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        entries = {e.entry_id: e for e in self._lci_entries()}
        if user_input is not None:
            cats, settings, state = await _import_lci(self.hass, entries[user_input["lci_entry"]])
            new_options = {**self.config_entry.options, **settings, CONF_CATS: cats}
            # Replace the running state first: the reload that follows saves it before starting again.
            coordinator = self.config_entry.runtime_data
            coordinator.cats = coordinator._cats_from_options(new_options)
            coordinator.cats.load(state)
            await coordinator.async_flush()
            return self.async_create_entry(data=new_options)
        options = [{"value": e.entry_id, "label": e.title} for e in entries.values()]
        schema = vol.Schema({vol.Required("lci_entry", default=options[0]["value"]): SelectSelector(
            SelectSelectorConfig(options=options, mode=SelectSelectorMode.LIST))})
        return self.async_show_form(step_id="import_lci", data_schema=schema)
