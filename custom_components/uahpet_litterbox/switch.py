"""Switches."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from homeassistant.components.switch import SwitchEntity, SwitchEntityDescription
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import LitterboxConfigEntry
from .dps import DP, SLEEP_OFF, SLEEP_ON
from .entity import LitterboxEntity


@dataclass(frozen=True, kw_only=True)
class LitterboxSwitchDescription(SwitchEntityDescription):
    dp: DP
    on_value: Any = True
    off_value: Any = False


SWITCHES: tuple[LitterboxSwitchDescription, ...] = (
    LitterboxSwitchDescription(key="auto_clean", dp=DP.AUTO_CLEAN),
    LitterboxSwitchDescription(key="sleep_mode", dp=DP.SLEEP, on_value=SLEEP_ON, off_value=SLEEP_OFF),
    LitterboxSwitchDescription(key="child_lock", dp=DP.CHILD_LOCK, entity_category=EntityCategory.CONFIG),
    LitterboxSwitchDescription(key="ionizer", dp=DP.ANION),
    LitterboxSwitchDescription(key="radar", dp=DP.RADAR, entity_category=EntityCategory.CONFIG),
    # Manual motor control / service mode: no safety sequence, hidden by default.
    LitterboxSwitchDescription(
        key="motor_forward", dp=DP.FORWARD, entity_category=EntityCategory.CONFIG, entity_registry_enabled_default=False
    ),
    LitterboxSwitchDescription(
        key="motor_reverse", dp=DP.REVERSE, entity_category=EntityCategory.CONFIG, entity_registry_enabled_default=False
    ),
    LitterboxSwitchDescription(
        key="developer_mode",
        dp=DP.DEVELOPER_MODE,
        entity_category=EntityCategory.CONFIG,
        entity_registry_enabled_default=False,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant, entry: LitterboxConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    async_add_entities(LitterboxSwitch(entry.runtime_data, d) for d in SWITCHES)


class LitterboxSwitch(LitterboxEntity, SwitchEntity):
    entity_description: LitterboxSwitchDescription

    @property
    def is_on(self) -> bool | None:
        value = self.dp_value(self.entity_description.dp)
        return None if value is None else value == self.entity_description.on_value

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self.coordinator.async_set_dp(self.entity_description.dp, self.entity_description.on_value)

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self.coordinator.async_set_dp(self.entity_description.dp, self.entity_description.off_value)
