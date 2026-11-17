"""Binary sensors (bits of bitmap DPs)."""

from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import UahpetConfigEntry
from .descriptions import UahpetBinarySensorDescription
from .dps import bit
from .entity import UahpetEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: UahpetConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    coordinator = entry.runtime_data
    async_add_entities(UahpetBinarySensor(coordinator, d) for d in coordinator.profile.binary_sensors)


class UahpetBinarySensor(UahpetEntity, BinarySensorEntity):
    entity_description: UahpetBinarySensorDescription

    @property
    def is_on(self) -> bool | None:
        return bit(self.dp_value(self.entity_description.dp), self.entity_description.bit)
