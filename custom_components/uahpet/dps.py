"""Generic Tuya DP value helpers. Pure Python: no Home Assistant imports."""

from __future__ import annotations

from typing import Any


def get(dps: dict[str, Any] | None, dp: int) -> Any:
    """Value of a DP from the device state (keys are strings), or None."""
    return None if dps is None else dps.get(str(int(dp)))


def scaled(value: Any, scale: int) -> float | None:
    """Tuya integer with `scale` decimals → float."""
    if value is None:
        return None
    return round(int(value) / 10**scale, scale)


def bit(value: Any, index: int) -> bool | None:
    """Bit `index` of a Tuya bitmap (label i ↔ bit i, LSB first)."""
    if value is None:
        return None
    return bool((int(value) >> index) & 1)


def active_bits(value: Any, labels: list[str]) -> list[str]:
    """Labels whose bit is set."""
    if value is None:
        return []
    return [label for i, label in enumerate(labels) if (int(value) >> i) & 1]


def int_bytes(value: Any) -> list[int] | None:
    """32-bit integer split into 4 bytes, big endian (for undecoded packed DPs)."""
    if value is None:
        return None
    return list(int(value).to_bytes(4, "big", signed=False))


def enum_value(value: Any, options: list[str]) -> str | None:
    """Value if it is a known option (unknown firmware values → None)."""
    return value if value in options else None
