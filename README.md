# Plant Monitor Premium Card

![HACS](https://img.shields.io/badge/HACS-Custom-blue)
![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2025.1%2B-green)
![Version](https://img.shields.io/badge/version-1.0.0-success)
![License](https://img.shields.io/badge/license-MIT-orange)

A premium Home Assistant card for Plant Monitor featuring OpenPlantBook integration, DLI-based light monitoring, rainfall-aware watering advice, mobile responsive layouts and a visual configuration editor.

<p align="center">
  <img src="screenshots/overview.png" width="1200">
</p>

---

## Features

- Plant Monitor integration support
- OpenPlantBook species information
- Indoor and outdoor plant support
- DLI (Daily Light Integral) monitoring
- Rainfall-aware watering advice
- Dynamic health scoring
- Mobile responsive design
- Visual configuration editor
- Lovelace card picker preview
- Battery and Link Quality (LQI) support
- Soil moisture monitoring
- Temperature monitoring
- Humidity monitoring
- Soil temperature monitoring
- VPD monitoring
- Graceful degradation when optional sensors are unavailable
- Optimised for large plant collections
- HACS compatible

---

## Why Plant Monitor Premium?

Most plant cards focus on displaying raw sensor values.

Plant Monitor Premium focuses on plant health.

It combines Plant Monitor status attributes, OpenPlantBook species data, DLI monitoring, VPD monitoring and rainfall-aware watering advice into a single premium dashboard card.

Designed and tested with more than 20 simultaneous plant cards, it is suitable for both small houseplant collections and larger indoor/outdoor plant dashboards.

---

## Screenshots

### Desktop Dashboard

![Desktop Dashboard](screenshots/desktop-dashboard.png)

Monitor multiple plants simultaneously with health scoring, alerts and watering recommendations.

---

### Mobile View

![Mobile View](screenshots/mobile-view.png)

Fully responsive layout designed for Home Assistant mobile apps.

---

### Configuration Editor

![Configuration Editor](screenshots/configuration-editor.png)

Simple visual configuration with live preview.

---

### Card Picker Preview

![Card Picker Preview](screenshots/card-picker-preview.png)

Easy discovery from the Lovelace card picker.

---

### Outdoor Plant Monitoring

![Outdoor Plant Examples](screenshots/outdoor-plant-examples.png)

Rainfall-aware watering advice for outdoor plants.

---

### Multiple Plant Dashboard

![Multiple Plant Dashboard](screenshots/multi-card-dashboard.png)

Designed to support large plant collections while remaining responsive.

---

## Highlights

### Plant Health Score

The card calculates a dynamic health score using Plant Monitor status attributes.

Typical monitored attributes include:

- Soil moisture
- Temperature
- Humidity
- Illuminance / DLI
- Soil temperature
- VPD

Health states:

| Score | Status |
| --- | --- |
| 90-100% | Excellent / Healthy |
| 70-89% | Attention / Good |
| Below 70% | Critical |

---

### DLI-Based Lighting

Unlike many plant dashboards that rely solely on lux values, Plant Monitor Premium uses Daily Light Integral (DLI) wherever available.

Benefits:

- More accurate assessment of plant light exposure
- Better support for indoor grow lighting
- Better support for outdoor plants
- Avoids misleading momentary lux readings
- Supports morning accumulation behaviour where DLI is still building

---

### Rainfall-Aware Watering Advice

Outdoor plants can incorporate rainfall sensors to generate intelligent watering recommendations:

- Water today
- Wait for forecast rain
- Useful rain due soon
- Avoid watering
- No action required

Default rainfall entities:

```yaml
rainfall_today_entity: sensor.plant_rain_today
rainfall_24h_entity: sensor.plant_rain_next_24h
rainfall_48h_entity: sensor.plant_rain_next_48h
```

---

## Important

This card is designed for the **custom Plant Monitor integration**.

It is **not designed for the stock Home Assistant Plant integration**.

---

## Architecture

Plant Monitor Premium was developed and tested using the following architecture:

```text
Zigbee Soil Sensor
        ↓
Zigbee2MQTT
        ↓
MQTT Sensor Entities
        ↓
Plant Monitor
        ↓
OpenPlantBook
        ↓
Plant Monitor Premium Card
```

The card does not communicate directly with the physical sensor.

All plant monitoring logic is provided by the Plant Monitor integration.

---

## Requirements

### Required

- Home Assistant
- HACS
- Plant Monitor custom integration

### Strongly Recommended

- OpenPlantBook

### Recommended For Outdoor Plants

- Pirate Weather
- HA-Illuminance

### Optional

- Zigbee2MQTT
- ESPHome
- MQTT sensors
- Battery sensors
- Link Quality sensors
- Soil temperature sensors
- CO2 sensors

---

## Installation

### HACS Custom Repository

Until this card is accepted into the default HACS repository list, install it as a custom repository.

1. Open HACS
2. Go to **Frontend**
3. Open the three-dot menu
4. Choose **Custom repositories**
5. Add this repository URL
6. Set category to **Dashboard**
7. Install **Plant Monitor Premium Card**
8. Refresh your browser or restart the Home Assistant mobile app

Repository URL:

```text
https://github.com/djmaxwell1975/plant-monitor-premium-card
```

---

### Manual Installation

Copy:

```text
dist/plant-monitor-premium-card.js
```

to:

```text
/config/www/plant-monitor-premium-card.js
```

Add the Lovelace resource:

```yaml
url: /local/plant-monitor-premium-card.js
type: module
```

Then refresh the Home Assistant frontend.

---

## Basic Usage

```yaml
type: custom:plant-monitor-premium-card
entity: plant.guelder_rose
plant_location: outdoor
```

Indoor example:

```yaml
type: custom:plant-monitor-premium-card
entity: plant.monstera_thai_constellation
plant_location: indoor
```

Temperature override example:

```yaml
type: custom:plant-monitor-premium-card
entity: plant.pieris_japonica_forest_flame
plant_location: outdoor
air_temperature_entity: sensor.pieris_japonica_forest_flame_temperature_2
```

Rainfall override example:

```yaml
type: custom:plant-monitor-premium-card
entity: plant.guelder_rose
plant_location: outdoor
rainfall_today_entity: sensor.plant_rain_today
rainfall_24h_entity: sensor.plant_rain_next_24h
rainfall_48h_entity: sensor.plant_rain_next_48h
```

---

## Entity Discovery

The card attempts to discover related Plant Monitor entities automatically.

You can optionally provide:

```yaml
sensor_prefix:
device_prefix:
air_temperature_entity:
rainfall_today_entity:
rainfall_24h_entity:
rainfall_48h_entity:
```

Missing optional sensors should not prevent the card from loading.

---

## Documentation

Additional documentation:

- [Prerequisites](docs/prerequisites.md)
- [Rainfall Sensors](docs/rainfall-sensors.md)
- [Sensor Hardware](docs/sensor-hardware.md)
- [Troubleshooting](docs/troubleshooting.md)

---

## Tested Environment

The card has been tested with:

- Home Assistant
- Plant Monitor custom integration
- OpenPlantBook
- Pirate Weather
- HA-Illuminance
- Zigbee2MQTT

Hardware used during development:

- Tuya Zigbee soil sensors
- HOBEIAN ZG-303Z
- COOLO / CS-201Z compatible sensors
- Outdoor plants using public illuminance estimates
- Indoor plants using physical sensors

Validated on:

- 21 simultaneous plant cards
- 5 indoor plants
- 16 outdoor plants
- Desktop Chrome
- Desktop Safari
- Home Assistant iOS App

The v1.0.0 release is based on the V32 stable rendering engine and has been validated for more than 48 hours on a live 21-plant dashboard.

---

## Performance

Plant Monitor Premium Card was optimised for larger plant dashboards.

The v1.0.0 rendering engine reduces unnecessary frontend re-renders and includes lifecycle recovery for:

- dashboard edit mode
- browser focus changes
- page restore
- Home Assistant mobile app resume

---

## Known Limitations

- Requires the custom Plant Monitor integration
- Not designed for the stock Home Assistant Plant integration
- OpenPlantBook data quality depends on available species records
- Rainfall forecasts are estimates
- Battery and LQI are shown only when matching sensors exist
- Outdoor CO2 is not required and is generally not recommended

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

---

## License

MIT License
