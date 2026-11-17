"""Local Tuya connection on a background thread (tinytuya is blocking)."""

from __future__ import annotations

from collections.abc import Callable
import logging
import queue
import threading
import time
from typing import Any

import tinytuya

from .const import AUTO_PROTOCOL_ORDER, PROTOCOL_AUTO

_LOGGER = logging.getLogger(__name__)

RECEIVE_TIMEOUT = 1.0  # s, also the max command latency
HEARTBEAT_INTERVAL = 10.0
POLL_INTERVAL = 120.0  # full status refresh, in case a push is missed
RECONNECT_DELAY = 10.0
ERR_KEY_OR_VER = "914"


class ProbeError(Exception):
    """Probe failed; `reason` is a config flow error key."""

    def __init__(self, reason: str) -> None:
        super().__init__(reason)
        self.reason = reason


def _new_device(device_id: str, host: str, local_key: str, version: str, timeout: float = 5) -> tinytuya.Device:
    dev = tinytuya.Device(
        device_id,
        host,
        local_key,
        version=float(version),
        connection_timeout=timeout,
        connection_retry_limit=2,
        connection_retry_delay=2,
    )
    return dev


def probe(device_id: str, host: str | None, local_key: str, protocol: str) -> tuple[str, str, dict[str, Any]]:
    """Find and test the device. Blocking. Returns (host, version, dps)."""
    found_version = None
    if not host:
        found = tinytuya.find_device(dev_id=device_id) or {}
        host = found.get("ip")
        found_version = found.get("version")
        if not host:
            raise ProbeError("cannot_find")
    if protocol != PROTOCOL_AUTO:
        versions = [protocol]
    else:
        versions = ([str(found_version)] if found_version else []) + AUTO_PROTOCOL_ORDER
        versions = list(dict.fromkeys(versions))

    reason = "cannot_connect"
    for version in versions:
        dev = _new_device(device_id, host, local_key, version, timeout=3)
        try:
            result = dev.status()
        finally:
            dev.close()
        if result and "dps" in result:
            return host, version, result["dps"]
        if result and str(result.get("Err")) == ERR_KEY_OR_VER:
            reason = "invalid_auth"
        _LOGGER.debug("Probe %s v%s failed: %s", host, version, result)
    raise ProbeError(reason)


class LitterboxClient:
    """Persistent connection. Pushes DP updates through callbacks (called from the worker thread)."""

    def __init__(
        self,
        device_id: str,
        host: str,
        local_key: str,
        version: str,
        on_dps: Callable[[dict[str, Any]], None],
        on_connection: Callable[[bool], None],
    ) -> None:
        self._args = (device_id, host, local_key, version)
        self._on_dps = on_dps
        self._on_connection = on_connection
        self._commands: queue.Queue[tuple[int, Any]] = queue.Queue()
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None

    def start(self) -> None:
        self._thread = threading.Thread(target=self._run, name=f"uahpet_litterbox_{self._args[0]}", daemon=True)
        self._thread.start()

    def stop(self) -> None:
        """Blocking: run in an executor."""
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=15)

    def set_dp(self, dp: int, value: Any) -> None:
        """Thread safe; sent within RECEIVE_TIMEOUT."""
        self._commands.put((int(dp), value))

    def _run(self) -> None:
        warned = False
        while not self._stop.is_set():
            was_connected = False
            try:
                was_connected = self._session()
            except Exception:  # noqa: BLE001 - keep the thread alive whatever tinytuya raises
                _LOGGER.exception("Unexpected error in litter box connection")
            if self._stop.is_set():
                break
            if was_connected:
                _LOGGER.info("Connection to litter box %s lost, reconnecting", self._args[1])
                warned = False
            elif not warned:
                _LOGGER.warning("Litter box %s unreachable, retrying every %ss", self._args[1], RECONNECT_DELAY)
                warned = True
            self._stop.wait(RECONNECT_DELAY)

    def _handle(self, data: dict[str, Any] | None) -> bool:
        """False when the message is an error (connection lost)."""
        if not data:
            return True
        if "Err" in data:
            _LOGGER.debug("Litter box error: %s", data)
            return False
        if isinstance(data.get("dps"), dict):
            self._on_dps(dict(data["dps"]))
        return True

    def _session(self) -> bool:
        """One connection lifetime. Returns True if it connected at all."""
        dev = _new_device(*self._args)
        dev.set_socketPersistent(True)
        connected = False
        try:
            first = dev.status()
            if not first or "dps" not in first:
                _LOGGER.debug("Status failed: %s", first)
                return False
            connected = True
            while not self._commands.empty():  # drop commands queued while offline
                self._commands.get_nowait()
            self._on_connection(True)
            self._handle(first)
            dev.set_socketTimeout(RECEIVE_TIMEOUT)
            now = time.monotonic()
            next_heartbeat, next_poll = now + HEARTBEAT_INTERVAL, now + POLL_INTERVAL

            while not self._stop.is_set():
                while True:
                    try:
                        dp, value = self._commands.get_nowait()
                    except queue.Empty:
                        break
                    _LOGGER.debug("Set DP %s = %r", dp, value)
                    if not self._handle(dev.set_value(dp, value, nowait=True)):
                        return connected
                if not self._handle(dev.receive()):
                    return connected
                now = time.monotonic()
                if now >= next_heartbeat:
                    next_heartbeat = now + HEARTBEAT_INTERVAL
                    if not self._handle(dev.heartbeat(nowait=True)):
                        return connected
                if now >= next_poll:
                    next_poll = now + POLL_INTERVAL
                    if not self._handle(dev.status(nowait=True)):
                        return connected
            return connected
        finally:
            dev.close()
            if connected:
                self._on_connection(False)
