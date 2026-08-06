# Changelog

## Unreleased

- Fix health scoring for automatically resolved plant sensors so populated
  metric bars no longer produce a false `0% Critical` result
- Show `Awaiting data` when no scoreable metric is available instead of
  treating missing data as zero health
- Fix manual soil moisture, DLI, temperature and humidity override handling
- Continue displaying valid sensor values when threshold entities are unavailable
- Reject lux/illuminance entities when configured as DLI overrides
- Align health, attention and watering logic with configured overrides
- Omit optional soil, VPD, battery and LQI chips when their sensors are unavailable
- Ignore CO₂ status for outdoor plants and mark non-`ok` plant entities critical
- Document all supported entity overrides and their top-level YAML placement
- Add a root compatibility entry point for existing Home Assistant resource paths

## v1.0.3

- Fix configuration errors for dashboards still loading the legacy root resource path

## v1.0.2

- Fix false `0% Critical` health summaries when sensor entities are discovered
  automatically from the plant device or sensor prefix
- Keep genuinely `problem` Plant Monitor entities critical

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
