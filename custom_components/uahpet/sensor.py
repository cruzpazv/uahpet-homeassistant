"""Sensors."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.const import UnitOfMass
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from homeassistant.util import dt as dt_util, slugify

from .cats import HISTORY_SIZE, UNIDENTIFIED
from .coordinator import UahpetConfigEntry, UahpetCoordinator
from .descriptions import UahpetSensorDescription
from .entity import UahpetEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: UahpetConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    coordinator = entry.runtime_data
    entities: list[SensorEntity] = [UahpetSensor(coordinator, d) for d in coordinator.profile.sensors]
    if coordinator.cats and coordinator.cats.profiles:
        entities += [LastVisitSensor(coordinator), UnidentifiedTodaySensor(coordinator)]
        for name in coordinator.cats.names:
            entities += [CatWeightSensor(coordinator, name), CatVisitsSensor(coordinator, name), CatLastVisitSensor(coordinator, name)]
    async_add_entities(entities)


def cat_unique_suffixes(name: str) -> list[str]:
    """unique_id suffixes of a cat's entities (kept in sync with the classes below)."""
    return [f"cat_{slugify(name)}_{part}" for part in ("weight", "visits_today", "last_visit", "health", "recalibrate")]


class UahpetSensor(UahpetEntity, SensorEntity):
    entity_description: UahpetSensorDescription

    @property
    def native_value(self) -> Any:
        desc = self.entity_description
        if desc.derived_fn:
            return desc.derived_fn(self.coordinator.tracker) if self.coordinator.tracker else None
        return desc.value_fn(self.coordinator.data) if desc.value_fn else None

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        desc = self.entity_description
        if desc.derived_attrs_fn and self.coordinator.tracker:
            return desc.derived_attrs_fn(self.coordinator.tracker)
        return desc.attrs_fn(self.coordinator.data) if desc.attrs_fn else None


# ---------- cat profiles (built-in identification) ----------


class CatSensor(UahpetEntity, SensorEntity):
    """Entity of the built-in cat identification; translation keys match Litter Cat Identifier."""

    def __init__(self, coordinator: UahpetCoordinator, key: str, translation_key: str, cat: str | None = None, **kw: Any) -> None:
        super().__init__(coordinator, SensorEntityDescription(key=key, translation_key=translation_key, **kw))
        self.cat = cat
        if cat:
            self._attr_translation_placeholders = {"cat": cat}

    @property
    def available(self) -> bool:
        return True  # computed by Home Assistant, not read from the device

    @property
    def entity_picture(self) -> str | None:
        return (self.coordinator.cats.profiles.get(self.cat) or {}).get("picture") if self.cat else None

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        if not self.cat:
            return None
        color = (self.coordinator.cats.profiles.get(self.cat) or {}).get("color")
        return {"cat": self.cat, "color": color} if color else {"cat": self.cat}


class CatWeightSensor(CatSensor):
    def __init__(self, coordinator: UahpetCoordinator, cat: str) -> None:
        super().__init__(
            coordinator, f"cat_{slugify(cat)}_weight", "cat_learned_weight", cat,
            device_class=SensorDeviceClass.WEIGHT, native_unit_of_measurement=UnitOfMass.KILOGRAMS,
            state_class=SensorStateClass.MEASUREMENT, suggested_display_precision=2,
        )

    @property
    def native_value(self) -> float | None:
        return self.coordinator.cats.learned.get(self.cat)


class CatVisitsSensor(CatSensor):
    def __init__(self, coordinator: UahpetCoordinator, cat: str) -> None:
        super().__init__(coordinator, f"cat_{slugify(cat)}_visits_today", "cat_visits_today", cat,
                         state_class=SensorStateClass.TOTAL_INCREASING)

    @property
    def native_value(self) -> int:
        return self.coordinator.cats.visits(self.cat, dt_util.now())


class CatLastVisitSensor(CatSensor):
    def __init__(self, coordinator: UahpetCoordinator, cat: str) -> None:
        super().__init__(coordinator, f"cat_{slugify(cat)}_last_visit", "cat_last_visit", cat,
                         device_class=SensorDeviceClass.TIMESTAMP)

    @property
    def native_value(self) -> datetime | None:
        last = self.coordinator.cats.last_visit.get(self.cat)
        return datetime.fromisoformat(last) if last else None


class LastVisitSensor(CatSensor):
    _unrecorded_attributes = frozenset({"history"})

    def __init__(self, coordinator: UahpetCoordinator) -> None:
        super().__init__(coordinator, "last_visit", "last_visit", device_class=SensorDeviceClass.ENUM)
        self._attr_options = [*coordinator.cats.names, UNIDENTIFIED]

    @property
    def native_value(self) -> str | None:
        h = self.coordinator.cats.history
        return h[0]["cat"] if h else None

    @property
    def entity_picture(self) -> str | None:
        cat = self.native_value
        return (self.coordinator.cats.profiles.get(cat) or {}).get("picture") if cat else None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        h = self.coordinator.cats.history
        last = h[0] if h else {}
        return {
            "time": last.get("time"), "weight": last.get("weight"), "duration": last.get("duration"),
            "reason": last.get("reason"), "likely_cat": last.get("likely_cat"), "history": h[:HISTORY_SIZE],
        }


class UnidentifiedTodaySensor(CatSensor):
    def __init__(self, coordinator: UahpetCoordinator) -> None:
        super().__init__(coordinator, "unidentified_today", "unidentified_today", state_class=SensorStateClass.TOTAL_INCREASING)

    @property
    def native_value(self) -> int:
        return self.coordinator.cats.visits(UNIDENTIFIED, dt_util.now())
