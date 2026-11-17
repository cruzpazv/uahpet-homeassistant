"""Sensors."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.const import EntityCategory, UnitOfMass, UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import LitterboxConfigEntry
from .dps import (
    BIN_STATUSES,
    DP,
    FAULT_BITS,
    NOTIFICATION_BITS,
    WORK_LOG_STATES,
    WORK_STATUSES,
    active_bits,
    get,
    log_bytes,
    scaled,
)
from .entity import LitterboxEntity


def _enum(options: list[str]) -> Callable[[Any], str | None]:
    return lambda v: v if v in options else None


def _alerts(dps: dict[str, Any]) -> list[str]:
    return active_bits(get(dps, DP.NOTIFICATION), NOTIFICATION_BITS) + active_bits(get(dps, DP.FAULT), FAULT_BITS)


@dataclass(frozen=True, kw_only=True)
class LitterboxSensorDescription(SensorEntityDescription):
    value_fn: Callable[[dict[str, Any]], Any]
    attrs_fn: Callable[[dict[str, Any]], dict[str, Any]] | None = None


SENSORS: tuple[LitterboxSensorDescription, ...] = (
    LitterboxSensorDescription(
        key="last_cat_weight",
        value_fn=lambda d: scaled(get(d, DP.LAST_CAT_WEIGHT), 1),
        device_class=SensorDeviceClass.WEIGHT,
        native_unit_of_measurement=UnitOfMass.KILOGRAMS,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
    ),
    LitterboxSensorDescription(
        key="cat_weight",
        value_fn=lambda d: scaled(get(d, DP.CAT_WEIGHT), 3),
        device_class=SensorDeviceClass.WEIGHT,
        native_unit_of_measurement=UnitOfMass.KILOGRAMS,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
    ),
    LitterboxSensorDescription(
        key="visits_today",
        value_fn=lambda d: get(d, DP.VISITS_TODAY),
        state_class=SensorStateClass.TOTAL_INCREASING,
    ),
    LitterboxSensorDescription(
        key="last_visit_duration",
        value_fn=lambda d: get(d, DP.VISIT_DURATION),
        device_class=SensorDeviceClass.DURATION,
        native_unit_of_measurement=UnitOfTime.SECONDS,
        state_class=SensorStateClass.MEASUREMENT,
    ),
    LitterboxSensorDescription(
        key="work_status",
        value_fn=lambda d: _enum(WORK_STATUSES)(get(d, DP.WORK_STATUS)),
        device_class=SensorDeviceClass.ENUM,
        options=WORK_STATUSES,
    ),
    LitterboxSensorDescription(
        key="bin_status",
        value_fn=lambda d: _enum(BIN_STATUSES)(get(d, DP.BIN_STATUS)),
        device_class=SensorDeviceClass.ENUM,
        options=BIN_STATUSES,
    ),
    LitterboxSensorDescription(
        key="active_alerts",
        value_fn=lambda d: len(_alerts(d)),
        attrs_fn=lambda d: {"alerts": _alerts(d)},
    ),
    LitterboxSensorDescription(
        key="work_log",
        value_fn=lambda d: _enum(WORK_LOG_STATES)(get(d, DP.WORK_LOG)),
        device_class=SensorDeviceClass.ENUM,
        options=WORK_LOG_STATES,
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
    ),
    LitterboxSensorDescription(
        key="log_code",
        value_fn=lambda d: get(d, DP.LOG),
        attrs_fn=lambda d: {
            "bytes": log_bytes(get(d, DP.LOG)),
            "hex": None if get(d, DP.LOG) is None else f"{int(get(d, DP.LOG)):08x}",
        },
        entity_category=EntityCategory.DIAGNOSTIC,
        entity_registry_enabled_default=False,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant, entry: LitterboxConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    async_add_entities(LitterboxSensor(entry.runtime_data, d) for d in SENSORS)


class LitterboxSensor(LitterboxEntity, SensorEntity):
    entity_description: LitterboxSensorDescription

    @property
    def native_value(self) -> Any:
        return self.entity_description.value_fn(self.coordinator.data)

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        fn = self.entity_description.attrs_fn
        return fn(self.coordinator.data) if fn else None
