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
