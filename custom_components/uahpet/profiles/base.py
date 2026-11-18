"""Profile definition."""

from __future__ import annotations

from collections.abc import Callable
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
    fans: tuple[Any, ...] = ()  # UahpetFanDescription (fan.py)
    # Derived values (see tracker.py) and the visit event, when the device has them.
    tracker_factory: Callable[[], Any] | None = None
    visit_data: Callable[[dict[str, Any]], dict[str, Any]] | None = None
    visit_dps: tuple[str, ...] = ()  # DPs a visit waits for before its event fires
    # Why an unidentified reading is not a cat, from the device state (cat profiles)
    visit_reason: Callable[[dict[str, Any]], str | None] | None = None

    def matches(self, dps: dict[str, Any]) -> bool:
        return self.signature <= set(dps)
