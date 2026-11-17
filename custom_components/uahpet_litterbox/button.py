"""Action buttons: clean, level, empty."""

from __future__ import annotations

from dataclasses import dataclass

from homeassistant.components.button import ButtonEntity, ButtonEntityDescription
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import LitterboxConfigEntry
from .dps import DP
from .entity import LitterboxEntity


@dataclass(frozen=True, kw_only=True)
class LitterboxButtonDescription(ButtonEntityDescription):
    dp: DP


BUTTONS: tuple[LitterboxButtonDescription, ...] = (
    LitterboxButtonDescription(key="clean", dp=DP.START),
    LitterboxButtonDescription(key="level", dp=DP.LEVEL),
    LitterboxButtonDescription(key="empty", dp=DP.EMPTY),
)


async def async_setup_entry(
    hass: HomeAssistant, entry: LitterboxConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    async_add_entities(LitterboxButton(entry.runtime_data, d) for d in BUTTONS)


class LitterboxButton(LitterboxEntity, ButtonEntity):
    entity_description: LitterboxButtonDescription

    async def async_press(self) -> None:
        await self.coordinator.async_set_dp(self.entity_description.dp, True, optimistic=False)
