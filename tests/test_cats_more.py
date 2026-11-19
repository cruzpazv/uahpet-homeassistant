"""Corrections, health, notifications, services and the import from Litter Cat Identifier."""

from datetime import datetime, timedelta, timezone
from pathlib import Path

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed, async_mock_service

from custom_components.uahpet.cats import CatIdentifier
from custom_components.uahpet.const import DOMAIN

from .test_integration import DEVICE_ID, _setup

T0 = datetime(2026, 11, 18, 10, 0, tzinfo=timezone.utc)


def _ci(**kw):
    ci = CatIdentifier(profiles={"Luna": {"weight": 3.8}, "Simba": {"weight": 5.5}}, **kw)
    ci.load(None)
    return ci


def test_corrections():
    ci = _ci()
    ci.record(3.9, 30, T0)
    ci.record(6.6, 30, T0 + timedelta(hours=1))  # unidentified (just over the tolerance)
    ci.reassign_last("Simba")
    assert ci.history[0]["cat"] == "Simba" and "reason" not in ci.history[0]
    assert ci.visits("Simba", T0) == 1 and ci.visits("unidentified", T0) == 0
    for kg in (5.0, 5.1, 5.2):
        ci.record(kg, 30, T0 + timedelta(hours=2))
    assert ci.recalibrate("Simba", samples=3) == 5.1
    assert ci.recalibrate("Luna", weight=4.0) == 4.0
    ci.record(1.0, 3, T0 + timedelta(hours=5))
    assert ci.clear_unidentified() == 1 and ci.visits("unidentified", T0) == 0


def test_no_unidentified_record_and_health():
    ci = _ci(record_unidentified=False)
    assert ci.record(12.0, 30, T0) is None and not ci.history
    ci = _ci()
    ci.daily = {(T0.date() - timedelta(days=d)).isoformat(): {"Luna": 2, "Simba": 2} for d in range(1, 8)}
    alerts = [a for i in range(6) for a in ci.record(3.8, 30, T0 + timedelta(minutes=i * 5))["health"]]
    assert ("Luna", "frequent_visits", 5) in alerts and "frequent_visits" in ci.health["Luna"]
    assert ci.roll(T0 + timedelta(days=1)) == [] and "frequent_visits" not in ci.health["Luna"]
    assert ci.daily[T0.date().isoformat()]["Luna"] == 6


def test_inactivity_once():
    ci = _ci()
    ci.record(3.8, 30, T0)
    assert ci.inactive(T0 + timedelta(hours=13), {"Luna": 12}) == [("Luna", 12)]
    assert ci.inactive(T0 + timedelta(hours=14), {"Luna": 12}) == []  # once until the next visit


def _eid(hass, platform, key):
    return er.async_get(hass).async_get_entity_id(platform, DOMAIN, f"{DEVICE_ID}_{key}")


async def _with_cats(hass, fake_client, **extra):
    entry = await _setup(hass)
    cats = [{"name": "Luna", "weight": 3.8, "notify_visit": True, "alert_hours": 0}, {"name": "Simba", "weight": 5.5}]
    hass.config_entries.async_update_entry(entry, options={"cats": cats, "notify_targets": ["notify.phone"], **extra})
    await hass.async_block_till_done()
    return entry, fake_client.instances[-1]


async def _visit(hass, client, raw, count, duration=30):
    client.on_dps({"7": count, "106": raw, "8": duration})
    await hass.async_block_till_done()
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=3))
    await hass.async_block_till_done()


async def test_entities_services_and_notifications(hass: HomeAssistant, fake_client) -> None:
    sent = async_mock_service(hass, "notify", "phone")
    entry, client = await _with_cats(hass, fake_client)
    for key in ("show_unidentified",):
        assert _eid(hass, "switch", key)
    assert _eid(hass, "button", "clear_unidentified") and _eid(hass, "button", "cat_luna_recalibrate")
    assert hass.states.get(_eid(hass, "binary_sensor", "cat_luna_health")).state == "off"

    await _visit(hass, client, 39, 9)  # Luna 3.9 kg -> notification
    await hass.async_block_till_done()
    assert sent and "Luna" in sent[-1].data["message"]

    await _visit(hass, client, 90, 10)  # 9 kg: unidentified
    await hass.services.async_call(DOMAIN, "reassign_last_visit", {"cat": "Simba"}, blocking=True)
    assert hass.states.get(_eid(hass, "sensor", "last_visit")).state == "Simba"

    await hass.services.async_call(DOMAIN, "recalibrate_weight", {"cat": "Luna", "weight": 4.2}, blocking=True)
    assert float(hass.states.get(_eid(hass, "sensor", "cat_luna_weight")).state) == 4.2

    await _visit(hass, client, 20, 11)  # 2 kg: unidentified
    await hass.services.async_call("button", "press", {"entity_id": _eid(hass, "button", "clear_unidentified")}, blocking=True)
    history = hass.states.get(_eid(hass, "sensor", "last_visit")).attributes["history"]
    assert all(v["cat"] != "unidentified" for v in history)
    assert entry


async def test_import_from_litter_cat_identifier(hass: HomeAssistant, fake_client, hass_storage, tmp_path, hass_client_no_auth) -> None:
    # a Litter Cat Identifier entry (not loaded) with its stored state and a photo it serves
    pics = Path(hass.config.path("litter_cat_identifier"))
    pics.mkdir(parents=True, exist_ok=True)
    (pics / "0123456789ab.jpg").write_bytes(b"jpeg")
    lci = MockConfigEntry(
        domain="litter_cat_identifier", title="Arenero",
        data={"name": "Arenero", "weight_entity": "sensor.w", "cats": [{"name": "Luna", "weight": 3.8}, {"name": "Simba", "weight": 5.5}]},
        options={"tolerance": 0.8, "notify_targets": ["notify.phone"], "notify_health": False,
                 "cat_options": {"Luna": {"picture": "/api/litter_cat_identifier/picture/0123456789ab.jpg", "color": [225, 87, 89], "notify_visit": True, "alert_hours": 12}}},
    )
    lci.add_to_hass(hass)
    hist = [{"time": "2026-11-18T09:00:00+00:00", "cat": "Simba", "weight": 5.6, "duration": 40},
            {"time": "2026-11-18T08:00:00+00:00", "cat": "Luna", "weight": 3.9, "duration": 30}]
    hass_storage[f"litter_cat_identifier.{lci.entry_id}"] = {"version": 1, "key": "x", "data": {
        "learned": {"Luna": 3.91, "Simba": 5.62}, "history": hist, "last_visit": {"Luna": hist[1]["time"], "Simba": hist[0]["time"]},
        "visits_today": {"Luna": 1, "Simba": 1}, "day": dt_util.now().date().isoformat()}}

    entry = await _setup(hass)
    r = await hass.config_entries.options.async_init(entry.entry_id)
    assert "import_lci" in r["menu_options"]
    r = await hass.config_entries.options.async_configure(r["flow_id"], {"next_step_id": "import_lci"})
    r = await hass.config_entries.options.async_configure(r["flow_id"], {"lci_entry": lci.entry_id})
    await hass.async_block_till_done()

    cats = {c["name"]: c for c in entry.options["cats"]}
    assert cats["Luna"]["weight"] == 3.91 and cats["Luna"]["alert_hours"] == 12 and cats["Luna"]["color"] == [225, 87, 89]
    assert cats["Luna"]["picture"].startswith("/api/uahpet/picture/")  # copied, survives removing Litter Cat Identifier
    # served to logged-in users only: entities hand out a signed URL
    pic = hass.states.get(_eid(hass, "sensor", "cat_luna_weight")).attributes["entity_picture"]
    anon = await hass_client_no_auth()
    assert "authSig=" in pic and (await anon.get(pic)).status == 200
    assert (await anon.get(cats["Luna"]["picture"])).status == 401
    assert entry.options["tolerance"] == 0.8 and entry.options["notify_health"] is False
    assert float(hass.states.get(_eid(hass, "sensor", "cat_simba_weight")).state) == 5.62
    last = hass.states.get(_eid(hass, "sensor", "last_visit"))
    assert last.state == "Simba" and len(last.attributes["history"]) == 2
    assert hass.states.get(_eid(hass, "sensor", "cat_luna_visits_today")).state == "1"
