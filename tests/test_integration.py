"""Setup, entity states, commands and availability with a fake client."""

from __future__ import annotations

from datetime import timedelta

from homeassistant.const import STATE_OFF, STATE_ON, STATE_UNAVAILABLE
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed

from custom_components.uahpet.const import CONF_DEVICE_ID, CONF_LOCAL_KEY, CONF_PROFILE, CONF_PROTOCOL, DOMAIN

DEVICE_ID = "bf4f00000000000000test"


async def _setup(hass: HomeAssistant) -> MockConfigEntry:
    entry = MockConfigEntry(
        domain=DOMAIN,
        title="Arenero",
        unique_id=DEVICE_ID,
        data={
            CONF_DEVICE_ID: DEVICE_ID,
            CONF_PROFILE: "litterbox",
            "host": "192.168.1.50",
            CONF_LOCAL_KEY: "0123456789abcdef",
            CONF_PROTOCOL: "3.4",
        },
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


def _eid(hass: HomeAssistant, platform: str, key: str) -> str:
    eid = er.async_get(hass).async_get_entity_id(platform, DOMAIN, f"{DEVICE_ID}_{key}")
    assert eid, f"{platform}.{key} not registered"
    return eid


async def test_states(hass: HomeAssistant, fake_client) -> None:
    await _setup(hass)
    st = lambda p, k: hass.states.get(_eid(hass, p, k))  # noqa: E731

    assert float(st("sensor", "last_cat_weight").state) == 6.1
    assert float(st("sensor", "cat_weight").state) == 0
    assert st("sensor", "visits_today").state == "8"
    assert st("sensor", "last_visit_duration").state == "21"
    assert st("sensor", "work_status").state == "standby"
    assert st("sensor", "bin_status").state == "bin_normal"
    assert st("sensor", "active_alerts").state == "0"
    assert st("switch", "auto_clean").state == STATE_ON
    assert st("switch", "sleep_mode").state == STATE_OFF
    assert st("switch", "ionizer").state == STATE_ON
    assert st("select", "litter_type").state == "larger_particle"
    assert float(st("number", "clean_delay").state) == 480
    assert st("binary_sensor", "bin_full").state == STATE_OFF

    # Hidden by default: manual motor and developer mode
    reg = er.async_get(hass)
    for platform, key in [("switch", "motor_forward"), ("switch", "developer_mode"), ("sensor", "log_code")]:
        assert reg.async_get(_eid(hass, platform, key)).disabled_by is er.RegistryEntryDisabler.INTEGRATION

    # translation_key is what the dashboard cards use to find entities
    assert reg.async_get(_eid(hass, "sensor", "work_status")).translation_key == "work_status"


async def test_commands(hass: HomeAssistant, fake_client) -> None:
    await _setup(hass)
    client = fake_client.instances[0]

    await hass.services.async_call("switch", "turn_on", {"entity_id": _eid(hass, "switch", "sleep_mode")}, blocking=True)
    await hass.services.async_call("button", "press", {"entity_id": _eid(hass, "button", "level")}, blocking=True)
    await hass.services.async_call(
        "number", "set_value", {"entity_id": _eid(hass, "number", "bury_delay"), "value": 30}, blocking=True
    )
    await hass.services.async_call(
        "select", "select_option", {"entity_id": _eid(hass, "select", "litter_type"), "option": "finer_particle"}, blocking=True
    )
    assert client.sent == [(101, "sleep_on"), (103, True), (117, 30), (2, "finer_particle")]
    assert hass.states.get(_eid(hass, "switch", "sleep_mode")).state == STATE_ON  # optimistic


async def test_push_alerts_and_offline(hass: HomeAssistant, fake_client) -> None:
    entry = await _setup(hass)
    client = fake_client.instances[0]

    client.on_dps({"21": 0b1000000, "113": "bin_full"})
    await hass.async_block_till_done()
    assert hass.states.get(_eid(hass, "binary_sensor", "bin_full")).state == STATE_ON
    alerts = hass.states.get(_eid(hass, "sensor", "active_alerts"))
    assert alerts.state == "1" and alerts.attributes["alerts"] == ["bin_full"]

    client.on_connection(False)
    await hass.async_block_till_done()
    assert hass.states.get(_eid(hass, "sensor", "work_status")).state == STATE_UNAVAILABLE

    client.on_dps({"108": "cleaning"})
    await hass.async_block_till_done()
    assert hass.states.get(_eid(hass, "sensor", "work_status")).state == "cleaning"

    assert await hass.config_entries.async_unload(entry.entry_id)
    assert client.stopped


async def test_derived_sensors_and_visit_event(hass: HomeAssistant, fake_client) -> None:
    await _setup(hass)
    client = fake_client.instances[0]
    st = lambda p, k: hass.states.get(_eid(hass, p, k))  # noqa: E731
    assert st("sensor", "cleanings_today").state == "0"
    assert st("event", "visit").state == "unknown"

    # a visit: counter + weight + duration arrive, the event fires once they settle
    client.on_dps({"7": 9, "106": 43})
    client.on_dps({"8": 37})
    await hass.async_block_till_done()
    assert st("sensor", "next_auto_clean").state not in ("unknown", "unavailable")
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=6))
    await hass.async_block_till_done()
    visit = st("event", "visit")
    assert visit.attributes["event_type"] == "visit"
    assert visit.attributes["weight"] == 4.3 and visit.attributes["duration"] == 37

    # auto clean starts
    client.on_dps({"108": "cleaning"})
    await hass.async_block_till_done()
    assert st("sensor", "cleanings_today").state == "1"
    assert st("sensor", "last_cleaning").state not in ("unknown", "unavailable")
    assert st("sensor", "next_auto_clean").state == "unknown"

    # bin taken out and put back
    client.on_dps({"113": "bin_uninstalled"})
    client.on_dps({"113": "bin_normal"})
    await hass.async_block_till_done()
    assert st("sensor", "last_bin_emptied").state not in ("unknown", "unavailable")
