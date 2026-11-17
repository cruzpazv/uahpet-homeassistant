"""Entity descriptions shared by every device profile."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from homeassistant.components.binary_sensor import BinarySensorEntityDescription
from homeassistant.components.button import ButtonEntityDescription
from homeassistant.components.number import NumberEntityDescription
from homeassistant.components.select import SelectEntityDescription
from homeassistant.components.sensor import SensorEntityDescription
from homeassistant.components.switch import SwitchEntityDescription

DPS = dict[str, Any]


@dataclass(frozen=True, kw_only=True)
class UahpetSensorDescription(SensorEntityDescription):
    value_fn: Callable[[DPS], Any]
    attrs_fn: Callable[[DPS], dict[str, Any]] | None = None


@dataclass(frozen=True, kw_only=True)
class UahpetBinarySensorDescription(BinarySensorEntityDescription):
    """One bit of a bitmap DP."""

    dp: int
    bit: int


@dataclass(frozen=True, kw_only=True)
class UahpetSwitchDescription(SwitchEntityDescription):
    dp: int
    on_value: Any = True
    off_value: Any = False


@dataclass(frozen=True, kw_only=True)
class UahpetButtonDescription(ButtonEntityDescription):
    dp: int
    press_value: Any = True


@dataclass(frozen=True, kw_only=True)
class UahpetNumberDescription(NumberEntityDescription):
    dp: int


@dataclass(frozen=True, kw_only=True)
class UahpetSelectDescription(SelectEntityDescription):
    dp: int
