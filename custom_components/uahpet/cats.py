"""Cat profiles: name each visit after the cat with the closest weight, like the UAHPET app.

Pure Python (no Home Assistant imports). The same idea as Litter Cat Identifier, built in
so a UAHPET litter box can tell cats apart on its own.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

UNIDENTIFIED = "unidentified"
HISTORY_SIZE = 20  # visits in the sensor attributes
STORED_HISTORY = 2000  # visits kept on disk (cards read them over the websocket API)
PARTIAL_WINDOW = 120  # s: a reading right after a cat's visit is probably that cat half inside

DEFAULT_TOLERANCE = 1.0  # kg
DEFAULT_SMOOTHING = 0.2
DEFAULT_MIN_WEIGHT = 0.5  # kg


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

    learned: dict[str, float] = field(default_factory=dict)
    initial: dict[str, float] = field(default_factory=dict)  # weight given in the options
    visits_today: dict[str, int] = field(default_factory=dict)
    last_visit: dict[str, str | None] = field(default_factory=dict)
    history: list[dict[str, Any]] = field(default_factory=list)
    day: str = ""

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

    def as_dict(self) -> dict[str, Any]:
        return {
            "learned": self.learned, "initial": self.initial, "visits_today": self.visits_today,
            "last_visit": self.last_visit, "history": self.history, "day": self.day,
        }

    # ---------- reads ----------

    def visits(self, name: str, now: datetime) -> int:
        return self.visits_today.get(name, 0) if self.day == now.date().isoformat() else 0

    # ---------- updates ----------

    def record(
        self, weight: float | None, duration: float | None, now: datetime, device_reason: str | None = None
    ) -> dict[str, Any]:
        """Identify and log one visit. Returns the visit as stored."""
        if self.day != now.date().isoformat():
            self.day, self.visits_today = now.date().isoformat(), {}
        kg = weight if weight is not None and weight >= self.min_weight else None
        cat = identify(kg, self.learned, self.tolerance) if kg is not None and self.learned else None
        visit: dict[str, Any] = {
            "time": now.isoformat(), "cat": cat or UNIDENTIFIED,
            "weight": round(kg, 2) if kg is not None else None, "duration": duration,
        }
        if cat:
            self.learned[cat] = round(learn(self.learned[cat], kg, self.smoothing), 3)
            self.last_visit[cat] = visit["time"]
        else:
            visit["reason"], visit["likely_cat"] = self._why(kg, now, device_reason)
        self.visits_today[visit["cat"]] = self.visits_today.get(visit["cat"], 0) + 1
        self.history.insert(0, visit)
        del self.history[STORED_HISTORY:]
        return visit

    def _why(self, kg: float | None, now: datetime, device_reason: str | None) -> tuple[str, str | None]:
        if device_reason:
            return device_reason, None
        prev = next((v for v in self.history if v["cat"] != UNIDENTIFIED), None)
        if prev and (now - datetime.fromisoformat(prev["time"])).total_seconds() <= PARTIAL_WINDOW:
            return "partial_after_visit", prev["cat"]
        if kg is None:
            return "no_weight", None
        return "refill_or_partial", None
