"""Self-cleaning litter box: Tuya category msp, product y0kvbmrnprybewtd (app code "msp")."""

from __future__ import annotations

from enum import IntEnum
from typing import Any

from homeassistant.components.binary_sensor import BinarySensorDeviceClass
from homeassistant.components.number import NumberDeviceClass, NumberMode
from homeassistant.components.sensor import SensorDeviceClass, SensorStateClass
from homeassistant.const import EntityCategory, UnitOfMass, UnitOfTime

from ..descriptions import (
    UahpetBinarySensorDescription,
    UahpetButtonDescription,
    UahpetNumberDescription,
    UahpetSelectDescription,
    UahpetSensorDescription,
    UahpetSwitchDescription,
)
from homeassistant.util import dt as dt_util

from ..dps import active_bits, enum_value, get, int_bytes, scaled
from ..tracker import LitterboxTracker
from .base import Profile


class DP(IntEnum):
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
    CAT_WEIGHT_LB = 109  # lb copy: not exposed (HA converts units)
    LAST_CAT_WEIGHT_LB = 110  # lb copy: not exposed
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
UNITS = ["unit_kg", "unit_lb"]
WORK_STATUSES = ["standby", "cleaning", "clearing", "leveling", "e_weight", "radar", "clumping"]
BIN_STATUSES = ["bin_normal", "bin_full", "bin_uninstalled", "bin_cover_open"]
WORK_LOG_STATES = [
    "clean_a", "clean_b", "clean_c", "clean_d", "clean_f", "clean_dc",
    "level_a", "level_b", "level_c", "clear_a", "clear_b",
]
NOTIFICATION_BITS = [
    # stagnant: the cat stayed too long; the box levels the litter to make it leave (UAHPET app)
    "excessive_clean_times", "no_weight", "stagnant", "not_in_place",
    "e_weight", "bin_cover_open", "bin_full",
]
FAULT_BITS = ["motor_fault"]


def _alerts(dps: dict[str, Any]) -> list[str]:
    return active_bits(get(dps, DP.NOTIFICATION), NOTIFICATION_BITS) + active_bits(get(dps, DP.FAULT), FAULT_BITS)


def _log_attrs(dps: dict[str, Any]) -> dict[str, Any]:
    value = get(dps, DP.LOG)
    return {"bytes": int_bytes(value), "hex": None if value is None else f"{int(value):08x}"}


def _visit_reason(dps: dict[str, Any]) -> str | None:
    if "stagnant" in active_bits(get(dps, DP.NOTIFICATION), NOTIFICATION_BITS):
        return "stayed_too_long"
    if get(dps, DP.WORK_STATUS) in ("cleaning", "clearing", "leveling"):
        return "device_busy"
    return None


def _stop(dps: dict[str, Any]) -> tuple[int, bool] | None:
    """Best effort: switch off the DP of the running task (the device may ignore it)."""
    dp = {"cleaning": DP.START, "leveling": DP.LEVEL, "clearing": DP.EMPTY}.get(get(dps, DP.WORK_STATUS))
    return (dp, False) if dp else None


def _visit_data(dps: dict[str, Any]) -> dict[str, Any]:
    return {"weight": scaled(get(dps, DP.LAST_CAT_WEIGHT), 1), "duration": get(dps, DP.VISIT_DURATION)}


_CONFIG = EntityCategory.CONFIG
_DIAG = EntityCategory.DIAGNOSTIC

LITTERBOX = Profile(
    key="litterbox",
    default_name="UAHPET Litter Box",
    model="Self-cleaning litter box",
    tuya_category="msp",
    product_ids=("y0kvbmrnprybewtd",),
    tracker_factory=LitterboxTracker,
    visit_data=_visit_data,
    visit_dps=(str(DP.LAST_CAT_WEIGHT), str(DP.VISIT_DURATION)),
    visit_reason=_visit_reason,
    signature=frozenset({str(DP.CAT_WEIGHT), str(DP.VISITS_TODAY), str(DP.VISIT_DURATION), str(DP.WORK_STATUS)}),
    sensors=(
        UahpetSensorDescription(
            key="last_cat_weight",
            value_fn=lambda d: scaled(get(d, DP.LAST_CAT_WEIGHT), 1),
            device_class=SensorDeviceClass.WEIGHT,
            native_unit_of_measurement=UnitOfMass.KILOGRAMS,
            state_class=SensorStateClass.MEASUREMENT,
            suggested_display_precision=1,
        ),
        UahpetSensorDescription(
            key="cat_weight",
            value_fn=lambda d: scaled(get(d, DP.CAT_WEIGHT), 3),
            device_class=SensorDeviceClass.WEIGHT,
            native_unit_of_measurement=UnitOfMass.KILOGRAMS,
            state_class=SensorStateClass.MEASUREMENT,
            suggested_display_precision=2,
        ),
        UahpetSensorDescription(
            key="visits_today",
            value_fn=lambda d: get(d, DP.VISITS_TODAY),
            state_class=SensorStateClass.TOTAL_INCREASING,
        ),
        UahpetSensorDescription(
            key="last_visit_duration",
            value_fn=lambda d: get(d, DP.VISIT_DURATION),
            device_class=SensorDeviceClass.DURATION,
            native_unit_of_measurement=UnitOfTime.SECONDS,
            state_class=SensorStateClass.MEASUREMENT,
        ),
        UahpetSensorDescription(
            key="work_status",
            value_fn=lambda d: enum_value(get(d, DP.WORK_STATUS), WORK_STATUSES),
            device_class=SensorDeviceClass.ENUM,
            options=WORK_STATUSES,
        ),
        UahpetSensorDescription(
            key="bin_status",
            value_fn=lambda d: enum_value(get(d, DP.BIN_STATUS), BIN_STATUSES),
            device_class=SensorDeviceClass.ENUM,
            options=BIN_STATUSES,
        ),
        UahpetSensorDescription(
            key="cleanings_today",
            derived_fn=lambda t: t.cleanings(dt_util.now()),
            state_class=SensorStateClass.TOTAL_INCREASING,
        ),
        UahpetSensorDescription(
            key="last_cleaning",
            derived_fn=lambda t: t.last_cleaning,
            device_class=SensorDeviceClass.TIMESTAMP,
        ),
        UahpetSensorDescription(
            key="next_auto_clean",
            derived_fn=lambda t: t.next_auto_clean,
            device_class=SensorDeviceClass.TIMESTAMP,
        ),
        UahpetSensorDescription(
            key="last_bin_emptied",
            derived_fn=lambda t: t.last_bin_emptied,
            device_class=SensorDeviceClass.TIMESTAMP,
        ),
        UahpetSensorDescription(
            key="active_alerts",
            value_fn=lambda d: len(_alerts(d)),
            attrs_fn=lambda d: {"alerts": _alerts(d)},
        ),
        UahpetSensorDescription(
            key="work_log",
            value_fn=lambda d: enum_value(get(d, DP.WORK_LOG), WORK_LOG_STATES),
            device_class=SensorDeviceClass.ENUM,
            options=WORK_LOG_STATES,
            entity_category=_DIAG,
            entity_registry_enabled_default=False,
        ),
        UahpetSensorDescription(
            key="log_code",
            value_fn=lambda d: get(d, DP.LOG),
            attrs_fn=_log_attrs,
            entity_category=_DIAG,
            entity_registry_enabled_default=False,
        ),
    ),
    binary_sensors=(
        *(
            UahpetBinarySensorDescription(key=label, dp=DP.NOTIFICATION, bit=i, device_class=BinarySensorDeviceClass.PROBLEM)
            for i, label in enumerate(NOTIFICATION_BITS)
        ),
        *(
            UahpetBinarySensorDescription(key=label, dp=DP.FAULT, bit=i, device_class=BinarySensorDeviceClass.PROBLEM)
            for i, label in enumerate(FAULT_BITS)
        ),
    ),
    switches=(
        UahpetSwitchDescription(key="auto_clean", dp=DP.AUTO_CLEAN),
        UahpetSwitchDescription(key="sleep_mode", dp=DP.SLEEP, on_value="sleep_on", off_value="sleep_off"),
        UahpetSwitchDescription(key="child_lock", dp=DP.CHILD_LOCK, entity_category=_CONFIG),
        UahpetSwitchDescription(key="ionizer", dp=DP.ANION),
        UahpetSwitchDescription(key="radar", dp=DP.RADAR, entity_category=_CONFIG),
        # Manual motor control / service mode: no safety sequence, hidden by default.
        UahpetSwitchDescription(
            key="motor_forward", dp=DP.FORWARD, entity_category=_CONFIG, entity_registry_enabled_default=False
        ),
        UahpetSwitchDescription(
            key="motor_reverse", dp=DP.REVERSE, entity_category=_CONFIG, entity_registry_enabled_default=False
        ),
        UahpetSwitchDescription(
            key="developer_mode", dp=DP.DEVELOPER_MODE, entity_category=_CONFIG, entity_registry_enabled_default=False
        ),
    ),
    buttons=(
        UahpetButtonDescription(key="clean", dp=DP.START),
        UahpetButtonDescription(key="level", dp=DP.LEVEL),
        UahpetButtonDescription(key="empty", dp=DP.EMPTY),
        UahpetButtonDescription(key="stop", dp=DP.START, press_fn=_stop),
    ),
    numbers=(
        UahpetNumberDescription(
            key="clean_delay",
            dp=DP.DELAY_CLEAN_TIME,
            native_min_value=10,
            native_max_value=1800,
            native_step=1,
            native_unit_of_measurement=UnitOfTime.SECONDS,
            device_class=NumberDeviceClass.DURATION,
            mode=NumberMode.BOX,
            entity_category=_CONFIG,
        ),
        UahpetNumberDescription(
            key="bury_delay",
            dp=DP.BURY_DELAY,
            native_min_value=5,
            native_max_value=60,
            native_step=1,
            native_unit_of_measurement=UnitOfTime.SECONDS,
            device_class=NumberDeviceClass.DURATION,
            mode=NumberMode.SLIDER,
            entity_category=_CONFIG,
        ),
        UahpetNumberDescription(
            key="excessive_visits",
            dp=DP.EXCESSIVE_VISITS,
            native_min_value=0,
            native_max_value=50,
            native_step=1,
            mode=NumberMode.BOX,
            entity_category=_CONFIG,
        ),
    ),
    selects=(
        UahpetSelectDescription(key="litter_type", dp=DP.WORK_MODE, options=WORK_MODES, entity_category=_CONFIG),
        UahpetSelectDescription(key="weight_unit", dp=DP.UNIT, options=UNITS, entity_category=_CONFIG),
    ),
)
