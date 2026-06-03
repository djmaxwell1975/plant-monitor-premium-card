# Prerequisites

Plant Monitor Premium Card is designed for a specific Home Assistant plant monitoring stack.

It is not a standalone plant monitoring integration. It is a dashboard card that displays and enhances plant data provided by other integrations.

---

## Required

### Home Assistant

Plant Monitor Premium Card is a Home Assistant Lovelace dashboard card.

### HACS

HACS is recommended for installation and updates.

### Plant Monitor Custom Integration

This card requires the custom Plant Monitor integration.

It is not designed for the stock Home Assistant Plant integration.

Plant Monitor provides:

- Plant entities
- Health/status attributes
- Species thresholds
- DLI status
- VPD status
- Moisture status
- Temperature status
- Humidity status
- Soil temperature status

The card expects plant entities such as:

plant.guelder_rose
plant.english_lavender
plant.monstera_thai_constellation

---

## Strongly Recommended

### OpenPlantBook

OpenPlantBook is strongly recommended.

It provides:

- Plant images
- Scientific names
- Species data
- Threshold information

The card uses the Plant Monitor entity data that is normally populated with help from OpenPlantBook.

---

## Recommended for Outdoor Plants

### HA-Illuminance

HA-Illuminance can provide estimated outdoor illuminance where no physical lux sensor exists.

### Pirate Weather

Pirate Weather can be used to create rainfall forecast sensors.

These rainfall sensors allow the card to show watering recommendations such as:

- Water today
- Wait for forecast rain
- Avoid watering

---

## Sensor Sources

The card does not communicate directly with soil sensors.

Example architecture:

Zigbee Soil Sensor
↓
Zigbee2MQTT
↓
MQTT Sensor Entities
↓
Plant Monitor
↓
Plant Monitor Premium Card

Other valid sources include:

- ESPHome
- MQTT
- Zigbee2MQTT
- ZHA
- Bluetooth plant sensors
- Template sensors
- REST sensors

---

## Optional Sensors

- Battery
- Link Quality Indicator
- Soil temperature
- VPD
- Rainfall forecast
- CO₂

---

## Tested Development Stack

- Home Assistant
- Plant Monitor custom integration
- OpenPlantBook
- Pirate Weather
- HA-Illuminance
- Zigbee2MQTT
- MQTT soil sensor entities
- 21 simultaneous plant cards

Tested on:

- Desktop Chrome
- Desktop Safari
- Home Assistant iOS App

