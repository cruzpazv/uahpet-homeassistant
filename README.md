<p align="center">
  <img src="https://raw.githubusercontent.com/cruzpazv/uahpet-homeassistant/main/custom_components/uahpet/brand/icon@2x.png" alt="UAHPET" width="160">
</p>

# UAHPET for Home Assistant

[![HACS](https://img.shields.io/badge/HACS-Custom-orange)](https://hacs.xyz/docs/faq/custom_repositories)
[![Release](https://img.shields.io/github/v/release/cruzpazv/uahpet-homeassistant?label=release)](https://github.com/cruzpazv/uahpet-homeassistant/releases)
[![Hassfest](https://img.shields.io/github/actions/workflow/status/cruzpazv/uahpet-homeassistant/hassfest.yml?branch=main&label=Hassfest&logo=github)](https://github.com/cruzpazv/uahpet-homeassistant/actions/workflows/hassfest.yml)
[![HACS validation](https://img.shields.io/github/actions/workflow/status/cruzpazv/uahpet-homeassistant/hacs.yml?branch=main&label=HACS%20validation&logo=github)](https://github.com/cruzpazv/uahpet-homeassistant/actions/workflows/hacs.yml)
[![Tests](https://img.shields.io/github/actions/workflow/status/cruzpazv/uahpet-homeassistant/tests.yml?branch=main&label=Tests&logo=github)](https://github.com/cruzpazv/uahpet-homeassistant/actions/workflows/tests.yml)
[![License](https://img.shields.io/github/license/cruzpazv/uahpet-homeassistant?color=yellow)](LICENSE)
[![Version](https://img.shields.io/badge/dynamic/json?label=VERSION&color=blue&url=https%3A%2F%2Fraw.githubusercontent.com%2Fcruzpazv%2Fuahpet-homeassistant%2Fmain%2Fcustom_components%2Fuahpet%2Fmanifest.json&query=%24.version)](custom_components/uahpet/manifest.json)
[![Home Assistant](https://img.shields.io/badge/dynamic/json?label=HOME%20ASSISTANT&color=41BDF5&prefix=%3E%3D&url=https%3A%2F%2Fraw.githubusercontent.com%2Fcruzpazv%2Fuahpet-homeassistant%2Fmain%2Fhacs.json&query=%24.homeassistant)](https://www.home-assistant.io/)

Home Assistant support for **UAHPET** pet devices. UAHPET devices run on Tuya, but the official Tuya integration only shows their standard data points. This package talks to them **locally** and exposes everything the UAHPET app can do, plus dashboard cards.

## Card previews

### Litter box

<table>
<tr><td><img src="docs/images/main.png" alt="Main card" width="380"><br><b>Main</b>: animated litter box, auto clean countdown, today's numbers, cats, actions</td>
<td><img src="docs/images/main-busy.png" alt="Main card while cleaning" width="380"><br>While a task runs, its button becomes <b>Stop</b></td></tr>
<tr><td><img src="docs/images/dialog.png" alt="Empty confirmation" width="380"><br><b>Empty</b> asks for confirmation first</td>
<td><img src="docs/images/main-radar.png" alt="Main card, cat nearby" width="380"><br>A cat nearby: operation paused</td></tr>
<tr><td><img src="docs/images/cats.png" alt="Cats card" width="380"><br><b>Cats</b>: weight, visits today, last visit (each cat in its own colour)<br><br><img src="docs/images/cat.png" alt="Cat card" width="380"><br><b>Cat</b>: one cat</td>
<td><img src="docs/images/visits-chart.png" alt="Visits per day card" width="380"><br><b>Visits per day</b>: one bar per cat</td></tr>
<tr><td><img src="docs/images/weight-chart.png" alt="Weight per cat card" width="380"><br><b>Weight</b>: one line per cat, 7 / 30 / 90 days</td>
<td><img src="docs/images/cat-vertical.png" alt="Cat card, vertical" width="380"><br><b>Cat</b> with <code>layout: vertical</code> and a bigger photo</td></tr>
<tr><td><img src="docs/images/visits.png" alt="Recent visits card" width="380"><br><b>Recent visits</b>: collapsible, whole history, why a visit was not identified</td>
<td><img src="docs/images/timeline.png" alt="Timeline card" width="380"><br><b>Timeline</b>: visits, cleanings, emptying, alerts</td></tr>
<tr><td><img src="docs/images/stats.png" alt="Statistics card" width="380"><br><b>Statistics</b> per day<br><br><img src="docs/images/mini.png" alt="Compact card" width="380"><br><b>Compact</b><br><br><img src="docs/images/maintenance-mini.png" alt="Compact maintenance" width="380"><br><b>Compact maintenance</b></td>
<td><img src="docs/images/maintenance.png" alt="Maintenance card" width="380"><br><b>Maintenance</b>: waste bin and how to fix each alert</td></tr>
<tr><td><img src="docs/images/settings.png" alt="Settings card" width="380"><br><b>Settings</b>, with the app's explanations</td>
<td><img src="docs/images/cats-add.png" alt="Adding a cat from the card" width="380"><br><b>Add a cat</b> straight from the Cats card<br><br><img src="docs/images/main-noart.png" alt="Main card without the drawing" width="380"><br><b>Main</b> with <code>show_art: false</code></td></tr>
</table>

### Air purifier

<table>
<tr><td><img src="docs/images/purifier-bar-dark.png" alt="Air purifier with buttons, dark theme" width="380"><br><b>Buttons</b> (dark theme): status line ending with the air quality, round buttons</td>
<td><img src="docs/images/purifier-bar-panel.png" alt="Air purifier with buttons, settings open" width="380"><br><b>Buttons</b> with <i>Settings</i> open: speed, timer, child lock, filter reset</td></tr>
<tr><td><img src="docs/images/purifier.png" alt="Air purifier card" width="380"><br><b>Full</b>: air quality, filter, mode, speed, timer</td>
<td><img src="docs/images/purifier-mini.png" alt="Compact air purifier" width="380"><br><b>Compact</b>: one row</td></tr>
</table>

Rendered from the real cards with sample data.

## Supported devices

| Device | Tuya category / product | How | What you get |
|---|---|---|---|
| Self-cleaning litter box | `msp` / `y0kvbmrnprybewtd` | **This integration** (local) | Every DP: clean, level, empty, sleep mode, child lock, ionizer, radar, waste bin, alerts, cat weight per visit… The Tuya integration only shows 5 of 27 |
| Air Purifier Slim | `kj` / `dhhzjzdaiyshx2md` | Official Tuya integration + the card from this package | All 8 DPs are already in the Tuya integration |
| Air Purifier (large, with hair suction) | `kj`? | Not yet | Needs a DP dump, see [Adding a device](#adding-a-device) |
| Fresh Food Feeder | ? (app code `wsq`) | Not yet | Needs a DP dump |

Other UAHPET products (fountains, Nano Deodorizer, iRetriever, Pulse tracker) are not connected to the UAHPET app over Wi-Fi.

## Install

**HACS (custom repository)**
HACS → ⋮ → Custom repositories → `https://github.com/cruzpazv/uahpet-homeassistant` → type *Integration* → Download → restart Home Assistant.

**Manual**
Copy `custom_components/uahpet` into `config/custom_components/` and restart.

## Get the device ID and local key

Local Tuya control needs the device's **local key**. Either:

- `tools/tuya_schema.py` in this repo (Tuya IoT Platform credentials). `--region eu` lists your devices, `--device <id>` writes `tuya_dump_<id>/info.json` with `local_key`.
- or `python -m tinytuya wizard`.

The local key changes every time a device is paired again. Use **Reconfigure** on the integration when that happens.

## Setup

Settings → Devices & services → Add integration → **UAHPET**: device ID and local key. The name, IP address and protocol version are optional: the device type and protocol are detected automatically, and an empty IP means "find it on the network". Reserve the device's IP in your router.

**Using the official Tuya integration as well?** Both can run at the same time. To avoid duplicated entities, disable the litter box in the Tuya integration (Devices → litter box → ⋮ → Disable). Keep the air purifiers in the Tuya integration.

## Litter box entities

| Entity | DP | Notes |
|---|---:|---|
| Sensor *Last cat weight* | 106 | Weight of the last visit (kg). Best weight source for [Litter Cat Identifier](https://github.com/cruzpazv/litter-cat-identifier) |
| Sensor *Live weight* | 6 | Real-time scale, 0 when empty |
| Sensor *Visits today* | 7 | Resets at midnight |
| Sensor *Last visit duration* | 8 | Seconds |
| Sensor *Status* | 108 | Standby, cleaning, emptying, levelling, weighing error, cat detected, waiting for litter to clump |
| Sensor *Waste bin* | 113 | OK, full, missing, cover open |
| Sensor *Active alerts* | 21, 22 | Number of active alerts, attribute `alerts` |
| Sensor *Cleanings today* | derived | Counted from the status changes, resets at midnight. The short turn right after a visit (burying the waste, before the clean delay) is not counted |
| Sensor *Last cleaning* / *Next auto clean* | derived | Timestamps. Next auto clean = end of visit + clean delay (not set when auto clean or Do not disturb stop it) |
| Sensor *Waste bin last emptied* | derived | When the bin goes back to OK after being full or taken out |
| Event *Visit* | 7, 8, 106 | One event per visit with `weight` (kg) and `duration` (s); with cat profiles its type is the cat's name |
| Binary sensors (8) | 21, 22 | Too many visits, no weight, cat stayed too long, weighing error, bin cover open, bin full, motor fault, and *Waste bin opened* (an opening, not an alert: you took it out to look at it) |
| Binary sensor *Waste bin out of place* | derived | The waste bin has been out for more than 5 minutes: this one is an alert |
| Button *Clean* / *Level litter* / *Empty litter* | 3 / 103 / 107 | |
| Button *Stop* | 3 / 103 / 107 | Switches off the DP of the running task. Best effort: not confirmed that every firmware honours it |
| Switch *Auto clean* | 4 | |
| Switch *Do not disturb* | 101 | No automatic cleaning while on |
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

*Cat stayed too long* (`stagnant`): the litter box levels the litter to make the cat leave and resets the weight. Still unknown: the packed format of DP 119 (`log_code` shows its bytes as attributes). Reports welcome.

Derived values are kept across restarts (stored per device).

## Dashboard cards

The cards load automatically with the integration and follow the UAHPET app. Add them from the card picker (search "UAHPET"); all have a visual editor. `device_id` is optional: without it each card uses the first matching device. Texts in English and Spanish.

**Size:** every card has a `scale` option (0.7–1.5, *Size* in the editor) to make it smaller or bigger, and fills the height you give it in a sections dashboard. The charts (Weight, Visits per day, Statistics) redraw for the height they get, so they stay whole when the card is made shorter.

### Litter box cards

| Card | What it shows |
|---|---|
| `custom:uahpet-litterbox-card` | Animated drawing of the litter box (drum turns while cleaning, litter waves while levelling, cat and radar pulse when a cat is nearby), status in the app's words, **auto clean countdown**, bin / litter / alert chips, today's visits, cleanings and last cat, a row with each cat, Clean / Level / Empty (Level and Empty ask for confirmation; while a task runs its button becomes **Stop**), quick toggles for auto clean and Do not disturb. `show_art: false` hides the drawing |
| `custom:uahpet-litterbox-timeline-card` | Today's (or last 24 h) visits with duration and weight, cleanings, emptying, levelling, bin emptied and alerts. The short turn right after a visit is shown as *Waste buried*, not as a cleaning (`show_burying: false` hides it). With [Litter Cat Identifier](https://github.com/cruzpazv/litter-cat-identifier) each visit shows the cat's name |
| `custom:uahpet-litterbox-stats-card` | Visits, cleanings, visit duration and weight per day, 7 or 30 days. Tap a day for its value |
| `custom:uahpet-litterbox-settings-card` | Cleaning (auto clean, clean delay with quick presets, bury delay), litter type, Do not disturb, radar, child lock, ionizer, visits alert and unit, each with the app's explanation. `show_advanced: true` adds manual motor control and developer mode |
| `custom:uahpet-litterbox-maintenance-card` | Waste bin drawing and state, when it was last emptied and cleaned, and every active alert with how to fix it (plus a Level button where it helps) |
| `custom:uahpet-litterbox-mini-card` | One row: status, visits today and a clean button |
| `custom:uahpet-litterbox-maintenance-mini-card` | One row: waste bin state, when it was emptied, number of alerts |
| `custom:uahpet-cats-card` / `custom:uahpet-cat-card` | Cats (or one cat): photo or coloured icon, learned weight, visits today, last visit, health alerts. The Cats card has **+ Add a cat** and **Manage cats** (`show_add: false` hides them). Options: `layout: vertical`, `avatar_size` (px), `show_photo`, `columns`, which cats |
| `custom:uahpet-visits-card` | Recent visits with cat, weight, duration and why unidentified ones were not matched. `collapsible: true`, `count`, `expanded_count`, whole history |
| `custom:uahpet-visits-chart-card` | Visits per day with one bar per cat, 7 or 30 days, tap a day / a cat |
| `custom:uahpet-weight-chart-card` | Weight of each cat over time, one line per cat in its colour, 7 / 30 / 90 days; the legend shows the latest weight and the change; tap for the values |

```yaml
type: custom:uahpet-litterbox-card
show_stats: true
show_actions: true
show_quick: true
```

```yaml
type: custom:uahpet-litterbox-timeline-card
range: today            # or 24h
max_items: 20
show_cleanings: true
show_alerts: true
```

```yaml
type: custom:uahpet-litterbox-stats-card
days: 7                 # or 30
metric: visits          # visits, cleanings, duration, weight
```

The 0.1.0 `uahpet-litterbox-history-card` still works and now shows the statistics card.

### Air purifier cards

They use the purifier's entities from the official Tuya integration (XTend Tuya works too), so they work without adding the purifier to UAHPET.

| Card | What it shows |
|---|---|
| `custom:uahpet-purifier-bar-card` | One status line (on/off, mode, filter, display when the purifier has one, air quality) and a row of round buttons: power, auto, next speed, settings (speed, timer, child lock, filter reset), sleep |
| `custom:uahpet-purifier-mini-card` | One row: state, air quality, filter, power button |
| `custom:uahpet-purifier-card` | Power, air quality, filter life, mode, speed, timer, child lock and filter reset. A tilt over 45° (`tipping`) shows as an alert |

```yaml
type: custom:uahpet-purifier-bar-card
device_id: <the purifier's device>   # optional: first Tuya air purifier
```

The cards are served by this integration, so at least one UAHPET device must be set up for them to load.

Full example: [examples/dashboard.yaml](examples/dashboard.yaml).

## Cats

UAHPET can tell your cats apart on its own, like the UAHPET app.

**The quickest way:** when you set the litter box up, the last step asks for your cats (or imports them from Litter Cat Identifier). Later, use **+ Add a cat** on the Cats card (name, weight, colour), or the `uahpet.add_cat` service.

**Everything else** (photo, notifications, identification settings): Settings → Devices & services → **UAHPET** → the **⚙** on the litter box's entry (the row with the entry name, not the device row with the pencil), or **Manage cats** on the Cats card. It opens this menu:

| Menu | What it does |
|---|---|
| *Add a cat* / *Edit a cat* | Name, approximate weight (then learned visit after visit), **photo** (pick or upload it from Media, or a URL / `/local/` path), **colour** (charts, icon without photo), notify every visit, alert after N hours without a visit |
| *Identification settings* | Tolerance, learning rate, minimum weight, record unidentified visits or not |
| *Notifications* | Notify services (e.g. `notify.mobile_app_my_phone`, photo attached), unidentified visits, health alerts |
| *Import from Litter Cat Identifier* | Copies cats, learned weights, photos, colours, notifications, settings and the whole visit history. Afterwards Litter Cat Identifier can be removed |

Entities per cat: *{cat} weight* (learned), *{cat} visits today*, *{cat} last visit*, *{cat} health* (binary sensor, attribute `reasons`: `frequent_visits`, `long_visit`, `weight_loss`), *Recalibrate {cat} weight* (button). Plus *Last visit* (cat, weight, duration, why a visit was not identified, last 20 visits), *Unidentified visits today*, *Show unidentified visits* (switch, for the cards) and *Clear unidentified visits* (button). The *Visit* event's type is the cat's name (`Luna`, `Simba`, `unidentified`), so an automation can trigger on one cat directly; the `cat`, `weight` and `duration` attributes are there too. The whole visit history (up to 2000) is available through the websocket command `uahpet/visits`.

Health alerts compare each cat with itself: many more visits than usual, a much longer visit than usual, or 5 % of weight lost in three weeks. They need about a week of history first. Not medical advice.

Services: `uahpet.add_cat` (name, weight, colour, photo URL), `uahpet.reassign_last_visit` (fix the last visit's cat), `uahpet.recalibrate_weight` (to a value or the median of the latest readings), `uahpet.clear_unidentified_visits`.

The colour picked for a cat is used by every card. A card can still override it in YAML: `colors: {Luna: "#e15759"}`.

## Telling cats apart with Litter Cat Identifier

Prefer [Litter Cat Identifier](https://github.com/cruzpazv/litter-cat-identifier) (health alerts, notifications, other brands)? Don't add cats in UAHPET; the cat cards use Litter Cat Identifier's cats instead.

This integration only talks to the device. To name each visit after the right cat, add [Litter Cat Identifier](https://github.com/cruzpazv/litter-cat-identifier): it recognises the UAHPET litter box and fills in the *Visit* event, *Last cat weight* and *Last visit duration* by itself.

With both installed:
- the main card shows each cat (photo, visits today, a ❤ when a health alert is on) and names the last cat;
- the timeline names the cat of every visit, using Litter Cat Identifier's whole history;
- Litter Cat Identifier explains unidentified readings with the litter box's state (it was levelling or emptying, or a cat stayed too long).

## Adding a device

1. Dump its data points with `tools/tuya_schema.py --region <region> --device <device id>` (needs a free Tuya IoT Platform project linked to the Smart Life app). Share `schema.md`, **never** `info.json` (it holds the local key).
2. Compare with what the official Tuya integration already shows. If it covers everything, a card is enough (like the air purifier).
3. Otherwise add a profile: a module in `custom_components/uahpet/profiles/` with a `Profile` (DP ids, detection `signature`, entity descriptions), append it to `PROFILES`, and add the entity names to `strings.json` and `translations/`.

## Development

```bash
pip install pytest-homeassistant-custom-component==0.13.316 tinytuya==1.20.0
pytest -q
```

Icon source: [assets/icon.svg](assets/icon.svg) (`rsvg-convert -w 256 -h 256 assets/icon.svg -o custom_components/uahpet/brand/icon.png`, and `-w 512 -h 512` for `icon@2x.png`).
