# Changelog

## Unreleased

- Fix manual soil moisture, DLI, temperature and humidity override handling
- Continue displaying valid sensor values when threshold entities are unavailable
- Reject lux/illuminance entities when configured as DLI overrides
- Align health, attention and watering logic with configured overrides
- Omit optional soil, VPD, battery and LQI chips when their sensors are unavailable
- Ignore CO₂ status for outdoor plants and mark non-`ok` plant entities critical
- Document all supported entity overrides and their top-level YAML placement

## v1.0.0

Initial public release.

### Features

- Plant Monitor integration support
- OpenPlantBook image support
- Plant health scoring
- DLI monitoring
- VPD monitoring
- Soil moisture monitoring
- Soil temperature monitoring
- Humidity monitoring
- Rainfall-aware watering recommendations
- Indoor and outdoor plant support
- Mobile responsive layout
- Desktop responsive layout
- Card picker preview
- Dynamic entity discovery
- Battery and LQI support where available

### Tested Environment

- Home Assistant
- Plant Monitor (custom integration)
- OpenPlantBook
- Pirate Weather
- HA Illuminance
- Zigbee2MQTT

### Stability

Validated on a live dashboard containing:

- 21 simultaneous plant cards
- Desktop Chrome
- Desktop Safari
- Home Assistant iOS App

Based on V32 rendering engine.
