"""Sensors."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import UahpetConfigEntry
from .descriptions import UahpetSensorDescription
from .entity import UahpetEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: UahpetConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    coordinator = entry.runtime_data
    async_add_entities(UahpetSensor(coordinator, d) for d in coordinator.profile.sensors)


class UahpetSensor(UahpetEntity, SensorEntity):
    entity_description: UahpetSensorDescription

    @property
    def native_value(self) -> Any:
        desc = self.entity_description
        if desc.derived_fn:
            return desc.derived_fn(self.coordinator.tracker) if self.coordinator.tracker else None
        return desc.value_fn(self.coordinator.data) if desc.value_fn else None

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        fn = self.entity_description.attrs_fn
        return fn(self.coordinator.data) if fn else None
