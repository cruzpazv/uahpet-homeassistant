"""Action buttons."""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import UahpetConfigEntry
from .descriptions import UahpetButtonDescription
from .entity import UahpetEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: UahpetConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    coordinator = entry.runtime_data
    async_add_entities(UahpetButton(coordinator, d) for d in coordinator.profile.buttons)


class UahpetButton(UahpetEntity, ButtonEntity):
    entity_description: UahpetButtonDescription

    async def async_press(self) -> None:
        await self.coordinator.async_set_dp(
            self.entity_description.dp, self.entity_description.press_value, optimistic=False
        )
