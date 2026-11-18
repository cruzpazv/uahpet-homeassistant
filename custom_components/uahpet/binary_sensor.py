"""Binary sensors (bits of bitmap DPs)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.binary_sensor import BinarySensorDeviceClass, BinarySensorEntity, BinarySensorEntityDescription
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import UahpetConfigEntry
from .descriptions import UahpetBinarySensorDescription
from .dps import bit
from homeassistant.util import slugify

from .entity import UahpetCatEntity, UahpetEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: UahpetConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    coordinator = entry.runtime_data
    entities: list[BinarySensorEntity] = [UahpetBinarySensor(coordinator, d) for d in coordinator.profile.binary_sensors]
    if coordinator.cats and coordinator.cats.profiles:
        entities += [CatHealthSensor(coordinator, cat) for cat in coordinator.cats.names]
    async_add_entities(entities)


class UahpetBinarySensor(UahpetEntity, BinarySensorEntity):
    entity_description: UahpetBinarySensorDescription

    @property
    def is_on(self) -> bool | None:
        desc = self.entity_description
        if desc.derived_fn:
            return desc.derived_fn(self.coordinator.tracker) if self.coordinator.tracker else None
        return bit(self.dp_value(desc.dp), desc.bit)


class CatHealthSensor(UahpetCatEntity, BinarySensorEntity):
    """On when one of the cat's health signals is active; `reasons` says which."""

    def __init__(self, coordinator, cat: str) -> None:
        super().__init__(coordinator, BinarySensorEntityDescription(
            key=f"cat_{slugify(cat)}_health", translation_key="cat_health", device_class=BinarySensorDeviceClass.PROBLEM), cat)

    @property
    def is_on(self) -> bool:
        return bool(self.coordinator.cats.health.get(self.cat))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        active = self.coordinator.cats.health.get(self.cat, {})
        return {**self.cat_attributes(), "reasons": list(active), **active}
