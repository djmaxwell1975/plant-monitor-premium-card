class PlantMonitorPremiumCard extends HTMLElement {
  static entityRegistry = null;
  static entityRegistryPromise = null;

  constructor() {
    super();
    this.config = {};
    this._hass = null;
    this._rendered = false;
    this._resolvedCache = null;
    this._cacheKey = "";
    this._watchedEntities = [];
    this._lastSignature = "";
    this._raf = null;
    this._previewRendered = false;

    this._boundForceRefresh = () => {
      this.forceRefresh();
    };
  }

  connectedCallback() {
    window.addEventListener("focus", this._boundForceRefresh);
    window.addEventListener("pageshow", this._boundForceRefresh);
    document.addEventListener("visibilitychange", this._boundForceRefresh);

    if (this._hass) {
      this.forceRefresh();
    }
  }

  disconnectedCallback() {
    window.removeEventListener("focus", this._boundForceRefresh);
    window.removeEventListener("pageshow", this._boundForceRefresh);
    document.removeEventListener("visibilitychange", this._boundForceRefresh);

    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
  }

  forceRefresh() {
    if (document.hidden) return;
    if (!this._hass) return;

    this._lastSignature = "";
    this.requestUpdate(true);
  }

  setConfig(config) {
    this.config = config || {};
    this._rendered = false;
    this._resolvedCache = null;
    this._cacheKey = "";
    this._watchedEntities = [];
    this._lastSignature = "";
    this._previewRendered = false;
  }

  set hass(hass) {
    this._hass = hass;

    if (!this._rendered || !this.querySelector("#card")) {
      this.renderCard();
      this.requestUpdate(true);
    } else if (this.isDomIncomplete()) {
      this.requestUpdate(true);
    } else {
      this.requestUpdate(false);
    }

    this.loadEntityRegistry();
  }

  isDomIncomplete() {
    if (this.config?.entity === "plant.plant_monitor_premium_preview") return false;

    const card = this.querySelector("#card");
    const header = this.querySelector("#header");
    const bars = this.querySelector("#bars");

    if (!card || !header || !bars) return true;
    if (!header.innerHTML.trim()) return true;
    if (!bars.innerHTML.trim()) return true;

    return false;
  }

  async loadEntityRegistry() {
    if (!this._hass?.callWS) return;

    if (PlantMonitorPremiumCard.entityRegistry) return;

    if (!PlantMonitorPremiumCard.entityRegistryPromise) {
      PlantMonitorPremiumCard.entityRegistryPromise = this._hass.callWS({
        type: "config/entity_registry/list"
      });
    }

    try {
      PlantMonitorPremiumCard.entityRegistry =
        await PlantMonitorPremiumCard.entityRegistryPromise;

      this._resolvedCache = null;
      this._cacheKey = "";
      this._watchedEntities = [];
      this._lastSignature = "";
      this.requestUpdate(true);
    } catch (err) {
      console.warn(
        "Plant Monitor Premium Card: entity registry unavailable, using prefix fallback",
        err
      );
      PlantMonitorPremiumCard.entityRegistry = [];
    }
  }

  requestUpdate(force = false) {
    if (!this._hass) return;

    if (!force && !this.shouldUpdate()) return;

    if (this._raf) return;

    this._raf = requestAnimationFrame(() => {
      this._raf = null;
      this.updateCard(force);
    });
  }

  shouldUpdate() {
    if (!this._rendered) return true;
    if (this.isDomIncomplete()) return true;

    const isPreview = this.config?.entity === "plant.plant_monitor_premium_preview";
    if (isPreview) return false;

    const signature = this.stateSignature();

    if (!signature) return true;
    if (signature === this._lastSignature) return false;

    this._lastSignature = signature;
    return true;
  }

  stateSignature() {
    const ids = this.getWatchedEntities();
    if (!ids.length) return "";

    return ids
      .map((id) => {
        const stateObj = this._hass?.states?.[id];
        if (!stateObj) return `${id}:missing`;

        const attrs = stateObj.attributes || {};

        return [
          id,
          stateObj.state,
          attrs.entity_picture || "",
          attrs.friendly_name || "",
          attrs.species || "",
          attrs.moisture_status || "",
          attrs.temperature_status || "",
          attrs.illuminance_status || "",
          attrs.humidity_status || "",
          attrs.co2_status || "",
          attrs.soil_temperature_status || "",
          attrs.dli_status || "",
          attrs.vpd_status || ""
        ].join(":");
      })
      .join("|");
  }

  getWatchedEntities() {
    if (this._watchedEntities.length) return this._watchedEntities;

    const r = this.resolved();

    const ids = [
      this.config?.entity,
      r.moisture,
      r.minMoisture,
      r.maxMoisture,
      r.dli,
      r.minDli,
      r.maxDli,
      r.temperature,
      r.minTemperature,
      r.maxTemperature,
      r.humidity,
      r.minHumidity,
      r.maxHumidity,
      r.soilTemperature,
      r.vpd,
      r.battery,
      r.lqi,
      r.rainToday,
      r.rain24h,
      r.rain48h
    ].filter(Boolean);

    this._watchedEntities = [...new Set(ids)];
    return this._watchedEntities;
  }

  entityRegistry() {
    return PlantMonitorPremiumCard.entityRegistry || [];
  }

  entityBase() {
    return (this.config?.entity || "").split(".")[1] || "";
  }

  sensorPrefix() {
    return this.config.sensor_prefix || this.entityBase();
  }

  devicePrefix() {
    return this.config.device_prefix || this.sensorPrefix();
  }

  exists(entityId) {
    return !!(entityId && this._hass && this._hass.states[entityId]);
  }

  firstExisting(list) {
    return list.find((id) => this.exists(id)) || null;
  }

  registryEntry(entityId) {
    return this.entityRegistry().find((entry) => entry.entity_id === entityId) || null;
  }

  sameDeviceEntries() {
    const plantEntry = this.registryEntry(this.config?.entity);
    const deviceId = plantEntry?.device_id;
    if (!deviceId) return [];

    return this.entityRegistry().filter((entry) => {
      return entry.device_id === deviceId && this.exists(entry.entity_id);
    });
  }

  registryEntity(domain, includes = [], excludes = [], prefers = []) {
    const entries = this.sameDeviceEntries();

    const matches = entries
      .filter((entry) => {
        const entityId = entry.entity_id || "";
        const entityDomain = entityId.split(".")[0];

        if (entityDomain !== domain) return false;

        const haystack = [
          entry.entity_id,
          entry.name,
          entry.original_name,
          entry.translation_key,
          entry.device_class
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!includes.every((word) => haystack.includes(word))) return false;
        if (excludes.some((word) => haystack.includes(word))) return false;

        return true;
      })
      .map((entry) => {
        const haystack = [
          entry.entity_id,
          entry.name,
          entry.original_name,
          entry.translation_key,
          entry.device_class
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        let score = 0;
        prefers.forEach((word) => {
          if (haystack.includes(word)) score += 50;
        });

        return {
          entity_id: entry.entity_id,
          score
        };
      })
      .sort((a, b) => b.score - a.score);

    return matches.length ? matches[0].entity_id : null;
  }

  prefixResolved() {
    const sensorPrefix = this.sensorPrefix();
    const devicePrefix = this.devicePrefix();

    return {
      moisture: this.firstExisting([
        `sensor.${sensorPrefix}_soil_moisture_2`,
        `sensor.${sensorPrefix}_soil_moisture`
      ]),
      minMoisture: `number.${sensorPrefix}_min_soil_moisture`,
      maxMoisture: `number.${sensorPrefix}_max_soil_moisture`,

      dli: `sensor.${sensorPrefix}_dli_24h`,
      minDli: `number.${sensorPrefix}_min_dli`,
      maxDli: `number.${sensorPrefix}_max_dli`,

      temperature: this.firstExisting([
        `sensor.${sensorPrefix}_temperature_2`,
        `sensor.${sensorPrefix}_temperature`
      ]),
      minTemperature: `number.${sensorPrefix}_min_temperature`,
      maxTemperature: `number.${sensorPrefix}_max_temperature`,

      humidity: `sensor.${sensorPrefix}_air_humidity`,
      minHumidity: `number.${sensorPrefix}_min_air_humidity`,
      maxHumidity: `number.${sensorPrefix}_max_air_humidity`,

      soilTemperature: `sensor.${sensorPrefix}_soil_temperature`,
      vpd: `sensor.${sensorPrefix}_vapour_pressure_deficit`,

      battery: this.firstExisting([
        `sensor.${devicePrefix}_battery`,
        `sensor.${sensorPrefix}_battery`
      ]),

      lqi: this.firstExisting([
        `sensor.${devicePrefix}_linkquality`,
        `sensor.${sensorPrefix}_linkquality`
      ])
    };
  }

  makeCacheKey() {
    return JSON.stringify({
      entity: this.config?.entity || "",
      sensor_prefix: this.config?.sensor_prefix || "",
      device_prefix: this.config?.device_prefix || "",
      plant_location: this.config?.plant_location || "",
      air_temperature_entity: this.config?.air_temperature_entity || "",
      moisture_entity: this.config?.moisture_entity || "",
      min_moisture_entity: this.config?.min_moisture_entity || "",
      max_moisture_entity: this.config?.max_moisture_entity || "",
      dli_entity: this.config?.dli_entity || "",
      min_dli_entity: this.config?.min_dli_entity || "",
      max_dli_entity: this.config?.max_dli_entity || "",
      humidity_entity: this.config?.humidity_entity || "",
      min_humidity_entity: this.config?.min_humidity_entity || "",
      max_humidity_entity: this.config?.max_humidity_entity || "",
      battery_entity: this.config?.battery_entity || "",
      lqi_entity: this.config?.lqi_entity || "",
      rainfall_today_entity: this.config?.rainfall_today_entity || "",
      rainfall_24h_entity: this.config?.rainfall_24h_entity || "",
      rainfall_48h_entity: this.config?.rainfall_48h_entity || "",
      registryReady: !!PlantMonitorPremiumCard.entityRegistry
    });
  }

  resolved() {
    const currentKey = this.makeCacheKey();

    if (this._resolvedCache && this._cacheKey === currentKey) {
      return this._resolvedCache;
    }

    const p = this.prefixResolved();

    this._resolvedCache = {
      moisture:
        this.config.moisture_entity ||
        this.registryEntity("sensor", ["soil", "moisture"], [], ["soil_moisture_2", "moisture_2"]) ||
        p.moisture,

      minMoisture:
        this.config.min_moisture_entity ||
        this.registryEntity("number", ["min", "soil", "moisture"]) ||
        p.minMoisture,

      maxMoisture:
        this.config.max_moisture_entity ||
        this.registryEntity("number", ["max", "soil", "moisture"]) ||
        p.maxMoisture,

      dli:
        this.config.dli_entity ||
        this.registryEntity("sensor", ["dli"], [], ["dli_24h"]) ||
        p.dli,

      minDli:
        this.config.min_dli_entity ||
        this.registryEntity("number", ["min", "dli"]) ||
        p.minDli,

      maxDli:
        this.config.max_dli_entity ||
        this.registryEntity("number", ["max", "dli"]) ||
        p.maxDli,

      temperature:
        this.config.air_temperature_entity ||
        this.registryEntity("sensor", ["temperature"], ["soil"], ["temperature_2"]) ||
        p.temperature,

      minTemperature:
        this.config.min_temperature_entity ||
        this.registryEntity("number", ["min", "temperature"], ["soil"]) ||
        p.minTemperature,

      maxTemperature:
        this.config.max_temperature_entity ||
        this.registryEntity("number", ["max", "temperature"], ["soil"]) ||
        p.maxTemperature,

      humidity:
        this.config.humidity_entity ||
        this.registryEntity("sensor", ["humidity"], [], ["air_humidity"]) ||
        p.humidity,

      minHumidity:
        this.config.min_humidity_entity ||
        this.registryEntity("number", ["min", "humidity"]) ||
        p.minHumidity,

      maxHumidity:
        this.config.max_humidity_entity ||
        this.registryEntity("number", ["max", "humidity"]) ||
        p.maxHumidity,

      soilTemperature:
        this.config.soil_temperature_entity ||
        this.registryEntity("sensor", ["soil", "temperature"]) ||
        p.soilTemperature,

      vpd:
        this.config.vpd_entity ||
        this.registryEntity("sensor", ["vapour", "pressure", "deficit"]) ||
        this.registryEntity("sensor", ["vpd"]) ||
        p.vpd,

      battery:
        this.config.battery_entity ||
        this.registryEntity("sensor", ["battery"], ["battery_plus"]) ||
        p.battery,

      lqi:
        this.config.lqi_entity ||
        this.registryEntity("sensor", ["linkquality"]) ||
        this.registryEntity("sensor", ["lqi"]) ||
        p.lqi,

      rainToday: this.config.rainfall_today_entity || "sensor.plant_rain_today",
      rain24h: this.config.rainfall_24h_entity || "sensor.plant_rain_next_24h",
      rain48h: this.config.rainfall_48h_entity || "sensor.plant_rain_next_48h"
    };

    this._cacheKey = currentKey;
    this._watchedEntities = [];
    this._lastSignature = "";

    return this._resolvedCache;
  }

  getState(entityId) {
    if (!entityId || !this._hass || !this._hass.states[entityId]) return null;
    return this._hass.states[entityId];
  }

  getNumber(entityId) {
    const stateObj = this.getState(entityId);
    if (!stateObj) return NaN;
    const value = parseFloat(stateObj.state);
    return isNaN(value) ? NaN : value;
  }

  getDisplay(entityId, suffix = "") {
    const stateObj = this.getState(entityId);
    if (!stateObj || stateObj.state === "unknown" || stateObj.state === "unavailable") return "—";
    return `${stateObj.state}${suffix}`;
  }

  getHealth(entity) {
    const attrs = entity?.attributes || {};

    const checks = [
      attrs.moisture_status,
      attrs.temperature_status,
      attrs.illuminance_status,
      attrs.humidity_status,
      attrs.co2_status,
      attrs.soil_temperature_status,
      attrs.dli_status,
      attrs.vpd_status
    ].filter((v) => v && v !== "null");

    const total = checks.length;
    const good = checks.filter((v) => v === "ok").length;
    const score = total ? Math.round((good / total) * 100) : 0;

    let colour = "#6ee16e";
    let stateLabel = "Excellent";

    if (score < 70) {
      colour = "#ff6b6b";
      stateLabel = "Critical";
    } else if (score < 80) {
      colour = "#f1c40f";
      stateLabel = "Attention";
    } else if (score < 90) {
      colour = "#f1c40f";
      stateLabel = "Good";
    } else if (score < 100) {
      colour = "#6ee16e";
      stateLabel = "Healthy";
    }

    return { score, total, good, colour, stateLabel };
  }

  getBackground(entity, score) {
    if (score < 70) {
      return "linear-gradient(135deg, rgba(74,37,24,.96), rgba(16,20,24,.98))";
    }

    if (score < 90) {
      return "linear-gradient(135deg, rgba(61,50,22,.96), rgba(16,20,24,.98))";
    }

    return "linear-gradient(135deg, rgba(18,53,31,.96), rgba(16,20,24,.98))";
  }

  renderCard() {
    this.innerHTML = `
      <ha-card id="card" style="
        display:block;
        border-radius:26px;
        padding:16px;
        color:white;
        background:linear-gradient(135deg,#12351f,#101418);
        box-shadow:
          0 16px 42px rgba(0,0,0,0.50),
          inset 0 1px 0 rgba(255,255,255,.08);
        border:1px solid rgba(255,255,255,.12);
        overflow:hidden;
        backdrop-filter:blur(18px);
        contain:content;
      ">
        <div id="header"></div>
        <div id="photo" style="margin-top:12px;"></div>
        <div id="bars" style="margin-top:11px;"></div>
        <div id="attention" style="margin-top:11px;"></div>
        <div id="watering" style="margin-top:11px;"></div>
        <div id="chips" style="margin-top:11px;"></div>
      </ha-card>
    `;

    this._rendered = true;
  }

  renderPreview() {
    return `
      <ha-card style="
        display:block;
        border-radius:26px;
        padding:16px;
        color:white;
        background:linear-gradient(135deg, rgba(18,53,31,.96), rgba(16,20,24,.98));
        box-shadow:
          0 16px 42px rgba(0,0,0,0.50),
          inset 0 1px 0 rgba(255,255,255,.08);
        border:1px solid rgba(255,255,255,.12);
        overflow:hidden;
        backdrop-filter:blur(18px);
        contain:content;
      ">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
          <div style="min-width:0;flex:1;">
            <div style="display:flex;align-items:flex-start;gap:7px;font-size:19px;font-weight:900;line-height:1.12;letter-spacing:-.25px;">
              <ha-icon icon="mdi:sprout" style="width:18px;height:18px;min-width:18px;margin-top:2px;color:#6ee16e;filter:drop-shadow(0 0 5px #6ee16e);"></ha-icon>
              <span>Plant Monitor Premium</span>
            </div>
            <div style="font-size:11px;opacity:.66;font-style:italic;margin-top:4px;padding-left:25px;">Premium plant dashboard card</div>
            <div style="margin-top:5px;margin-left:25px;width:42px;height:2px;border-radius:999px;background:#6ee16e;opacity:.48;box-shadow:0 0 8px #6ee16e;"></div>
          </div>

          <div style="min-width:74px;text-align:center;">
            <div style="position:relative;width:46px;height:46px;margin-left:auto;margin-right:auto;border-radius:50%;background:conic-gradient(#6ee16e 345deg, rgba(255,255,255,.16) 0deg);box-shadow:0 0 14px rgba(0,0,0,.38);">
              <div style="position:absolute;inset:5px;border-radius:50%;background:rgba(16,20,24,.94);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#6ee16e;">96%</div>
            </div>
            <div style="font-size:10px;opacity:.82;margin-top:4px;font-weight:800;color:#6ee16e;">Healthy</div>
            <div style="font-size:10px;opacity:.56;margin-top:1px;">7/7 healthy</div>
          </div>
        </div>

        <div style="
          height:84px;
          border-radius:20px;
          margin-top:12px;
          overflow:hidden;
          background:
            radial-gradient(circle at 25% 45%, rgba(110,225,110,.35), transparent 28%),
            radial-gradient(circle at 70% 35%, rgba(255,255,255,.18), transparent 24%),
            linear-gradient(135deg, rgba(57,120,70,.85), rgba(12,35,22,.9));
          box-shadow:inset 0 0 0 1px rgba(255,255,255,.10);
        "></div>

        ${this.renderPreviewBar("Soil Moisture", "mdi:water", "62%", "Good", "#2ecc71", 72)}
        ${this.renderPreviewBar("DLI 24h", "mdi:white-balance-sunny", "12.4", "Good", "#2ecc71", 58)}
        ${this.renderPreviewBar("Temperature", "mdi:thermometer", "21.3°C", "Good", "#2ecc71", 65)}

        <div style="background:rgba(46,204,113,.13);border:1px solid rgba(46,204,113,.38);border-radius:17px;padding:10px;font-size:13px;text-align:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.06);margin-top:11px;">
          <b style="color:#6ee16e;">✓ All monitored values are within target range</b>
        </div>
      </ha-card>
    `;
  }

  renderPreviewBar(label, icon, value, status, colour, pct) {
    return `
      <div style="margin-top:11px;">
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px;align-items:center;">
          <span style="display:flex;align-items:center;gap:5px;opacity:.94;">
            <ha-icon icon="${icon}" style="width:16px;height:16px;color:${colour};"></ha-icon>
            ${label}
          </span>
          <span style="font-weight:900;color:${colour};">${value} • ${status}</span>
        </div>
        <div style="height:8px;background:rgba(255,255,255,.14);border-radius:999px;overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,.35);">
          <div style="height:100%;width:${pct}%;background:${colour};border-radius:999px;box-shadow:0 0 14px ${colour};"></div>
        </div>
      </div>
    `;
  }

  updateCard(force = false) {
    if (!this._hass) return;

    const isPreview = this.config?.entity === "plant.plant_monitor_premium_preview";

    if (isPreview) {
      if (!this._previewRendered || force) {
        this.innerHTML = this.renderPreview();
        this._previewRendered = true;
      }
      this._rendered = true;
      return;
    }

    if (!force && !this.shouldUpdate()) return;

    const entity = this.getState(this.config?.entity);

    const cardEl = this.querySelector("#card");
    const headerEl = this.querySelector("#header");
    const photoEl = this.querySelector("#photo");
    const barsEl = this.querySelector("#bars");
    const attentionEl = this.querySelector("#attention");
    const wateringEl = this.querySelector("#watering");
    const chipsEl = this.querySelector("#chips");

    if (!cardEl || !headerEl || !photoEl || !barsEl || !attentionEl || !wateringEl || !chipsEl) {
      this.renderCard();
      this.requestUpdate(true);
      return;
    }

    if (!entity) {
      headerEl.innerHTML = `
        <div style="font-size:18px;font-weight:800;">Plant entity not found</div>
        <div style="font-size:12px;opacity:.7;margin-top:4px;">Choose a plant entity in the card editor.</div>
      `;
      photoEl.innerHTML = "";
      barsEl.innerHTML = "";
      attentionEl.innerHTML = "";
      wateringEl.innerHTML = "";
      chipsEl.innerHTML = "";
      return;
    }

    const r = this.resolved();
    const attrs = entity.attributes || {};
    const name = attrs.friendly_name || "Plant";
    const species = attrs.species || "Plant";
    const image = attrs.entity_picture || "";
    const health = this.getHealth(entity);

    cardEl.style.background = this.getBackground(entity, health.score);

    headerEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
        <div style="min-width:0;flex:1;">
          <div style="display:flex;align-items:flex-start;gap:7px;font-size:19px;font-weight:900;line-height:1.12;letter-spacing:-.25px;">
            <ha-icon icon="mdi:sprout" style="width:18px;height:18px;min-width:18px;margin-top:2px;color:${health.colour};filter:drop-shadow(0 0 5px ${health.colour});"></ha-icon>
            <span style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;white-space:normal;word-break:normal;">${name}</span>
          </div>
          <div style="font-size:11px;opacity:.66;font-style:italic;margin-top:4px;padding-left:25px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${species}</div>
          <div style="margin-top:5px;margin-left:25px;width:42px;height:2px;border-radius:999px;background:${health.colour};opacity:.48;box-shadow:0 0 8px ${health.colour};"></div>
        </div>

        <div style="min-width:74px;text-align:center;">
          <div style="position:relative;width:46px;height:46px;margin-left:auto;margin-right:auto;border-radius:50%;background:conic-gradient(${health.colour} ${health.score * 3.6}deg, rgba(255,255,255,.16) 0deg);box-shadow:0 0 14px rgba(0,0,0,.38);">
            <div style="position:absolute;inset:5px;border-radius:50%;background:rgba(16,20,24,.94);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:${health.colour};">${health.score}%</div>
          </div>
          <div style="font-size:10px;opacity:.82;margin-top:4px;font-weight:800;color:${health.colour};">${health.stateLabel}</div>
          <div style="font-size:10px;opacity:.56;margin-top:1px;">${health.good}/${health.total} healthy</div>
        </div>
      </div>
    `;

    if (photoEl.dataset.image !== image) {
      photoEl.dataset.image = image;
      photoEl.innerHTML = image
        ? `<div style="height:120px;border-radius:20px;overflow:hidden;background:rgba(255,255,255,.06);box-shadow:inset 0 0 0 1px rgba(255,255,255,.10);position:relative;">
             <img src="${image}" loading="lazy" style="width:100%;height:100%;object-fit:cover;filter:saturate(1.08) contrast(1.04);">
             <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,.01), rgba(0,0,0,.22));"></div>
           </div>`
        : `<div style="height:120px;border-radius:20px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-size:46px;">🌿</div>`;
    }

    barsEl.innerHTML = `
      ${this.renderBar("Soil Moisture", "mdi:water", r.moisture, r.minMoisture, r.maxMoisture, "%")}
      ${this.renderBar("DLI 24h", "mdi:white-balance-sunny", r.dli, r.minDli, r.maxDli, "", "dli")}
      ${this.renderBar("Temperature", "mdi:thermometer", r.temperature, r.minTemperature, r.maxTemperature, "°C")}
      ${this.renderBar("Humidity", "mdi:water-percent", r.humidity, r.minHumidity, r.maxHumidity, "%")}
    `;

    attentionEl.innerHTML = this.renderAttention(entity);
    wateringEl.innerHTML = this.renderWatering(entity, r);
    chipsEl.innerHTML = this.renderChips(r);

    this._lastSignature = this.stateSignature();
  }

  renderBar(label, icon, sensorEntity, minEntity, maxEntity, unit, mode = "normal") {
    const current = this.getNumber(sensorEntity);
    const min = this.getNumber(minEntity);
    const max = this.getNumber(maxEntity);

    let text = "Unknown";
    let colour = "#777";
    let pct = 0;
    let display = "—";
    let glow = "none";

    if (!isNaN(current) && !isNaN(min) && !isNaN(max)) {
      display = `${current.toFixed(current % 1 ? 1 : 0)}${unit}`;
      pct = Math.max(0, Math.min(100, (current / max) * 100));

      if (mode === "dli" && new Date().getHours() < 12 && current < min) {
        text = "Collecting";
        colour = "#f1c40f";
      } else if (current < min) {
        text = "Low";
        colour = "#f1c40f";
      } else if (current > max) {
        text = "High";
        colour = "#3498db";
      } else {
        text = "Good";
        colour = "#2ecc71";
      }

      if (mode === "dli") glow = `0 0 14px ${colour}`;
    }

    return `
      <div style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px;align-items:center;">
          <span style="display:flex;align-items:center;gap:5px;opacity:.94;">
            <ha-icon icon="${icon}" style="width:16px;height:16px;color:${colour};filter:${mode === "dli" ? `drop-shadow(0 0 5px ${colour})` : "none"};"></ha-icon>
            ${label}
          </span>
          <span style="font-weight:900;color:${colour};">${display} • ${text}</span>
        </div>
        <div style="height:8px;background:rgba(255,255,255,.14);border-radius:999px;overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,.35);">
          <div style="height:100%;width:${pct}%;background:${colour};border-radius:999px;box-shadow:${glow};transition:width .45s ease;"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:10px;opacity:.55;margin-top:3px;">
          <span>Min ${isNaN(min) ? "—" : min}${unit}</span>
          <span>Max ${isNaN(max) ? "—" : max}${unit}</span>
        </div>
      </div>
    `;
  }

  renderAttention(entity) {
    const attrs = entity.attributes || {};
    const items = [];
    const labels = {
      moisture_status: "Soil moisture",
      temperature_status: "Air temperature",
      illuminance_status: "Light level",
      humidity_status: "Humidity",
      co2_status: "CO₂",
      soil_temperature_status: "Soil temperature",
      dli_status: "Daily light",
      vpd_status: "VPD"
    };

    for (const [key, label] of Object.entries(labels)) {
      const value = attrs[key];
      if (value && value !== "ok" && value !== "null") {
        items.push(`${label} ${String(value).toLowerCase()}`);
      }
    }

    if (!items.length) {
      return `
        <div style="background:rgba(46,204,113,.13);border:1px solid rgba(46,204,113,.38);border-radius:17px;padding:10px;font-size:13px;text-align:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.06);">
          <b style="color:#6ee16e;">✓ All monitored values are within target range</b>
        </div>
      `;
    }

    return `
      <div style="background:rgba(241,196,15,.13);border:1px solid rgba(241,196,15,.40);border-radius:17px;padding:10px;font-size:13px;text-align:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.06);">
        <div style="font-weight:900;color:#f1c40f;margin-bottom:${items.length === 1 ? "0" : "5px"};">
          ⚠ ${items.length === 1 ? "Attention Needed" : `${items.length} issues detected`}
        </div>
        ${items.length > 1 ? items.map((i) => `<div style="opacity:.9;">• ${i}</div>`).join("") : `<div style="opacity:.9;">${items[0]}</div>`}
      </div>
    `;
  }

  renderWatering(entity, r) {
    const isOutdoor = this.config.plant_location === "outdoor";
    const moistureStatus = String(entity.attributes?.moisture_status || "").toLowerCase();

    const rainToday = isOutdoor ? this.getNumber(r.rainToday) || 0 : 0;
    const rain24h = isOutdoor ? this.getNumber(r.rain24h) || 0 : 0;
    const rain48h = isOutdoor ? this.getNumber(r.rain48h) || 0 : 0;

    let icon = "mdi:watering-can";
    let colour = "#2ecc71";
    let title = "No action required";
    let detail = "Soil moisture is within range.";

    if (moistureStatus === "low") {
      if (isOutdoor && rain24h >= 4) {
        icon = "mdi:weather-pouring";
        colour = "#3498db";
        title = "Wait for forecast rain";
        detail = `${rain24h} mm forecast in the next 24 hours.`;
      } else if (isOutdoor && rain48h >= 8) {
        icon = "mdi:weather-rainy";
        colour = "#3498db";
        title = "Useful rain due soon";
        detail = `Delay watering if possible. ${rain48h} mm forecast within 48 hours.`;
      } else {
        icon = "mdi:watering-can";
        colour = "#f1c40f";
        title = "Water today";
        detail = isOutdoor ? "Soil moisture is low and no useful rain is expected." : "Soil moisture is low.";
      }
    } else if (moistureStatus === "high") {
      icon = "mdi:water-off";
      colour = "#3498db";
      title = "Avoid watering";
      detail = "Soil moisture is already high.";
    } else if (isOutdoor && rainToday >= 10) {
      icon = "mdi:weather-pouring";
      colour = "#3498db";
      title = "Rain has watered it";
      detail = `${rainToday} mm rain recorded today.`;
    }

    return `
      <div style="background:rgba(255,255,255,.085);border:1px solid rgba(255,255,255,.16);border-radius:17px;padding:10px 12px;box-shadow:inset 0 1px 0 rgba(255,255,255,.06);">
        <div style="display:flex;align-items:center;gap:11px;">
          <div style="width:34px;height:34px;min-width:34px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.10);">
            <ha-icon icon="${icon}" style="width:23px;height:23px;color:${colour};filter:drop-shadow(0 0 5px ${colour});"></ha-icon>
          </div>
          <div style="text-align:left;min-width:0;">
            <div style="font-size:10px;letter-spacing:.04em;opacity:.62;font-weight:800;">Watering Advice</div>
            <div style="font-size:14px;font-weight:950;color:${colour};line-height:1.15;margin-top:1px;">${title}</div>
            <div style="font-size:11px;opacity:.72;margin-top:2px;">${detail}</div>
          </div>
        </div>
        ${
          isOutdoor
            ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.09);display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
                ${this.renderForecastChip("☔", "Today", `${rainToday} mm`)}
                ${this.renderForecastChip("🌦", "24h", `${rain24h} mm`)}
                ${this.renderForecastChip("🌧", "48h", `${rain48h} mm`)}
              </div>`
            : ""
        }
      </div>
    `;
  }

  renderForecastChip(icon, label, value) {
    return `
      <div style="background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:5px 4px;text-align:center;font-size:10px;line-height:1.2;">
        <div style="opacity:.8;">${icon} ${label}</div>
        <div style="font-weight:900;opacity:.9;margin-top:1px;">${value}</div>
      </div>
    `;
  }

  renderChips(r) {
    const soil = this.getDisplay(r.soilTemperature, "°C");
    const vpd = this.getDisplay(r.vpd);
    const battery = this.getDisplay(r.battery, "%");
    const lqi = this.getDisplay(r.lqi);

    return `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center;">
        ${this.renderChip("mdi:thermometer-lines", soil, "Soil")}
        ${this.renderChip("mdi:weather-windy", vpd, "VPD")}
        ${this.renderChip("mdi:battery", battery, "Battery")}
        ${this.renderChip("mdi:signal", lqi, "LQI")}
      </div>
    `;
  }

  renderChip(icon, value, label) {
    return `
      <div style="background:linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.065));border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:9px 6px;box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 4px 12px rgba(0,0,0,.18);">
        <ha-icon icon="${icon}" style="width:17px;height:17px;opacity:.74;margin-bottom:3px;"></ha-icon>
        <div style="font-size:14px;font-weight:950;line-height:1.05;">${value}</div>
        <div style="font-size:11px;opacity:.66;margin-top:3px;">${label}</div>
      </div>
    `;
  }

  getCardSize() {
    return 8;
  }

  static getStubConfig() {
    return {
      entity: "plant.plant_monitor_premium_preview",
      plant_location: "outdoor"
    };
  }

  static getConfigForm() {
    return {
      schema: [
        { name: "entity", label: "Plant entity", selector: { entity: { domain: "plant" } } },
        { name: "sensor_prefix", label: "Plant Monitor sensor prefix", selector: { text: {} } },
        { name: "device_prefix", label: "Device battery/LQI prefix", selector: { text: {} } },
        { name: "air_temperature_entity", label: "Air temperature override", selector: { entity: {} } },
        {
          name: "plant_location",
          label: "Plant location",
          default: "outdoor",
          selector: {
            select: {
              mode: "dropdown",
              options: [
                { value: "outdoor", label: "Outdoor" },
                { value: "indoor", label: "Indoor" }
              ]
            }
          }
        }
      ]
    };
  }
}

if (!customElements.get("plant-monitor-premium-card")) {
  customElements.define("plant-monitor-premium-card", PlantMonitorPremiumCard);
}

window.customCards = window.customCards || [];

window.customCards.push({
  type: "plant-monitor-premium-card",
  name: "Plant Monitor Premium Card",
  preview: true,
  description: "Premium plant dashboard card for Home Assistant Plant Monitor"
});
