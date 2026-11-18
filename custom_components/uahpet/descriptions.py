"""Entity descriptions shared by every device profile."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any

from homeassistant.components.binary_sensor import BinarySensorEntityDescription
from homeassistant.components.button import ButtonEntityDescription
from homeassistant.components.fan import FanEntityDescription
from homeassistant.components.number import NumberEntityDescription
from homeassistant.components.select import SelectEntityDescription
from homeassistant.components.sensor import SensorEntityDescription
from homeassistant.components.switch import SwitchEntityDescription

DPS = dict[str, Any]


@dataclass(frozen=True, kw_only=True)
class UahpetSensorDescription(SensorEntityDescription):
    value_fn: Callable[[DPS], Any] | None = None
    attrs_fn: Callable[[DPS], dict[str, Any]] | None = None
    derived_fn: Callable[[Any], Any] | None = None  # reads the profile's tracker instead of the DPs
    derived_attrs_fn: Callable[[Any], dict[str, Any]] | None = None


@dataclass(frozen=True, kw_only=True)
class UahpetBinarySensorDescription(BinarySensorEntityDescription):
    """One bit of a bitmap DP, or a value derived by the profile's tracker."""

    dp: int = 0
    bit: int = 0
    derived_fn: Callable[[Any], bool | None] | None = None


@dataclass(frozen=True, kw_only=True)
class UahpetSwitchDescription(SwitchEntityDescription):
    dp: int
    on_value: Any = True
    off_value: Any = False


@dataclass(frozen=True, kw_only=True)
class UahpetButtonDescription(ButtonEntityDescription):
    dp: int
    press_value: Any = True
    press_fn: Callable[[DPS], tuple[int, Any] | None] | None = None  # (dp, value) chosen from the state


@dataclass(frozen=True, kw_only=True)
class UahpetNumberDescription(NumberEntityDescription):
    dp: int


@dataclass(frozen=True, kw_only=True)
class UahpetSelectDescription(SelectEntityDescription):
    dp: int


@dataclass(frozen=True, kw_only=True)
class UahpetFanDescription(FanEntityDescription):
    switch_dp: int
    mode_dp: int | None = None
    modes: list[str] = field(default_factory=list)
    speed_dp: int | None = None
    speeds: list[str] = field(default_factory=list)  # slowest first


def speed_to_percentage(speeds: list[str], value: Any) -> int | None:
    """Same mapping as Home Assistant's Tuya integration: position * 100 // count."""
    if value not in speeds:
        return None
    return (speeds.index(value) + 1) * 100 // len(speeds)


def percentage_to_speed(speeds: list[str], percentage: int) -> str:
    for i, speed in enumerate(speeds):
        if percentage <= (i + 1) * 100 // len(speeds):
            return speed
    return speeds[-1]
