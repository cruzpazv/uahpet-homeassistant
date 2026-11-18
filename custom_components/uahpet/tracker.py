"""Values the device does not report but the app shows: derived from DP changes.

Pure Python (no Home Assistant imports) so it can be unit tested.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any


@dataclass
class TrackResult:
    changed: bool = False  # derived state changed: persist it
    visit_ended: bool = False  # a visit was counted: fire the visit event once weight/duration settle
    burying: bool = False  # the short "cleaning" right after a visit (covering the waste), not a cleaning


@dataclass
class LitterboxTracker:
    """Cleanings today, last cleaning, next automatic clean and last waste bin emptying."""

    # DP ids (strings, as Tuya sends them)
    dp_status: str = "108"
    dp_visits: str = "7"
    dp_delay: str = "5"
    dp_auto_clean: str = "4"
    dp_sleep: str = "101"
    dp_bin: str = "113"

    day: str | None = None
    cleanings_today: int = 0
    last_cleaning: datetime | None = None
    next_auto_clean: datetime | None = None
    last_bin_emptied: datetime | None = None
    last_visit_at: datetime | None = None
    last_burying: datetime | None = None
    _stored: tuple[str, ...] = field(
        default=("day", "cleanings_today", "last_cleaning", "next_auto_clean", "last_bin_emptied", "last_visit_at", "last_burying"),
        repr=False,
    )

    # ---------- persistence ----------

    def as_dict(self) -> dict[str, Any]:
        out: dict[str, Any] = {}
        for name in self._stored:
            value = getattr(self, name)
            out[name] = value.isoformat() if isinstance(value, datetime) else value
        return out

    def load(self, data: dict[str, Any] | None) -> None:
        for name in self._stored:
            if not data or name not in data:
                continue
            value = data[name]
            if name in ("last_cleaning", "next_auto_clean", "last_bin_emptied", "last_visit_at", "last_burying") and value:
                value = datetime.fromisoformat(value)
            setattr(self, name, value)

    # ---------- reads ----------

    def cleanings(self, now: datetime) -> int:
        return self.cleanings_today if self.day == now.date().isoformat() else 0

    # ---------- updates ----------

    def is_burying(self, now: datetime, delay: Any) -> bool:
        """A "cleaning" that starts well before the clean delay after a visit is the litter box
        covering the waste (bury delay), not the automatic clean that comes after the delay."""
        if self.last_visit_at is None or not isinstance(delay, int) or delay <= 90:
            return False  # with a short clean delay both happen together: count it as a cleaning
        return (now - self.last_visit_at).total_seconds() < delay - 30

    def update(self, old: dict[str, Any], new: dict[str, Any], now: datetime) -> TrackResult:
        """`old`/`new`: full DP state before and after a device update."""
        res = TrackResult()
        visits_old, visits_new = old.get(self.dp_visits), new.get(self.dp_visits)
        if isinstance(visits_old, int) and isinstance(visits_new, int) and visits_new > visits_old:
            res.visit_ended = True
            self.last_visit_at = now
            delay = new.get(self.dp_delay)
            if new.get(self.dp_auto_clean) is True and new.get(self.dp_sleep) != "sleep_on" and isinstance(delay, int):
                self.next_auto_clean = now + timedelta(seconds=delay)
            res.changed = True

        status_old, status_new = old.get(self.dp_status), new.get(self.dp_status)
        # old is None on the first update after (re)connecting: not a transition.
        if status_new == "cleaning" and status_old not in (None, "cleaning"):
            if self.is_burying(now, new.get(self.dp_delay)):
                self.last_burying = now  # the auto clean is still to come: keep its countdown
                res.burying = True
            else:
                if self.day != now.date().isoformat():
                    self.day, self.cleanings_today = now.date().isoformat(), 0
                self.cleanings_today += 1
                self.last_cleaning = now
                self.next_auto_clean = None
            res.changed = True

        auto_off = new.get(self.dp_auto_clean) is False or new.get(self.dp_sleep) == "sleep_on"
        if auto_off and self.next_auto_clean is not None:
            self.next_auto_clean = None
            res.changed = True

        bin_old, bin_new = old.get(self.dp_bin), new.get(self.dp_bin)
        if bin_new == "bin_normal" and bin_old in ("bin_uninstalled", "bin_full"):
            self.last_bin_emptied = now
            res.changed = True
        return res
