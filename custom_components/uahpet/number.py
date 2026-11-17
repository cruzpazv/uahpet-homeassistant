"""Number settings."""

from __future__ import annotations

from homeassistant.components.number import NumberEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import UahpetConfigEntry
from .descriptions import UahpetNumberDescription
from .entity import UahpetEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: UahpetConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    coordinator = entry.runtime_data
    async_add_entities(UahpetNumber(coordinator, d) for d in coordinator.profile.numbers)


class UahpetNumber(UahpetEntity, NumberEntity):
    entity_description: UahpetNumberDescription

    @property
    def native_value(self) -> float | None:
        return self.dp_value(self.entity_description.dp)

    async def async_set_native_value(self, value: float) -> None:
        await self.coordinator.async_set_dp(self.entity_description.dp, int(value))
