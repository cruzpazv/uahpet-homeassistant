"""Tuya data points of the UAHPET litter box (product y0kvbmrnprybewtd, category msp).

Pure Python: no Home Assistant imports, so it can be unit tested on its own.
"""

from __future__ import annotations

from enum import IntEnum
from typing import Any


class DP(IntEnum):
    """Data point ids."""

    WORK_MODE = 2  # enum: litter type
    START = 3  # bool: clean now
    AUTO_CLEAN = 4  # bool
    DELAY_CLEAN_TIME = 5  # int s, 10..1800
    CAT_WEIGHT = 6  # int, scale 3, kg (live, 0 when empty)
    VISITS_TODAY = 7  # int
    VISIT_DURATION = 8  # int s (last visit)
    TIMER = 20  # raw, cloud schedules: not exposed
    NOTIFICATION = 21  # bitmap
    FAULT = 22  # bitmap
    SLEEP = 101  # enum sleep_on / sleep_off
    CHILD_LOCK = 102  # bool
    LEVEL = 103  # bool: level litter
    FORWARD = 104  # bool: drive motor forward (manual)
    REVERSE = 105  # bool: drive motor backwards (manual)
    LAST_CAT_WEIGHT = 106  # int, scale 1, kg (weight of the last visit)
    EMPTY = 107  # bool: empty all litter
    WORK_STATUS = 108  # enum
    CAT_WEIGHT_LB = 109  # int, scale 1, lb: not exposed (HA converts units)
    LAST_CAT_WEIGHT_LB = 110  # int, scale 1, lb: not exposed
    UNIT = 111  # enum, unit shown on the device
    DEVELOPER_MODE = 112  # bool
    BIN_STATUS = 113  # enum
    ANION = 114  # bool: ionizer
    RADAR = 115  # bool: presence radar
    WORK_LOG = 116  # enum: internal cycle phase
    BURY_DELAY = 117  # int s, 5..60
    EXCESSIVE_VISITS = 118  # int, 0..50: alert threshold
    LOG = 119  # int, packed, undecoded


WORK_MODES = ["larger_particle", "finer_particle"]
SLEEP_ON, SLEEP_OFF = "sleep_on", "sleep_off"
UNITS = ["unit_kg", "unit_lb"]
WORK_STATUSES = ["standby", "cleaning", "clearing", "leveling", "e_weight", "radar", "clumping"]
BIN_STATUSES = ["bin_normal", "bin_full", "bin_uninstalled", "bin_cover_open"]
WORK_LOG_STATES = [
    "clean_a", "clean_b", "clean_c", "clean_d", "clean_f", "clean_dc",
    "level_a", "level_b", "level_c", "clear_a", "clear_b",
]
NOTIFICATION_BITS = [
    "excessive_clean_times", "no_weight", "stagnant", "not_in_place",
    "e_weight", "bin_cover_open", "bin_full",
]
FAULT_BITS = ["motor_fault"]


def get(dps: dict[str, Any] | None, dp: int) -> Any:
    """Value of a DP from the device state (keys are strings), or None."""
    return None if dps is None else dps.get(str(dp))


def scaled(value: Any, scale: int) -> float | None:
    """Tuya integer with `scale` decimals → float."""
    if value is None:
        return None
    return round(int(value) / 10**scale, scale)


def bit(value: Any, index: int) -> bool | None:
    """Bit `index` of a Tuya bitmap (label i ↔ bit i, LSB first)."""
    if value is None:
        return None
    return bool((int(value) >> index) & 1)


def active_bits(value: Any, labels: list[str]) -> list[str]:
    """Labels whose bit is set."""
    if value is None:
        return []
    return [label for i, label in enumerate(labels) if (int(value) >> i) & 1]


def log_bytes(value: Any) -> list[int] | None:
    """DP 119 split into 4 bytes, big endian (format still unknown)."""
    if value is None:
        return None
    return list(int(value).to_bytes(4, "big", signed=False))
