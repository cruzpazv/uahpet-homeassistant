"""Switches."""

from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity, SwitchEntityDescription
from homeassistant.const import STATE_OFF, EntityCategory
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import UahpetConfigEntry
from .descriptions import UahpetSwitchDescription
from .entity import UahpetCatEntity, UahpetEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: UahpetConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    coordinator = entry.runtime_data
    entities: list[SwitchEntity] = [UahpetSwitch(coordinator, d) for d in coordinator.profile.switches]
    if coordinator.cats and coordinator.cats.profiles:
        entities.append(ShowUnidentifiedSwitch(coordinator))
    async_add_entities(entities)


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


class ShowUnidentifiedSwitch(UahpetCatEntity, SwitchEntity, RestoreEntity):
    """Display preference for the cards: show or hide unidentified visits. Nothing is deleted."""

    def __init__(self, coordinator) -> None:
        super().__init__(coordinator, SwitchEntityDescription(
            key="show_unidentified", translation_key="show_unidentified", entity_category=EntityCategory.CONFIG))
        self._attr_is_on = True

    @property
    def is_on(self) -> bool:
        return self._attr_is_on

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        if (last := await self.async_get_last_state()) is not None:
            self._attr_is_on = last.state != STATE_OFF

    async def async_turn_on(self, **kwargs: Any) -> None:
        self._attr_is_on = True
        self.async_write_ha_state()

    async def async_turn_off(self, **kwargs: Any) -> None:
        self._attr_is_on = False
        self.async_write_ha_state()
