# Troubleshooting

This guide covers the most common issues encountered when installing or configuring Plant Monitor Premium Card.

---

## Card Does Not Appear In Lovelace Picker

### Symptoms

- Card cannot be found when adding a card
- Plant Monitor Premium Card is missing from the card list

### Checks

Confirm the card resource is installed correctly.

If installed manually:

```yaml
url: /local/plant-monitor-premium-card.js
type: module
```

If installed through HACS:

- Refresh browser cache
- Reload the Home Assistant frontend
- Fully close and reopen the Home Assistant mobile app

---

## Red Error Card

### Symptoms

The card displays a red error box.

### Checks

Verify:

- Plant Monitor Premium Card is installed
- The resource URL is correct
- Browser cache has been refreshed
- Home Assistant frontend has reloaded

---

## Plant Entity Not Found

### Symptoms

The card displays:

```text
Plant entity not found
```

### Checks

Verify that the configured entity exists.

Example:

```yaml
entity: plant.english_lavender
```

Check Developer Tools → States and confirm the plant entity exists.

---

## Using The Wrong Plant Integration

### Symptoms

Health scoring does not work correctly.

### Cause

Plant Monitor Premium was designed for the custom Plant Monitor integration.

It is not designed for the stock Home Assistant Plant integration.

### Resolution

Install and configure the custom Plant Monitor integration.

---

## No Plant Image

### Symptoms

The card displays a placeholder image.

### Checks

Verify:

- OpenPlantBook is configured
- The plant species is recognised
- Plant Monitor is exposing an entity picture

Not all plants are available in OpenPlantBook.

---

## Scientific Name Missing

### Symptoms

The common name is shown but the scientific name is blank.

### Checks

Verify OpenPlantBook is configured correctly and associated with the plant.

---

## Soil Moisture Displays —

### Symptoms

The Soil Moisture bar shows:

```text
—
```

### Checks

Verify:

- Soil moisture sensor exists
- Plant Monitor is receiving the value
- Sensor entity is available

---

## Temperature Displays —

### Symptoms

The Temperature bar shows:

```text
—
```

### Checks

Verify:

- Temperature sensor exists
- Plant Monitor is receiving the value

If required, use an override:

```yaml
air_temperature_entity: sensor.my_temperature_sensor
```

---

## DLI Displays —

### Symptoms

The DLI bar shows no value.

### Checks

Verify:

- DLI sensor exists
- Plant Monitor is calculating DLI
- Illuminance source is configured

For outdoor plants, HA-Illuminance is recommended.

---

## VPD Displays —

### Symptoms

The VPD chip displays:

```text
—
```

### Checks

Verify:

- Temperature data exists
- Humidity data exists
- Plant Monitor is calculating VPD

---

## Battery Or LQI Missing

### Symptoms

Battery or LQI values display:

```text
—
```

### Explanation

Battery and Link Quality are optional.

The card continues to function without them.

---

## Rainfall Always Shows 0 mm

### Symptoms

Outdoor rainfall chips always display 0 mm.

### Checks

Verify:

- sensor.plant_rain_today
- sensor.plant_rain_next_24h
- sensor.plant_rain_next_48h

exist in Developer Tools → States.

---

## Watering Advice Ignores Rainfall

### Symptoms

The card suggests watering despite forecast rain.

### Checks

Verify:

```yaml
plant_location: outdoor
```

Rainfall logic is only used for outdoor plants.

---

## Performance Issues

### Symptoms

Slow scrolling
High CPU usage
Mobile device becomes warm

### Checks

Verify you are using the latest release.

The release version includes the V32 rendering engine which significantly reduced unnecessary re-rendering.

---

## Browser Still Shows Old Version

### Symptoms

Recent updates do not appear.

### Resolution

Force refresh the browser.

Examples:

Windows:

```text
Ctrl + F5
```

Mac:

```text
Cmd + Shift + R
```

Home Assistant iOS App:

- Close the app completely
- Reopen the app

---

## Known Good Configuration

The initial release was validated using:

- 21 simultaneous plant cards
- 5 indoor plants
- 16 outdoor plants

Integrations:

- Plant Monitor
- OpenPlantBook
- Pirate Weather
- HA-Illuminance
- Zigbee2MQTT

Platforms:

- Desktop Chrome
- Desktop Safari
- Home Assistant iOS App

Validated for more than 48 hours of continuous operation.

---

## Need More Help?

When reporting issues, include:

- Home Assistant version
- Plant Monitor version
- Browser or app used
- Example plant entity
- Screenshots if possible

This information makes troubleshooting significantly easier.
