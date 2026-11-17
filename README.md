<p align="center">
  <img src="https://raw.githubusercontent.com/cruzpazv/uahpet-litterbox/main/custom_components/uahpet_litterbox/brand/icon@2x.png" alt="UAHPET Litterbox" width="160">
</p>

# UAHPET Litterbox

[![HACS](https://img.shields.io/badge/HACS-Custom-orange)](https://hacs.xyz/docs/faq/custom_repositories)
[![Validate](https://img.shields.io/github/actions/workflow/status/cruzpazv/uahpet-litterbox/validate.yml?branch=main&label=validate&logo=github)](https://github.com/cruzpazv/uahpet-litterbox/actions/workflows/validate.yml)
[![License](https://img.shields.io/github/license/cruzpazv/uahpet-litterbox?color=yellow)](LICENSE)

Home Assistant integration for the **UAHPET stainless steel smart litter box** (Tuya product `y0kvbmrnprybewtd`, category `msp`). It talks to the litter box **locally** and exposes every data point, including the 19 that the official Tuya integration does not show: levelling, emptying, child lock, sleep mode, ionizer, radar, waste bin status, the cat's weight per visit and more.

Comes with three dashboard cards.

- Local push: no cloud, updates within a second
- Every DP of the device, with English and Spanish names
- Dashboard cards with visual editors: status, settings and history
- Reconfigure flow for when the local key or the IP address changes
- Diagnostics with the local key redacted

## Install

**HACS (custom repository)**
HACS → ⋮ → Custom repositories → `https://github.com/cruzpazv/uahpet-litterbox` → type *Integration* → Download → restart Home Assistant.

**Manual**
Copy `custom_components/uahpet_litterbox` into `config/custom_components/` and restart.

## Get the device ID and local key

Local Tuya control needs the device's **local key**. Either:

- `tools/tuya_schema.py` in this repo (Tuya IoT Platform credentials). `--region eu` lists your devices, `--device <id>` writes `tuya_dump_<id>/info.json` with `local_key`.
- or `python -m tinytuya wizard`.

The local key changes every time the litter box is paired again. Use **Reconfigure** on the integration when that happens.

## Setup

Settings → Devices & services → Add integration → **UAHPET Litterbox**: name, device ID, local key. The IP address is optional (empty = find it on the network) and the protocol version is detected automatically. Reserve the litter box's IP in your router.

**Using the official Tuya integration as well?** Both can run at the same time. To avoid duplicated entities, disable the litter box device in the Tuya integration (Devices → litter box → ⋮ → Disable).

## Entities

| Entity | DP | Notes |
|---|---:|---|
| Sensor *Last cat weight* | 106 | Weight of the last visit (kg). Best weight source for [Litter Cat Identifier](https://github.com/cruzpazv/litter-cat-identifier) |
| Sensor *Live weight* | 6 | Real-time scale, 0 when empty |
| Sensor *Visits today* | 7 | Resets at midnight |
| Sensor *Last visit duration* | 8 | Seconds |
| Sensor *Status* | 108 | Standby, cleaning, emptying, levelling, weighing error, cat detected, waiting for litter to clump |
| Sensor *Waste bin* | 113 | OK, full, missing, cover open |
| Sensor *Active alerts* | 21, 22 | Number of active alerts, attribute `alerts` |
| Binary sensors (8) | 21, 22 | Too many visits, no weight, stagnant, not in place, weighing error, bin cover open, bin full, motor fault |
| Button *Clean* / *Level litter* / *Empty litter* | 3 / 103 / 107 | |
| Switch *Auto clean* | 4 | |
| Switch *Sleep mode* | 101 | |
| Switch *Child lock* | 102 | |
| Switch *Ionizer* | 114 | |
| Switch *Radar* | 115 | Presence radar |
| Number *Clean delay* | 5 | 10–1800 s after a visit |
| Number *Bury delay* | 117 | 5–60 s |
| Number *Too many visits threshold* | 118 | 0–50 |
| Select *Litter type* | 2 | Coarse / fine grain |
| Select *Device weight unit* | 111 | kg / lb on the device itself |
| *Disabled by default:* motor forward / reverse | 104 / 105 | Manual motor control, **no safety sequence**: never enable with a cat nearby |
| *Disabled by default:* developer mode, cycle phase, work log code | 112, 116, 119 | Diagnostics |

Not exposed: DP 20 (cloud schedules, raw) and DP 109/110 (pound copies of the weights; Home Assistant converts units itself).

Still unknown: the meaning of the *stagnant* alert and the packed format of DP 119 (`log_code` shows its bytes as attributes). Reports welcome.

## Dashboard cards

The cards load automatically. Add them from the card picker (search "UAHPET") or in YAML. `device_id` is optional: without it they use the first UAHPET litter box.

```yaml
type: custom:uahpet-litterbox-card       # status, alerts, actions, toggles
show_alerts: true
show_actions: true                        # Empty needs a second tap to confirm
show_toggles: true
```

```yaml
type: custom:uahpet-litterbox-settings-card
show_advanced: false                      # true adds the hidden diagnostic and motor entities
```

```yaml
type: custom:uahpet-litterbox-history-card
days: 30                                  # cat weight per visit and visits per day
```

Full example: [examples/dashboard.yaml](examples/dashboard.yaml).

## Telling cats apart

This integration only talks to the device. To name each visit after the right cat, add [Litter Cat Identifier](https://github.com/cruzpazv/litter-cat-identifier) with *Last cat weight* as the weight sensor and *Visits today* as the visit counter.

## Development

```bash
pip install pytest-homeassistant-custom-component==0.13.316 tinytuya==1.20.0
pytest -q
```
