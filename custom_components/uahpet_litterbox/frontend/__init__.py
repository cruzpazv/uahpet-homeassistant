"""Serve and auto-load the dashboard cards."""

from __future__ import annotations

from pathlib import Path

from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration

from ..const import DOMAIN

URL_BASE = f"/{DOMAIN}_static"
CARDS_JS = "uahpet-litterbox-cards.js"


async def async_register_cards(hass: HomeAssistant) -> None:
    folder = Path(__file__).parent
    await hass.http.async_register_static_paths([StaticPathConfig(URL_BASE, str(folder), True)])
    if "frontend" not in hass.config.components:
        return
    from homeassistant.components.frontend import add_extra_js_url

    version = (await async_get_integration(hass, DOMAIN)).version
    add_extra_js_url(hass, f"{URL_BASE}/{CARDS_JS}?v={version}")
