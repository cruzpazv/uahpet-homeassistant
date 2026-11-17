"""Profile definition."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ..descriptions import (
    UahpetBinarySensorDescription,
    UahpetButtonDescription,
    UahpetNumberDescription,
    UahpetSelectDescription,
    UahpetSensorDescription,
    UahpetSwitchDescription,
)


@dataclass(frozen=True, kw_only=True)
class Profile:
    key: str  # stored in the config entry
    default_name: str
    model: str
    tuya_category: str
    product_ids: tuple[str, ...]
    signature: frozenset[str]  # DP ids that must all be reported to recognise the device
    sensors: tuple[UahpetSensorDescription, ...] = ()
    binary_sensors: tuple[UahpetBinarySensorDescription, ...] = ()
    switches: tuple[UahpetSwitchDescription, ...] = ()
    buttons: tuple[UahpetButtonDescription, ...] = ()
    numbers: tuple[UahpetNumberDescription, ...] = ()
    selects: tuple[UahpetSelectDescription, ...] = ()

    def matches(self, dps: dict[str, Any]) -> bool:
        return self.signature <= set(dps)
