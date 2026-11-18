"""Fan: air purifiers (power, preset modes, every speed of the device)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.fan import FanEntity, FanEntityFeature
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import UahpetConfigEntry
from .descriptions import UahpetFanDescription, percentage_to_speed, speed_to_percentage
from .entity import UahpetEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: UahpetConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    coordinator = entry.runtime_data
    async_add_entities(UahpetFan(coordinator, d) for d in coordinator.profile.fans)


class UahpetFan(UahpetEntity, FanEntity):
    entity_description: UahpetFanDescription
    _attr_name = None  # the device's main entity

    def __init__(self, coordinator, description: UahpetFanDescription) -> None:
        super().__init__(coordinator, description)
        features = FanEntityFeature.TURN_ON | FanEntityFeature.TURN_OFF
        if description.speed_dp and description.speeds:
            features |= FanEntityFeature.SET_SPEED
            self._attr_speed_count = len(description.speeds)
        if description.mode_dp and description.modes:
            features |= FanEntityFeature.PRESET_MODE
            self._attr_preset_modes = list(description.modes)
        self._attr_supported_features = features

    @property
    def is_on(self) -> bool | None:
        value = self.dp_value(self.entity_description.switch_dp)
        return None if value is None else bool(value)

    @property
    def percentage(self) -> int | None:
        d = self.entity_description
        return speed_to_percentage(d.speeds, self.dp_value(d.speed_dp)) if d.speed_dp else None

    @property
    def preset_mode(self) -> str | None:
        d = self.entity_description
        value = self.dp_value(d.mode_dp) if d.mode_dp else None
        return value if value in d.modes else None

    async def async_set_percentage(self, percentage: int) -> None:
        d = self.entity_description
        if percentage == 0:
            await self.async_turn_off()
            return
        await self.coordinator.async_set_dp(d.speed_dp, percentage_to_speed(d.speeds, percentage))

    async def async_set_preset_mode(self, preset_mode: str) -> None:
        await self.coordinator.async_set_dp(self.entity_description.mode_dp, preset_mode)

    async def async_turn_on(self, percentage: int | None = None, preset_mode: str | None = None, **kwargs: Any) -> None:
        await self.coordinator.async_set_dp(self.entity_description.switch_dp, True)
        if preset_mode:
            await self.async_set_preset_mode(preset_mode)
        if percentage:
            await self.async_set_percentage(percentage)

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self.coordinator.async_set_dp(self.entity_description.switch_dp, False)
