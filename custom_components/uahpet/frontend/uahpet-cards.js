/* UAHPET dashboard cards: litter box (this integration) and air purifier (Tuya integration or this one).
   No build step, no dependencies. */
const DOMAIN = "uahpet";
const TUYA_PLATFORMS = ["tuya", "xtend_tuya"];
const PURIFIER_PLATFORMS = [DOMAIN, ...TUYA_PLATFORMS]; // DOMAIN: future local purifier profiles
const VERSION = "0.1.0";
const DOCS = "https://github.com/cruzpazv/uahpet-homeassistant";

const I18N = {
  en: {
    clean: "Clean", level: "Level", empty: "Empty", confirm: "Tap again",
    auto_clean: "Auto clean", sleep_mode: "Sleep", child_lock: "Child lock", ionizer: "Ionizer", radar: "Radar",
    last_cat_weight: "Last cat", visits_today: "Visits today", last_visit_duration: "Last visit", cat_weight: "Live weight",
    offline: "Offline", not_found: "No UAHPET litter box found. Add the UAHPET integration first.",
    settings: "Litter box settings", weight_history: "Cat weight per visit", visits_history: "Visits per day",
    excessive_clean_times: "Too many visits", no_weight: "No weight detected", stagnant: "Stagnant",
    not_in_place: "Not in place", e_weight: "Weighing error", bin_cover_open: "Bin cover open",
    bin_full: "Bin full", motor_fault: "Motor fault",
    on: "On", off: "Off", power: "Power", air_quality: "Air quality", filter: "Filter", filter_reset: "Reset filter",
    mode: "Mode", speed: "Speed", timer: "Timer",
    aq_great: "Great", aq_good: "Good", aq_medium: "Medium", aq_mild: "Mild", aq_severe: "Poor",
    mode_manual: "Manual", mode_auto: "Auto", mode_sleep: "Sleep", tilted: "Tipped over: stand it upright",
    speed_sleep: "Sleep", timer_cancel: "Off",
    purifier_not_found: "No Tuya air purifier found. Set it up in the Tuya integration first.",
    ed_device_id: "Device", ed_title: "Title", ed_show_actions: "Show actions",
    ed_show_toggles: "Show toggles", ed_show_alerts: "Show alerts", ed_days: "Days to show",
    ed_show_advanced: "Show advanced settings", ed_show_modes: "Show modes", ed_show_speed: "Show speed",
    ed_show_timer: "Show timer", ed_show_extras: "Show child lock and filter reset",
    card_status: "UAHPET litter box", card_status_desc: "Status, alerts, actions and toggles of the UAHPET litter box.",
    card_settings: "UAHPET litter box settings", card_settings_desc: "Delays, litter type and other settings.",
    card_history: "UAHPET litter box history", card_history_desc: "Cat weight per visit and visits per day.",
    card_purifier: "UAHPET air purifier", card_purifier_desc: "Air quality, filter, mode, speed and timer (Tuya integration).",
  },
  es: {
    clean: "Limpiar", level: "Nivelar", empty: "Vaciar", confirm: "Pulsa otra vez",
    auto_clean: "Auto limpieza", sleep_mode: "Noche", child_lock: "Bloqueo", ionizer: "Ionizador", radar: "Radar",
    last_cat_weight: "Último gato", visits_today: "Visitas hoy", last_visit_duration: "Última visita", cat_weight: "Peso actual",
    offline: "Sin conexión", not_found: "No hay ningún arenero UAHPET. Añade antes la integración UAHPET.",
    settings: "Ajustes del arenero", weight_history: "Peso del gato por visita", visits_history: "Visitas por día",
    excessive_clean_times: "Demasiadas visitas", no_weight: "Sin peso detectado", stagnant: "Estancamiento",
    not_in_place: "Fuera de posición", e_weight: "Error de pesaje", bin_cover_open: "Tapa del cubo abierta",
    bin_full: "Cubo lleno", motor_fault: "Fallo del motor",
    on: "Encendido", off: "Apagado", power: "Encender", air_quality: "Calidad del aire", filter: "Filtro",
    filter_reset: "Reiniciar filtro", mode: "Modo", speed: "Velocidad", timer: "Temporizador",
    aq_great: "Excelente", aq_good: "Buena", aq_medium: "Regular", aq_mild: "Leve", aq_severe: "Mala",
    mode_manual: "Manual", mode_auto: "Auto", mode_sleep: "Noche", tilted: "Volcado: ponlo de pie",
    speed_sleep: "Noche", timer_cancel: "No",
    purifier_not_found: "No hay ningún purificador Tuya. Añádelo antes a la integración de Tuya.",
    ed_device_id: "Dispositivo", ed_title: "Título", ed_show_actions: "Mostrar acciones",
    ed_show_toggles: "Mostrar interruptores", ed_show_alerts: "Mostrar avisos", ed_days: "Días a mostrar",
    ed_show_advanced: "Mostrar ajustes avanzados", ed_show_modes: "Mostrar modos", ed_show_speed: "Mostrar velocidad",
    ed_show_timer: "Mostrar temporizador", ed_show_extras: "Mostrar bloqueo y reinicio del filtro",
    card_status: "Arenero UAHPET", card_status_desc: "Estado, avisos, acciones e interruptores del arenero UAHPET.",
    card_settings: "Ajustes del arenero UAHPET", card_settings_desc: "Retardos, tipo de arena y otros ajustes.",
    card_history: "Historial del arenero UAHPET", card_history_desc: "Peso del gato por visita y visitas por día.",
    card_purifier: "Purificador UAHPET", card_purifier_desc: "Calidad del aire, filtro, modo, velocidad y temporizador (integración Tuya).",
  },
};

const lang = (hass) => (hass?.locale?.language || hass?.language || navigator.language || "en").slice(0, 2);
const t = (hass, key) => (I18N[lang(hass)] || I18N.en)[key] ?? I18N.en[key] ?? key;
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fire = (node, type, detail) => node.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
const isOff = (s) => !s || s.state === "unavailable";

/* ---------- entity lookup ---------- */

/** UAHPET litter boxes: devices of this integration with a work_status sensor. */
function litterDevices(hass) {
  const ids = new Set();
  for (const e of Object.values(hass?.entities || {})) {
    if (e.platform === DOMAIN && e.device_id && e.translation_key === "work_status") ids.add(e.device_id);
  }
  return [...ids];
}

/** translation_key → entity_id for one litter box (first one if none given). */
function entityMap(hass, deviceId) {
  const dev = deviceId || litterDevices(hass)[0];
  const map = {};
  if (!dev) return { dev: null, map };
  for (const e of Object.values(hass.entities)) {
    if (e.platform === DOMAIN && e.device_id === dev && e.translation_key) map[e.translation_key] = e.entity_id;
  }
  return { dev, map };
}

function purifierEntitiesByDevice(hass) {
  const devs = {};
  for (const e of Object.values(hass?.entities || {})) {
    if (PURIFIER_PLATFORMS.includes(e.platform) && e.device_id) (devs[e.device_id] ||= []).push(e);
  }
  return devs;
}

/** Devices with a fan plus an air quality or filter sensor = air purifiers. */
function purifierDevices(hass) {
  return Object.entries(purifierEntitiesByDevice(hass))
    .filter(([, es]) => es.some((e) => e.entity_id.startsWith("fan.")) &&
      es.some((e) => ["air_quality", "filter_utilization"].includes(e.translation_key)))
    .map(([dev]) => dev);
}

/** Purifier entities: `fan` plus Tuya translation keys (air_quality, filter_utilization, child_lock, ...). */
function purifierMap(hass, deviceId) {
  const dev = deviceId || purifierDevices(hass)[0];
  const map = {};
  for (const e of (dev && purifierEntitiesByDevice(hass)[dev]) || []) {
    if (e.entity_id.startsWith("fan.")) map.fan = e.entity_id;
    else if (e.translation_key) map[e.translation_key] = e.entity_id;
  }
  return { dev: dev || null, map };
}

/* ---------- editors ---------- */

class UahpetEditor extends HTMLElement {
  static schema = [];
  setConfig(config) { this._config = config; this._render(); }
  set hass(hass) { this._hass = hass; this._render(); }
  _render() {
    if (!this._hass || !this._config) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => t(this._hass, `ed_${s.name}`);
      this._form.addEventListener("value-changed", (ev) => {
        this._config = ev.detail.value;
        fire(this, "config-changed", { config: this._config });
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.data = this._config;
    this._form.schema = this.constructor.schema;
  }
}
const bool = (name) => ({ name, selector: { boolean: {} } });
const DEVICE_FIELD = { name: "device_id", selector: { device: { filter: { integration: DOMAIN } } } };
const PURIFIER_DEVICE_FIELD = { name: "device_id", selector: { device: { filter: PURIFIER_PLATFORMS.map((integration) => ({ integration })) } } };
const TITLE_FIELD = { name: "title", selector: { text: {} } };

class StatusEditor extends UahpetEditor {
  static schema = [DEVICE_FIELD, TITLE_FIELD, bool("show_alerts"), bool("show_actions"), bool("show_toggles")];
}
class SettingsEditor extends UahpetEditor {
  static schema = [DEVICE_FIELD, TITLE_FIELD, bool("show_advanced")];
}
class HistoryEditor extends UahpetEditor {
  static schema = [DEVICE_FIELD, { name: "days", selector: { number: { min: 1, max: 365, mode: "box" } } }];
}
class PurifierEditor extends UahpetEditor {
  static schema = [PURIFIER_DEVICE_FIELD, TITLE_FIELD, bool("show_modes"), bool("show_speed"), bool("show_timer"), bool("show_extras")];
}

/* ---------- base for the hand-drawn cards ---------- */

class UahpetCard extends HTMLElement {
  static defaults = {};

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._armed = null;
    this.shadowRoot.addEventListener("click", (ev) => {
      const el = ev.target.closest("[data-act]");
      if (!el || el.hasAttribute("disabled")) return;
      const { act, key, val } = el.dataset;
      if (act === "info") {
        if (this._map[key]) fire(this, "hass-more-info", { entityId: this._map[key] });
        return;
      }
      this.handle(act, key, val);
      this._key = null;
      this._render();
    });
  }

  setConfig(config) {
    this._config = { ...this.constructor.defaults, ...config };
    this._key = null;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() { return 5; }
  getGridOptions() { return { columns: 12, min_columns: 6, rows: "auto" }; }

  _state(key) { const id = this._map?.[key]; return id ? this._hass.states[id] : undefined; }
  _fmt(key) { const s = this._state(key); return s ? this._hass.formatEntityState(s) : "—"; }
  _call(domain, service, key, data = {}) {
    const id = this._map[key];
    if (id) this._hass.callService(domain, service, { entity_id: id, ...data });
  }

  /** Two-tap confirmation; returns true on the second tap. */
  _confirm(key) {
    clearTimeout(this._armTimer);
    if (this._armed === key) { this._armed = null; return true; }
    this._armed = key;
    this._armTimer = setTimeout(() => { this._armed = null; this._key = null; this._render(); }, 4000);
    return false;
  }

  _deviceName(dev) {
    const d = this._hass.devices?.[dev];
    return d?.name_by_user || d?.name;
  }

  _render() {
    if (!this._hass || !this._config) return;
    const { dev, map } = this.lookup();
    this._map = map;
    this._dev = dev;
    const watched = Object.values(map).map((id) => {
      const s = this._hass.states[id];
      return s ? `${id}=${s.state}@${s.last_updated}` : id;
    });
    const key = `${lang(this._hass)}|${this._armed}|${watched.join(",")}`;
    if (key === this._key) return;
    this._key = key;
    this.shadowRoot.innerHTML = `${STYLE}<ha-card>${this.body()}</ha-card>`;
  }
}

/* ---------- litter box status card ---------- */

const ALERTS = ["motor_fault", "bin_full", "bin_cover_open", "not_in_place", "e_weight", "no_weight", "stagnant", "excessive_clean_times"];
const ALERT_ICONS = {
  motor_fault: "mdi:engine-off-outline", bin_full: "mdi:delete-alert", bin_cover_open: "mdi:delete-outline",
  not_in_place: "mdi:alert-rhombus-outline", e_weight: "mdi:scale-unbalanced", no_weight: "mdi:scale-balance",
  stagnant: "mdi:timer-alert-outline", excessive_clean_times: "mdi:counter",
};
const STATS = [
  ["last_cat_weight", "mdi:cat"], ["visits_today", "mdi:paw"],
  ["last_visit_duration", "mdi:timer-outline"], ["cat_weight", "mdi:scale"],
];
const TOGGLES = [
  ["auto_clean", "mdi:robot-vacuum"], ["sleep_mode", "mdi:power-sleep"], ["child_lock", "mdi:lock-outline"],
  ["ionizer", "mdi:creation-outline"], ["radar", "mdi:radar"],
];
const ACTIONS = [["clean", "mdi:broom"], ["level", "mdi:waves"], ["empty", "mdi:delete-empty"]];
const STATUS = {
  standby: ["mdi:cat", "ok"], cleaning: ["mdi:rotate-3d-variant", "busy"], clearing: ["mdi:delete-empty", "busy"],
  leveling: ["mdi:waves", "busy"], clumping: ["mdi:timer-sand", "warn"], radar: ["mdi:radar", "warn"],
  e_weight: ["mdi:scale-unbalanced", "bad"],
};

class UahpetLitterboxCard extends UahpetCard {
  static defaults = { show_alerts: true, show_actions: true, show_toggles: true };
  static getConfigElement() { return document.createElement("uahpet-litterbox-card-editor"); }
  static getStubConfig(hass) { return { device_id: litterDevices(hass)[0] || "", ...this.defaults }; }

  lookup() { return entityMap(this._hass, this._config.device_id); }

  handle(act, key) {
    if (act === "toggle") this._call("switch", "toggle", key);
    else if (act === "press" && (key !== "empty" || this._confirm(key))) this._call("button", "press", key);
  }

  body() {
    const map = this._map;
    if (!map.work_status) return `<div class="empty">${esc(t(this._hass, "not_found"))}</div>`;
    const c = this._config;
    const statusObj = this._state("work_status");
    const offline = isOff(statusObj);
    const [statusIcon, tone] = offline ? ["mdi:lan-disconnect", "bad"] : STATUS[statusObj.state] || ["mdi:cat", "ok"];
    const title = c.title || this._deviceName(this._dev) || t(this._hass, "card_status");
    const bin = this._state("bin_status");
    const binTone = !bin || bin.state === "bin_normal" ? "ok" : bin.state === "bin_full" ? "bad" : "warn";
    const dis = offline ? "disabled" : "";
    const alerts = c.show_alerts
      ? ALERTS.filter((k) => this._state(k)?.state === "on")
          .map((k) => `<button class="alert" data-act="info" data-key="${k}"><ha-icon icon="${ALERT_ICONS[k]}"></ha-icon>${esc(t(this._hass, k))}</button>`)
          .join("")
      : "";

    return `
      <div class="head">
        <button class="badge ${tone}" data-act="info" data-key="work_status" aria-label="${esc(this._fmt("work_status"))}">
          <ha-icon class="${tone === "busy" ? "spin" : ""}" icon="${statusIcon}"></ha-icon>
        </button>
        <div class="titles">
          <div class="title">${esc(title)}</div>
          <div class="sub">${esc(offline ? t(this._hass, "offline") : this._fmt("work_status"))}</div>
        </div>
        ${bin ? `<button class="chip ${binTone}" data-act="info" data-key="bin_status"><ha-icon icon="mdi:delete-outline"></ha-icon>${esc(this._fmt("bin_status"))}</button>` : ""}
      </div>
      ${alerts ? `<div class="alerts">${alerts}</div>` : ""}
      <div class="stats">
        ${STATS.filter(([k]) => map[k]).map(([k, icon]) => `
          <button class="stat" data-act="info" data-key="${k}">
            <ha-icon icon="${icon}"></ha-icon>
            <span class="val">${esc(this._fmt(k))}</span>
            <span class="lbl">${esc(t(this._hass, k))}</span>
          </button>`).join("")}
      </div>
      ${c.show_actions ? `<div class="actions">
        ${ACTIONS.filter(([k]) => map[k]).map(([k, icon]) => {
          const armed = this._armed === k;
          return `<button class="action ${armed ? "armed" : ""}" data-act="press" data-key="${k}" ${dis}>
            <ha-icon icon="${icon}"></ha-icon>${esc(t(this._hass, armed ? "confirm" : k))}</button>`;
        }).join("")}
      </div>` : ""}
      ${c.show_toggles ? `<div class="toggles">
        ${TOGGLES.filter(([k]) => map[k]).map(([k, icon]) => {
          const on = this._state(k)?.state === "on";
          return `<button class="toggle ${on ? "on" : ""}" data-act="toggle" data-key="${k}" aria-pressed="${on}" ${dis}>
            <ha-icon icon="${icon}"></ha-icon>${esc(t(this._hass, k))}</button>`;
        }).join("")}
      </div>` : ""}`;
  }
}

/* ---------- air purifier card (entities from the Tuya integration) ---------- */

const AQ_TONE = { great: "ok", good: "ok", medium: "warn", mild: "warn", severe: "bad" };
const MODE_ICONS = { manual: "mdi:hand-back-right-outline", auto: "mdi:fan-auto", sleep: "mdi:power-sleep" };
// "tipping" is reported as a mode when the purifier tilts over 45°: an alert, not a choice.
const TILT_MODE = "tipping";

class UahpetPurifierCard extends UahpetCard {
  static defaults = { show_modes: true, show_speed: true, show_timer: true, show_extras: true };
  static getConfigElement() { return document.createElement("uahpet-purifier-card-editor"); }
  static getStubConfig(hass) { return { device_id: purifierDevices(hass)[0] || "", ...this.defaults }; }

  lookup() { return purifierMap(this._hass, this._config.device_id); }

  handle(act, key, val) {
    if (act === "power") this._call("fan", "toggle", "fan");
    else if (act === "mode") this._call("fan", "set_preset_mode", "fan", { preset_mode: val });
    else if (act === "speed") this._call("fan", "set_percentage", "fan", { percentage: Number(val) });
    else if (act === "timer") this._call("select", "select_option", "countdown", { option: val });
    else if (act === "toggle") this._call("switch", "toggle", key);
    else if (act === "reset" && this._confirm(key)) this._call("switch", "turn_on", key);
  }

  _speeds(fan) {
    const step = Number(fan.attributes.percentage_step);
    const n = step > 0 ? Math.round(100 / step) : 0;
    // Tuya: percentage = (index + 1) * 100 // n; this purifier has sleep, P1, P2, P3
    return Array.from({ length: n }, (_, i) => ({
      pct: Math.floor(((i + 1) * 100) / n),
      label: n === 4 ? (i === 0 ? t(this._hass, "speed_sleep") : String(i)) : String(i + 1),
    }));
  }

  body() {
    const map = this._map;
    if (!map.fan) return `<div class="empty">${esc(t(this._hass, "purifier_not_found"))}</div>`;
    const c = this._config;
    const fan = this._state("fan");
    const offline = isOff(fan);
    const on = fan?.state === "on";
    const dis = offline ? "disabled" : "";
    const title = c.title || this._deviceName(this._dev) || t(this._hass, "card_purifier");
    const pct = Number(fan?.attributes.percentage) || 0;
    const mode = fan?.attributes.preset_mode;
    const tilted = mode === TILT_MODE;
    const modes = (fan?.attributes.preset_modes || []).filter((m) => m !== TILT_MODE);
    const speeds = fan ? this._speeds(fan) : [];
    const speedIdx = speeds.length && pct ? Math.max(0, Math.ceil((pct * speeds.length) / 100) - 1) : -1;
    const sub = offline ? t(this._hass, "offline")
      : on ? [t(this._hass, "on"), mode && !tilted && t(this._hass, `mode_${mode}`), speeds[speedIdx]?.label].filter(Boolean).join(" · ")
      : t(this._hass, "off");

    const aq = this._state("air_quality");
    const aqTone = AQ_TONE[aq?.state] || "ok";
    const filter = this._state("filter_utilization");
    const filterPct = Math.max(0, Math.min(100, Number(filter?.state) || 0));
    const filterTone = filterPct < 15 ? "bad" : filterPct < 30 ? "warn" : "ok";
    const timer = this._state("countdown");
    const lock = this._state("child_lock");
    const reset = this._map.filter_cartridge_reset;
    const seg = (act, items, active) => `<div class="seg">${items.map(([val, label, icon]) => `
      <button class="${val === active ? "on" : ""}" data-act="${act}" data-val="${esc(val)}" aria-pressed="${val === active}" ${dis}>
        ${icon ? `<ha-icon icon="${icon}"></ha-icon>` : ""}<span>${esc(label)}</span></button>`).join("")}</div>`;

    return `
      <div class="head">
        <button class="badge ${on ? "busy" : offline ? "bad" : "idle"}" data-act="info" data-key="fan">
          <ha-icon class="${on ? "spin" : ""}" style="animation-duration:${(3.2 - 2.4 * (pct / 100)).toFixed(2)}s"
            icon="${offline ? "mdi:lan-disconnect" : "mdi:fan"}"></ha-icon>
        </button>
        <div class="titles">
          <div class="title">${esc(title)}</div>
          <div class="sub">${esc(sub)}</div>
        </div>
        <button class="power ${on ? "on" : ""}" data-act="power" aria-label="${esc(t(this._hass, "power"))}" aria-pressed="${on}" ${dis}>
          <ha-icon icon="mdi:power"></ha-icon></button>
      </div>
      ${tilted ? `<div class="alerts"><button class="alert" data-act="info" data-key="fan"><ha-icon icon="mdi:alert-rotate"></ha-icon>${esc(t(this._hass, "tilted"))}</button></div>` : ""}
      <div class="stats">
        ${aq ? `<button class="stat aq ${aqTone}" data-act="info" data-key="air_quality">
          <ha-icon icon="mdi:air-filter"></ha-icon>
          <span class="val">${esc(isOff(aq) ? "—" : t(this._hass, `aq_${aq.state}`))}</span>
          <span class="lbl">${esc(t(this._hass, "air_quality"))}</span></button>` : ""}
        ${filter ? `<button class="stat" data-act="info" data-key="filter_utilization">
          <ha-icon icon="mdi:air-filter"></ha-icon>
          <span class="val">${isOff(filter) ? "—" : `${filterPct} %`}</span>
          <span class="lbl">${esc(t(this._hass, "filter"))}</span>
          <span class="bar ${filterTone}"><span style="width:${filterPct}%"></span></span></button>` : ""}
      </div>
      ${c.show_modes && modes.length ? `<div class="group"><div class="glabel">${esc(t(this._hass, "mode"))}</div>
        ${seg("mode", modes.map((m) => [m, t(this._hass, `mode_${m}`), MODE_ICONS[m]]), on ? mode : null)}</div>` : ""}
      ${c.show_speed && speeds.length ? `<div class="group"><div class="glabel">${esc(t(this._hass, "speed"))}</div>
        ${seg("speed", speeds.map((s) => [String(s.pct), s.label]), on && speedIdx >= 0 ? String(speeds[speedIdx].pct) : null)}</div>` : ""}
      ${c.show_timer && timer?.attributes.options?.length ? `<div class="group"><div class="glabel">${esc(t(this._hass, "timer"))}</div>
        ${seg("timer", timer.attributes.options.map((o) => [o, o === "cancel" ? t(this._hass, "timer_cancel") : o]), timer.state)}</div>` : ""}
      ${c.show_extras && (lock || reset) ? `<div class="toggles">
        ${lock ? `<button class="toggle ${lock.state === "on" ? "on" : ""}" data-act="toggle" data-key="child_lock" aria-pressed="${lock.state === "on"}" ${dis}>
          <ha-icon icon="mdi:lock-outline"></ha-icon>${esc(t(this._hass, "child_lock"))}</button>` : ""}
        ${reset ? `<button class="toggle ${this._armed === "filter_cartridge_reset" ? "armed" : ""}" data-act="reset" data-key="filter_cartridge_reset" ${dis}>
          <ha-icon icon="mdi:restore"></ha-icon>${esc(t(this._hass, this._armed === "filter_cartridge_reset" ? "confirm" : "filter_reset"))}</button>` : ""}
      </div>` : ""}`;
  }
}

const STYLE = `<style>
  :host { --ok: var(--success-color, #43a047); --warn: var(--warning-color, #ffa000); --bad: var(--error-color, #db4437); --busy: var(--primary-color, #03a9f4); }
  ha-card { padding: 16px; display: flex; flex-direction: column; gap: 14px; }
  button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; padding: 0; }
  button[disabled] { opacity: .4; cursor: default; }
  .empty { color: var(--secondary-text-color); }
  .head { display: flex; align-items: center; gap: 12px; }
  .badge { width: 48px; height: 48px; border-radius: 50%; display: grid; place-items: center; flex: none; }
  .badge ha-icon { --mdc-icon-size: 28px; }
  .badge.ok { background: color-mix(in srgb, var(--ok) 18%, transparent); color: var(--ok); }
  .badge.busy { background: color-mix(in srgb, var(--busy) 18%, transparent); color: var(--busy); }
  .badge.warn { background: color-mix(in srgb, var(--warn) 18%, transparent); color: var(--warn); }
  .badge.bad { background: color-mix(in srgb, var(--bad) 18%, transparent); color: var(--bad); }
  .badge.idle { background: var(--secondary-background-color, rgba(127,127,127,.12)); color: var(--secondary-text-color); }
  .spin { animation: spin 2.4s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .spin { animation: none; } }
  .titles { flex: 1; min-width: 0; }
  .title { font-size: 1.15em; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { color: var(--secondary-text-color); }
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 16px; font-size: .9em; flex: none; }
  .chip ha-icon { --mdc-icon-size: 18px; }
  .chip.ok { background: color-mix(in srgb, var(--ok) 15%, transparent); }
  .chip.warn { background: color-mix(in srgb, var(--warn) 22%, transparent); }
  .chip.bad { background: color-mix(in srgb, var(--bad) 22%, transparent); }
  .power { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; flex: none;
    border: 1px solid var(--divider-color); color: var(--secondary-text-color); }
  .power.on { background: var(--primary-color); border-color: transparent; color: var(--text-primary-color, #fff); }
  .alerts { display: flex; flex-wrap: wrap; gap: 6px; }
  .alert { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 16px; font-size: .9em;
    background: color-mix(in srgb, var(--bad) 18%, transparent); color: var(--bad); }
  .alert ha-icon { --mdc-icon-size: 18px; }
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px; }
  .stat { display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto auto; column-gap: 8px; align-items: center;
    text-align: left; padding: 8px; border-radius: 12px; background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .stat ha-icon { grid-row: span 2; color: var(--state-icon-color, var(--secondary-text-color)); }
  .stat.aq.ok ha-icon { color: var(--ok); }
  .stat.aq.warn ha-icon { color: var(--warn); }
  .stat.aq.bad ha-icon { color: var(--bad); }
  .val { font-weight: 500; font-variant-numeric: tabular-nums; }
  .lbl { font-size: .8em; color: var(--secondary-text-color); }
  .bar { grid-column: 1 / -1; height: 4px; margin-top: 6px; border-radius: 2px; background: var(--divider-color); overflow: hidden; }
  .bar span { display: block; height: 100%; border-radius: 2px; }
  .bar.ok span { background: var(--ok); }
  .bar.warn span { background: var(--warn); }
  .bar.bad span { background: var(--bad); }
  .actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .action { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 4px; border-radius: 12px;
    background: color-mix(in srgb, var(--primary-color) 12%, transparent); color: var(--primary-color); font-weight: 500; }
  .action.armed, .toggle.armed { background: var(--bad); border-color: transparent; color: var(--text-primary-color, #fff); }
  .group { display: flex; flex-direction: column; gap: 6px; }
  .glabel { font-size: .8em; color: var(--secondary-text-color); }
  .seg { display: flex; border: 1px solid var(--divider-color); border-radius: 12px; overflow: hidden; }
  .seg button { flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; gap: 4px; padding: 8px 4px;
    color: var(--secondary-text-color); }
  .seg button + button { border-left: 1px solid var(--divider-color); }
  .seg button ha-icon { --mdc-icon-size: 18px; flex: none; }
  .seg button span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .seg button.on { background: color-mix(in srgb, var(--primary-color) 15%, transparent); color: var(--primary-color); font-weight: 500; }
  .toggles { display: flex; flex-wrap: wrap; gap: 6px; }
  .toggle { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 18px;
    border: 1px solid var(--divider-color); color: var(--secondary-text-color); }
  .toggle ha-icon { --mdc-icon-size: 18px; }
  .toggle.on { background: color-mix(in srgb, var(--primary-color) 15%, transparent); border-color: transparent; color: var(--primary-color); }
  button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
</style>`;

/* ---------- wrapper cards: build a built-in card from the litter box entities ---------- */

class UahpetWrapperCard extends HTMLElement {
  setConfig(config) { this._config = config; this._innerKey = null; this._update(); }
  set hass(hass) { this._hass = hass; this._update(); }
  getCardSize() { return this._card?.getCardSize?.() ?? 4; }

  async _update() {
    if (!this._hass || !this._config) return;
    const { map } = entityMap(this._hass, this._config.device_id);
    const inner = this.buildConfig(map);
    const key = JSON.stringify(inner);
    if (key !== this._innerKey) {
      this._innerKey = key;
      const helpers = await window.loadCardHelpers();
      const card = await helpers.createCardElement(inner);
      if (key !== this._innerKey) return; // superseded meanwhile
      this.replaceChildren(card);
      this._card = card;
    }
    if (this._card) this._card.hass = this._hass;
  }

  notFound() { return { type: "markdown", content: t(this._hass, "not_found") }; }
}

class UahpetLitterboxSettingsCard extends UahpetWrapperCard {
  static getConfigElement() { return document.createElement("uahpet-litterbox-settings-card-editor"); }
  static getStubConfig(hass) { return { device_id: litterDevices(hass)[0] || "" }; }

  buildConfig(map) {
    if (!map.clean_delay) return this.notFound();
    const keys = ["auto_clean", "clean_delay", "bury_delay", "litter_type", "excessive_visits", "child_lock", "radar", "weight_unit"];
    if (this._config.show_advanced) keys.push("work_log", "log_code", "motor_forward", "motor_reverse", "developer_mode");
    return {
      type: "entities",
      title: this._config.title || t(this._hass, "settings"),
      state_color: true,
      entities: keys.filter((k) => map[k]).map((k) => ({ entity: map[k] })),
    };
  }
}

class UahpetLitterboxHistoryCard extends UahpetWrapperCard {
  static getConfigElement() { return document.createElement("uahpet-litterbox-history-card-editor"); }
  static getStubConfig(hass) { return { device_id: litterDevices(hass)[0] || "", days: 30 }; }

  buildConfig(map) {
    if (!map.last_cat_weight) return this.notFound();
    const days = Number(this._config.days) || 30;
    const period = days > 60 ? "week" : "day";
    const cards = [{
      type: "statistics-graph", title: t(this._hass, "weight_history"), entities: [map.last_cat_weight],
      stat_types: ["mean", "min", "max"], chart_type: "line", period, days_to_show: days,
    }];
    if (map.visits_today) cards.push({
      type: "statistics-graph", title: t(this._hass, "visits_history"), entities: [map.visits_today],
      stat_types: ["change"], chart_type: "bar", period, days_to_show: days,
    });
    return { type: "vertical-stack", cards };
  }
}

/* ---------- registration ---------- */

const define = (name, cls) => { if (!customElements.get(name)) customElements.define(name, cls); };
define("uahpet-litterbox-card", UahpetLitterboxCard);
define("uahpet-litterbox-card-editor", StatusEditor);
define("uahpet-litterbox-settings-card", UahpetLitterboxSettingsCard);
define("uahpet-litterbox-settings-card-editor", SettingsEditor);
define("uahpet-litterbox-history-card", UahpetLitterboxHistoryCard);
define("uahpet-litterbox-history-card-editor", HistoryEditor);
define("uahpet-purifier-card", UahpetPurifierCard);
define("uahpet-purifier-card-editor", PurifierEditor);

window.customCards = window.customCards || [];
const tl = (k) => t(document.querySelector("home-assistant")?.hass, k);
for (const [type, name, desc] of [
  ["uahpet-litterbox-card", "card_status", "card_status_desc"],
  ["uahpet-litterbox-settings-card", "card_settings", "card_settings_desc"],
  ["uahpet-litterbox-history-card", "card_history", "card_history_desc"],
  ["uahpet-purifier-card", "card_purifier", "card_purifier_desc"],
]) {
  if (!window.customCards.some((c) => c.type === type)) {
    window.customCards.push({ type, name: tl(name), description: tl(desc), preview: true, documentationURL: DOCS });
  }
}
console.info(`%c UAHPET %c ${VERSION} `, "background:#3a7d44;color:#fff", "background:#ddd;color:#000");
