"""Built-in cat profiles: identification, options flow, entities, websocket, stop."""

from datetime import datetime, timedelta, timezone

from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import async_fire_time_changed

from custom_components.uahpet.cats import CatIdentifier
from custom_components.uahpet.const import DOMAIN

from .test_integration import DEVICE_ID, _setup

T0 = datetime(2026, 11, 18, 10, 0, tzinfo=timezone.utc)


def test_identifier_learns_and_explains():
    ci = CatIdentifier(profiles={"Luna": {"weight": 3.8}, "Simba": {"weight": 5.5}})
    ci.load(None)
    assert ci.record(5.3, 40, T0)["cat"] == "Simba"
    assert 5.4 < ci.learned["Simba"] < 5.5
    v = ci.record(2.2, 5, T0 + timedelta(seconds=60))
    assert v["cat"] == "unidentified" and v["reason"] == "partial_after_visit" and v["likely_cat"] == "Simba"
    v = ci.record(9.0, 5, T0 + timedelta(hours=1), device_reason="device_busy")
    assert v["reason"] == "device_busy"
    assert ci.visits("Simba", T0) == 1 and ci.visits("unidentified", T0) == 2
    assert ci.visits("Simba", T0 + timedelta(days=1)) == 0

    other = CatIdentifier(profiles={"Luna": {"weight": 3.8}, "Simba": {"weight": 6.0}})
    other.load(ci.as_dict())
    assert other.learned["Simba"] == 6.0  # weight changed in the options: learned value reset
    assert other.learned["Luna"] == 3.8 and len(other.history) == 3


async def _add_cat(hass, entry, name, weight):
    r = await hass.config_entries.options.async_init(entry.entry_id)
    assert r["type"] is FlowResultType.MENU
    r = await hass.config_entries.options.async_configure(r["flow_id"], {"next_step_id": "add_cat"})
    r = await hass.config_entries.options.async_configure(r["flow_id"], {"name": name, "weight": weight})
    assert r["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()


def _eid(hass, key):
    return er.async_get(hass).async_get_entity_id("sensor", DOMAIN, f"{DEVICE_ID}_{key}")


async def test_cats_end_to_end(hass: HomeAssistant, fake_client, hass_ws_client) -> None:
    entry = await _setup(hass)
    assert _eid(hass, "last_visit") is None  # no cats configured: nothing extra
    await _add_cat(hass, entry, "Luna", 3.8)
    await _add_cat(hass, entry, "Simba", 5.5)
    assert _eid(hass, "cat_luna_weight") and _eid(hass, "cat_simba_visits_today")
    # per-cat weights must not take over the litter box's live weight name (same platform)
    assert hass.states.get(_eid(hass, "cat_luna_weight")).name.endswith("Luna weight")
    assert hass.states.get(_eid(hass, "cat_weight")).name.endswith("Live weight")

    client = fake_client.instances[-1]
    client.on_dps({"7": 9, "106": 54, "8": 41})  # Simba, 5.4 kg
    await hass.async_block_till_done()
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=3))
    await hass.async_block_till_done()

    visit = hass.states.get(er.async_get(hass).async_get_entity_id("event", DOMAIN, f"{DEVICE_ID}_visit"))
    assert visit.attributes["cat"] == "Simba" and visit.attributes["weight"] == 5.4
    assert visit.attributes["event_type"] == "Simba"  # automations can trigger on the cat directly
    assert hass.states.get(_eid(hass, "last_visit")).state == "Simba"
    assert hass.states.get(_eid(hass, "cat_simba_visits_today")).state == "1"
    assert hass.states.get(_eid(hass, "cat_simba_weight")).attributes["cat"] == "Simba"

    device = dr.async_get(hass).async_get_device(identifiers={(DOMAIN, DEVICE_ID)})
    ws = await hass_ws_client(hass)
    await ws.send_json({"id": 1, "type": f"{DOMAIN}/visits", "device_id": device.id})
    res = await ws.receive_json()
    assert res["result"]["total"] == 1 and res["result"]["history"][0]["cat"] == "Simba"

    # remove Luna: her entities go away, Simba's history stays
    r = await hass.config_entries.options.async_init(entry.entry_id)
    r = await hass.config_entries.options.async_configure(r["flow_id"], {"next_step_id": "remove_cat"})
    r = await hass.config_entries.options.async_configure(r["flow_id"], {"name": "Luna"})
    await hass.async_block_till_done()
    assert _eid(hass, "cat_luna_weight") is None
    assert hass.states.get(_eid(hass, "cat_simba_visits_today")).state == "1"


async def test_duplicate_cat_name(hass: HomeAssistant, fake_client) -> None:
    entry = await _setup(hass)
    await _add_cat(hass, entry, "Luna", 3.8)
    r = await hass.config_entries.options.async_init(entry.entry_id)
    r = await hass.config_entries.options.async_configure(r["flow_id"], {"next_step_id": "add_cat"})
    r = await hass.config_entries.options.async_configure(r["flow_id"], {"name": "luna", "weight": 4})
    assert r["errors"] == {"name": "duplicate_name"}


async def test_stop_button(hass: HomeAssistant, fake_client) -> None:
    await _setup(hass)
    client = fake_client.instances[0]
    stop = er.async_get(hass).async_get_entity_id("button", DOMAIN, f"{DEVICE_ID}_stop")
    client.on_dps({"108": "leveling"})
    await hass.async_block_till_done()
    await hass.services.async_call("button", "press", {"entity_id": stop}, blocking=True)
    assert client.sent[-1] == (103, False)


async def test_cat_colour(hass: HomeAssistant, fake_client) -> None:
    entry = await _setup(hass)
    r = await hass.config_entries.options.async_init(entry.entry_id)
    r = await hass.config_entries.options.async_configure(r["flow_id"], {"next_step_id": "add_cat"})
    await hass.config_entries.options.async_configure(r["flow_id"], {"name": "Luna", "weight": 3.8, "color": [225, 87, 89]})
    await hass.async_block_till_done()
    assert hass.states.get(_eid(hass, "cat_luna_weight")).attributes["color"] == "#e15759"
