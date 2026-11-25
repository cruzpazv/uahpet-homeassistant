"""Cat profiles: name each visit after the cat with the closest weight, like the UAHPET app.

Pure Python (no Home Assistant imports). The same idea as Litter Cat Identifier, built in
so a UAHPET litter box can tell cats apart on its own.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from statistics import median
from typing import Any

from . import health

UNIDENTIFIED = "unidentified"
HISTORY_SIZE = 20  # visits in the sensor attributes
STORED_HISTORY = 2000  # visits kept on disk (cards read them over the websocket API)
PARTIAL_WINDOW = 120  # s: a reading right after a cat's visit is probably that cat half inside

DEFAULT_TOLERANCE = 0.5  # kg
DEFAULT_SMOOTHING = 0.2
DEFAULT_MIN_WEIGHT = 0.5  # kg
RECALIBRATE_SAMPLES = 5
LEARN_SAMPLES = 5  # learn towards the median of the latest readings: one odd reading does not drag the weight


def identify(weight: float, learned: dict[str, float], tolerance: float) -> str | None:
    """The cat whose learned weight is closest, if within tolerance."""
    best = min(learned.items(), key=lambda kv: abs(kv[1] - weight), default=None)
    if best is None or abs(best[1] - weight) > tolerance:
        return None
    return best[0]


def learn(current: float, reading: float, rate: float) -> float:
    return current + (reading - current) * rate


@dataclass
class CatIdentifier:
    """Learned weights, today's counts, last visits and the visit history."""

    profiles: dict[str, dict[str, Any]] = field(default_factory=dict)  # name -> {"weight", "picture"}
    tolerance: float = DEFAULT_TOLERANCE
    smoothing: float = DEFAULT_SMOOTHING
    min_weight: float = DEFAULT_MIN_WEIGHT
    record_unidentified: bool = True

    learned: dict[str, float] = field(default_factory=dict)
    initial: dict[str, float] = field(default_factory=dict)  # weight given in the options
    visits_today: dict[str, int] = field(default_factory=dict)
    last_visit: dict[str, str | None] = field(default_factory=dict)
    history: list[dict[str, Any]] = field(default_factory=list)
    day: str = ""
    daily: dict[str, dict[str, int]] = field(default_factory=dict)  # day -> visits per cat (health baseline)
    weights: dict[str, dict[str, float]] = field(default_factory=dict)  # day -> learned weight per cat
    health: dict[str, dict[str, Any]] = field(default_factory=dict)  # cat -> active reason -> detail
    alerted: dict[str, bool] = field(default_factory=dict)  # "no visit in X hours" already sent

    @property
    def names(self) -> list[str]:
        return list(self.profiles)

    # ---------- persistence ----------

    def load(self, data: dict[str, Any] | None) -> None:
        data = data or {}
        stored, initial = data.get("learned", {}), data.get("initial", {})
        for name, prof in self.profiles.items():
            given = float(prof["weight"])
            # a weight changed in the options resets what was learned
            self.learned[name] = float(stored[name]) if name in stored and initial.get(name) == given else given
            self.initial[name] = given
        self.visits_today = {k: int(v) for k, v in data.get("visits_today", {}).items()}
        self.last_visit = {n: data.get("last_visit", {}).get(n) for n in self.names}
        self.history = list(data.get("history", []))[:STORED_HISTORY]
        self.day = data.get("day", "")
        self.daily = dict(data.get("daily", {}))
        self.weights = dict(data.get("weights", {}))
        self.health = {n: dict(data.get("health", {}).get(n, {})) for n in self.names}
        self.alerted = {n: bool(data.get("alerted", {}).get(n, False)) for n in self.names}

    def as_dict(self) -> dict[str, Any]:
        return {
            "learned": self.learned, "initial": self.initial, "visits_today": self.visits_today,
            "last_visit": self.last_visit, "history": self.history, "day": self.day,
            "daily": self.daily, "weights": self.weights, "health": self.health, "alerted": self.alerted,
        }

    # ---------- reads ----------

    def visits(self, name: str, now: datetime) -> int:
        return self.visits_today.get(name, 0) if self.day == now.date().isoformat() else 0

    # ---------- updates ----------

    def roll(self, now: datetime) -> list[tuple[str, str, Any]]:
        """Start a new day if needed: keep yesterday as health baseline. Returns new health alerts."""
        today = now.date().isoformat()
        if self.day == today:
            return []
        if self.day:
            self.daily[self.day] = {n: self.visits_today.get(n, 0) for n in self.names}
            self.weights[self.day] = dict(self.learned)
            health.trim(self.daily, now.date())
            health.trim(self.weights, now.date())
        self.day, self.visits_today = today, {}
        for active in self.health.values():  # daily signals end with the day
            active.pop("frequent_visits", None)
            active.pop("long_visit", None)
        return self.check_weight_loss(now)

    def check_weight_loss(self, now: datetime) -> list[tuple[str, str, Any]]:
        new = []
        for cat in self.names:
            snapshots = {d: w.get(cat) for d, w in self.weights.items() if w.get(cat)}
            pct = health.weight_loss(self.learned.get(cat), snapshots, now.date())
            active = self.health.setdefault(cat, {})
            if pct is not None and "weight_loss" not in active:
                active["weight_loss"] = pct
                new.append((cat, "weight_loss", pct))
            elif pct is None:
                active.pop("weight_loss", None)
        return new

    def _visit_health(self, cat: str, duration: float | None) -> list[tuple[str, str, Any]]:
        new, active = [], self.health.setdefault(cat, {})
        today = self.visits_today.get(cat, 0)
        if "frequent_visits" not in active and health.frequent_visits(today, [d.get(cat, 0) for d in self.daily.values()]):
            active["frequent_visits"] = today
            new.append((cat, "frequent_visits", today))
        past = [v["duration"] for v in self.history[1:200] if v["cat"] == cat and v.get("duration")]
        if "long_visit" not in active and health.long_visit(duration, past):
            active["long_visit"] = round(duration)
            new.append((cat, "long_visit", round(duration)))
        return new

    def inactive(self, now: datetime, hours: dict[str, float]) -> list[tuple[str, float]]:
        """Cats past their 'no visit in X hours' limit, once until they visit again."""
        out = []
        for cat, limit in hours.items():
            last = self.last_visit.get(cat)
            if limit and last and not self.alerted.get(cat) and now - datetime.fromisoformat(last) > timedelta(hours=limit):
                self.alerted[cat] = True
                out.append((cat, limit))
        return out

    def record(
        self, weight: float | None, duration: float | None, now: datetime, device_reason: str | None = None
    ) -> dict[str, Any] | None:
        """Identify and log one visit. Returns the visit as stored (None: unidentified and not recorded).
        New health alerts are in visit["health"]."""
        alerts = self.roll(now)
        kg = weight if weight is not None and weight >= self.min_weight else None
        cat = identify(kg, self.learned, self.tolerance) if kg is not None and self.learned else None
        if cat and (other := self._half_inside(cat, kg, now)):
            cat = None  # lighter than the cat, right after another (heavier) cat's visit
            partial_of = other
        else:
            partial_of = None
        if cat is None and not self.record_unidentified:
            return None
        visit: dict[str, Any] = {
            "time": now.isoformat(), "cat": cat or UNIDENTIFIED,
            "weight": round(kg, 2) if kg is not None else None, "duration": duration,
        }
        if cat:
            self.learned[cat] = round(learn(self.learned[cat], self._typical(cat, kg), self.smoothing), 3)
            self.last_visit[cat] = visit["time"]
            self.alerted[cat] = False
        elif partial_of:
            visit["reason"], visit["likely_cat"] = "partial_after_visit", partial_of
        else:
            visit["reason"], visit["likely_cat"] = self._why(kg, now, device_reason)
        self.visits_today[visit["cat"]] = self.visits_today.get(visit["cat"], 0) + 1
        self.history.insert(0, visit)
        del self.history[STORED_HISTORY:]
        if cat:
            alerts += self._visit_health(cat, duration)
        return {**visit, "health": alerts}

    # ---------- corrections ----------

    def reassign_last(self, cat: str) -> None:
        """Fix the most recent visit when identification got it wrong."""
        if cat not in self.profiles:
            raise ValueError(f"Unknown cat: {cat}")
        if not self.history:
            raise ValueError("No visits recorded yet")
        visit = self.history[0]
        old = visit["cat"]
        if old == cat:
            return
        if visit["time"][:10] == self.day:
            self.visits_today[old] = max(0, self.visits_today.get(old, 0) - 1)
            self.visits_today[cat] = self.visits_today.get(cat, 0) + 1
        visit["cat"] = cat
        visit.pop("reason", None)
        visit.pop("likely_cat", None)
        self.last_visit[cat] = visit["time"]
        self.alerted[cat] = False
        if old in self.profiles:
            self.last_visit[old] = next((v["time"] for v in self.history if v["cat"] == old), None)
        if visit["weight"] is not None:
            self.learned[cat] = round(learn(self.learned[cat], visit["weight"], self.smoothing), 3)

    def recalibrate(self, cat: str, weight: float | None = None, samples: int = RECALIBRATE_SAMPLES) -> float:
        """Reset a cat's learned weight: given value, or median of its latest readings."""
        if cat not in self.profiles:
            raise ValueError(f"Unknown cat: {cat}")
        if weight is None:
            readings = [v["weight"] for v in self.history if v["cat"] == cat and v["weight"] is not None]
            if not readings:
                raise ValueError(f"No weighed visits for {cat} yet")
            weight = median(readings[: max(1, int(samples))])
        self.learned[cat] = round(float(weight), 3)
        return self.learned[cat]

    def clear_unidentified(self) -> int:
        """Drop unidentified visits from the log and reset today's count."""
        before = len(self.history)
        self.history = [v for v in self.history if v["cat"] != UNIDENTIFIED]
        self.visits_today[UNIDENTIFIED] = 0
        return before - len(self.history)

    def _typical(self, cat: str, kg: float) -> float:
        """Median of this reading and the cat's latest ones: what the learned weight moves towards."""
        recent = [v["weight"] for v in self.history if v["cat"] == cat and v["weight"] is not None][: LEARN_SAMPLES - 1]
        return median([kg, *recent])

    def _half_inside(self, cat: str, kg: float, now: datetime) -> str | None:
        """A reading well under `cat`'s weight right after a heavier cat left: that cat
        stepping back in with half its body (e.g. to cover its waste). Returns that cat."""
        prev = next((v for v in self.history if v["cat"] != UNIDENTIFIED), None)
        if not prev or prev["cat"] == cat or prev.get("weight") is None:
            return None
        if (now - datetime.fromisoformat(prev["time"])).total_seconds() > PARTIAL_WINDOW:
            return None
        if kg < self.learned[cat] - self.tolerance / 2 and kg < prev["weight"]:
            return prev["cat"]
        return None

    def _why(self, kg: float | None, now: datetime, device_reason: str | None) -> tuple[str, str | None]:
        if device_reason:
            return device_reason, None
        prev = next((v for v in self.history if v["cat"] != UNIDENTIFIED), None)
        if prev and (now - datetime.fromisoformat(prev["time"])).total_seconds() <= PARTIAL_WINDOW:
            return "partial_after_visit", prev["cat"]
        if kg is None:
            return "no_weight", None
        return "refill_or_partial", None
