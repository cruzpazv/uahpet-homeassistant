"""Number settings."""

from __future__ import annotations

from dataclasses import dataclass

from homeassistant.components.number import (
    NumberDeviceClass,
    NumberEntity,
    NumberEntityDescription,
    NumberMode,
)
from homeassistant.const import EntityCategory, UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import LitterboxConfigEntry
from .dps import DP
from .entity import LitterboxEntity


@dataclass(frozen=True, kw_only=True)
class LitterboxNumberDescription(NumberEntityDescription):
    dp: DP


NUMBERS: tuple[LitterboxNumberDescription, ...] = (
    LitterboxNumberDescription(
        key="clean_delay",
        dp=DP.DELAY_CLEAN_TIME,
        native_min_value=10,
        native_max_value=1800,
        native_step=1,
        native_unit_of_measurement=UnitOfTime.SECONDS,
        device_class=NumberDeviceClass.DURATION,
        mode=NumberMode.BOX,
        entity_category=EntityCategory.CONFIG,
    ),
    LitterboxNumberDescription(
        key="bury_delay",
        dp=DP.BURY_DELAY,
        native_min_value=5,
        native_max_value=60,
        native_step=1,
        native_unit_of_measurement=UnitOfTime.SECONDS,
        device_class=NumberDeviceClass.DURATION,
        mode=NumberMode.SLIDER,
        entity_category=EntityCategory.CONFIG,
    ),
    LitterboxNumberDescription(
        key="excessive_visits",
        dp=DP.EXCESSIVE_VISITS,
        native_min_value=0,
        native_max_value=50,
        native_step=1,
        mode=NumberMode.BOX,
        entity_category=EntityCategory.CONFIG,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant, entry: LitterboxConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    async_add_entities(LitterboxNumber(entry.runtime_data, d) for d in NUMBERS)


class LitterboxNumber(LitterboxEntity, NumberEntity):
    entity_description: LitterboxNumberDescription

    @property
    def native_value(self) -> float | None:
        return self.dp_value(self.entity_description.dp)

    async def async_set_native_value(self, value: float) -> None:
        await self.coordinator.async_set_dp(self.entity_description.dp, int(value))
