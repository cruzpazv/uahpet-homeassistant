"""Config and reconfigure flows."""

from __future__ import annotations

from unittest.mock import patch

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType

from custom_components.uahpet.client import ProbeError
from custom_components.uahpet.const import DOMAIN

from .conftest import SAMPLE_DPS

PROBE = "custom_components.uahpet.config_flow.probe"
USER_INPUT = {
    "name": "Arenero",
    "device_id": " bf4f00000000000000test ",
    "local_key": "0123456789abcdef",
    "host": "",
    "protocol_version": "auto",
}


async def test_user_flow(hass: HomeAssistant, fake_client) -> None:
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})
    assert result["type"] is FlowResultType.FORM

    with patch(PROBE, return_value=("192.168.1.50", "3.4", SAMPLE_DPS)) as probe:
        result = await hass.config_entries.flow.async_configure(result["flow_id"], USER_INPUT)
        await hass.async_block_till_done()

    probe.assert_called_once_with("bf4f00000000000000test", "", "0123456789abcdef", "auto")
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "Arenero"
    assert result["data"] == {
        "device_id": "bf4f00000000000000test",
        "profile": "litterbox",
        "host": "192.168.1.50",
        "local_key": "0123456789abcdef",
        "protocol_version": "3.4",
    }

    # Same device again → abort
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})
    result = await hass.config_entries.flow.async_configure(result["flow_id"], USER_INPUT)
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "already_configured"


async def test_default_title(hass: HomeAssistant, fake_client) -> None:
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})
    with patch(PROBE, return_value=("192.168.1.50", "3.4", SAMPLE_DPS)):
        result = await hass.config_entries.flow.async_configure(result["flow_id"], {**USER_INPUT, "name": ""})
        await hass.async_block_till_done()
    assert result["title"] == "UAHPET Litter Box"


async def test_user_flow_errors(hass: HomeAssistant, fake_client) -> None:
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})
    with patch(PROBE, side_effect=ProbeError("invalid_auth")):
        result = await hass.config_entries.flow.async_configure(result["flow_id"], USER_INPUT)
    assert result["errors"] == {"base": "invalid_auth"}

    with patch(PROBE, return_value=("192.168.1.50", "3.3", {"1": True})):
        result = await hass.config_entries.flow.async_configure(result["flow_id"], USER_INPUT)
    assert result["errors"] == {"base": "not_supported"}


async def test_reconfigure(hass: HomeAssistant, fake_client) -> None:
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})
    with patch(PROBE, return_value=("192.168.1.50", "3.4", SAMPLE_DPS)):
        await hass.config_entries.flow.async_configure(result["flow_id"], USER_INPUT)
        await hass.async_block_till_done()
    entry = hass.config_entries.async_entries(DOMAIN)[0]

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_RECONFIGURE, "entry_id": entry.entry_id}
    )
    assert result["type"] is FlowResultType.FORM
    with patch(PROBE, return_value=("192.168.1.77", "3.5", SAMPLE_DPS)):
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {"local_key": "fedcba9876543210", "host": "192.168.1.77", "protocol_version": "auto"}
        )
        await hass.async_block_till_done()
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "reconfigure_successful"
    assert entry.data["host"] == "192.168.1.77"
    assert entry.data["local_key"] == "fedcba9876543210"
    assert entry.data["protocol_version"] == "3.5"
