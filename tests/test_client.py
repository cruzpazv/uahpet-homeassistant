"""Connection thread and probe, against a fake tinytuya.Device."""

from __future__ import annotations

import threading
import time
from unittest.mock import patch

import pytest

from custom_components.uahpet import client as client_mod
from custom_components.uahpet.client import UahpetClient, ProbeError, probe


class FakeDevice:
    """Scripted device: status() → dps, receive() → queued messages, then None."""

    script: list = []
    versions: dict[float, dict] = {}
    sent: list = []

    def __init__(self, dev_id, address, local_key, version=3.3, **kwargs) -> None:
        self.version = version
        self.closed = False

    def status(self, nowait=False):
        return FakeDevice.versions.get(self.version, {"dps": {"108": "standby"}})

    def receive(self):
        time.sleep(0.005)
        return FakeDevice.script.pop(0) if FakeDevice.script else None

    def set_value(self, dp, value, nowait=False):
        FakeDevice.sent.append((dp, value))

    def heartbeat(self, nowait=True):
        return None

    def set_socketPersistent(self, persist):
        pass

    def set_socketTimeout(self, s):
        pass

    def close(self):
        self.closed = True


@pytest.fixture(autouse=True)
def fake_device():
    FakeDevice.script, FakeDevice.versions, FakeDevice.sent = [], {}, []
    with patch.object(client_mod.tinytuya, "Device", FakeDevice):
        yield


def _wait(cond, timeout=3.0):
    end = time.monotonic() + timeout
    while time.monotonic() < end:
        if cond():
            return True
        time.sleep(0.01)
    return False


def test_session_pushes_and_sends():
    updates, conn = [], []
    FakeDevice.script = [{"dps": {"106": 52}}, {"dps": {"7": 9}}]
    c = UahpetClient("id", "1.2.3.4", "key", "3.4", updates.append, conn.append)
    c.start()
    try:
        assert _wait(lambda: len(updates) >= 3)
        assert updates[0] == {"108": "standby"} and {"106": 52} in updates and {"7": 9} in updates
        assert conn == [True]
        c.set_dp(103, True)
        assert _wait(lambda: FakeDevice.sent == [(103, True)])
    finally:
        c.stop()
    assert conn == [True, False]


def test_session_reconnects_after_error():
    conn = []
    FakeDevice.script = [{"Err": "901", "Error": "Network Error"}]
    with patch.object(client_mod, "RECONNECT_DELAY", 0.05):
        c = UahpetClient("id", "1.2.3.4", "key", "3.4", lambda d: None, conn.append)
        c.start()
        try:
            assert _wait(lambda: conn[:3] == [True, False, True])
        finally:
            c.stop()


def test_probe_auto_versions():
    FakeDevice.versions = {3.5: {"Err": "914", "Error": "Check device key or version"}}
    host, version, dps = probe("id", "1.2.3.4", "key", "auto")
    assert (host, version, dps) == ("1.2.3.4", "3.4", {"108": "standby"})


def test_probe_errors():
    FakeDevice.versions = {v: {"Err": "914"} for v in (3.5, 3.4, 3.3)}
    with pytest.raises(ProbeError) as err:
        probe("id", "1.2.3.4", "key", "auto")
    assert err.value.reason == "invalid_auth"

    with patch.object(client_mod.tinytuya, "find_device", return_value={"ip": None}), pytest.raises(ProbeError) as err:
        probe("id", "", "key", "auto")
    assert err.value.reason == "cannot_find"
