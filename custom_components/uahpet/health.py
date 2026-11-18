"""Per-cat health signals (same rules as Litter Cat Identifier). Pure Python: no Home Assistant imports.

Simple, explainable rules on each cat's own history (not medical advice):
- frequent_visits: today's visits are well above the cat's usual daily count
- long_visit: a visit far longer than the cat's usual visits
- weight_loss: learned weight down by 5 % or more compared with three weeks ago
"""

from __future__ import annotations

from datetime import date, timedelta



def median(values: list[float]) -> float:
    ordered = sorted(values)
    mid = len(ordered) // 2
    return ordered[mid] if len(ordered) % 2 else (ordered[mid - 1] + ordered[mid]) / 2

MIN_HISTORY = 5  # days / visits needed before judging what is "usual"
FREQUENT_FACTOR = 2.0
FREQUENT_EXTRA = 3
LONG_FACTOR = 3.0
LONG_MIN = 120  # s
WEIGHT_LOSS_PCT = 5.0
WEIGHT_LOOKBACK = 21  # days
KEEP_DAYS = 60

REASONS = ("frequent_visits", "long_visit", "weight_loss")


def frequent_visits(today_count: int, past_counts: list[int]) -> bool:
    if len(past_counts) < MIN_HISTORY:
        return False
    usual = median(past_counts)
    return today_count >= max(usual * FREQUENT_FACTOR, usual + FREQUENT_EXTRA)


def long_visit(duration: float | None, past_durations: list[float]) -> bool:
    past = [d for d in past_durations if d]
    if duration is None or len(past) < MIN_HISTORY:
        return False
    return duration >= max(median(past) * LONG_FACTOR, LONG_MIN)


def weight_loss(current: float | None, snapshots: dict[str, float], today: date) -> float | None:
    """Percentage lost against the newest snapshot at least WEIGHT_LOOKBACK days old, if significant."""
    limit = (today - timedelta(days=WEIGHT_LOOKBACK)).isoformat()
    old_days = sorted(d for d, w in snapshots.items() if d <= limit and w)
    if current is None or not old_days:
        return None
    old = snapshots[old_days[-1]]
    pct = (old - current) / old * 100
    return round(pct, 1) if pct >= WEIGHT_LOSS_PCT else None


def trim(days: dict[str, object], today: date) -> None:
    """Drop entries older than KEEP_DAYS (keys are ISO dates)."""
    limit = (today - timedelta(days=KEEP_DAYS)).isoformat()
    for d in [d for d in days if d < limit]:
        del days[d]
