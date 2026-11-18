"""Air purifier profile: local control with every speed (the Tuya cloud only declares one)."""

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.uahpet.const import CONF_DEVICE_ID, CONF_LOCAL_KEY, CONF_PROFILE, CONF_PROTOCOL, DOMAIN

PURIFIER_DPS = {"1": True, "3": "manual", "4": "P1", "5": 79, "7": False, "11": False, "18": "cancel", "21": "great"}
DEV = "bfpurifier000000000000"


async def test_purifier(hass: HomeAssistant, fake_client) -> None:
    fake_client.initial = PURIFIER_DPS
    entry = MockConfigEntry(domain=DOMAIN, title="Purificador Cuarto", unique_id=DEV, data={
        CONF_DEVICE_ID: DEV, CONF_PROFILE: "purifier", "host": "192.168.1.60", CONF_LOCAL_KEY: "k" * 16, CONF_PROTOCOL: "3.4"})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    reg = er.async_get(hass)
    eid = lambda p, k: reg.async_get_entity_id(p, DOMAIN, f"{DEV}_{k}")  # noqa: E731
    fan = hass.states.get(eid("fan", "purifier"))
    assert fan.state == "on" and fan.attributes["percentage"] == 50 and fan.attributes["percentage_step"] == 25
    assert fan.attributes["preset_mode"] == "manual" and "tipping" in fan.attributes["preset_modes"]
    assert hass.states.get(eid("sensor", "air_quality")).state == "great"
    assert hass.states.get(eid("sensor", "filter_utilization")).state == "79"
    assert reg.async_get(eid("sensor", "air_quality")).translation_key == "air_quality"  # what the cards look for

    client = fake_client.instances[0]
    await hass.services.async_call("fan", "set_percentage", {"entity_id": eid("fan", "purifier"), "percentage": 75}, blocking=True)
    await hass.services.async_call("fan", "set_preset_mode", {"entity_id": eid("fan", "purifier"), "preset_mode": "sleep"}, blocking=True)
    await hass.services.async_call("select", "select_option", {"entity_id": eid("select", "countdown"), "option": "4h"}, blocking=True)
    await hass.services.async_call("fan", "turn_off", {"entity_id": eid("fan", "purifier")}, blocking=True)
    assert client.sent == [(4, "P2"), (3, "sleep"), (18, "4h"), (1, False)]
    assert hass.states.get(eid("fan", "purifier")).state == "off"
