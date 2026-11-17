"""Select settings."""

from __future__ import annotations

from dataclasses import dataclass

from homeassistant.components.select import SelectEntity, SelectEntityDescription
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import LitterboxConfigEntry
from .dps import DP, UNITS, WORK_MODES
from .entity import LitterboxEntity


@dataclass(frozen=True, kw_only=True)
class LitterboxSelectDescription(SelectEntityDescription):
    dp: DP


SELECTS: tuple[LitterboxSelectDescription, ...] = (
    LitterboxSelectDescription(key="litter_type", dp=DP.WORK_MODE, options=WORK_MODES, entity_category=EntityCategory.CONFIG),
    LitterboxSelectDescription(key="weight_unit", dp=DP.UNIT, options=UNITS, entity_category=EntityCategory.CONFIG),
)


async def async_setup_entry(
    hass: HomeAssistant, entry: LitterboxConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    async_add_entities(LitterboxSelect(entry.runtime_data, d) for d in SELECTS)


class LitterboxSelect(LitterboxEntity, SelectEntity):
    entity_description: LitterboxSelectDescription

    @property
    def current_option(self) -> str | None:
        value = self.dp_value(self.entity_description.dp)
        return value if value in self.options else None

    async def async_select_option(self, option: str) -> None:
        await self.coordinator.async_set_dp(self.entity_description.dp, option)
