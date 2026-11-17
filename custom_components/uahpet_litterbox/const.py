"""Constants for UAHPET Litterbox."""

from __future__ import annotations

DOMAIN = "uahpet_litterbox"

CONF_DEVICE_ID = "device_id"
CONF_LOCAL_KEY = "local_key"
CONF_PROTOCOL = "protocol_version"

PROTOCOL_AUTO = "auto"
PROTOCOLS = [PROTOCOL_AUTO, "3.5", "3.4", "3.3", "3.2", "3.1"]
AUTO_PROTOCOL_ORDER = ["3.5", "3.4", "3.3"]

DEFAULT_NAME = "UAHPET Litterbox"
MANUFACTURER = "UAHPET"
MODEL = "Stainless steel smart litter box"
