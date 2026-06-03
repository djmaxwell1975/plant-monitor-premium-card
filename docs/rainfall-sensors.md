# Rainfall Sensors

Plant Monitor Premium Card includes rainfall-aware watering advice for outdoor plants.

Rainfall support is optional, but strongly recommended for outdoor plants.

The card can use three rainfall sensors:

- `sensor.plant_rain_today`
- `sensor.plant_rain_next_24h`
- `sensor.plant_rain_next_48h`

These are the default entity IDs used by the card.

---

## Why Rainfall Sensors Matter

Outdoor plants should not be judged by soil moisture alone.

If the soil is dry but rain is expected soon, the card can recommend waiting rather than watering immediately.

Example watering messages include:

- Water today
- Wait for forecast rain
- Useful rain due soon
- Avoid watering
- Rain has watered it

---

## Default Entity Names

By default, Plant Monitor Premium looks for:

```yaml
rainfall_today_entity: sensor.plant_rain_today
rainfall_24h_entity: sensor.plant_rain_next_24h
rainfall_48h_entity: sensor.plant_rain_next_48h
```

If you use these entity IDs, no extra rainfall configuration is needed in each card.

Example:

```yaml
type: custom:plant-monitor-premium-card
entity: plant.guelder_rose
plant_location: outdoor
```

---

## Custom Rainfall Entity Names

If your rainfall sensors use different entity IDs, you can override them per card:

```yaml
type: custom:plant-monitor-premium-card
entity: plant.guelder_rose
plant_location: outdoor

rainfall_today_entity: sensor.my_rain_today
rainfall_24h_entity: sensor.my_rain_next_24h
rainfall_48h_entity: sensor.my_rain_next_48h
```

---

## Recommended Weather Source

The card was developed and tested with Pirate Weather.

Pirate Weather can provide precipitation data that can be converted into template sensors for:

- rain today
- rain forecast for the next 24 hours
- rain forecast for the next 48 hours

Other weather providers can also be used if they expose equivalent rainfall values.

---

## Example Template Sensors

The exact template may vary depending on your weather integration and entity names.

The goal is to create three sensors with these final entity IDs:

```yaml
sensor.plant_rain_today
sensor.plant_rain_next_24h
sensor.plant_rain_next_48h
```

Example template structure:

```yaml
sensor:

   - name: Plant Rain Today
     unique_id: plant_rain_today
     unit_of_measurement: "mm"
     state: >
       {{ states('sensor.your_rain_today_source') | float(0) }}

   - name: Plant Rain Next 24h
     unique_id: plant_rain_next_24h
     unit_of_measurement: "mm"
     state: >
       {{ states('sensor.your_rain_next_24h_source') | float(0) }}

   - name: Plant Rain Next 48h
     unique_id: plant_rain_next_48h
     unit_of_measurement: "mm"
     state: >
       {{ states('sensor.your_rain_next_48h_source') | float(0) }}
```

Replace the `sensor.your_*_source` entities with the rainfall or precipitation sensors exposed by your weather integration.

---

## Home Assistant Template File Note

If your Home Assistant configuration uses a separate `template.yaml` file, add the sensors in the same style as the rest of your template sensors.

Some installations use:

```yaml
template:
   - sensor:
```

Others use an included file where sensors are defined directly as:

```yaml
sensor:
```

Follow the format used by your own Home Assistant setup.

---

## Outdoor Card Example

```yaml
type: custom:plant-monitor-premium-card
entity: plant.english_lavender
plant_location: outdoor
```

With default rainfall sensors, the card automatically uses:

```yaml
sensor.plant_rain_today
sensor.plant_rain_next_24h
sensor.plant_rain_next_48h
```

---

## Indoor Plants

Rainfall sensors are not used for indoor plants.

For indoor plants, set:

```yaml
plant_location: indoor
```

Example:

```yaml
type: custom:plant-monitor-premium-card
entity: plant.monstera_thai_constellation
plant_location: indoor
```

---

## Troubleshooting

### Rainfall always shows 0 mm

Check that your template sensors exist in Developer Tools → States.

Expected entities:

- `sensor.plant_rain_today`
- `sensor.plant_rain_next_24h`
- `sensor.plant_rain_next_48h`

### Watering advice ignores rainfall

Check that:

```yaml
plant_location: outdoor
```

is set on the card.

Rainfall logic is only used for outdoor plants.

### My weather provider uses different entity names

Use per-card overrides:

```yaml
rainfall_today_entity: sensor.my_rain_today
rainfall_24h_entity: sensor.my_rain_next_24h
rainfall_48h_entity: sensor.my_rain_next_48h
```

---

## Notes

Rainfall forecasts are estimates.

Always use common sense when watering outdoor plants, especially during heatwaves, drought, prolonged rain, or when plants are newly planted.
