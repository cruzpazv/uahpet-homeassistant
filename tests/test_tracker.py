from datetime import datetime, timedelta, timezone

from custom_components.uahpet.tracker import LitterboxTracker

from .conftest import SAMPLE_DPS

T0 = datetime(2026, 11, 18, 10, 0, tzinfo=timezone.utc)


def _upd(tr, old, **changes):
    new = {**old, **changes}
    return tr.update(old, new, _upd.now), new


def test_cleanings_visits_and_next_clean():
    tr = LitterboxTracker()
    state = dict(SAMPLE_DPS)  # standby, 8 visits, auto clean on, delay 480 s, DND off
    _upd.now = T0
    res, state = _upd(tr, state, **{"7": 9})
    assert res.visit_ended and tr.next_auto_clean == T0 + timedelta(seconds=480)

    _upd.now = T0 + timedelta(minutes=8)
    res, state = _upd(tr, state, **{"108": "cleaning"})
    assert res.changed and tr.cleanings(_upd.now) == 1 and tr.last_cleaning == _upd.now
    assert tr.next_auto_clean is None
    res, state = _upd(tr, state, **{"108": "cleaning"})  # still cleaning: not a new one
    assert not res.changed and tr.cleanings(_upd.now) == 1

    # next day: counter starts again
    assert tr.cleanings(T0 + timedelta(days=1)) == 0
    _upd.now = T0 + timedelta(days=1)
    _, state = _upd(tr, state, **{"108": "standby"})
    _, state = _upd(tr, state, **{"108": "cleaning"})
    assert tr.cleanings(_upd.now) == 1


def test_no_next_clean_when_auto_off_or_dnd():
    tr = LitterboxTracker()
    _upd.now = T0
    _, state = _upd(tr, dict(SAMPLE_DPS), **{"4": False, "7": 9})
    assert tr.next_auto_clean is None
    _, state = _upd(tr, state, **{"4": True, "7": 10})
    assert tr.next_auto_clean is not None
    _, state = _upd(tr, state, **{"101": "sleep_on"})  # do not disturb cancels it
    assert tr.next_auto_clean is None


def test_bin_emptied_and_first_update_ignored():
    tr = LitterboxTracker()
    _upd.now = T0
    res = tr.update({}, {**SAMPLE_DPS, "108": "cleaning"}, T0)  # first update after connecting
    assert not res.changed and tr.cleanings(T0) == 0
    _, state = _upd(tr, dict(SAMPLE_DPS), **{"113": "bin_full"})
    _, state = _upd(tr, state, **{"113": "bin_uninstalled"})
    assert tr.last_bin_emptied is None
    _, state = _upd(tr, state, **{"113": "bin_normal"})
    assert tr.last_bin_emptied == T0


def test_persistence_roundtrip():
    tr = LitterboxTracker(day="2026-11-18", cleanings_today=3, last_cleaning=T0, last_bin_emptied=T0)
    other = LitterboxTracker()
    other.load(tr.as_dict())
    assert other.cleanings(T0) == 3 and other.last_cleaning == T0 and other.last_bin_emptied == T0
    other.load(None)  # nothing stored yet
    assert other.cleanings(T0) == 3
