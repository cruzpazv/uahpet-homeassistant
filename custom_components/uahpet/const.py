"""Constants for UAHPET."""

from __future__ import annotations

DOMAIN = "uahpet"

CONF_DEVICE_ID = "device_id"
CONF_LOCAL_KEY = "local_key"
CONF_PROTOCOL = "protocol_version"
CONF_PROFILE = "profile"

PROTOCOL_AUTO = "auto"
PROTOCOLS = [PROTOCOL_AUTO, "3.5", "3.4", "3.3", "3.2", "3.1"]
AUTO_PROTOCOL_ORDER = ["3.5", "3.4", "3.3"]

MANUFACTURER = "UAHPET"

# cat profiles (options)
CONF_CATS = "cats"
CONF_CAT_NAME = "name"
CONF_CAT_WEIGHT = "weight"
CONF_CAT_PICTURE = "picture"
CONF_CAT_COLOR = "color"  # [r, g, b]
CONF_TOLERANCE = "tolerance"
CONF_SMOOTHING = "smoothing"
CONF_MIN_WEIGHT = "min_weight"
