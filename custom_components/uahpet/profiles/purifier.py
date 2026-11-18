"""Pet Air Purifier Slim: Tuya category kj, product dhhzjzdaiyshx2md (app code "jhq").

The Tuya cloud's standard instruction set declares a single fan speed ("sleep") for this product,
so the official Tuya integration can't set speeds 1-3. Locally the device takes all four.
"""

from __future__ import annotations

from enum import IntEnum

from homeassistant.components.sensor import SensorDeviceClass, SensorStateClass
from homeassistant.const import PERCENTAGE, EntityCategory

from ..descriptions import UahpetFanDescription, UahpetSelectDescription, UahpetSensorDescription, UahpetSwitchDescription
from ..dps import enum_value, get
from .base import Profile


class DP(IntEnum):
    SWITCH = 1
    MODE = 3  # manual, auto, sleep, tipping (tipped over: an alert, not a choice)
    SPEED = 4  # sleep, P1, P2, P3
    FILTER = 5  # filter life left, %
    CHILD_LOCK = 7
    FILTER_RESET = 11
    COUNTDOWN = 18  # cancel, 2h … 10h
    AIR_QUALITY = 21  # great, medium, severe


MODES = ["manual", "auto", "sleep", "tipping"]
SPEEDS = ["sleep", "P1", "P2", "P3"]
TIMERS = ["cancel", "2h", "4h", "6h", "8h", "10h"]
AIR = ["great", "medium", "severe"]

PURIFIER = Profile(
    key="purifier",
    default_name="UAHPET Air Purifier",
    model="Pet Air Purifier Slim",
    tuya_category="kj",
    product_ids=("dhhzjzdaiyshx2md",),
    signature=frozenset({str(DP.SWITCH), str(DP.MODE), str(DP.SPEED), str(DP.FILTER), str(DP.AIR_QUALITY)}),
    # translation keys match the Tuya integration's, so the purifier cards work with either
    fans=(UahpetFanDescription(key="purifier", switch_dp=DP.SWITCH, mode_dp=DP.MODE, modes=MODES, speed_dp=DP.SPEED, speeds=SPEEDS),),
    sensors=(
        UahpetSensorDescription(
            key="air_quality", value_fn=lambda d: enum_value(get(d, DP.AIR_QUALITY), AIR),
            device_class=SensorDeviceClass.ENUM, options=AIR,
        ),
        UahpetSensorDescription(
            key="filter_utilization", value_fn=lambda d: get(d, DP.FILTER),
            native_unit_of_measurement=PERCENTAGE, state_class=SensorStateClass.MEASUREMENT,
        ),
    ),
    switches=(
        UahpetSwitchDescription(key="child_lock", dp=DP.CHILD_LOCK, entity_category=EntityCategory.CONFIG),
        UahpetSwitchDescription(key="filter_cartridge_reset", dp=DP.FILTER_RESET, entity_category=EntityCategory.CONFIG),
    ),
    selects=(UahpetSelectDescription(key="countdown", dp=DP.COUNTDOWN, options=TIMERS),),
)
