# Sensor Hardware

Plant Monitor Premium Card was intentionally developed using inexpensive and widely available hardware.

The goal of the project is to make advanced plant monitoring accessible to ordinary Home Assistant users without requiring expensive horticultural equipment.

---

## Reference Development Sensor

The card was developed and tested primarily using:

### ZG-303Z / CS-201Z Zigbee Soil Sensor

Commonly sold under various brand names including:

- COOLO
- HOBEIAN
- Generic Tuya Zigbee Soil Sensor

Connected through:

```text
Zigbee Soil Sensor
        ↓
Zigbee2MQTT
        ↓
MQTT Entities
        ↓
Plant Monitor
        ↓
Plant Monitor Premium Card
```

---

## Sensor Data Used

The reference sensor provides:

- Soil moisture
- Soil temperature
- Air humidity
- Battery level
- Link Quality Indicator (LQI)

These values are then processed by Plant Monitor.

The card itself reads Plant Monitor entities rather than communicating directly with the sensor.

---

## Important Design Principle

Plant Monitor Premium is sensor-agnostic.

The card does not require a specific brand or model of sensor.

As long as Plant Monitor receives suitable data, the card can display and analyse it.

---

## Supported Sensor Sources

Examples include:

- Zigbee2MQTT
- ZHA
- ESPHome
- MQTT
- Bluetooth plant sensors
- REST sensors
- Template sensors

---

## Indoor Plants

A typical indoor setup might include:

- Soil moisture sensor
- Air temperature sensor
- Humidity sensor

Optional:

- Soil temperature
- Lux sensor
- CO₂ sensor

---

## Outdoor Plants

A typical outdoor setup might include:

- Soil moisture sensor
- Soil temperature sensor
- Plant Monitor
- OpenPlantBook
- HA-Illuminance
- Pirate Weather

A physical lux sensor is not required.

Plant Monitor Premium was specifically designed to work with estimated outdoor illuminance values.

---

## Battery and LQI

When available, the card can display:

- Battery percentage
- Link Quality Indicator (LQI)

If these sensors are unavailable, the card will continue to function normally.

---

## OpenPlantBook

OpenPlantBook is strongly recommended.

Benefits include:

- Plant images
- Scientific names
- Species metadata
- Plant-specific thresholds

Many of the visual features of Plant Monitor Premium rely on data supplied through Plant Monitor and OpenPlantBook.

---

## Performance Testing

The release version of Plant Monitor Premium was tested with:

- 21 simultaneous plant cards
- 5 indoor plants
- 16 outdoor plants

Using:

- Home Assistant
- Plant Monitor
- OpenPlantBook
- Pirate Weather
- HA-Illuminance
- Zigbee2MQTT

The V32 rendering engine was validated for more than 48 hours of continuous operation across desktop browsers and the Home Assistant iOS application.

---

## Frequently Asked Question

### Do I need the same sensor?

No.

The card was developed using a low-cost Zigbee soil sensor, but any sensor source that provides suitable data to Plant Monitor can be used.

### Do I need Zigbee2MQTT?

No.

Zigbee2MQTT was used during development, but the card works with any sensor source supported by Plant Monitor.

### Do I need a lux sensor?

No.

Outdoor plants can use HA-Illuminance as an estimated lux source.

### Do I need a CO₂ sensor?

No.

CO₂ is optional and many outdoor plants will not have a CO₂ source configured.
