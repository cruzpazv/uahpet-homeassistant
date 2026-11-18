"""Action buttons."""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
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
        desc = self.entity_description
        if desc.press_fn:
            target = desc.press_fn(self.coordinator.data or {})
            if target is None:
                raise HomeAssistantError("Nothing to stop: the litter box is not cleaning, levelling or emptying")
            await self.coordinator.async_set_dp(*target, optimistic=False)
            return
        await self.coordinator.async_set_dp(desc.dp, desc.press_value, optimistic=False)
