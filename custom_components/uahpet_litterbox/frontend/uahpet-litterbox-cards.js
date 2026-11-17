/* UAHPET Litterbox dashboard cards: status, settings, history. No build step, no dependencies. */
const DOMAIN = "uahpet_litterbox";
const VERSION = "0.1.0";

const I18N = {
  en: {
    clean: "Clean", level: "Level", empty: "Empty", confirm: "Tap again",
    auto_clean: "Auto clean", sleep_mode: "Sleep", child_lock: "Child lock", ionizer: "Ionizer", radar: "Radar",
    last_cat_weight: "Last cat", visits_today: "Visits today", last_visit_duration: "Last visit", cat_weight: "Live weight",
    bin: "Bin", offline: "Offline", not_found: "No UAHPET litter box found. Add the UAHPET Litterbox integration first.",
    settings: "Litter box settings", weight_history: "Cat weight per visit", visits_history: "Visits per day",
    excessive_clean_times: "Too many visits", no_weight: "No weight detected", stagnant: "Stagnant",
    not_in_place: "Not in place", e_weight: "Weighing error", bin_cover_open: "Bin cover open",
    bin_full: "Bin full", motor_fault: "Motor fault",
    ed_device_id: "Litter box", ed_title: "Title", ed_show_actions: "Show actions",
    ed_show_toggles: "Show toggles", ed_show_alerts: "Show alerts", ed_days: "Days to show",
    ed_show_advanced: "Show advanced settings",
    card_status: "UAHPET litter box", card_status_desc: "Status, alerts, actions and toggles of the UAHPET litter box.",
    card_settings: "UAHPET litter box settings", card_settings_desc: "Delays, litter type and other settings.",
    card_history: "UAHPET litter box history", card_history_desc: "Cat weight per visit and visits per day.",
  },
  es: {
    clean: "Limpiar", level: "Nivelar", empty: "Vaciar", confirm: "Pulsa otra vez",
    auto_clean: "Auto limpieza", sleep_mode: "Noche", child_lock: "Bloqueo", ionizer: "Ionizador", radar: "Radar",
    last_cat_weight: "Último gato", visits_today: "Visitas hoy", last_visit_duration: "Última visita", cat_weight: "Peso actual",
    bin: "Cubo", offline: "Sin conexión", not_found: "No hay ningún arenero UAHPET. Añade antes la integración UAHPET Litterbox.",
    settings: "Ajustes del arenero", weight_history: "Peso del gato por visita", visits_history: "Visitas por día",
    excessive_clean_times: "Demasiadas visitas", no_weight: "Sin peso detectado", stagnant: "Estancamiento",
    not_in_place: "Fuera de posición", e_weight: "Error de pesaje", bin_cover_open: "Tapa del cubo abierta",
    bin_full: "Cubo lleno", motor_fault: "Fallo del motor",
    ed_device_id: "Arenero", ed_title: "Título", ed_show_actions: "Mostrar acciones",
    ed_show_toggles: "Mostrar interruptores", ed_show_alerts: "Mostrar avisos", ed_days: "Días a mostrar",
    ed_show_advanced: "Mostrar ajustes avanzados",
    card_status: "Arenero UAHPET", card_status_desc: "Estado, avisos, acciones e interruptores del arenero UAHPET.",
    card_settings: "Ajustes del arenero UAHPET", card_settings_desc: "Retardos, tipo de arena y otros ajustes.",
    card_history: "Historial del arenero UAHPET", card_history_desc: "Peso del gato por visita y visitas por día.",
  },
};

const lang = (hass) => (hass?.locale?.language || hass?.language || navigator.language || "en").slice(0, 2);
const t = (hass, key) => (I18N[lang(hass)] || I18N.en)[key] ?? I18N.en[key] ?? key;

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

/** Device ids that have UAHPET Litterbox entities. */
function litterDevices(hass) {
  const ids = new Set();
  for (const e of Object.values(hass?.entities || {})) if (e.platform === DOMAIN && e.device_id) ids.add(e.device_id);
  return [...ids];
}

/** translation_key → entity_id for one device (first device if none given). */
function entityMap(hass, deviceId) {
  const dev = deviceId || litterDevices(hass)[0];
  const map = {};
  if (!dev) return { dev: null, map };
  for (const e of Object.values(hass.entities)) {
    if (e.platform === DOMAIN && e.device_id === dev && e.translation_key) map[e.translation_key] = e.entity_id;
  }
  return { dev, map };
}

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fire = (node, type, detail) => node.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));

/* ---------- editor ---------- */

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
const DEVICE_FIELD = { name: "device_id", selector: { device: { filter: { integration: DOMAIN } } } };
const TITLE_FIELD = { name: "title", selector: { text: {} } };

class StatusEditor extends UahpetEditor {
  static schema = [
    DEVICE_FIELD, TITLE_FIELD,
    { name: "show_alerts", selector: { boolean: {} } },
    { name: "show_actions", selector: { boolean: {} } },
    { name: "show_toggles", selector: { boolean: {} } },
  ];
}
class SettingsEditor extends UahpetEditor {
  static schema = [DEVICE_FIELD, TITLE_FIELD, { name: "show_advanced", selector: { boolean: {} } }];
}
class HistoryEditor extends UahpetEditor {
  static schema = [DEVICE_FIELD, { name: "days", selector: { number: { min: 1, max: 365, mode: "box" } } }];
}

/* ---------- status card ---------- */

class UahpetLitterboxCard extends HTMLElement {
  static getConfigElement() { return document.createElement("uahpet-litterbox-card-editor"); }
  static getStubConfig(hass) {
    return { device_id: litterDevices(hass)[0] || "", show_alerts: true, show_actions: true, show_toggles: true };
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._armed = null;
    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
  }

  setConfig(config) {
    this._config = { show_alerts: true, show_actions: true, show_toggles: true, ...config };
    this._key = null;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() { return 5; }
  getGridOptions() { return { columns: 12, min_columns: 6, rows: "auto" }; }

  _state(key) { const id = this._map[key]; return id ? this._hass.states[id] : undefined; }
  _fmt(key) { const s = this._state(key); return s ? this._hass.formatEntityState(s) : "—"; }

  _onClick(ev) {
    const el = ev.target.closest("[data-act]");
    if (!el || el.hasAttribute("disabled")) return;
    const { act, key } = el.dataset;
    const id = this._map[key];
    if (!id) return;
    if (act === "info") fire(this, "hass-more-info", { entityId: id });
    else if (act === "toggle") this._hass.callService("switch", "toggle", { entity_id: id });
    else if (act === "press") {
      if (key === "empty" && this._armed !== "empty") {
        this._armed = "empty";
        clearTimeout(this._armTimer);
        this._armTimer = setTimeout(() => { this._armed = null; this._key = null; this._render(); }, 4000);
      } else {
        this._armed = null;
        this._hass.callService("button", "press", { entity_id: id });
      }
      this._key = null;
      this._render();
    }
  }

  _render() {
    if (!this._hass || !this._config) return;
    const { map } = entityMap(this._hass, this._config.device_id);
    this._map = map;
    const watched = Object.values(map).map((id) => {
      const s = this._hass.states[id];
      return s ? `${id}=${s.state}@${s.last_updated}` : id;
    });
    const key = `${lang(this._hass)}|${this._armed}|${watched.join(",")}`;
    if (key === this._key) return;
    this._key = key;

    if (!map.work_status) {
      this.shadowRoot.innerHTML = `${STYLE}<ha-card><div class="empty">${esc(t(this._hass, "not_found"))}</div></ha-card>`;
      return;
    }

    const c = this._config;
    const statusObj = this._state("work_status");
    const offline = !statusObj || statusObj.state === "unavailable";
    const [statusIcon, tone] = offline ? ["mdi:lan-disconnect", "bad"] : STATUS[statusObj.state] || ["mdi:cat", "ok"];
    const title = c.title || this._deviceName() || t(this._hass, "card_status");
    const bin = this._state("bin_status");
    const binTone = !bin || bin.state === "bin_normal" ? "ok" : bin.state === "bin_full" ? "bad" : "warn";
    const dis = offline ? "disabled" : "";

    const alerts = c.show_alerts
      ? ALERTS.filter((k) => this._state(k)?.state === "on")
          .map((k) => `<button class="alert" data-act="info" data-key="${k}"><ha-icon icon="${ALERT_ICONS[k]}"></ha-icon>${esc(t(this._hass, k))}</button>`)
          .join("")
      : "";

    this.shadowRoot.innerHTML = `${STYLE}
      <ha-card>
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
        </div>` : ""}
      </ha-card>`;
  }

  _deviceName() {
    const dev = this._hass.devices?.[entityMap(this._hass, this._config.device_id).dev];
    return dev?.name_by_user || dev?.name;
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
  .alerts { display: flex; flex-wrap: wrap; gap: 6px; }
  .alert { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 16px; font-size: .9em;
    background: color-mix(in srgb, var(--bad) 18%, transparent); color: var(--bad); }
  .alert ha-icon { --mdc-icon-size: 18px; }
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px; }
  .stat { display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto auto; column-gap: 8px; align-items: center;
    text-align: left; padding: 8px; border-radius: 12px; background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .stat ha-icon { grid-row: span 2; color: var(--state-icon-color, var(--secondary-text-color)); }
  .val { font-weight: 500; font-variant-numeric: tabular-nums; }
  .lbl { font-size: .8em; color: var(--secondary-text-color); }
  .actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .action { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 4px; border-radius: 12px;
    background: color-mix(in srgb, var(--primary-color) 12%, transparent); color: var(--primary-color); font-weight: 500; }
  .action.armed { background: var(--bad); color: var(--text-primary-color, #fff); }
  .toggles { display: flex; flex-wrap: wrap; gap: 6px; }
  .toggle { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 18px;
    border: 1px solid var(--divider-color); color: var(--secondary-text-color); }
  .toggle ha-icon { --mdc-icon-size: 18px; }
  .toggle.on { background: color-mix(in srgb, var(--primary-color) 15%, transparent); border-color: transparent; color: var(--primary-color); }
  button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
</style>`;

/* ---------- wrapper cards: build a built-in card from the device's entities ---------- */

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
    const cards = [{
      type: "statistics-graph",
      title: t(this._hass, "weight_history"),
      entities: [map.last_cat_weight],
      stat_types: ["mean", "min", "max"],
      chart_type: "line",
      period: days > 60 ? "week" : "day",
      days_to_show: days,
    }];
    if (map.visits_today) cards.push({
      type: "statistics-graph",
      title: t(this._hass, "visits_history"),
      entities: [map.visits_today],
      stat_types: ["change"],
      chart_type: "bar",
      period: days > 60 ? "week" : "day",
      days_to_show: days,
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

window.customCards = window.customCards || [];
const tl = (k) => t(document.querySelector("home-assistant")?.hass, k);
for (const [type, name, desc] of [
  ["uahpet-litterbox-card", "card_status", "card_status_desc"],
  ["uahpet-litterbox-settings-card", "card_settings", "card_settings_desc"],
  ["uahpet-litterbox-history-card", "card_history", "card_history_desc"],
]) {
  if (!window.customCards.some((c) => c.type === type)) {
    window.customCards.push({ type, name: tl(name), description: tl(desc), preview: true, documentationURL: "https://github.com/cruzpazv/uahpet-litterbox" });
  }
}
console.info(`%c UAHPET-LITTERBOX %c ${VERSION} `, "background:#3a7d44;color:#fff", "background:#ddd;color:#000");
