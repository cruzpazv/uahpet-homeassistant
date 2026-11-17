"""Alert binary sensors (bitmaps DP 21 and DP 22)."""

from __future__ import annotations

from dataclasses import dataclass

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
    BinarySensorEntityDescription,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import LitterboxConfigEntry
from .dps import DP, FAULT_BITS, NOTIFICATION_BITS, bit
from .entity import LitterboxEntity


@dataclass(frozen=True, kw_only=True)
class LitterboxBinaryDescription(BinarySensorEntityDescription):
    dp: DP
    bit: int


BINARY_SENSORS: tuple[LitterboxBinaryDescription, ...] = (
    *(
        LitterboxBinaryDescription(key=label, dp=DP.NOTIFICATION, bit=i, device_class=BinarySensorDeviceClass.PROBLEM)
        for i, label in enumerate(NOTIFICATION_BITS)
    ),
    *(
        LitterboxBinaryDescription(key=label, dp=DP.FAULT, bit=i, device_class=BinarySensorDeviceClass.PROBLEM)
        for i, label in enumerate(FAULT_BITS)
    ),
)


async def async_setup_entry(
    hass: HomeAssistant, entry: LitterboxConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    async_add_entities(LitterboxBinarySensor(entry.runtime_data, d) for d in BINARY_SENSORS)


class LitterboxBinarySensor(LitterboxEntity, BinarySensorEntity):
    entity_description: LitterboxBinaryDescription

    @property
    def is_on(self) -> bool | None:
        return bit(self.dp_value(self.entity_description.dp), self.entity_description.bit)
