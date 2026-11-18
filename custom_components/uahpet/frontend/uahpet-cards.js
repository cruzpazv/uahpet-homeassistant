/* UAHPET dashboard cards. Litter box: main, timeline, stats, settings, maintenance, mini.
   Air purifier: one card on top of the Tuya integration. No build step, no dependencies. */
const DOMAIN = "uahpet";
const TUYA_PLATFORMS = ["tuya", "xtend_tuya"];
const PURIFIER_PLATFORMS = [DOMAIN, ...TUYA_PLATFORMS]; // DOMAIN: future local purifier profiles
const VERSION = "0.2.1";
const DOCS = "https://github.com/cruzpazv/uahpet-homeassistant";

/* ---------- texts ---------- */

const I18N = {
  en: {
    clean: "Clean", level: "Level", empty: "Empty", cancel: "Cancel", confirm_btn: "Continue",
    auto_clean: "Auto clean", sleep_mode: "Do not disturb", child_lock: "Child lock", ionizer: "Ionizer", radar: "Radar",
    last_cat_weight: "Last cat", visits_today: "Visits today", cleanings_today: "Cleanings today", last_visit_duration: "Last visit",
    offline: "Offline", not_found: "No UAHPET litter box found. Add the UAHPET integration first.",
    st_standby: "Ready", st_cleaning: "Cleaning the litter, please wait", st_clearing: "Emptying the litter, please wait",
    st_leveling: "Levelling the litter, please wait", st_radar: "Cat nearby, operation paused",
    st_clumping: "Waiting for the litter to clump", st_e_weight: "Abnormal weighing data detected",
    auto_in: "Auto clean in {t}", auto_soon: "Auto clean any moment now", auto_off: "Auto clean is off",
    dnd_on: "Do not disturb: no automatic cleaning", cat_inside: "Cat using the litter box",
    dlg_empty_t: "Empty the litter?", dlg_empty: "Emptying pours all the litter into the waste bin. Continue?",
    dlg_level_t: "Confirm safety before levelling", dlg_level: "Make sure no cat is inside or next to the litter box.",
    bin_bin_normal: "Bin OK", bin_bin_full: "Bin full", bin_bin_uninstalled: "No bin", bin_bin_cover_open: "Cover open",
    lt_larger_particle: "Coarse litter", lt_finer_particle: "Fine litter", alerts_n: "{n} alerts", alert_1: "1 alert",
    // timeline
    timeline: "Today", last24: "Last 24 h", visits_n: "{n} visits", cleanings_n: "{n} cleanings", avg: "avg {t}",
    visit_cat: "{cat} used the litter box, stayed {d}", visit_anon: "Visit, stayed {d}", unidentified: "Unidentified cat",
    ev_cleaning: "Cleaning", ev_clearing: "Litter emptied", ev_leveling: "Litter levelled", ev_bin: "Waste bin emptied",
    no_events: "Nothing yet today.", loading: "Loading…", yesterday: "Yesterday", today_h: "Today",
    // stats
    stats: "Statistics", m_visits: "Visits", m_cleanings: "Cleanings", m_duration: "Duration", m_weight: "Weight",
    per_day: "{v}/day", total: "total {v}", average: "average {v}", no_data: "No data yet.", days_n: "{n} days",
    // settings
    settings: "Litter box settings", sec_clean: "Cleaning", sec_litter: "Litter", sec_comfort: "Behaviour",
    sec_alerts: "Alerts", sec_device: "Device", sec_advanced: "Advanced",
    clean_delay: "Clean delay", bury_delay: "Bury delay", excessive_visits: "Too many visits alert", weight_unit: "Unit on the device",
    h_auto_clean: "Cleans by itself after the cat leaves, once the delay has passed.",
    h_clean_delay: "Waiting time after a visit before the automatic clean.",
    h_bury_delay: "Waiting time before covering the waste.",
    h_litter: "Pick the grain size of your litter so cleaning and levelling adapt to it.",
    h_dnd: "While on, the litter box does not clean automatically.",
    h_radar: "If a cat comes close during operation, the box pauses for safety and resumes 10 s after it leaves.",
    h_child_lock: "Locks the buttons on the litter box.", h_ionizer: "Negative ions to reduce odours.",
    h_excessive: "Alert when a cat uses the litter box more times than this in a day.",
    h_advanced: "Manual motor control has no safety sequence. Never use it with a cat nearby.",
    motor_forward: "Motor forward", motor_reverse: "Motor reverse", developer_mode: "Developer mode",
    // maintenance
    maintenance: "Maintenance", all_good: "All good", emptied_ago: "Emptied {t}", never_emptied: "Not emptied since setup",
    cleaned_ago: "Last clean {t}",
    a_motor_fault: "Motor fault", s_motor_fault: "Check nothing blocks the drum and restart the litter box. Contact UAHPET if it persists.",
    a_bin_full: "Waste bin full", s_bin_full: "Empty the waste bin.",
    a_bin_cover_open: "Cover open", s_bin_cover_open: "Close the top cover / bin cover.",
    a_not_in_place: "Not in place", s_not_in_place: "Check the waste bin is installed properly.",
    a_e_weight: "Weighing error", s_e_weight: "Check the litter is installed properly and the box isn't touching anything, place it on a flat surface, then tap Level to recalibrate.",
    a_no_weight: "No weight detected", s_no_weight: "Check there is enough litter, then tap Level.",
    a_stagnant: "Cat stayed too long", s_stagnant: "The litter box levelled the litter to make the cat leave and reset the weight.",
    a_excessive_clean_times: "Too many visits", s_excessive_clean_times: "More visits than the set limit today. If it continues, consider a vet check.",
    // purifier
    on: "On", off: "Off", power: "Power", air_quality: "Air quality", filter: "Filter", filter_reset: "Reset filter",
    mode: "Mode", speed: "Speed", timer: "Timer", confirm: "Tap again",
    aq_great: "Great", aq_good: "Good", aq_medium: "Medium", aq_mild: "Mild", aq_severe: "Poor",
    mode_manual: "Manual", mode_auto: "Auto", mode_sleep: "Sleep", tilted: "Tipped over: stand it upright",
    speed_sleep: "Sleep", timer_cancel: "Off",
    purifier_not_found: "No Tuya air purifier found. Set it up in the Tuya integration first.",
    // editors
    ed_device_id: "Device", ed_title: "Title", ed_show_actions: "Show actions", ed_show_quick: "Show quick toggles",
    ed_show_stats: "Show today's numbers", ed_show_advanced: "Show advanced settings", ed_range: "Period",
    ed_max_items: "Maximum entries", ed_show_cleanings: "Show cleanings", ed_show_alerts: "Show alerts",
    ed_days: "Days", ed_metric: "Default chart", ed_show_modes: "Show modes", ed_show_speed: "Show speed",
    ed_show_timer: "Show timer", ed_show_extras: "Show child lock and filter reset",
    // picker
    c_main: "UAHPET litter box", c_main_d: "Animated status, auto clean countdown, actions and quick toggles.",
    c_timeline: "UAHPET litter box timeline", c_timeline_d: "Today's visits, cleanings and alerts, with cat names from Litter Cat Identifier.",
    c_stats: "UAHPET litter box statistics", c_stats_d: "Visits, cleanings, visit duration and weight per day.",
    c_settings: "UAHPET litter box settings", c_settings_d: "Cleaning, litter and behaviour settings with explanations.",
    c_maint: "UAHPET litter box maintenance", c_maint_d: "Waste bin, alerts and how to fix them.",
    c_mini: "UAHPET litter box (compact)", c_mini_d: "One row: status, visits today and a clean button.",
    c_purifier: "UAHPET air purifier", c_purifier_d: "Air quality, filter, mode, speed and timer (Tuya integration).",
  },
  es: {
    clean: "Limpiar", level: "Nivelar", empty: "Vaciar", cancel: "Cancelar", confirm_btn: "Continuar",
    auto_clean: "Limpieza automática", sleep_mode: "No molestar", child_lock: "Bloqueo infantil", ionizer: "Ionizador", radar: "Radar",
    last_cat_weight: "Último gato", visits_today: "Visitas hoy", cleanings_today: "Limpiezas hoy", last_visit_duration: "Última visita",
    offline: "Sin conexión", not_found: "No hay ningún arenero UAHPET. Añade antes la integración UAHPET.",
    st_standby: "Listo", st_cleaning: "Limpiando la arena, espera…", st_clearing: "Vaciando la arena, espera…",
    st_leveling: "Nivelando la arena, espera…", st_radar: "Gato cerca, en pausa",
    st_clumping: "Esperando a que apelmace la arena", st_e_weight: "Peso anómalo detectado",
    auto_in: "Limpieza automática en {t}", auto_soon: "Limpieza automática en breve", auto_off: "Limpieza automática desactivada",
    dnd_on: "No molestar: sin limpieza automática", cat_inside: "El gato está usando el arenero",
    dlg_empty_t: "¿Vaciar la arena?", dlg_empty: "Vaciar echará toda la arena al cubo de residuos. ¿Continuar?",
    dlg_level_t: "Confirma la seguridad antes de nivelar", dlg_level: "Comprueba que no hay ningún gato dentro ni junto al arenero.",
    bin_bin_normal: "Cubo bien", bin_bin_full: "Cubo lleno", bin_bin_uninstalled: "Sin cubo", bin_bin_cover_open: "Tapa abierta",
    lt_larger_particle: "Arena gruesa", lt_finer_particle: "Arena fina", alerts_n: "{n} avisos", alert_1: "1 aviso",
    timeline: "Hoy", last24: "Últimas 24 h", visits_n: "{n} visitas", cleanings_n: "{n} limpiezas", avg: "media {t}",
    visit_cat: "{cat} usó el arenero, estuvo {d}", visit_anon: "Visita, estuvo {d}", unidentified: "Gato sin identificar",
    ev_cleaning: "Limpieza", ev_clearing: "Arena vaciada", ev_leveling: "Arena nivelada", ev_bin: "Cubo de residuos vaciado",
    no_events: "Nada todavía hoy.", loading: "Cargando…", yesterday: "Ayer", today_h: "Hoy",
    stats: "Estadísticas", m_visits: "Visitas", m_cleanings: "Limpiezas", m_duration: "Duración", m_weight: "Peso",
    per_day: "{v}/día", total: "total {v}", average: "media {v}", no_data: "Aún no hay datos.", days_n: "{n} días",
    settings: "Ajustes del arenero", sec_clean: "Limpieza", sec_litter: "Arena", sec_comfort: "Comportamiento",
    sec_alerts: "Avisos", sec_device: "Aparato", sec_advanced: "Avanzado",
    clean_delay: "Retardo de limpieza", bury_delay: "Retardo de enterrado", excessive_visits: "Aviso de demasiadas visitas", weight_unit: "Unidad en el aparato",
    h_auto_clean: "Limpia sola cuando el gato sale, pasado el retardo.",
    h_clean_delay: "Tiempo de espera tras una visita antes de la limpieza automática.",
    h_bury_delay: "Tiempo de espera antes de cubrir los excrementos.",
    h_litter: "Elige el grano de tu arena para que la limpieza y el nivelado se adapten.",
    h_dnd: "Mientras está activo, el arenero no limpia solo.",
    h_radar: "Si un gato se acerca mientras funciona, el arenero se pausa por seguridad y sigue 10 s después de que se vaya.",
    h_child_lock: "Bloquea los botones del arenero.", h_ionizer: "Iones negativos para reducir olores.",
    h_excessive: "Avisa cuando un gato usa el arenero más veces que esto en un día.",
    h_advanced: "El control manual del motor no tiene secuencia de seguridad. No lo uses nunca con un gato cerca.",
    motor_forward: "Motor hacia delante", motor_reverse: "Motor hacia atrás", developer_mode: "Modo desarrollador",
    maintenance: "Mantenimiento", all_good: "Todo en orden", emptied_ago: "Vaciado {t}", never_emptied: "Sin vaciar desde la instalación",
    cleaned_ago: "Última limpieza {t}",
    a_motor_fault: "Fallo del motor", s_motor_fault: "Comprueba que nada bloquea el tambor y reinicia el arenero. Si sigue, contacta con UAHPET.",
    a_bin_full: "Cubo de residuos lleno", s_bin_full: "Vacía el cubo de residuos.",
    a_bin_cover_open: "Tapa abierta", s_bin_cover_open: "Cierra la tapa superior o la del cubo.",
    a_not_in_place: "Fuera de posición", s_not_in_place: "Comprueba que el cubo de residuos está bien colocado.",
    a_e_weight: "Error de pesaje", s_e_weight: "Comprueba que la arena está bien puesta y que el arenero no toca nada, ponlo en una superficie plana y pulsa Nivelar para recalibrar.",
    a_no_weight: "Sin peso detectado", s_no_weight: "Comprueba que hay arena suficiente y pulsa Nivelar.",
    a_stagnant: "Gato demasiado tiempo dentro", s_stagnant: "El arenero ha nivelado la arena para que el gato salga y ha reiniciado el peso.",
    a_excessive_clean_times: "Demasiadas visitas", s_excessive_clean_times: "Hoy se ha superado el límite de visitas. Si se repite, consulta al veterinario.",
    on: "Encendido", off: "Apagado", power: "Encender", air_quality: "Calidad del aire", filter: "Filtro",
    filter_reset: "Reiniciar filtro", mode: "Modo", speed: "Velocidad", timer: "Temporizador", confirm: "Pulsa otra vez",
    aq_great: "Excelente", aq_good: "Buena", aq_medium: "Regular", aq_mild: "Leve", aq_severe: "Mala",
    mode_manual: "Manual", mode_auto: "Auto", mode_sleep: "Noche", tilted: "Volcado: ponlo de pie",
    speed_sleep: "Noche", timer_cancel: "No",
    purifier_not_found: "No hay ningún purificador Tuya. Añádelo antes a la integración de Tuya.",
    ed_device_id: "Dispositivo", ed_title: "Título", ed_show_actions: "Mostrar acciones", ed_show_quick: "Mostrar interruptores rápidos",
    ed_show_stats: "Mostrar cifras de hoy", ed_show_advanced: "Mostrar ajustes avanzados", ed_range: "Periodo",
    ed_max_items: "Máximo de entradas", ed_show_cleanings: "Mostrar limpiezas", ed_show_alerts: "Mostrar avisos",
    ed_days: "Días", ed_metric: "Gráfica inicial", ed_show_modes: "Mostrar modos", ed_show_speed: "Mostrar velocidad",
    ed_show_timer: "Mostrar temporizador", ed_show_extras: "Mostrar bloqueo y reinicio del filtro",
    c_main: "Arenero UAHPET", c_main_d: "Estado animado, cuenta atrás de la limpieza automática, acciones e interruptores rápidos.",
    c_timeline: "Cronología del arenero UAHPET", c_timeline_d: "Visitas, limpiezas y avisos de hoy, con el nombre del gato de Litter Cat Identifier.",
    c_stats: "Estadísticas del arenero UAHPET", c_stats_d: "Visitas, limpiezas, duración de las visitas y peso por día.",
    c_settings: "Ajustes del arenero UAHPET", c_settings_d: "Ajustes de limpieza, arena y comportamiento con explicaciones.",
    c_maint: "Mantenimiento del arenero UAHPET", c_maint_d: "Cubo de residuos, avisos y cómo solucionarlos.",
    c_mini: "Arenero UAHPET (compacta)", c_mini_d: "Una fila: estado, visitas de hoy y botón de limpiar.",
    c_purifier: "Purificador UAHPET", c_purifier_d: "Calidad del aire, filtro, modo, velocidad y temporizador (integración Tuya).",
  },
};

const lang = (hass) => (hass?.locale?.language || hass?.language || navigator.language || "en").slice(0, 2);
const t = (hass, key, vars) => {
  let s = (I18N[lang(hass)] || I18N.en)[key] ?? I18N.en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
};
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fire = (node, type, detail) => node.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
const isOff = (s) => !s || s.state === "unavailable";
const known = (s) => s && !["unknown", "unavailable", ""].includes(s.state);
const num = (s) => (known(s) && !isNaN(parseFloat(s.state)) ? parseFloat(s.state) : null);

/* ---------- time ---------- */

const locale = (hass) => hass?.locale?.language || lang(hass);
const fmtClock = (hass, d) => new Intl.DateTimeFormat(locale(hass), { hour: "2-digit", minute: "2-digit" }).format(d);
const fmtDur = (s) => {
  s = Math.max(0, Math.round(Number(s) || 0));
  return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min${s % 60 ? ` ${s % 60} s` : ""}`;
};
const fmtCountdown = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
function fmtAgo(hass, date) {
  const diff = (date.getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale(hass), { numeric: "auto" });
  const abs = Math.abs(diff);
  if (abs < 60) return rtf.format(Math.round(diff), "second");
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  return rtf.format(Math.round(diff / 86400), "day");
}
const fmtNum = (hass, v, digits = 1) => Number(Number(v).toFixed(digits)).toLocaleString(locale(hass), { maximumFractionDigits: digits });
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const tsOf = (row) => (row.lu ?? row.lc ?? 0) * 1000;

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

/** Litter Cat Identifier "last visit" sensor (its `history` attribute names the cat of each visit). */
function catVisitsEntity(hass) {
  return Object.values(hass?.entities || {}).find((e) => e.platform === "litter_cat_identifier" && e.translation_key === "last_visit")?.entity_id;
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

/** Purifier entities: `fan` plus translation keys (air_quality, filter_utilization, child_lock, ...). */
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

function makeEditor(schemaFn, defaults = {}) {
  return class extends HTMLElement {
    setConfig(config) { this._config = config; this._render(); }
    set hass(hass) { this._hass = hass; this._render(); }
    _render() {
      if (!this._hass || !this._config) return;
      if (!this._form) {
        this._form = document.createElement("ha-form");
        this._form.computeLabel = (s) => t(this._hass, `ed_${s.name}`);
        this._form.addEventListener("value-changed", (ev) => {
          const config = { ...ev.detail.value };
          for (const k of Object.keys(config)) {
            if (config[k] === "" || config[k] === undefined || defaults[k] === config[k]) delete config[k];
          }
          this._config = config;
          fire(this, "config-changed", { config });
        });
        this.appendChild(this._form);
      }
      this._form.hass = this._hass;
      this._form.schema = schemaFn(this._hass);
      // ha-form does not apply defaults itself: show toggles with their real value.
      this._form.data = { ...defaults, ...this._config };
    }
  };
}
const bool = (name) => ({ name, selector: { boolean: {} } });
const choice = (hass, name, values, labelKey) => ({
  name, selector: { select: { mode: "dropdown", options: values.map((v) => ({ value: v, label: labelKey ? t(hass, labelKey(v)) : String(v) })) } },
});
const DEVICE_FIELD = { name: "device_id", selector: { device: { filter: { integration: DOMAIN } } } };
const PURIFIER_DEVICE_FIELD = { name: "device_id", selector: { device: { filter: PURIFIER_PLATFORMS.map((integration) => ({ integration })) } } };
const TITLE_FIELD = { name: "title", selector: { text: {} } };

/* ---------- base card ---------- */

class UahpetCard extends HTMLElement {
  static defaults = {};

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._armed = null;
    this._dialog = null;
    this.shadowRoot.addEventListener("click", (ev) => {
      const el = ev.target.closest("[data-act]");
      if (!el || el.hasAttribute("disabled")) return;
      const { act, key, val } = el.dataset;
      if (act === "info") {
        if (this._map[key]) fire(this, "hass-more-info", { entityId: this._map[key] });
        return;
      }
      if (act === "dlg-cancel") this._dialog = null;
      else if (act === "dlg-ok") { const run = this._dialog?.run; this._dialog = null; run?.(); }
      else this.handle(act, key, val, el);
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

  connectedCallback() {
    if (this.tick && !this._timer) this._timer = setInterval(() => this.tick(), 1000);
  }

  disconnectedCallback() {
    clearInterval(this._timer);
    this._timer = null;
  }

  getCardSize() { return 5; }
  getGridOptions() { return { columns: 12, min_columns: 6, rows: "auto" }; }
  handle() {}
  extraKey() { return ""; }

  _state(key) { const id = this._map?.[key]; return id ? this._hass.states[id] : undefined; }
  _fmt(key) { const s = this._state(key); return known(s) ? this._hass.formatEntityState(s) : "—"; }
  _call(domain, service, key, data = {}) {
    const id = this._map[key];
    if (id) this._hass.callService(domain, service, { entity_id: id, ...data });
  }
  _ask(title, text, run) { this._dialog = { title, text, run }; }

  /** Two-tap confirmation (purifier); returns true on the second tap. */
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
    const key = `${lang(this._hass)}|${this._armed}|${this._dialog?.title}|${this.extraKey()}|${watched.join(",")}`;
    if (key === this._key) return;
    this._key = key;
    const dlg = this._dialog ? `<div class="dlg-back"><div class="dlg" role="dialog" aria-modal="true">
        <div class="dlg-t">${esc(this._dialog.title)}</div><div class="dlg-x">${esc(this._dialog.text)}</div>
        <div class="dlg-b"><button class="btn" data-act="dlg-cancel">${esc(t(this._hass, "cancel"))}</button>
        <button class="btn primary" data-act="dlg-ok">${esc(t(this._hass, "confirm_btn"))}</button></div></div></div>` : "";
    this.shadowRoot.innerHTML = `${STYLE}<ha-card>${this.body()}${dlg}</ha-card>`;
    this.tick?.();
  }
}

/** Base for litter box cards. */
class LitterCard extends UahpetCard {
  lookup() { return entityMap(this._hass, this._config.device_id); }
  notFound() { return `<div class="empty">${esc(t(this._hass, "not_found"))}</div>`; }
  cardTitle(key) { return this._config.title || this._deviceName(this._dev) || t(this._hass, key); }
  status() {
    const s = this._state("work_status");
    return isOff(s) ? "offline" : s.state;
  }
}

/* ---------- litter box illustration ---------- */

const BUSY = ["cleaning", "clearing", "leveling"];

/** Drum litter box drawn in SVG; CSS animates it per status (class on the wrapper). */
function boxArt(status, binState) {
  const badge = { clumping: "mdi:timer-sand", e_weight: "mdi:alert", offline: "mdi:lan-disconnect" }[status];
  return `<div class="art s-${esc(status)} ${binState === "bin_full" ? "bin-full" : ""}" aria-hidden="true">
    <svg viewBox="0 0 200 150">
      <defs><clipPath id="hole"><circle cx="100" cy="92" r="33"/></clipPath></defs>
      <g class="pulse"><circle cx="100" cy="92" r="70"/><circle cx="100" cy="92" r="70"/></g>
      <path class="dome" d="M22 118 A78 78 0 0 1 178 118 Z"/>
      <rect class="base" x="16" y="112" width="168" height="28" rx="13"/>
      <circle class="led" cx="100" cy="126" r="3.5"/>
      <circle class="rim" cx="100" cy="92" r="41"/>
      <circle class="hole" cx="100" cy="92" r="33"/>
      <g clip-path="url(#hole)">
        <g class="drum"><circle cx="100" cy="92" r="27"/></g>
        <path class="litter wave" d="M40 108 Q55 100 70 108 T100 108 T130 108 T160 108 T190 108 V140 H40 Z"/>
        <g class="grains"><circle cx="92" cy="96" r="2.4"/><circle cx="104" cy="90" r="2"/><circle cx="110" cy="99" r="2.4"/></g>
      </g>
      <g class="cat"><path d="M160 74 l5 -14 l8 10 q5 -2 10 0 l8 -10 l5 14 q4 16 -18 18 q-22 -2 -18 -18z"/>
        <circle class="eye" cx="171" cy="78" r="2"/><circle class="eye" cx="185" cy="78" r="2"/></g>
    </svg>
    ${badge ? `<span class="art-badge"><ha-icon icon="${badge}"></ha-icon></span>` : ""}
  </div>`;
}

/* ---------- 1. main card ---------- */

const STATUS_TONE = { standby: "ok", cleaning: "busy", clearing: "busy", leveling: "busy", radar: "warn", clumping: "warn", e_weight: "bad", offline: "bad" };
const ALERTS = ["motor_fault", "bin_full", "bin_cover_open", "not_in_place", "e_weight", "no_weight", "stagnant", "excessive_clean_times"];
const ALERT_ICONS = {
  motor_fault: "mdi:engine-off-outline", bin_full: "mdi:delete-alert", bin_cover_open: "mdi:delete-outline",
  not_in_place: "mdi:alert-rhombus-outline", e_weight: "mdi:scale-unbalanced", no_weight: "mdi:scale-balance",
  stagnant: "mdi:timer-alert-outline", excessive_clean_times: "mdi:counter",
};

class UahpetLitterboxCard extends LitterCard {
  static defaults = { show_stats: true, show_actions: true, show_quick: true };
  static getConfigElement() { return document.createElement("uahpet-litterbox-card-editor"); }
  static getStubConfig(hass) { return { device_id: litterDevices(hass)[0] || "" }; }

  handle(act, key) {
    const h = this._hass;
    if (act === "toggle") this._call("switch", "toggle", key);
    else if (act === "press" && key === "clean") this._call("button", "press", "clean");
    else if (act === "press" && key === "empty") this._ask(t(h, "dlg_empty_t"), t(h, "dlg_empty"), () => this._call("button", "press", "empty"));
    else if (act === "press" && key === "level") this._ask(t(h, "dlg_level_t"), t(h, "dlg_level"), () => this._call("button", "press", "level"));
  }

  /** Auto clean line, updated every second without re-rendering. */
  _autoLine() {
    const h = this._hass;
    const status = this.status();
    if (status !== "standby") return "";
    if (this._state("sleep_mode")?.state === "on") return t(h, "dnd_on");
    if (this._state("auto_clean")?.state === "off") return t(h, "auto_off");
    if (num(this._state("cat_weight")) > 0.3) return t(h, "cat_inside");
    const next = this._state("next_auto_clean");
    if (!known(next)) return "";
    const ms = new Date(next.state).getTime() - Date.now();
    if (ms < -5 * 60000) return "";
    return ms > 0 ? t(h, "auto_in", { t: fmtCountdown(ms) }) : t(h, "auto_soon");
  }

  tick() {
    const el = this.shadowRoot.querySelector(".auto-line");
    if (el && this._hass) el.textContent = this._autoLine();
  }

  body() {
    const map = this._map, h = this._hass, c = this._config;
    if (!map.work_status) return this.notFound();
    const status = this.status();
    const offline = status === "offline";
    const busy = BUSY.includes(status);
    const bin = this._state("bin_status");
    const litter = this._state("litter_type");
    const alerts = ALERTS.filter((k) => this._state(k)?.state === "on");
    const chip = (cls, icon, text, key) => `<button class="chip ${cls}" data-act="info" data-key="${key}"><ha-icon icon="${icon}"></ha-icon>${esc(text)}</button>`;
    const chips = [
      known(bin) ? chip(bin.state === "bin_normal" ? "ok" : bin.state === "bin_full" ? "bad" : "warn", "mdi:delete-outline", t(h, `bin_${bin.state}`), "bin_status") : "",
      known(litter) ? chip("", "mdi:grain", t(h, `lt_${litter.state}`), "litter_type") : "",
      alerts.length ? chip("bad", "mdi:alert-circle-outline", alerts.length === 1 ? t(h, "alert_1") : t(h, "alerts_n", { n: alerts.length }), "active_alerts") : "",
    ].join("");
    const stat = (key, icon, label) => map[key] ? `<button class="stat" data-act="info" data-key="${key}">
        <ha-icon icon="${icon}"></ha-icon><span class="val">${esc(this._fmt(key))}</span><span class="lbl">${esc(label)}</span></button>` : "";
    const dis = offline || busy ? "disabled" : "";
    const quick = [["auto_clean", "mdi:robot-vacuum"], ["sleep_mode", "mdi:bell-sleep-outline"]].filter(([k]) => map[k]);

    return `
      <div class="hero">
        ${boxArt(status, bin?.state)}
        <div class="hero-text">
          <div class="title">${esc(this.cardTitle("c_main"))}</div>
          <button class="status ${STATUS_TONE[status] || "ok"}" data-act="info" data-key="work_status">${esc(t(h, `st_${status}`))}</button>
          <div class="auto-line sub"></div>
        </div>
      </div>
      ${chips ? `<div class="chips">${chips}</div>` : ""}
      ${c.show_stats ? `<div class="stats three">
        ${stat("visits_today", "mdi:paw", t(h, "visits_today"))}
        ${stat("cleanings_today", "mdi:broom", t(h, "cleanings_today"))}
        ${stat("last_cat_weight", "mdi:cat", t(h, "last_cat_weight"))}
      </div>` : ""}
      ${c.show_actions ? `<div class="actions">
        ${[["clean", "mdi:broom"], ["level", "mdi:waves"], ["empty", "mdi:delete-empty"]].filter(([k]) => map[k]).map(([k, icon]) =>
          `<button class="action" data-act="press" data-key="${k}" ${dis}><ha-icon icon="${icon}"></ha-icon>${esc(t(h, k))}</button>`).join("")}
      </div>` : ""}
      ${c.show_quick && quick.length ? `<div class="toggles">
        ${quick.map(([k, icon]) => {
          const on = this._state(k)?.state === "on";
          return `<button class="toggle ${on ? "on" : ""}" data-act="toggle" data-key="${k}" aria-pressed="${on}" ${offline ? "disabled" : ""}>
            <ha-icon icon="${icon}"></ha-icon>${esc(t(h, k))}</button>`;
        }).join("")}
      </div>` : ""}`;
  }
}

/* ---------- 2. timeline ---------- */

class UahpetLitterboxTimelineCard extends LitterCard {
  static defaults = { range: "today", max_items: 20, show_cleanings: true, show_alerts: true };
  static getConfigElement() { return document.createElement("uahpet-litterbox-timeline-card-editor"); }
  static getStubConfig(hass) { return { device_id: litterDevices(hass)[0] || "" }; }

  extraKey() {
    // Re-fetch history when one of the timeline sources changes.
    const ids = this._sources().concat(catVisitsEntity(this._hass) || []);
    const sig = ids.map((id) => this._hass.states[id]?.last_updated).join("|") + JSON.stringify(this._config);
    if (sig !== this._sig) { this._sig = sig; this._fetch(); }
    return `${this._version || 0}`;
  }

  _sources() {
    const keys = ["visit", "work_status", "last_bin_emptied", ...(this._config.show_alerts ? ALERTS : [])];
    return keys.map((k) => this._map[k]).filter(Boolean);
  }

  _start() { return this._config.range === "24h" ? new Date(Date.now() - 86400000) : startOfToday(); }

  async _fetch() {
    const ids = this._sources();
    if (!ids.length || !this._hass.callWS) return;
    clearTimeout(this._fetchTimer);
    this._fetchTimer = setTimeout(async () => {
      try {
        this._history = await this._hass.callWS({
          type: "history/history_during_period", start_time: this._start().toISOString(), entity_ids: ids,
          minimal_response: false, no_attributes: false, significant_changes_only: false,
        });
      } catch (e) { this._history = {}; }
      this._version = (this._version || 0) + 1;
      this._key = null;
      this._render();
    }, 300);
  }

  _events() {
    const h = this._hass, hist = this._history || {}, m = this._map, start = this._start().getTime();
    const items = [];
    const cats = (this._hass.states[catVisitsEntity(h)]?.attributes?.history || []).map((v) => ({ ...v, ts: Date.parse(v.time) }));
    // visits
    let attrs = {};
    for (const row of hist[m.visit] || []) {
      if (row.a) attrs = row.a;
      const ts = Date.parse(row.s);
      if (isNaN(ts) || ts < start || attrs.event_type !== "visit") continue;
      const match = cats.find((v) => Math.abs(v.ts - ts) < 120000);
      const cat = match ? (match.cat === "unidentified" ? t(h, "unidentified") : match.cat) : null;
      items.push({ ts, kind: "visit", icon: "mdi:paw", duration: attrs.duration, weight: attrs.weight, cat });
    }
    // cleanings, emptying, levelling
    if (this._config.show_cleanings) {
      let prev = null;
      for (const row of hist[m.work_status] || []) {
        const ts = tsOf(row);
        if (row.s !== prev && ["cleaning", "clearing", "leveling"].includes(row.s) && ts >= start) {
          const icon = { cleaning: "mdi:broom", clearing: "mdi:delete-empty", leveling: "mdi:waves" }[row.s];
          items.push({ ts, kind: "status", icon, text: t(h, `ev_${row.s}`) });
        }
        prev = row.s;
      }
    }
    for (const row of hist[m.last_bin_emptied] || []) {
      const ts = Date.parse(row.s);
      if (!isNaN(ts) && ts >= start) items.push({ ts, kind: "bin", icon: "mdi:delete-restore", text: t(h, "ev_bin") });
    }
    // alerts (rising edges)
    if (this._config.show_alerts) {
      for (const key of ALERTS) {
        let prev = null;
        for (const row of hist[m[key]] || []) {
          const ts = tsOf(row);
          if (row.s === "on" && prev !== "on" && prev !== null && ts >= start) {
            items.push({ ts, kind: "alert", icon: ALERT_ICONS[key], text: t(h, `a_${key}`) });
          }
          prev = row.s;
        }
      }
    }
    const seen = new Set();
    return items.sort((a, b) => b.ts - a.ts).filter((i) => {
      const k = `${i.kind}|${i.text}|${Math.round(i.ts / 1000)}`;
      return seen.has(k) ? false : seen.add(k);
    });
  }

  body() {
    const h = this._hass, c = this._config;
    if (!this._map.work_status) return this.notFound();
    const head = `<div class="card-head"><div class="title">${esc(c.title || t(h, c.range === "24h" ? "last24" : "timeline"))}</div></div>`;
    if (!this._history) return `${head}<div class="empty">${esc(t(h, "loading"))}</div>`;
    const events = this._events();
    const visits = events.filter((e) => e.kind === "visit");
    const durs = visits.map((v) => Number(v.duration)).filter((d) => d > 0);
    const visitsToday = num(this._state("visits_today"));
    const cleaningsToday = num(this._state("cleanings_today"));
    const summary = [
      visitsToday !== null ? t(h, "visits_n", { n: visitsToday }) : "",
      cleaningsToday !== null ? t(h, "cleanings_n", { n: cleaningsToday }) : "",
      durs.length ? t(h, "avg", { t: fmtDur(durs.reduce((a, b) => a + b, 0) / durs.length) }) : "",
    ].filter(Boolean).join(" · ");
    const shown = events.slice(0, Number(c.max_items) || 20);
    let lastDay = null;
    const rows = shown.map((e) => {
      const d = new Date(e.ts);
      const day = d.toDateString();
      let sep = "";
      if (c.range === "24h" && day !== lastDay) {
        sep = `<li class="day">${esc(day === new Date().toDateString() ? t(h, "today_h") : t(h, "yesterday"))}</li>`;
      }
      lastDay = day;
      let text = e.text;
      if (e.kind === "visit") {
        const dur = fmtDur(e.duration);
        text = e.cat ? t(h, "visit_cat", { cat: e.cat, d: dur }) : t(h, "visit_anon", { d: dur });
      }
      const extra = e.kind === "visit" && e.weight ? `<span class="tl-w">${esc(fmtNum(h, e.weight))} kg</span>` : "";
      return `${sep}<li class="tl-${e.kind}"><span class="tl-time">${esc(fmtClock(h, d))}</span>
        <span class="tl-dot"><ha-icon icon="${e.icon}"></ha-icon></span><span class="tl-text">${esc(text)}</span>${extra}</li>`;
    }).join("");
    return `${head}${summary ? `<div class="sub summary">${esc(summary)}</div>` : ""}
      ${rows ? `<ul class="timeline">${rows}</ul>` : `<div class="empty">${esc(t(h, "no_events"))}</div>`}`;
  }
}

/* ---------- 3. statistics ---------- */

const METRICS = {
  visits: { stat: "visits_today", type: "change", live: "visits_today", kind: "bar", fmt: (h, v) => fmtNum(h, v, 0) },
  cleanings: { stat: "cleanings_today", type: "change", live: "cleanings_today", kind: "bar", fmt: (h, v) => fmtNum(h, v, 0) },
  duration: { stat: "last_visit_duration", type: "mean", kind: "line", fmt: (h, v) => fmtDur(v) },
  weight: { stat: "last_cat_weight", type: "mean", kind: "line", fmt: (h, v) => `${fmtNum(h, v)} kg` },
};

class UahpetLitterboxStatsCard extends LitterCard {
  static defaults = { days: 7, metric: "visits" };
  static getConfigElement() { return document.createElement("uahpet-litterbox-stats-card-editor"); }
  static getStubConfig(hass) { return { device_id: litterDevices(hass)[0] || "" }; }

  handle(act, key, val) {
    if (act === "metric") this._metric = val;
    else if (act === "days") { this._days = Number(val); this._fetchedAt = 0; }
    else if (act === "bar") this._picked = this._picked === Number(val) ? null : Number(val);
  }

  extraKey() {
    const days = this._days || Number(this._config.days) || 7;
    if (!this._fetchedAt || Date.now() - this._fetchedAt > 5 * 60000 || this._fetchedDays !== days) this._fetch(days);
    return `${this._version || 0}|${this._metric}|${this._picked}|${days}`;
  }

  async _fetch(days) {
    const ids = Object.values(METRICS).map((m) => this._map[m.stat]).filter(Boolean);
    if (!ids.length || !this._hass.callWS) return;
    this._fetchedAt = Date.now();
    this._fetchedDays = days;
    const start = startOfToday();
    start.setDate(start.getDate() - (days - 1));
    try {
      this._stats = await this._hass.callWS({
        type: "recorder/statistics_during_period", start_time: start.toISOString(),
        statistic_ids: ids, period: "day", types: ["change", "mean"],
      });
    } catch (e) { this._stats = {}; }
    this._version = (this._version || 0) + 1;
    this._key = null;
    this._render();
  }

  _series(metric, days) {
    const m = METRICS[metric], id = this._map[m.stat];
    const out = [];
    const start = startOfToday();
    start.setDate(start.getDate() - (days - 1));
    const byDay = {};
    for (const row of (this._stats || {})[id] || []) {
      const d = new Date(typeof row.start === "number" ? row.start : Date.parse(row.start));
      byDay[d.toDateString()] = row[m.type];
    }
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      let v = byDay[d.toDateString()];
      if (i === days - 1 && m.live) v = num(this._state(m.live)) ?? v; // today: live value
      if (m.type === "change" && (v === undefined || v === null)) v = 0;
      out.push({ d, v: v === undefined ? null : v });
    }
    return out;
  }

  _chart(series, kind) {
    const W = 300, H = 120, pad = 6;
    const vals = series.map((p) => p.v).filter((v) => v !== null);
    if (!vals.length) return "";
    const max = Math.max(...vals) || 1;
    const min = kind === "line" ? Math.min(...vals) : 0;
    const span = max - min || max || 1;
    const slot = W / series.length;
    const y = (v) => H - pad - ((v - min) / span) * (H - pad * 2 - (kind === "line" ? 10 : 0));
    const many = series.length > 10;
    const labels = series.map((p, i) => {
      if (many && i % 5 !== series.length % 5 && i !== series.length - 1) return "";
      const label = many ? p.d.getDate() : new Intl.DateTimeFormat(locale(this._hass), { weekday: "narrow" }).format(p.d);
      return `<text x="${slot * i + slot / 2}" y="${H + 14}" text-anchor="middle">${label}</text>`;
    }).join("");
    let marks = "";
    if (kind === "bar") {
      const bw = Math.max(3, slot * 0.6);
      marks = series.map((p, i) => {
        const v = p.v || 0, top = y(v), x = slot * i + (slot - bw) / 2;
        return `<rect class="bar ${this._picked === i ? "picked" : ""} ${i === series.length - 1 ? "today" : ""}" data-act="bar" data-val="${i}"
          x="${x}" y="${Math.min(top, H - pad - 2)}" width="${bw}" height="${Math.max(2, H - pad - top)}" rx="${Math.min(4, bw / 2)}"/>`;
      }).join("");
    } else {
      const pts = series.map((p, i) => (p.v === null ? null : [slot * i + slot / 2, y(p.v), i])).filter(Boolean);
      marks = `<polyline class="line" points="${pts.map(([x, yy]) => `${x},${yy}`).join(" ")}"/>` +
        pts.map(([x, yy, i]) => `<circle class="dot ${this._picked === i ? "picked" : ""}" data-act="bar" data-val="${i}" cx="${x}" cy="${yy}" r="${many ? 3 : 4.5}"/>`).join("");
    }
    return `<svg class="chart" viewBox="0 -4 ${W} ${H + 22}" preserveAspectRatio="none" role="img">${marks}<g class="xl">${labels}</g></svg>`;
  }

  body() {
    const h = this._hass, c = this._config;
    if (!this._map.work_status) return this.notFound();
    const metric = this._metric || c.metric || "visits";
    const days = this._days || Number(c.days) || 7;
    const m = METRICS[metric];
    const tabs = Object.keys(METRICS).filter((k) => this._map[METRICS[k].stat]).map((k) =>
      `<button class="${k === metric ? "on" : ""}" data-act="metric" data-val="${k}" aria-pressed="${k === metric}">${esc(t(h, `m_${k}`))}</button>`).join("");
    const range = [7, 30].map((d) =>
      `<button class="chip ${d === days ? "sel" : ""}" data-act="days" data-val="${d}">${esc(t(h, "days_n", { n: d }))}</button>`).join("");
    const head = `<div class="card-head"><div class="title">${esc(c.title || t(h, "stats"))}</div><div class="range">${range}</div></div>
      <div class="seg tabs">${tabs}</div>`;
    if (!this._stats) return `${head}<div class="empty">${esc(t(h, "loading"))}</div>`;
    const series = this._series(metric, days);
    const vals = series.map((p) => p.v).filter((v) => v !== null);
    if (!vals.length || (m.type === "change" && vals.every((v) => !v))) return `${head}<div class="empty">${esc(t(h, "no_data"))}</div>`;
    let summary;
    if (this._picked !== null && this._picked !== undefined && series[this._picked]) {
      const p = series[this._picked];
      const day = new Intl.DateTimeFormat(locale(h), { weekday: "short", day: "numeric", month: "short" }).format(p.d);
      summary = `${day}: ${p.v === null ? "—" : m.fmt(h, p.v)}`;
    } else if (m.type === "change") {
      const total = vals.reduce((a, b) => a + b, 0);
      summary = `${t(h, "per_day", { v: fmtNum(h, total / series.length) })} · ${t(h, "total", { v: fmtNum(h, total, 0) })}`;
    } else {
      summary = t(h, "average", { v: m.fmt(h, vals.reduce((a, b) => a + b, 0) / vals.length) });
    }
    return `${head}<div class="big">${esc(summary)}</div>${this._chart(series, m.kind)}`;
  }
}

/* ---------- 4. settings ---------- */

const DELAY_PRESETS = [60, 180, 300, 600, 900];

class UahpetLitterboxSettingsCard extends LitterCard {
  static defaults = { show_advanced: false };
  static getConfigElement() { return document.createElement("uahpet-litterbox-settings-card-editor"); }
  static getStubConfig(hass) { return { device_id: litterDevices(hass)[0] || "" }; }

  handle(act, key, val) {
    if (act === "toggle") this._call("switch", "toggle", key);
    else if (act === "set") this._call("number", "set_value", key, { value: Number(val) });
    else if (act === "step") {
      const s = this._state(key);
      const a = s?.attributes || {};
      const v = Math.min(Number(a.max ?? 1e9), Math.max(Number(a.min ?? 0), (num(s) || 0) + Number(val)));
      this._call("number", "set_value", key, { value: v });
    } else if (act === "option") this._call("select", "select_option", key, { option: val });
  }

  _switch(key, label, help, warn = false) {
    const s = this._state(key);
    if (!s) return "";
    const on = s.state === "on";
    return `<div class="row"><div class="row-t"><div class="row-l">${esc(label)}</div>${help ? `<div class="help ${warn ? "warn" : ""}">${esc(help)}</div>` : ""}</div>
      <button class="switch ${on ? "on" : ""}" role="switch" aria-checked="${on}" aria-label="${esc(label)}" data-act="toggle" data-key="${key}" ${isOff(s) ? "disabled" : ""}><span></span></button></div>`;
  }

  _stepper(key, label, help, step, fmt) {
    const s = this._state(key);
    if (!s) return "";
    const v = num(s);
    return `<div class="row"><div class="row-t"><div class="row-l">${esc(label)}</div>${help ? `<div class="help">${esc(help)}</div>` : ""}</div>
      <div class="stepper"><button data-act="step" data-key="${key}" data-val="${-step}" aria-label="−" ${isOff(s) ? "disabled" : ""}>−</button>
      <span class="val">${v === null ? "—" : esc(fmt(v))}</span>
      <button data-act="step" data-key="${key}" data-val="${step}" aria-label="+" ${isOff(s) ? "disabled" : ""}>+</button></div></div>`;
  }

  _segment(key, label, help, labelKey) {
    const s = this._state(key);
    if (!s) return "";
    const opts = s.attributes?.options || [];
    return `<div class="row col"><div class="row-t"><div class="row-l">${esc(label)}</div>${help ? `<div class="help">${esc(help)}</div>` : ""}</div>
      <div class="seg">${opts.map((o) => `<button class="${o === s.state ? "on" : ""}" data-act="option" data-key="${key}" data-val="${esc(o)}" aria-pressed="${o === s.state}" ${isOff(s) ? "disabled" : ""}>
        <span>${esc(labelKey(o))}</span></button>`).join("")}</div></div>`;
  }

  body() {
    const h = this._hass, c = this._config;
    if (!this._map.work_status) return this.notFound();
    const delay = this._state("clean_delay");
    const delayV = num(delay);
    const presets = delay ? `<div class="presets">${DELAY_PRESETS.map((p) =>
      `<button class="chip ${delayV === p ? "sel" : ""}" data-act="set" data-key="clean_delay" data-val="${p}" ${isOff(delay) ? "disabled" : ""}>${p / 60} min</button>`).join("")}</div>` : "";
    const sec = (title, rows) => (rows.trim() ? `<div class="section"><div class="sec-t">${esc(title)}</div>${rows}</div>` : "");
    return `<div class="card-head"><div class="title">${esc(c.title || t(h, "settings"))}</div></div>
      ${sec(t(h, "sec_clean"),
        this._switch("auto_clean", t(h, "auto_clean"), t(h, "h_auto_clean")) +
        this._stepper("clean_delay", t(h, "clean_delay"), t(h, "h_clean_delay"), 30, fmtDur) + presets +
        this._stepper("bury_delay", t(h, "bury_delay"), t(h, "h_bury_delay"), 5, fmtDur))}
      ${sec(t(h, "sec_litter"), this._segment("litter_type", t(h, "sec_litter"), t(h, "h_litter"), (o) => t(h, `lt_${o}`)))}
      ${sec(t(h, "sec_comfort"),
        this._switch("sleep_mode", t(h, "sleep_mode"), t(h, "h_dnd")) +
        this._switch("radar", t(h, "radar"), t(h, "h_radar")) +
        this._switch("child_lock", t(h, "child_lock"), t(h, "h_child_lock")) +
        this._switch("ionizer", t(h, "ionizer"), t(h, "h_ionizer")))}
      ${sec(t(h, "sec_alerts"), this._stepper("excessive_visits", t(h, "excessive_visits"), t(h, "h_excessive"), 1, (v) => fmtNum(h, v, 0)))}
      ${sec(t(h, "sec_device"), this._segment("weight_unit", t(h, "weight_unit"), "", (o) => o.replace("unit_", "")))}
      ${c.show_advanced ? sec(t(h, "sec_advanced"),
        `<div class="help warn">${esc(t(h, "h_advanced"))}</div>` +
        this._switch("motor_forward", t(h, "motor_forward"), "") +
        this._switch("motor_reverse", t(h, "motor_reverse"), "") +
        this._switch("developer_mode", t(h, "developer_mode"), "")) : ""}`;
  }
}

/* ---------- 5. maintenance ---------- */

const ALERT_ACTION = { e_weight: "level", no_weight: "level" };

function binArt(state) {
  const fill = { bin_full: 48, bin_normal: 16, bin_cover_open: 16 }[state] ?? 0;
  return `<svg class="bin s-${esc(state)}" viewBox="0 0 80 90" aria-hidden="true">
    <defs><clipPath id="bin-inside"><path d="M14 30 h52 l-5 54 h-42z"/></clipPath></defs>
    <rect class="bin-fill" x="10" y="${84 - fill}" width="60" height="${fill}" clip-path="url(#bin-inside)"/>
    <path class="bin-body" d="M14 30 h52 l-5 54 h-42z"/>
    <path class="bin-lid" d="M8 20 h64 v8 h-64z"/>
    <rect class="bin-handle" x="32" y="12" width="16" height="6" rx="3"/>
  </svg>`;
}

class UahpetLitterboxMaintenanceCard extends LitterCard {
  static getConfigElement() { return document.createElement("uahpet-litterbox-maintenance-card-editor"); }
  static getStubConfig(hass) { return { device_id: litterDevices(hass)[0] || "" }; }

  handle(act, key) {
    const h = this._hass;
    if (act === "press" && key === "level") this._ask(t(h, "dlg_level_t"), t(h, "dlg_level"), () => this._call("button", "press", "level"));
  }

  body() {
    const h = this._hass, c = this._config;
    if (!this._map.work_status) return this.notFound();
    const bin = this._state("bin_status");
    const emptied = this._state("last_bin_emptied");
    const cleaned = this._state("last_cleaning");
    const offline = this.status() === "offline";
    const alerts = ALERTS.filter((k) => this._state(k)?.state === "on");
    const lines = [
      known(emptied) ? t(h, "emptied_ago", { t: fmtAgo(h, new Date(emptied.state)) }) : t(h, "never_emptied"),
      known(cleaned) ? t(h, "cleaned_ago", { t: fmtAgo(h, new Date(cleaned.state)) }) : "",
    ].filter(Boolean);
    const binTone = !known(bin) ? "" : bin.state === "bin_normal" ? "ok" : bin.state === "bin_full" ? "bad" : "warn";
    const list = alerts.map((k) => {
      const action = ALERT_ACTION[k];
      return `<li class="fix"><ha-icon icon="${ALERT_ICONS[k]}"></ha-icon><div><div class="fix-t">${esc(t(h, `a_${k}`))}</div>
        <div class="help">${esc(t(h, `s_${k}`))}</div>
        ${action && this._map[action] ? `<button class="btn primary small" data-act="press" data-key="${action}" ${offline ? "disabled" : ""}>${esc(t(h, action))}</button>` : ""}</div></li>`;
    }).join("");
    return `<div class="card-head"><div class="title">${esc(c.title || t(h, "maintenance"))}</div></div>
      <div class="maint">
        <button class="bin-wrap" data-act="info" data-key="bin_status">${binArt(bin?.state || "unknown")}</button>
        <div><div class="status ${binTone}">${esc(known(bin) ? t(h, `bin_${bin.state}`) : "—")}</div>
          ${lines.map((l) => `<div class="sub">${esc(l)}</div>`).join("")}</div>
      </div>
      ${list ? `<ul class="fixes">${list}</ul>` : `<div class="all-good"><ha-icon icon="mdi:check-circle-outline"></ha-icon>${esc(t(h, offline ? "offline" : "all_good"))}</div>`}`;
  }
}

/* ---------- 6. compact ---------- */

const STATUS_ICON = {
  standby: "mdi:cat", cleaning: "mdi:rotate-3d-variant", clearing: "mdi:delete-empty", leveling: "mdi:waves",
  radar: "mdi:radar", clumping: "mdi:timer-sand", e_weight: "mdi:scale-unbalanced", offline: "mdi:lan-disconnect",
};

class UahpetLitterboxMiniCard extends LitterCard {
  static getConfigElement() { return document.createElement("uahpet-litterbox-mini-card-editor"); }
  static getStubConfig(hass) { return { device_id: litterDevices(hass)[0] || "" }; }
  getCardSize() { return 1; }
  getGridOptions() { return { columns: 6, min_columns: 4, rows: 1 }; }

  handle(act) { if (act === "press") this._call("button", "press", "clean"); }

  body() {
    const h = this._hass;
    if (!this._map.work_status) return this.notFound();
    const status = this.status();
    const tone = STATUS_TONE[status] || "ok";
    const alerts = ALERTS.filter((k) => this._state(k)?.state === "on").length;
    const visits = num(this._state("visits_today"));
    const sub = [t(h, `st_${status}`), visits !== null ? t(h, "visits_n", { n: visits }) : ""].filter(Boolean).join(" · ");
    return `<div class="mini">
      <button class="badge small ${alerts ? "bad" : tone}" data-act="info" data-key="work_status">
        <ha-icon class="${BUSY.includes(status) ? "spin" : ""}" icon="${alerts ? "mdi:alert-circle-outline" : STATUS_ICON[status] || "mdi:cat"}"></ha-icon></button>
      <div class="titles"><div class="title">${esc(this.cardTitle("c_mini"))}</div><div class="sub">${esc(sub)}</div></div>
      ${this._map.clean ? `<button class="round" data-act="press" aria-label="${esc(t(h, "clean"))}" ${status === "offline" || BUSY.includes(status) ? "disabled" : ""}>
        <ha-icon icon="mdi:broom"></ha-icon></button>` : ""}
    </div>`;
  }
}

/* ---------- air purifier (entities from the Tuya integration) ---------- */

const AQ_TONE = { great: "ok", good: "ok", medium: "warn", mild: "warn", severe: "bad" };
const MODE_ICONS = { manual: "mdi:hand-back-right-outline", auto: "mdi:fan-auto", sleep: "mdi:power-sleep" };
// "tipping" is reported as a mode when the purifier tilts over 45°: an alert, not a choice.
const TILT_MODE = "tipping";

class UahpetPurifierCard extends UahpetCard {
  static defaults = { show_modes: true, show_speed: true, show_timer: true, show_extras: true };
  static getConfigElement() { return document.createElement("uahpet-purifier-card-editor"); }
  static getStubConfig(hass) { return { device_id: purifierDevices(hass)[0] || "" }; }

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
    const title = c.title || this._deviceName(this._dev) || t(this._hass, "c_purifier");
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
          <span class="bar-line ${filterTone}"><span style="width:${filterPct}%"></span></span></button>` : ""}
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

/* ---------- styles ---------- */

const STYLE = `<style>
  :host { --ok: var(--success-color, #43a047); --warn: var(--warning-color, #ffa000); --bad: var(--error-color, #db4437);
    --busy: var(--primary-color, #03a9f4); --muted: var(--secondary-text-color); --soft: var(--secondary-background-color, rgba(127,127,127,.08));
    --box-body: #4fb393; --box-base: #2a6b5a; --box-rim: #e6f0ec; --box-hole: #163a32; --box-litter: #e3c48c; }
  ha-card { padding: 16px; display: flex; flex-direction: column; gap: 14px; position: relative; overflow: hidden; }
  button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; padding: 0; text-align: inherit; }
  button[disabled] { opacity: .4; cursor: default; }
  button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  .empty { color: var(--muted); }
  .title { font-size: 1.15em; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { color: var(--muted); }
  .card-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
  .help { color: var(--muted); font-size: .85em; line-height: 1.35; }
  .help.warn { color: var(--warn); }
  .ok { --tone: var(--ok); } .warn { --tone: var(--warn); } .bad { --tone: var(--bad); } .busy { --tone: var(--busy); }
  .spin { animation: spin 2.4s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* hero */
  .hero { display: flex; align-items: center; gap: 14px; }
  .hero-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
  .status { font-weight: 500; color: var(--tone, var(--primary-text-color)); text-align: left; }
  .art { position: relative; width: 132px; flex: none; }
  .art svg { width: 100%; display: block; overflow: visible; }
  .dome { fill: var(--box-body); } .base { fill: var(--box-base); transition: fill .3s; } .rim { fill: var(--box-rim); }
  .hole { fill: var(--box-hole); } .litter { fill: var(--box-litter); } .led { fill: #a8f2d6; }
  .drum circle { fill: none; stroke: rgba(255,255,255,.28); stroke-width: 3; stroke-dasharray: 7 9; }
  .drum, .grains, .wave { transform-box: view-box; }
  .drum { transform-origin: 100px 92px; }
  .grains circle { fill: var(--box-litter); opacity: 0; }
  .cat path { fill: var(--primary-text-color); opacity: .75; } .cat .eye { fill: var(--card-background-color, #fff); }
  .cat { opacity: 0; transition: opacity .3s; }
  .pulse circle { fill: none; stroke: var(--warn); stroke-width: 2; opacity: 0; transform-origin: 100px 92px; transform-box: view-box; }
  .art.bin-full .base { fill: var(--bad); }
  .art.s-offline { filter: grayscale(1); opacity: .55; }
  .art.s-cleaning .drum { animation: spin 3s linear infinite; }
  .art.s-clearing .drum { animation: spin 1.4s linear infinite reverse; }
  .art.s-clearing .grains circle { animation: fall 1.1s ease-in infinite; }
  .art.s-clearing .grains circle:nth-child(2) { animation-delay: .35s; } .art.s-clearing .grains circle:nth-child(3) { animation-delay: .7s; }
  .art.s-leveling .wave { animation: wave 1.2s ease-in-out infinite alternate; }
  .art.s-radar .cat { opacity: 1; }
  .art.s-radar .pulse circle { animation: ping 1.8s ease-out infinite; } .art.s-radar .pulse circle + circle { animation-delay: .9s; }
  .art.s-cleaning .led, .art.s-clearing .led, .art.s-leveling .led { animation: blink 1s steps(2) infinite; }
  @keyframes fall { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(40px); } }
  @keyframes wave { from { transform: translateX(0); } to { transform: translateX(-30px); } }
  @keyframes ping { 0% { opacity: .8; transform: scale(.6); } 100% { opacity: 0; transform: scale(1.15); } }
  @keyframes blink { 50% { opacity: .2; } }
  .art-badge { position: absolute; top: 0; right: 0; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center;
    background: var(--card-background-color, #fff); color: var(--warn); box-shadow: 0 1px 3px rgba(0,0,0,.25); }
  .art.s-e_weight .art-badge, .art.s-offline .art-badge { color: var(--bad); }
  .art-badge ha-icon { --mdc-icon-size: 18px; }
  @media (prefers-reduced-motion: reduce) { .art *, .spin { animation: none !important; } }

  /* chips, stats, actions, toggles */
  .chips, .toggles, .alerts, .presets { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 16px; font-size: .9em;
    background: color-mix(in srgb, var(--tone, var(--muted)) 15%, transparent); }
  .chip ha-icon { --mdc-icon-size: 18px; color: var(--tone, var(--muted)); }
  .chip.sel { background: var(--primary-color); color: var(--text-primary-color, #fff); }
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px; }
  .stats.three { grid-template-columns: repeat(3, 1fr); }
  .stat { display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto auto; column-gap: 8px; align-items: center;
    padding: 8px; border-radius: 12px; background: var(--soft); min-width: 0; }
  .stat ha-icon { grid-row: span 2; color: var(--state-icon-color, var(--muted)); }
  .stat.aq ha-icon { color: var(--tone); }
  .val { font-weight: 500; font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .lbl { font-size: .8em; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .bar-line { grid-column: 1 / -1; height: 4px; margin-top: 6px; border-radius: 2px; background: var(--divider-color); overflow: hidden; }
  .bar-line span { display: block; height: 100%; border-radius: 2px; background: var(--tone); }
  .actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .action { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 4px; border-radius: 12px; text-align: center;
    background: color-mix(in srgb, var(--primary-color) 12%, transparent); color: var(--primary-color); font-weight: 500; }
  .toggle { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 18px;
    border: 1px solid var(--divider-color); color: var(--muted); }
  .toggle ha-icon { --mdc-icon-size: 18px; }
  .toggle.on { background: color-mix(in srgb, var(--primary-color) 15%, transparent); border-color: transparent; color: var(--primary-color); }
  .toggle.armed { background: var(--bad); border-color: transparent; color: var(--text-primary-color, #fff); }

  /* dialog */
  .dlg-back { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: grid; place-items: center; padding: 16px; z-index: 2; }
  .dlg { background: var(--card-background-color, #fff); border-radius: 16px; padding: 18px; max-width: 320px; box-shadow: 0 6px 24px rgba(0,0,0,.3); }
  .dlg-t { font-weight: 500; font-size: 1.05em; margin-bottom: 6px; }
  .dlg-x { color: var(--muted); }
  .dlg-b { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
  .btn { padding: 8px 14px; border-radius: 18px; color: var(--primary-color); font-weight: 500; }
  .btn.primary { background: var(--primary-color); color: var(--text-primary-color, #fff); }
  .btn.small { padding: 4px 12px; margin-top: 6px; font-size: .9em; }

  /* timeline */
  .summary { margin-top: -8px; }
  .timeline { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
  .timeline li { display: grid; grid-template-columns: 3.2em 28px 1fr auto; align-items: center; gap: 8px; padding: 6px 0; position: relative; }
  .timeline li:not(.day)::before { content: ""; position: absolute; left: calc(3.2em + 8px + 13px); top: 0; bottom: 0; width: 2px; background: var(--divider-color); }
  .timeline li:first-child::before { top: 50%; } .timeline li:last-child::before { bottom: 50%; }
  .timeline li.day { display: block; font-size: .8em; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; padding-top: 10px; }
  .tl-time { color: var(--muted); font-variant-numeric: tabular-nums; font-size: .9em; }
  .tl-dot { width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; z-index: 1;
    background: var(--card-background-color, #fff); border: 2px solid var(--divider-color); }
  .tl-dot ha-icon { --mdc-icon-size: 16px; }
  .tl-visit .tl-dot { border-color: var(--primary-color); color: var(--primary-color); }
  .tl-alert .tl-dot { border-color: var(--bad); color: var(--bad); }
  .tl-status .tl-dot, .tl-bin .tl-dot { color: var(--muted); }
  .tl-text { min-width: 0; }
  .tl-w { font-weight: 500; font-variant-numeric: tabular-nums; }

  /* stats */
  .range { display: flex; gap: 6px; }
  .big { font-size: 1.3em; font-weight: 500; font-variant-numeric: tabular-nums; }
  .chart { width: 100%; height: 150px; display: block; overflow: visible; }
  .chart .bar { fill: color-mix(in srgb, var(--primary-color) 45%, transparent); cursor: pointer; }
  .chart .bar.today, .chart .bar.picked { fill: var(--primary-color); }
  .chart .line { fill: none; stroke: var(--primary-color); stroke-width: 2.5; vector-effect: non-scaling-stroke; stroke-linejoin: round; }
  .chart .dot { fill: var(--card-background-color, #fff); stroke: var(--primary-color); stroke-width: 2; vector-effect: non-scaling-stroke; cursor: pointer; }
  .chart .dot.picked { fill: var(--primary-color); }
  .chart .xl text { fill: var(--muted); font-size: 11px; }

  /* settings */
  .section { display: flex; flex-direction: column; gap: 10px; }
  .section + .section { border-top: 1px solid var(--divider-color); padding-top: 12px; }
  .sec-t { font-size: .8em; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; }
  .row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .row.col { flex-direction: column; align-items: stretch; }
  .row-t { min-width: 0; flex: 1; }
  .row-l { font-weight: 500; }
  .switch { width: 44px; height: 26px; border-radius: 13px; background: var(--divider-color); position: relative; flex: none; transition: background .2s; }
  .switch span { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.3); transition: transform .2s; }
  .switch.on { background: var(--primary-color); } .switch.on span { transform: translateX(18px); }
  .stepper { display: flex; align-items: center; gap: 4px; flex: none; }
  .stepper button { width: 32px; height: 32px; border-radius: 50%; background: var(--soft); font-size: 1.2em; line-height: 1; }
  .stepper .val { min-width: 4.5em; text-align: center; }
  .seg { display: flex; border: 1px solid var(--divider-color); border-radius: 12px; overflow: hidden; }
  .seg button { flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; gap: 4px; padding: 8px 4px; color: var(--muted); }
  .seg button + button { border-left: 1px solid var(--divider-color); }
  .seg button ha-icon { --mdc-icon-size: 18px; flex: none; }
  .seg button span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .seg button.on { background: color-mix(in srgb, var(--primary-color) 15%, transparent); color: var(--primary-color); font-weight: 500; }

  /* maintenance */
  .maint { display: flex; align-items: center; gap: 14px; }
  .bin-wrap { flex: none; }
  .bin { width: 64px; display: block; }
  .bin-lid, .bin-body { fill: none; stroke: var(--muted); stroke-width: 3; stroke-linejoin: round; }
  .bin-handle { fill: var(--muted); }
  .bin-fill { fill: color-mix(in srgb, var(--box-litter) 80%, transparent); }
  .bin.s-bin_full .bin-body { stroke: var(--bad); } .bin.s-bin_full .bin-fill { fill: color-mix(in srgb, var(--bad) 35%, transparent); }
  .bin.s-bin_cover_open .bin-lid { transform: rotate(-24deg); transform-origin: 8px 24px; transform-box: view-box; stroke: var(--warn); }
  .bin.s-bin_uninstalled .bin-body { stroke-dasharray: 5 5; } .bin.s-bin_uninstalled .bin-fill { display: none; }
  .fixes { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
  .fix { display: grid; grid-template-columns: 24px 1fr; gap: 10px; padding: 10px; border-radius: 12px; background: color-mix(in srgb, var(--bad) 10%, transparent); }
  .fix > ha-icon { color: var(--bad); }
  .fix-t { font-weight: 500; }
  .all-good { display: flex; align-items: center; gap: 8px; color: var(--ok); font-weight: 500; }

  /* compact + purifier */
  .mini, .head { display: flex; align-items: center; gap: 12px; }
  .titles { flex: 1; min-width: 0; }
  .badge { width: 48px; height: 48px; border-radius: 50%; display: grid; place-items: center; flex: none;
    background: color-mix(in srgb, var(--tone, var(--muted)) 18%, transparent); color: var(--tone, var(--muted)); }
  .badge.small { width: 40px; height: 40px; }
  .badge ha-icon { --mdc-icon-size: 26px; }
  .badge.idle { --tone: var(--muted); }
  .round, .power { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; flex: none;
    background: color-mix(in srgb, var(--primary-color) 14%, transparent); color: var(--primary-color); }
  .power { background: none; border: 1px solid var(--divider-color); color: var(--muted); }
  .power.on { background: var(--primary-color); border-color: transparent; color: var(--text-primary-color, #fff); }
  .alert { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 16px; font-size: .9em;
    background: color-mix(in srgb, var(--bad) 18%, transparent); color: var(--bad); }
  .alert ha-icon { --mdc-icon-size: 18px; }
  .group { display: flex; flex-direction: column; gap: 6px; }
  .glabel { font-size: .8em; color: var(--muted); }
  @media (max-width: 420px) { .art { width: 104px; } .stats.three { grid-template-columns: 1fr 1fr; } }
</style>`;

/* ---------- registration ---------- */

const define = (name, cls) => { if (!customElements.get(name)) customElements.define(name, cls); };
const D = (cls) => cls.defaults;
define("uahpet-litterbox-card", UahpetLitterboxCard);
define("uahpet-litterbox-card-editor", makeEditor(() => [DEVICE_FIELD, TITLE_FIELD, bool("show_stats"), bool("show_actions"), bool("show_quick")], D(UahpetLitterboxCard)));
define("uahpet-litterbox-timeline-card", UahpetLitterboxTimelineCard);
define("uahpet-litterbox-timeline-card-editor", makeEditor((h) => [DEVICE_FIELD, TITLE_FIELD,
  choice(h, "range", ["today", "24h"], (v) => (v === "today" ? "timeline" : "last24")),
  { name: "max_items", selector: { number: { min: 5, max: 50, mode: "box" } } }, bool("show_cleanings"), bool("show_alerts")], D(UahpetLitterboxTimelineCard)));
define("uahpet-litterbox-stats-card", UahpetLitterboxStatsCard);
define("uahpet-litterbox-stats-card-editor", makeEditor((h) => [DEVICE_FIELD, TITLE_FIELD,
  choice(h, "days", [7, 30]), choice(h, "metric", Object.keys(METRICS), (v) => `m_${v}`)], D(UahpetLitterboxStatsCard)));
// 0.1.0 name of the statistics card
define("uahpet-litterbox-history-card", class extends UahpetLitterboxStatsCard {});
define("uahpet-litterbox-history-card-editor", class extends customElements.get("uahpet-litterbox-stats-card-editor") {});
define("uahpet-litterbox-settings-card", UahpetLitterboxSettingsCard);
define("uahpet-litterbox-settings-card-editor", makeEditor(() => [DEVICE_FIELD, TITLE_FIELD, bool("show_advanced")], D(UahpetLitterboxSettingsCard)));
define("uahpet-litterbox-maintenance-card", UahpetLitterboxMaintenanceCard);
define("uahpet-litterbox-maintenance-card-editor", makeEditor(() => [DEVICE_FIELD, TITLE_FIELD]));
define("uahpet-litterbox-mini-card", UahpetLitterboxMiniCard);
define("uahpet-litterbox-mini-card-editor", makeEditor(() => [DEVICE_FIELD, TITLE_FIELD]));
define("uahpet-purifier-card", UahpetPurifierCard);
define("uahpet-purifier-card-editor", makeEditor(() => [PURIFIER_DEVICE_FIELD, TITLE_FIELD, bool("show_modes"), bool("show_speed"), bool("show_timer"), bool("show_extras")], D(UahpetPurifierCard)));

window.customCards = window.customCards || [];
const tl = (k) => t(document.querySelector("home-assistant")?.hass, k);
for (const [type, name] of [
  ["uahpet-litterbox-card", "c_main"], ["uahpet-litterbox-timeline-card", "c_timeline"], ["uahpet-litterbox-stats-card", "c_stats"],
  ["uahpet-litterbox-settings-card", "c_settings"], ["uahpet-litterbox-maintenance-card", "c_maint"], ["uahpet-litterbox-mini-card", "c_mini"],
  ["uahpet-purifier-card", "c_purifier"],
]) {
  if (!window.customCards.some((c) => c.type === type)) {
    window.customCards.push({ type, name: tl(name), description: tl(`${name}_d`), preview: true, documentationURL: DOCS });
  }
}
console.info(`%c UAHPET %c ${VERSION} `, "background:#3a7d44;color:#fff", "background:#ddd;color:#000");
