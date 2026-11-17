"""Base entity."""

from __future__ import annotations

from typing import Any

from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import EntityDescription
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, MANUFACTURER, MODEL
from .coordinator import LitterboxCoordinator
from .dps import get


class LitterboxEntity(CoordinatorEntity[LitterboxCoordinator]):
    """Entity bound to one DP. translation_key = description key (cards rely on it)."""

    _attr_has_entity_name = True

    def __init__(self, coordinator: LitterboxCoordinator, description: EntityDescription) -> None:
        super().__init__(coordinator)
        self.entity_description = description
        self._attr_translation_key = description.translation_key or description.key
        self._attr_unique_id = f"{coordinator.device_id}_{description.key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, coordinator.device_id)},
            name=coordinator.config_entry.title,
            manufacturer=MANUFACTURER,
            model=MODEL,
        )

    def dp_value(self, dp: int) -> Any:
        return get(self.coordinator.data, dp)
