from custom_components.uahpet_litterbox.dps import DP, NOTIFICATION_BITS, active_bits, bit, get, log_bytes, scaled


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


def test_get_and_log():
    assert get({"106": 61}, DP.LAST_CAT_WEIGHT) == 61
    assert get(None, DP.LAST_CAT_WEIGHT) is None
    assert log_bytes(1477777414) == [0x58, 0x15, 0x18, 0x06]
