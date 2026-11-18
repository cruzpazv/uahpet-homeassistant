"""Device profiles: one per UAHPET device type.

Adding a device = new module here with a Profile, appended to PROFILES, plus
translations for its entity keys. Get the DPs with tools/tuya_schema.py.
"""

from __future__ import annotations

from typing import Any

from .base import Profile
from .litterbox import LITTERBOX
from .purifier import PURIFIER

PROFILES: tuple[Profile, ...] = (LITTERBOX, PURIFIER)
PROFILES_BY_KEY = {p.key: p for p in PROFILES}


def detect_profile(dps: dict[str, Any]) -> Profile | None:
    return next((p for p in PROFILES if p.matches(dps)), None)
