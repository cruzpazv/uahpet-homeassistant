"""Shared fixtures: a fake LitterboxClient so no network is touched."""

from __future__ import annotations

from typing import Any
from unittest.mock import patch

import pytest

# Real values read from a UAHPET litter box (product y0kvbmrnprybewtd).
SAMPLE_DPS: dict[str, Any] = {
    "2": "larger_particle", "3": False, "4": True, "5": 480, "6": 0, "7": 8, "8": 21, "21": 0, "22": 0,
    "101": "sleep_off", "102": False, "103": False, "104": False, "105": False, "106": 61, "107": False,
    "108": "standby", "109": 0, "110": 135, "111": "unit_kg", "112": False, "113": "bin_normal",
    "114": True, "115": True, "116": "clean_f", "117": 10, "118": 10, "119": 1477777414,
}


class FakeClient:
    instances: list[FakeClient] = []

    def __init__(self, device_id, host, local_key, version, on_dps, on_connection) -> None:
        self.on_dps, self.on_connection = on_dps, on_connection
        self.sent: list[tuple[int, Any]] = []
        self.started = self.stopped = False
        FakeClient.instances.append(self)

    def start(self) -> None:
        self.started = True
        self.on_connection(True)
        self.on_dps(dict(SAMPLE_DPS))

    def stop(self) -> None:
        self.stopped = True

    def set_dp(self, dp: int, value: Any) -> None:
        self.sent.append((dp, value))


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


@pytest.fixture
def fake_client():
    FakeClient.instances = []
    with patch("custom_components.uahpet_litterbox.coordinator.LitterboxClient", FakeClient):
        yield FakeClient
