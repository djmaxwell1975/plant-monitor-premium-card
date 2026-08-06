const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

class TestHTMLElement {}

const context = {
  HTMLElement: TestHTMLElement,
  document: {
    hidden: false,
    addEventListener() {},
    removeEventListener() {}
  },
  window: {
    addEventListener() {},
    removeEventListener() {},
    customCards: []
  },
  customElements: {
    registry: new Map(),
    get(name) {
      return this.registry.get(name);
    },
    define(name, value) {
      this.registry.set(name, value);
    }
  },
  requestAnimationFrame(callback) {
    return callback();
  },
  cancelAnimationFrame() {},
  console,
  Date,
  isNaN,
  JSON,
  Math,
  String
};

vm.createContext(context);
const source = fs.readFileSync("dist/plant-monitor-premium-card.js", "utf8");
vm.runInContext(`${source}\nthis.CardUnderTest = PlantMonitorPremiumCard;`, context);

const Card = context.CardUnderTest;

function makeCard(config, states) {
  const card = new Card();
  card.setConfig(config);
  card._hass = { states };
  Card.entityRegistry = [];
  return card;
}

function sensor(state, unit_of_measurement) {
  return {
    state: String(state),
    attributes: unit_of_measurement ? { unit_of_measurement } : {}
  };
}

{
  const card = makeCard(
    {
      entity: "plant.monstera",
      moisture_entity: "sensor.third_reality_moisture",
      dli_entity: "sensor.monstera_dli"
    },
    {
      "sensor.third_reality_moisture": sensor(62, "%"),
      "sensor.monstera_dli": sensor(12.4, "mol/m²/day"),
      "number.monstera_min_soil_moisture": sensor(30, "%"),
      "number.monstera_max_soil_moisture": sensor(80, "%"),
      "number.monstera_min_dli": sensor(8, "mol/m²/day"),
      "number.monstera_max_dli": sensor(35, "mol/m²/day")
    }
  );

  const resolved = card.resolved();
  assert.equal(resolved.moisture, "sensor.third_reality_moisture");
  assert.equal(resolved.dli, "sensor.monstera_dli");
}

{
  const card = makeCard(
    { entity: "plant.monstera", moisture_entity: "sensor.third_reality_moisture" },
    { "sensor.third_reality_moisture": sensor(62, "%") }
  );

  const html = card.renderBar(
    "Soil Moisture",
    "mdi:water",
    "sensor.third_reality_moisture",
    "number.missing_min",
    "number.missing_max",
    "%"
  );

  assert.match(html, /62%/);
  assert.match(html, /Value/);
}

{
  const card = makeCard(
    { entity: "plant.monstera", dli_entity: "sensor.motion_sensor_illuminance" },
    { "sensor.motion_sensor_illuminance": sensor(420, "lx") }
  );

  const html = card.renderBar(
    "DLI 24h",
    "mdi:white-balance-sunny",
    "sensor.motion_sensor_illuminance",
    "number.min_dli",
    "number.max_dli",
    "",
    "dli"
  );

  assert.match(html, /420lx/);
  assert.match(html, /Use DLI sensor/);
}

{
  const card = makeCard(
    {
      entity: "plant.monstera",
      plant_location: "outdoor",
      moisture_entity: "sensor.override_moisture",
      min_moisture_entity: "number.override_min",
      max_moisture_entity: "number.override_max"
    },
    {
      "sensor.override_moisture": sensor(62, "%"),
      "number.override_min": sensor(30, "%"),
      "number.override_max": sensor(80, "%")
    }
  );

  const entity = {
    state: "ok",
    attributes: {
      moisture_status: "low",
      co2_status: "low"
    }
  };
  const health = card.getHealth(entity, card.resolved());
  const attention = card.renderAttention(entity, card.resolved());

  assert.equal(health.score, 100);
  assert.doesNotMatch(attention, /Soil moisture low/);
  assert.doesNotMatch(attention, /CO₂/);
}

{
  const card = makeCard(
    {
      entity: "plant.monstera",
      sensor_prefix: "monstera"
    },
    {
      "plant.monstera": { state: "ok", attributes: {} },
      "sensor.monstera_soil_moisture": sensor(62, "%"),
      "number.monstera_min_soil_moisture": sensor(30, "%"),
      "number.monstera_max_soil_moisture": sensor(80, "%"),
      "sensor.monstera_dli_24h": sensor(12.4, "mol/m²/day"),
      "number.monstera_min_dli": sensor(8, "mol/m²/day"),
      "number.monstera_max_dli": sensor(35, "mol/m²/day"),
      "sensor.monstera_temperature": sensor(21, "°C"),
      "number.monstera_min_temperature": sensor(15, "°C"),
      "number.monstera_max_temperature": sensor(30, "°C"),
      "sensor.monstera_air_humidity": sensor(55, "%"),
      "number.monstera_min_air_humidity": sensor(40, "%"),
      "number.monstera_max_air_humidity": sensor(70, "%")
    }
  );

  const entity = card.getState("plant.monstera");
  const health = card.getHealth(entity, card.resolved());
  const attention = card.renderAttention(entity, card.resolved());

  assert.equal(health.score, 100);
  assert.equal(health.total, 4);
  assert.equal(health.good, 4);
  assert.match(attention, /All monitored values are within target range/);
}

{
  const card = makeCard({ entity: "plant.monstera" }, {});
  const health = card.getHealth({ state: "ok", attributes: {} }, card.resolved());

  assert.equal(health.score, null);
  assert.equal(health.stateLabel, "Awaiting data");
  assert.equal(health.total, 0);
}

{
  const card = makeCard(
    {
      entity: "plant.monstera",
      sensor_prefix: "monstera"
    },
    {
      "sensor.monstera_soil_moisture": sensor(62, "%"),
      "number.monstera_min_soil_moisture": sensor(30, "%"),
      "number.monstera_max_soil_moisture": sensor(80, "%")
    }
  );

  const health = card.getHealth({ state: "problem", attributes: {} }, card.resolved());

  assert.equal(health.score, 0);
  assert.equal(health.stateLabel, "Critical");
}

{
  const card = makeCard({ entity: "plant.monstera" }, {});
  const health = card.getHealth({ state: "unavailable", attributes: {} }, card.resolved());
  assert.equal(health.score, 0);
  assert.equal(health.stateLabel, "Critical");
}

console.log("Plant Monitor Premium Card regression tests passed");
