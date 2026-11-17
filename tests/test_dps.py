from custom_components.uahpet.dps import active_bits, bit, enum_value, get, int_bytes, scaled
from custom_components.uahpet.profiles import PROFILES_BY_KEY, detect_profile
from custom_components.uahpet.profiles.litterbox import DP, NOTIFICATION_BITS

from .conftest import SAMPLE_DPS


def test_scaled():
    assert scaled(61, 1) == 6.1
    assert scaled(4250, 3) == 4.25
    assert scaled(None, 1) is None


def test_bitmap():
    assert bit(64, 6) is True
    assert bit(64, 0) is False
    assert bit(None, 0) is None
    assert active_bits(0b1000001, NOTIFICATION_BITS) == ["excessive_clean_times", "bin_full"]
    assert active_bits(None, NOTIFICATION_BITS) == []


def test_get_enum_and_bytes():
    assert get({"106": 61}, DP.LAST_CAT_WEIGHT) == 61
    assert get(None, DP.LAST_CAT_WEIGHT) is None
    assert enum_value("standby", ["standby"]) == "standby"
    assert enum_value("new_firmware_state", ["standby"]) is None
    assert int_bytes(1477777414) == [0x58, 0x15, 0x18, 0x06]


def test_detect_profile():
    assert detect_profile(SAMPLE_DPS) is PROFILES_BY_KEY["litterbox"]
    # The UAHPET air purifier Slim (Tuya kj) is left to the Tuya integration.
    purifier = {"1": True, "3": "auto", "4": "P2", "5": 79, "7": False, "11": False, "18": "cancel", "21": "great"}
    assert detect_profile(purifier) is None


def test_profile_keys_unique():
    for profile in PROFILES_BY_KEY.values():
        for group in (profile.sensors, profile.binary_sensors, profile.switches, profile.buttons, profile.numbers, profile.selects):
            keys = [d.key for d in group]
            assert len(keys) == len(set(keys)), profile.key
