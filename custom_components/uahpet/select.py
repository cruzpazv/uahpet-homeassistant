"""Select settings."""

from __future__ import annotations

from homeassistant.components.select import SelectEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import UahpetConfigEntry
from .descriptions import UahpetSelectDescription
from .entity import UahpetEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: UahpetConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    coordinator = entry.runtime_data
    async_add_entities(UahpetSelect(coordinator, d) for d in coordinator.profile.selects)


class UahpetSelect(UahpetEntity, SelectEntity):
    entity_description: UahpetSelectDescription

    @property
    def current_option(self) -> str | None:
        value = self.dp_value(self.entity_description.dp)
        return value if value in self.options else None

    async def async_select_option(self, option: str) -> None:
        await self.coordinator.async_set_dp(self.entity_description.dp, option)
