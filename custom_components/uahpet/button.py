"""Action buttons."""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity, ButtonEntityDescription
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import UahpetConfigEntry
from .descriptions import UahpetButtonDescription
from homeassistant.util import slugify

from .entity import UahpetCatEntity, UahpetEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: UahpetConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    coordinator = entry.runtime_data
    entities: list[ButtonEntity] = [UahpetButton(coordinator, d) for d in coordinator.profile.buttons]
    if coordinator.cats and coordinator.cats.profiles:
        entities += [ClearUnidentifiedButton(coordinator), *(RecalibrateButton(coordinator, cat) for cat in coordinator.cats.names)]
    async_add_entities(entities)


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


class RecalibrateButton(UahpetCatEntity, ButtonEntity):
    """Reset the cat's learned weight to the median of its latest readings."""

    def __init__(self, coordinator, cat: str) -> None:
        super().__init__(coordinator, ButtonEntityDescription(
            key=f"cat_{slugify(cat)}_recalibrate", translation_key="recalibrate", entity_category=EntityCategory.CONFIG), cat)

    async def async_press(self) -> None:
        try:
            self.coordinator.cats.recalibrate(self.cat)
        except ValueError as err:
            raise HomeAssistantError(str(err)) from err
        self.coordinator.async_cats_changed()


class ClearUnidentifiedButton(UahpetCatEntity, ButtonEntity):
    def __init__(self, coordinator) -> None:
        super().__init__(coordinator, ButtonEntityDescription(
            key="clear_unidentified", translation_key="clear_unidentified", entity_category=EntityCategory.CONFIG))

    async def async_press(self) -> None:
        self.coordinator.cats.clear_unidentified()
        self.coordinator.async_cats_changed()
