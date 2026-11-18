"""Visit event: one event per litter box visit, with the cat's weight and the visit duration."""

from __future__ import annotations

from typing import Any

from homeassistant.components.event import EventEntity, EventEntityDescription
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import UahpetConfigEntry, UahpetCoordinator, signal_visit
from .entity import UahpetEntity

VISIT = EventEntityDescription(key="visit", event_types=["visit"])


async def async_setup_entry(
    hass: HomeAssistant, entry: UahpetConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    coordinator = entry.runtime_data
    if coordinator.profile.visit_data:
        async_add_entities([UahpetVisitEvent(coordinator)])


class UahpetVisitEvent(UahpetEntity, EventEntity):
    def __init__(self, coordinator: UahpetCoordinator) -> None:
        super().__init__(coordinator, VISIT)

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.async_on_remove(
            async_dispatcher_connect(self.hass, signal_visit(self.coordinator.config_entry.entry_id), self._on_visit)
        )

    @callback
    def _on_visit(self, data: dict[str, Any]) -> None:
        self._trigger_event("visit", data)
        self.async_write_ha_state()
