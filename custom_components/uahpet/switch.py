"""Switches."""

from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import UahpetConfigEntry
from .descriptions import UahpetSwitchDescription
from .entity import UahpetEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: UahpetConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    coordinator = entry.runtime_data
    async_add_entities(UahpetSwitch(coordinator, d) for d in coordinator.profile.switches)


class UahpetSwitch(UahpetEntity, SwitchEntity):
    entity_description: UahpetSwitchDescription

    @property
    def is_on(self) -> bool | None:
        value = self.dp_value(self.entity_description.dp)
        return None if value is None else value == self.entity_description.on_value

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self.coordinator.async_set_dp(self.entity_description.dp, self.entity_description.on_value)

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self.coordinator.async_set_dp(self.entity_description.dp, self.entity_description.off_value)
