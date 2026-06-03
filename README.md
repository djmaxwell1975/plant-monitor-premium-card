# Plant Monitor Premium Card

A premium Home Assistant dashboard card for the custom Plant Monitor integration, designed to provide attractive, information-rich plant monitoring with health scoring, DLI tracking, VPD monitoring, rainfall-aware watering recommendations and OpenPlantBook integration.

---

## Features

- Plant health score with visual indicator
- Dynamic card colouring based on plant health
- Daily Light Integral (DLI) monitoring
- Vapour Pressure Deficit (VPD) monitoring
- Soil moisture monitoring
- Air temperature monitoring
- Air humidity monitoring
- Soil temperature monitoring
- Rainfall-aware watering recommendations
- Indoor and outdoor plant support
- OpenPlantBook image support
- Responsive desktop and mobile layouts
- Card picker preview
- Automatic entity discovery
- Battery and LQI display where available
- Graceful handling of missing sensors

---

## Important

This card is designed for the custom Plant Monitor integration.

It is not designed for the stock Home Assistant Plant integration.

---

## Architecture

Plant Monitor Premium was developed and tested using the following architecture:

```text
Zigbee Soil Sensor
        ↓
Zigbee2MQTT
        ↓
MQTT Sensors
        ↓
Plant Monitor
        ↓
OpenPlantBook
        ↓
Plant Monitor Premium Card
```

The card does not communicate directly with the sensor.

All monitoring logic is provided by the Plant Monitor integration.

---

## Requirements

### Required

- Home Assistant
- HACS
- Plant Monitor (custom integration)

### Strongly Recommended

- OpenPlantBook

### Recommended for Outdoor Plants

- Pirate Weather
- HA-Illuminance

### Optional

- Zigbee2MQTT
- ESPHome
- Battery sensors
- Link Quality sensors
- CO₂ sensors

---

## Tested Hardware

Reference development sensor:

**ZG-303Z / CS-201Z Zigbee Soil Sensor**

Exposes:

- Soil Moisture
- Soil Temperature
- Air Humidity
- Battery
- Link Quality

Plant Monitor Premium works with any sensor capable of providing equivalent data through Plant Monitor.

---

## Outdoor Plant Support

The card was specifically designed to support outdoor plants.

Features include:

- DLI monitoring
- Outdoor lux estimation
- Rainfall-aware watering recommendations
- Species-specific thresholds
- OpenPlantBook integration

A physical outdoor lux sensor is not required.

The card was developed using:

- HA-Illuminance
- Pirate Weather

for outdoor monitoring.

---

## Rainfall Sensors

The card supports three rainfall sensors:

```yaml
rainfall_today_entity:
rainfall_24h_entity:
rainfall_48h_entity:
```

These are used to generate watering recommendations such as:

- Water today
- Wait for forecast rain
- Avoid watering

Example:

```yaml
type: custom:plant-monitor-premium-card
entity: plant.guelder_rose
plant_location: outdoor

rainfall_today_entity: sensor.rainfall_today
rainfall_24h_entity: sensor.rainfall_next_24h
rainfall_48h_entity: sensor.rainfall_next_48h
```

---

## Example Card

```yaml
type: custom:plant-monitor-premium-card
entity: plant.guelder_rose
plant_location: outdoor
```

Example with temperature override:

```yaml
type: custom:plant-monitor-premium-card
entity: plant.pieris_japonica_forest_flame
plant_location: outdoor
air_temperature_entity: sensor.pieris_japonica_forest_flame_temperature_2
```

---

## Tested Environment

### Integrations

- Plant Monitor (custom integration)
- OpenPlantBook
- Pirate Weather
- HA-Illuminance
- Zigbee2MQTT

### Stability Testing

Validated on a live Home Assistant deployment containing:

- 21 simultaneous plant cards
- 5 indoor plants
- 16 outdoor plants

Tested on:

- Desktop Chrome
- Desktop Safari
- Home Assistant iOS App

The v1.0.0 release is based on the V32 stable rendering engine and has been validated on a live 21-plant dashboard.

---

## Installation

### HACS

1. Open HACS
2. Dashboard → Custom Repositories
3. Add this repository
4. Repository Type: Dashboard
5. Install Plant Monitor Premium Card
6. Refresh browser
7. Add the card to Lovelace

### Manual

Copy:

```text
dist/plant-monitor-premium-card.js
```

to:

```text
/config/www/
```

Add resource:

```yaml
url: /local/plant-monitor-premium-card.js
type: module
```

Restart Home Assistant frontend.

---

## License

MIT License
