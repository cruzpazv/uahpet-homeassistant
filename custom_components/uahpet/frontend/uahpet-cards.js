/* UAHPET dashboard cards. Litter box: main, timeline, stats, settings, maintenance, mini.
   Air purifier: one card on top of the Tuya integration. No build step, no dependencies. */
const DOMAIN = "uahpet";
const TUYA_PLATFORMS = ["tuya", "xtend_tuya"];
const PURIFIER_PLATFORMS = [DOMAIN, ...TUYA_PLATFORMS]; // DOMAIN: future local purifier profiles
const VERSION = "0.8.3";
const DOCS = "https://github.com/cruzpazv/uahpet-homeassistant";
// per-cat entities (attribute `cat`): UAHPET cat profiles use cat_learned_weight, Litter Cat Identifier cat_weight
const CAT_FIELDS = { cat_learned_weight: "weight", cat_weight: "weight", cat_visits_today: "visits", cat_last_visit: "last", cat_health: "health" };

/* ---------- texts ---------- */

const I18N = {
  en: {
    clean: "Clean", level: "Level", empty: "Empty", cancel: "Cancel", confirm_btn: "Continue",
    ev_burying: "Waste buried", st_burying: "Burying the waste", ed_show_burying: "Show burying", ed_scale: "Size",
    add_cat: "Add a cat", manage_cats: "Manage cats", f_name: "Name", f_weight: "Approximate weight (kg)", f_color: "Colour", add_btn: "Add",
    add_hint: "Photo, notifications and more in Manage cats.", adding: "Adding…",
    speed_cloud: "Speeds 1–3 aren't available through the Tuya cloud for this purifier (it only declares one). Add the purifier to UAHPET to control them locally.",
    air_short: "Air", display: "Display", display_on: "Display on", display_off: "Display off", auto_mode: "Auto", sleep_mode_p: "Sleep",
    next_speed: "Next speed", more_settings: "Settings", c_purifier_bar: "UAHPET air purifier (buttons)", c_purifier_bar_d: "Status line with air quality and a row of round buttons.",
    weight_chart: "Weight", change: "{v} kg in {n} days", ed_layout: "Layout", ed_avatar_size: "Photo size (px)", ed_show_photo: "Show photo",
    lay_horizontal: "Horizontal", lay_vertical: "Vertical", c_weight: "UAHPET weight per cat", c_weight_d: "Weight of each cat over time, one line per cat.",
    hide_unk: "Hide unidentified", show_unk: "Show unidentified ({n})", clear_unk: "Clear unidentified",
    dlg_clear_t: "Clear unidentified visits?", dlg_clear: "They are removed from the log and today's count is reset.", dlg_clear_ok: "Clear",
    ed_show_toggle: "Show hide / clear buttons", ed_show_add: "Show Add a cat / Manage cats",
    stop: "Stop", dlg_empty_ok: "Empty", cats: "Cats", today_n: "{n} today", last_at: "last {t}", never: "no visits yet",
    visits_card: "Recent visits", th_time: "Time", th_cat: "Cat", th_weight: "Weight", th_duration: "Duration",
    more: "Show more", less: "Show less", all_hist: "Whole history", chart: "Visits per day", last_days: "Last {n} days (tap a day for details)",
    no_cats: "No cats yet. Add them in UAHPET → Configure, or install Litter Cat Identifier.", pick_cat: "Pick a cat in the card editor.",
    r_partial_after_visit: "Probably {cat} half inside, right after the visit", r_no_weight: "Visit without a weight",
    r_refill_or_partial: "Probably a litter refill or a cat half inside", r_device_busy: "The litter box was moving the litter",
    r_stayed_too_long: "A cat stayed too long: the litter was levelled and the weight reset",
    hl_frequent_visits: "{v} visits today, much more than usual", hl_long_visit: "{v} s visit, much longer than usual", hl_weight_loss: "Lost {v} % of weight in 3 weeks",
    ed_columns: "Cats per row", ed_cat: "Cat", ed_cats: "Cats to show (empty = all)", ed_count: "Visits shown", ed_collapsible: "Collapsible list",
    ed_expanded_count: "Visits when expanded", ed_show_weight: "Show weight", ed_show_visits: "Show visits today", ed_show_last: "Show last visit",
    ed_show_duration: "Show duration", ed_show_unidentified: "Show unidentified visits",
    c_cats: "UAHPET cats", c_cats_d: "Each cat: photo, weight, visits today, last visit.", c_cat: "UAHPET cat", c_cat_d: "One cat.",
    c_visits: "UAHPET recent visits", c_visits_d: "Latest visits with the cat, weight and duration; collapsible, whole history.",
    c_chart: "UAHPET visits per day", c_chart_d: "Bars per day with one bar per cat.",
    c_maint_mini: "UAHPET maintenance (compact)", c_maint_mini_d: "One row: waste bin and alerts.",
    c_purifier_mini: "UAHPET air purifier (compact)", c_purifier_mini_d: "One row: state, air quality, filter and power.",
    auto_clean: "Auto clean", sleep_mode: "Do not disturb", child_lock: "Child lock", ionizer: "Ionizer", radar: "Radar",
    last_cat_weight: "Last cat", visits_today: "Visits today", cleanings_today: "Cleanings", last_visit_duration: "Last visit",
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
    litter_type: "Litter type", settings: "Litter box settings", sec_clean: "Cleaning", sec_litter: "Litter", sec_comfort: "Behaviour",
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
    a_not_in_place: "Waste bin opened", s_not_in_place: "Close it when you're done. If it stays out 5 minutes, it counts as out of place.",
    a_bin_misplaced: "Waste bin out of place", s_bin_misplaced: "It has been out for a while: check it is pushed in properly.",
    bin_open_chip: "Bin open", ev_bin_opened: "Waste bin opened",
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
    ed_show_art: "Show the litter box drawing", ed_art_style: "Drawing", art_drum: "Drum", art_circle: "Circle (logo)", art_cube: "Cube", art_v_minimal: "minimalist", art_v_cat: "with cat", ed_box_color: "Litter box colour", ed_cat_color: "Cat colour", ed_show_stats: "Show today's numbers", ed_show_cats: "Show cats (Litter Cat Identifier)", ed_show_advanced: "Show advanced settings", ed_range: "Period",
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
    ev_burying: "Excrementos enterrados", st_burying: "Enterrando los excrementos", ed_show_burying: "Mostrar enterrados", ed_scale: "Tamaño",
    add_cat: "Añadir un gato", manage_cats: "Gestionar gatos", f_name: "Nombre", f_weight: "Peso aproximado (kg)", f_color: "Color", add_btn: "Añadir",
    add_hint: "Foto, avisos y más en Gestionar gatos.", adding: "Añadiendo…",
    speed_cloud: "Las velocidades 1–3 no están disponibles por la nube de Tuya en este purificador (solo declara una). Añádelo a UAHPET para controlarlas en local.",
    air_short: "Aire", display: "Pantalla", display_on: "Pantalla encendida", display_off: "Pantalla apagada", auto_mode: "Auto", sleep_mode_p: "Noche",
    next_speed: "Siguiente velocidad", more_settings: "Ajustes", c_purifier_bar: "Purificador UAHPET (botones)", c_purifier_bar_d: "Línea de estado con la calidad del aire y una fila de botones redondos.",
    weight_chart: "Peso", change: "{v} kg en {n} días", ed_layout: "Disposición", ed_avatar_size: "Tamaño de la foto (px)", ed_show_photo: "Mostrar foto",
    lay_horizontal: "Horizontal", lay_vertical: "Vertical", c_weight: "Peso por gato UAHPET", c_weight_d: "Peso de cada gato a lo largo del tiempo, una línea por gato.",
    hide_unk: "Ocultar sin identificar", show_unk: "Mostrar sin identificar ({n})", clear_unk: "Borrar sin identificar",
    dlg_clear_t: "¿Borrar las visitas sin identificar?", dlg_clear: "Se quitan del registro y se pone a cero la cuenta de hoy.", dlg_clear_ok: "Borrar",
    ed_show_toggle: "Mostrar botones de ocultar / borrar", ed_show_add: "Mostrar Añadir gato / Gestionar gatos",
    stop: "Detener", dlg_empty_ok: "Vaciar", cats: "Gatos", today_n: "{n} hoy", last_at: "última {t}", never: "sin visitas",
    visits_card: "Últimas visitas", th_time: "Hora", th_cat: "Gato", th_weight: "Peso", th_duration: "Duración",
    more: "Ver más", less: "Ver menos", all_hist: "Todo el historial", chart: "Visitas por día", last_days: "Últimos {n} días (toca un día para ver el detalle)",
    no_cats: "Aún no hay gatos. Añádelos en UAHPET → Configurar, o instala Litter Cat Identifier.", pick_cat: "Elige un gato en el editor de la tarjeta.",
    r_partial_after_visit: "Probablemente {cat} medio dentro, justo tras su visita", r_no_weight: "Visita sin peso",
    r_refill_or_partial: "Probablemente relleno de arena o un gato medio dentro", r_device_busy: "El arenero estaba moviendo la arena",
    r_stayed_too_long: "Un gato estuvo demasiado tiempo: se niveló la arena y se reinició el peso",
    hl_frequent_visits: "{v} visitas hoy, muchas más de lo habitual", hl_long_visit: "Visita de {v} s, mucho más larga de lo habitual", hl_weight_loss: "Ha perdido un {v} % de peso en 3 semanas",
    ed_columns: "Gatos por fila", ed_cat: "Gato", ed_cats: "Gatos a mostrar (vacío = todos)", ed_count: "Visitas visibles", ed_collapsible: "Lista desplegable",
    ed_expanded_count: "Visitas al desplegar", ed_show_weight: "Mostrar peso", ed_show_visits: "Mostrar visitas de hoy", ed_show_last: "Mostrar última visita",
    ed_show_duration: "Mostrar duración", ed_show_unidentified: "Mostrar visitas sin identificar",
    c_cats: "Gatos UAHPET", c_cats_d: "Cada gato: foto, peso, visitas de hoy, última visita.", c_cat: "Gato UAHPET", c_cat_d: "Un gato.",
    c_visits: "Últimas visitas UAHPET", c_visits_d: "Últimas visitas con gato, peso y duración; desplegable y todo el historial.",
    c_chart: "Visitas por día UAHPET", c_chart_d: "Barras por día con una barra por gato.",
    c_maint_mini: "Mantenimiento UAHPET (compacta)", c_maint_mini_d: "Una fila: cubo de residuos y avisos.",
    c_purifier_mini: "Purificador UAHPET (compacta)", c_purifier_mini_d: "Una fila: estado, calidad del aire, filtro y encendido.",
    auto_clean: "Limpieza automática", sleep_mode: "No molestar", child_lock: "Bloqueo infantil", ionizer: "Ionizador", radar: "Radar",
    last_cat_weight: "Último gato", visits_today: "Visitas hoy", cleanings_today: "Limpiezas", last_visit_duration: "Última visita",
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
    litter_type: "Tipo de arena", settings: "Ajustes del arenero", sec_clean: "Limpieza", sec_litter: "Arena", sec_comfort: "Comportamiento",
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
    a_not_in_place: "Depósito de residuos abierto", s_not_in_place: "Ciérralo cuando termines. Si sigue fuera 5 minutos, cuenta como mal colocado.",
    a_bin_misplaced: "Depósito de residuos mal colocado", s_bin_misplaced: "Lleva un rato fuera: comprueba que está bien metido.",
    bin_open_chip: "Depósito abierto", ev_bin_opened: "Depósito abierto",
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
    ed_show_art: "Mostrar el dibujo del arenero", ed_art_style: "Dibujo", art_drum: "Tambor", art_circle: "Círculo (logo)", art_cube: "Cubo", art_v_minimal: "minimalista", art_v_cat: "con gato", ed_box_color: "Color del arenero", ed_cat_color: "Color del gato", ed_show_stats: "Mostrar cifras de hoy", ed_show_cats: "Mostrar gatos (Litter Cat Identifier)", ed_show_advanced: "Mostrar ajustes avanzados", ed_range: "Periodo",
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
    if (e.platform !== DOMAIN || e.device_id !== dev || !e.translation_key) continue;
    if (CAT_FIELDS[e.translation_key] && hass.states[e.entity_id]?.attributes?.cat) continue; // a cat, not the litter box
    map[e.translation_key] = e.entity_id;
  }
  return { dev, map };
}



function collectCats(hass, ents) {
  const cats = {};
  let lastVisit = null, unidentified = null, device = null, showSwitch = null, clearButton = null;
  for (const e of ents) {
    if (e.translation_key === "last_visit") { lastVisit = e.entity_id; device = e.device_id; }
    else if (e.translation_key === "unidentified_today") unidentified = e.entity_id;
    else if (e.translation_key === "show_unidentified") showSwitch = e.entity_id;
    else if (e.translation_key === "clear_unidentified" && e.entity_id.startsWith("button.")) clearButton = e.entity_id;
    const field = CAT_FIELDS[e.translation_key];
    const name = field && hass.states[e.entity_id]?.attributes?.cat;
    if (name) (cats[name] ||= { name })[field] = e.entity_id;
  }
  return { cats: Object.values(cats), lastVisit, unidentified, device, showSwitch, clearButton };
}

/** Cats of a litter box: UAHPET's own cat profiles, otherwise Litter Cat Identifier.
    {kind, cats: [{name, weight, visits, last, health}], lastVisit, unidentified, ws: {type, device_id}} */
function catSource(hass, litterDevice) {
  const all = Object.values(hass?.entities || {});
  const own = collectCats(hass, all.filter((e) => e.platform === DOMAIN && (!litterDevice || e.device_id === litterDevice)));
  if (own.cats.length) return { ...own, kind: DOMAIN, ws: { type: `${DOMAIN}/visits`, device_id: own.device } };
  const lci = collectCats(hass, all.filter((e) => e.platform === "litter_cat_identifier"));
  if (lci.cats.length) return { ...lci, kind: "lci", ws: { type: "litter_cat_identifier/history", device_id: lci.device } };
  return null;
}

const catIds = (src) => (src ? src.cats.flatMap((c) => [c.weight, c.visits, c.last, c.health]).concat(src.lastVisit, src.unidentified, src.showSwitch).filter(Boolean) : []);
const catPicture = (hass, cat) => hass.states[cat.weight]?.attributes?.entity_picture;
/** Card option `colors: {Name: "#hex"}` first, then the colour picked for the cat, then the palette. */
const catColor = (hass, cat, i, config) => config?.colors?.[cat.name] || hass.states[cat.weight]?.attributes?.color || PALETTE[i % PALETTE.length];

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
            if (config[k] === "" || config[k] === undefined || defaults[k] === config[k] || (k === "scale" && Number(config[k]) === 1)) delete config[k];
          }
          this._config = config;
          fire(this, "config-changed", { config });
        });
        this.appendChild(this._form);
      }
      this._form.hass = this._hass;
      this._form.schema = [...schemaFn(this._hass, this._config),
        { name: "scale", selector: { number: { min: 0.7, max: 1.5, step: 0.05, mode: "slider" } } }];
      // ha-form does not apply defaults itself: show toggles with their real value.
      this._form.data = { scale: 1, ...defaults, ...this._config };
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
    this._ro?.disconnect();
    this._observed = null;
  }

  /** Charts are drawn for the size of their box, so they fit when the card is made shorter or taller. */
  _observeChart() {
    const box = this.shadowRoot.querySelector(".chart-box");
    if (!box || this._observed === box) return;
    this._ro ||= new ResizeObserver((entries) => {
      const r = entries[0].contentRect, w = Math.round(r.width), h = Math.round(r.height);
      if (!w || !h || (this._box && Math.abs(this._box.w - w) < 3 && Math.abs(this._box.h - h) < 3)) return;
      this._box = { w, h };
      this._key = null;
      requestAnimationFrame(() => this._render());
    });
    this._ro.disconnect();
    this._ro.observe(box);
    this._observed = box;
  }

  /** viewBox height for a chart `W` units wide that fills its box (fallback before the first measure). */
  _chartH(W, fallback) { return this._box ? Math.max(50, Math.round((W * this._box.h) / this._box.w)) : fallback; }

  getCardSize() { return 5; }
  getGridOptions() { return { columns: 12, min_columns: 4, rows: "auto" }; }
  handle() {}
  extraKey() { return ""; }

  _state(key) { const id = this._map?.[key]; return id ? this._hass.states[id] : undefined; }
  _fmt(key) { const s = this._state(key); return known(s) ? this._hass.formatEntityState(s) : "—"; }
  _call(domain, service, key, data = {}) {
    const id = this._map[key];
    if (id) this._hass.callService(domain, service, { entity_id: id, ...data });
  }
  _ask(title, text, run, danger = null) { this._dialog = { title, text, run, danger }; }

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
    if (this._freeze && this.shadowRoot.innerHTML) return;  // a form is open: keep what is being typed
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
    const d = this._dialog;
    const dlg = d ? `<div class="dlg-back"><div class="dlg ${d.danger ? "danger" : ""}" role="alertdialog" aria-modal="true">
        ${d.danger ? `<ha-icon class="dlg-i" icon="mdi:alert-outline"></ha-icon>` : ""}
        <div class="dlg-t">${esc(d.title)}</div><div class="dlg-x">${esc(d.text)}</div>
        <div class="dlg-b"><button class="btn" data-act="dlg-cancel">${esc(t(this._hass, "cancel"))}</button>
        <button class="btn primary" data-act="dlg-ok">${esc(d.danger || t(this._hass, "confirm_btn"))}</button></div></div></div>` : "";
    const scale = Number(this._config.scale) || 1;
    this.shadowRoot.innerHTML = `${STYLE}<ha-card ${scale !== 1 ? `style="zoom:${scale}"` : ""}>${this.body()}${dlg}</ha-card>`;
    this._observed = null;
    this._observeChart();
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

  /** Cleaning right after a visit, well before the clean delay: burying the waste. */
  burying() {
    if (this.status() !== "cleaning") return false;
    const visit = this._state("visit"), delay = num(this._state("clean_delay"));
    const at = known(visit) ? Date.parse(visit.state) : NaN;
    return !isNaN(at) && delay > 90 && (Date.now() - at) / 1000 < delay - 30;
  }
}

/* ---------- litter box illustration ---------- */

const BUSY = ["cleaning", "clearing", "leveling"];

/** Drum litter box drawn in SVG; CSS animates it per status (class on the wrapper). */
const ART_MODELS = ["drum", "circle", "cube"];
const ART_VARIANTS = ["", "-minimal", "-cat"];  // normal, lines only, a cat always peeking out
const ART_STYLES = ART_MODELS.flatMap((m) => ART_VARIANTS.map((v) => m + v));
const ART_LEGACY = { logo: "circle-cat", cat: "drum-cat", minimal: "drum-minimal" };  // art_style values of earlier builds

/** art_style (+ the older art_minimal flag) -> {model, minimal, cat}. */
function artStyle(style, minimalFlag) {
  style = ART_LEGACY[style] || style;
  if (!ART_STYLES.includes(style)) style = "drum";
  const [model, variant] = style.split("-");
  return { model, minimal: variant === "minimal" || (!variant && !!minimalFlag), cat: variant === "cat" };
}

const toRgb = (value) => {
  if (Array.isArray(value) && value.length === 3) return value.map((x) => Math.max(0, Math.min(255, Number(x) || 0)));
  if (typeof value === "string" && /^#?[0-9a-f]{6}$/i.test(value.trim())) {
    const v = value.trim().replace("#", "");
    return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16));
  }
  return null;
};
const mix = (rgb, to, f) => `rgb(${rgb.map((c, i) => Math.round(c + (to[i] - c) * f)).join(", ")})`;

/** CSS variables for a chosen litter box colour: body, lighter / darker shades for gradients, base, lines. */
function boxPaint(value) {
  const rgb = toRgb(value);
  if (!rgb) return "";
  const W = [255, 255, 255], K = [0, 0, 0];
  return [`--box-body:${mix(rgb, W, 0)}`, `--box-hi:${mix(rgb, W, 0.22)}`, `--box-lo:${mix(rgb, K, 0.22)}`,
    `--box-base:${mix(rgb, K, 0.45)}`, `--box-base-lo:${mix(rgb, K, 0.6)}`,
    `--steel-a:${mix(rgb, W, 0.7)}`, `--steel-b:${mix(rgb, W, 0.35)}`, `--steel-c:${mix(rgb, K, 0.1)}`, `--steel-base:${mix(rgb, K, 0.4)}`,
    `--lg:${mix(rgb, K, 0.3)}`, `--lg-soft:${mix(rgb, W, 0)}`].join(";");
}

/** The cat that peeks out of the opening when one is inside (drawn for a hole of radius 33 at 0,0). */
const PEEK = `<g class="peek"><g transform="scale(0.295) translate(-256 -262)">
    <path class="peek-head" d="M184 330 C178 290 186 250 198 214 L240 250 Q256 246 272 250 L314 214 C326 250 334 290 328 330 Z"/>
    <path class="peek-ear" d="M205 232 L222 248 L208 252 Z M307 232 L290 248 L304 252 Z"/>
    <ellipse class="peek-eye" cx="231" cy="284" rx="10" ry="13"/><ellipse class="peek-eye" cx="281" cy="284" rx="10" ry="13"/>
    <path class="peek-nose" d="M250 302 L262 302 L256 309 Z"/></g></g>`;

/** Opening: rim, drum (turns while cleaning), the cat inside, litter (waves while levelling), grains (fall while emptying). */
function artOpening(cx, cy, R, r, rimClass = "rim") {
  return `<circle class="${rimClass}" cx="${cx}" cy="${cy}" r="${R}"/>
      <circle class="hole" cx="${cx}" cy="${cy}" r="${r}"/>
      <g clip-path="url(#hole)"><g transform="translate(${cx} ${cy}) scale(${(r / 33).toFixed(4)})">
        <g class="drum"><circle cx="0" cy="0" r="27"/></g>
        ${PEEK}
        <path class="litter wave" d="M-60 16 Q-45 8 -30 16 T0 16 T30 16 T60 16 T90 16 V50 H-60 Z"/>
        <g class="grains"><circle cx="-8" cy="4" r="2.4"/><circle cx="4" cy="-2" r="2"/><circle cx="10" cy="7" r="2.4"/></g>
      </g></g>`;
}

const ART_CAT = (dx = 0, dy = 0) => `<g class="cat" transform="translate(${dx} ${dy})"><path d="M160 74 l5 -14 l8 10 q5 -2 10 0 l8 -10 l5 14 q4 16 -18 18 q-22 -2 -18 -18z"/>
        <circle class="eye" cx="171" cy="78" r="2"/><circle class="eye" cx="185" cy="78" r="2"/></g>`;
const ART_PULSE = (cx, cy, r = 70) => `<g class="pulse"><circle cx="${cx}" cy="${cy}" r="${r}"/><circle cx="${cx}" cy="${cy}" r="${r}"/></g>`;

/** Litter box drawn in SVG: model drum / circle (the logo) / cube, full colour or minimalist.
    CSS animates it per status; `catInside` shows the cat peeking out of the opening. */
/** "#rrggbb" or [r, g, b] -> {color, eye}: eyes light on a dark cat, dark on a light one. */
function catPaint(value) {
  const rgb = toRgb(value);
  if (!rgb) return null;
  const [r, g, b] = rgb;
  const light = (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.45;
  return { color: `rgb(${r}, ${g}, ${b})`, eye: light ? "#163a32" : "#f2e6b8" };
}

function boxArt(status, binState, artStyleValue = "drum", minimalFlag = false, catInside = false, catColor = null, boxColor = null) {
  const { model: style, minimal, cat } = artStyle(artStyleValue, minimalFlag);
  const badge = { clumping: "mdi:timer-sand", e_weight: "mdi:alert", offline: "mdi:lan-disconnect" }[status];
  let shape;
  if (style === "cube") {
    shape = `<defs><clipPath id="hole"><circle cx="100" cy="74" r="33"/></clipPath>
        <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--steel-a,#e3e8ec)"/><stop offset=".55" style="stop-color:var(--steel-b,#b9c2ca)"/><stop offset="1" style="stop-color:var(--steel-c,#8e99a4)"/></linearGradient></defs>
      ${ART_PULSE(100, 74)}
      <rect class="shell" x="34" y="12" width="132" height="114" rx="28" fill="url(#steel)"/>
      <rect class="screen" x="74" y="22" width="52" height="9" rx="4.5"/><circle class="led" cx="117" cy="26.5" r="2.2"/>
      ${artOpening(100, 74, 40, 33, "rim steel-rim")}
      <rect class="base" x="42" y="122" width="116" height="14" rx="7"/>
      ${ART_CAT(8, -14)}`;
  } else if (style === "circle") {
    // the integration's logo (assets/icon.svg), drawn in its own 512-unit space
    shape = `<defs><clipPath id="hole"><circle cx="256" cy="262" r="112"/></clipPath><clipPath id="lg-dome"><rect width="512" height="400"/></clipPath>
        <linearGradient id="lg-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--box-hi,#5cc3a2)"/><stop offset="1" style="stop-color:var(--box-lo,#2c8a6f)"/></linearGradient>
        <linearGradient id="lg-base" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--box-base,#2a6b5a)"/><stop offset="1" style="stop-color:var(--box-base-lo,#1d4f42)"/></linearGradient></defs>
      <g transform="translate(5 -20) scale(0.37)">
        ${ART_PULSE(256, 262, 200)}
        <circle class="shell" cx="256" cy="268" r="200" fill="url(#lg-body)" clip-path="url(#lg-dome)"/>
        <rect class="base" x="44" y="372" width="424" height="76" rx="34" fill="url(#lg-base)"/>
        <circle class="led" cx="256" cy="410" r="9"/>
        ${artOpening(256, 262, 126, 112)}
      </g>
      ${ART_CAT(6, -18)}`;
  } else {
    shape = `<defs><clipPath id="hole"><circle cx="100" cy="92" r="33"/></clipPath></defs>
      ${ART_PULSE(100, 92)}
      <path class="shell" d="M22 118 A78 78 0 0 1 178 118 Z"/>
      <rect class="base" x="16" y="112" width="168" height="28" rx="13"/>
      <circle class="led" cx="100" cy="126" r="3.5"/>
      ${artOpening(100, 92, 41, 33)}
      ${ART_CAT()}`;
  }
  const cls = [`art v-${style}`, minimal ? "min" : "", cat ? "cat-always" : "", `s-${esc(status)}`, binState === "bin_full" ? "bin-full" : "", catInside ? "cat-in" : ""];
  const paint = catPaint(catColor);
  const vars = [paint ? `--cat-color:${paint.color};--cat-eye:${paint.eye}` : "", boxPaint(boxColor)].filter(Boolean).join(";");
  return `<div class="${cls.filter(Boolean).join(" ")}" ${vars ? `style="${vars}"` : ""} aria-hidden="true">
    <svg viewBox="0 0 200 150">${shape}</svg>
    ${badge ? `<span class="art-badge"><ha-icon icon="${badge}"></ha-icon></span>` : ""}
  </div>`;
}

/* ---------- 1. main card ---------- */

const STATUS_TONE = { standby: "ok", cleaning: "busy", clearing: "busy", leveling: "busy", radar: "warn", clumping: "warn", e_weight: "bad", offline: "bad" };
const ALERTS = ["motor_fault", "bin_full", "bin_cover_open", "bin_misplaced", "e_weight", "no_weight", "stagnant", "excessive_clean_times"];
// the waste bin taken out to look at it: shown as information, not as an alert (bin_misplaced if it stays out)
const BIN_OPEN = "not_in_place";
const ALERT_ICONS = {
  motor_fault: "mdi:engine-off-outline", bin_full: "mdi:delete-alert", bin_cover_open: "mdi:delete-outline",
  not_in_place: "mdi:tray-arrow-up", bin_misplaced: "mdi:tray-alert", e_weight: "mdi:scale-unbalanced", no_weight: "mdi:scale-balance",
  stagnant: "mdi:timer-alert-outline", excessive_clean_times: "mdi:counter",
};

class UahpetLitterboxCard extends LitterCard {
  static defaults = { show_art: true, art_style: "drum", show_stats: true, show_cats: true, show_actions: true, show_quick: true };
  static getConfigElement() { return document.createElement("uahpet-litterbox-card-editor"); }

  extraKey() {
    // re-render when a cat changes too
    return catIds(catSource(this._hass, this._dev)).map((id) => this._hass.states[id]?.last_updated).join("|");
  }
  static getStubConfig(hass) { return { device_id: litterDevices(hass)[0] || "" }; }

  handle(act, key, val) {
    const h = this._hass;
    if (act === "cat") fire(this, "hass-more-info", { entityId: val });
    else if (act === "toggle") this._call("switch", "toggle", key);
    else if (act === "press" && key === "clean") this._call("button", "press", "clean");
    else if (act === "press" && key === "empty") this._ask(t(h, "dlg_empty_t"), t(h, "dlg_empty"), () => this._call("button", "press", "empty"), t(h, "dlg_empty_ok"));
    else if (act === "stop") this._call("button", "press", "stop");
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
      this._state(BIN_OPEN)?.state === "on" && !alerts.includes("bin_misplaced") ? chip("warn", ALERT_ICONS[BIN_OPEN], t(h, "bin_open_chip"), BIN_OPEN) : "",
      alerts.length ? chip("bad", "mdi:alert-circle-outline", alerts.length === 1 ? t(h, "alert_1") : t(h, "alerts_n", { n: alerts.length }), "active_alerts") : "",
    ].join("");
    const stat = (key, icon, label) => map[key] ? `<button class="stat" data-act="info" data-key="${key}">
        <ha-icon icon="${icon}"></ha-icon><span class="val">${esc(this._fmt(key))}</span><span class="lbl">${esc(label)}</span></button>` : "";
    const dis = offline || busy ? "disabled" : "";
    const quick = [["auto_clean", "mdi:robot-vacuum"], ["sleep_mode", "mdi:bell-sleep-outline"]].filter(([k]) => map[k]);
    const src = c.show_cats ? catSource(h, this._dev) : null;
    const cats = src ? src.cats : [];
    const lastCat = src && h.states[src.lastVisit]?.state;
    const lastLabel = lastCat && cats.some((x) => x.name === lastCat) ? lastCat : t(h, "last_cat_weight");
    const catRow = cats.map((cat, i) => {
      const pic = catPicture(h, cat), color = catColor(h, cat, i, c);
      const sick = h.states[cat.health]?.state === "on";
      return `<button class="cat-chip ${sick ? "sick" : ""}" data-act="cat" data-val="${esc(cat.weight || cat.visits)}">
        ${pic ? `<img src="${esc(pic)}" alt="">` : `<span class="cat-ic" style="color:${esc(color)}"><ha-icon icon="mdi:cat"></ha-icon></span>`}
        <span class="cat-n">${esc(cat.name)}</span><span class="cat-v">${esc(h.states[cat.visits]?.state ?? "0")}</span>
        ${sick ? `<ha-icon class="cat-h" icon="mdi:heart-pulse"></ha-icon>` : ""}</button>`;
    }).join("");

    return `
      <div class="hero ${c.show_art ? "" : "no-art"}">
        ${c.show_art ? boxArt(status, bin?.state, c.art_style, c.art_minimal, !BUSY.includes(status) && num(this._state("cat_weight")) > 0.3, c.cat_color, c.box_color) : ""}
        <div class="hero-text">
          <div class="title">${esc(this.cardTitle("c_main"))}</div>
          <button class="status ${STATUS_TONE[status] || "ok"}" data-act="info" data-key="work_status">${esc(t(h, this.burying() ? "st_burying" : `st_${status}`))}</button>
          <div class="auto-line sub"></div>
        </div>
      </div>
      ${chips ? `<div class="chips">${chips}</div>` : ""}
      ${c.show_stats ? `<div class="stats three">
        ${stat("visits_today", "mdi:paw", t(h, "visits_today"))}
        ${stat("cleanings_today", "mdi:broom", t(h, "cleanings_today"))}
        ${stat("last_cat_weight", "mdi:cat", lastLabel)}
      </div>` : ""}
      ${catRow ? `<div class="cat-row">${catRow}</div>` : ""}
      ${c.show_actions ? `<div class="actions">
        ${[["clean", "mdi:broom", "cleaning"], ["level", "mdi:waves", "leveling"], ["empty", "mdi:delete-empty", "clearing"]].filter(([k]) => map[k]).map(([k, icon, running]) =>
          status === running && map.stop
            ? `<button class="action stop" data-act="stop" aria-label="${esc(t(h, "stop"))}"><ha-icon icon="mdi:stop-circle-outline"></ha-icon>${esc(t(h, "stop"))}</button>`
            : `<button class="action" data-act="press" data-key="${k}" ${dis}><ha-icon icon="${icon}"></ha-icon>${esc(t(h, k))}</button>`).join("")}
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
  static defaults = { range: "today", max_items: 20, show_cleanings: true, show_burying: true, show_alerts: true };
  static getConfigElement() { return document.createElement("uahpet-litterbox-timeline-card-editor"); }
  static getStubConfig(hass) { return { device_id: litterDevices(hass)[0] || "" }; }

  extraKey() {
    // Re-fetch history when one of the timeline sources changes.
    const src = catSource(this._hass, this._dev);
    const ids = this._sources().concat(src?.lastVisit || []);
    const sig = ids.map((id) => this._hass.states[id]?.last_updated).join("|") + JSON.stringify(this._config);
    if (sig !== this._sig) { this._sig = sig; this._fetch(); }
    return `${this._version || 0}`;
  }

  _sources() {
    const keys = ["visit", "work_status", "last_bin_emptied", ...(this._config.show_alerts ? [...ALERTS, BIN_OPEN] : [])];
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
      // The cat sensor only carries the latest 20 visits; the integration gives the rest.
      const src = catSource(this._hass, this._dev);
      if (src?.ws.device_id) {
        try {
          const res = await this._hass.callWS({ ...src.ws, limit: 300 });
          this._catHistory = res.history || [];
        } catch (e) { this._catHistory = null; }
      }
      this._version = (this._version || 0) + 1;
      this._key = null;
      this._render();
    }, 300);
  }

  _events() {
    const h = this._hass, hist = this._history || {}, m = this._map, start = this._start().getTime();
    const items = [];
    const src = catSource(h, this._dev);
    const cats = (this._catHistory || (src && h.states[src.lastVisit]?.attributes?.history) || []).map((v) => ({ ...v, ts: Date.parse(v.time) }));
    // visits
    let attrs = {};
    for (const row of hist[m.visit] || []) {
      if (row.a) attrs = row.a;
      const ts = Date.parse(row.s);
      // event_type is "visit", or the cat's name / "unidentified" with cat profiles
      if (isNaN(ts) || ts < start || !attrs.event_type) continue;
      const match = attrs.cat ? { cat: attrs.cat } : cats.find((v) => Math.abs(v.ts - ts) < 120000);
      const cat = match ? (match.cat === "unidentified" ? t(h, "unidentified") : match.cat) : null;
      const i = src && match ? src.cats.findIndex((x) => x.name === match.cat) : -1;
      const color = i >= 0 ? catColor(h, src.cats[i], i, this._config) : match?.cat === "unidentified" ? GREY : null;
      items.push({ ts, kind: "visit", icon: "mdi:paw", duration: attrs.duration, weight: attrs.weight, cat, color });
    }
    // cleanings, emptying, levelling. A "cleaning" well before the clean delay after a visit is the
    // litter box burying the waste, not the automatic clean that follows the delay.
    if (this._config.show_cleanings) {
      const visitTimes = items.filter((i) => i.kind === "visit").map((i) => i.ts).sort((a, b) => a - b);
      const delay = num(this._state("clean_delay"));
      let prev = null;
      for (const row of hist[m.work_status] || []) {
        const ts = tsOf(row);
        if (row.s !== prev && ["cleaning", "clearing", "leveling"].includes(row.s) && ts >= start) {
          const visit = visitTimes.filter((v) => v <= ts + 15000).pop();
          if (row.s === "cleaning" && visit && delay > 90 && (ts - visit) / 1000 < delay - 30) {
            if (this._config.show_burying) items.push({ ts, kind: "bury", icon: "mdi:shovel", text: t(h, "ev_burying") });
          } else {
            const icon = { cleaning: "mdi:broom", clearing: "mdi:delete-empty", leveling: "mdi:waves" }[row.s];
            items.push({ ts, kind: "status", icon, text: t(h, `ev_${row.s}`) });
          }
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
      for (const key of [...ALERTS, BIN_OPEN]) {
        let prev = null;
        for (const row of hist[m[key]] || []) {
          const ts = tsOf(row);
          if (row.s === "on" && prev !== "on" && prev !== null && ts >= start) {
            items.push(key === BIN_OPEN
              ? { ts, kind: "bin", icon: ALERT_ICONS[key], text: t(h, "ev_bin_opened") }
              : { ts, kind: "alert", icon: ALERT_ICONS[key], text: t(h, `a_${key}`) });
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
        <span class="tl-dot"${e.color ? ` style="--cat:${esc(e.color)}"` : ""}><ha-icon icon="${e.icon}"></ha-icon></span><span class="tl-text">${esc(text)}</span>${extra}</li>`;
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
    const W = 300, TH = this._chartH(W, 146), H = TH - 26, pad = 6;
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
    return `<div class="chart-box"><svg class="chart" viewBox="0 -4 ${W} ${TH}" role="img">${marks}<g class="xl">${labels}</g></svg></div>`;
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
      <div class="stepper"><button data-act="step" data-key="${key}" data-val="${-step}" aria-label="−" ${isOff(s) ? "disabled" : ""}><ha-icon icon="mdi:minus"></ha-icon></button>
      <span class="val">${v === null ? "—" : esc(fmt(v))}</span>
      <button data-act="step" data-key="${key}" data-val="${step}" aria-label="+" ${isOff(s) ? "disabled" : ""}><ha-icon icon="mdi:plus"></ha-icon></button></div></div>`;
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
      ${sec(t(h, "sec_litter"), this._segment("litter_type", t(h, "litter_type"), t(h, "h_litter"), (o) => t(h, `lt_${o}`)))}
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
    const binOpen = this._state(BIN_OPEN)?.state === "on" && !alerts.includes("bin_misplaced");
    const info = binOpen ? `<li class="fix info"><ha-icon icon="${ALERT_ICONS[BIN_OPEN]}"></ha-icon><div><div class="fix-t">${esc(t(h, `a_${BIN_OPEN}`))}</div>
        <div class="help">${esc(t(h, `s_${BIN_OPEN}`))}</div></div></li>` : "";
    const list = info + alerts.map((k) => {
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

  handle(act) {
    if (act === "press") this._call("button", "press", "clean");
    else if (act === "stop") this._call("button", "press", "stop");
  }

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
      ${BUSY.includes(status) && this._map.stop
        ? `<button class="round stop" data-act="stop" aria-label="${esc(t(h, "stop"))}"><ha-icon icon="mdi:stop"></ha-icon></button>`
        : this._map.clean ? `<button class="round" data-act="press" aria-label="${esc(t(h, "clean"))}" ${status === "offline" ? "disabled" : ""}>
        <ha-icon icon="mdi:broom"></ha-icon></button>` : ""}
    </div>`;
  }
}

/* ---------- cats (UAHPET cat profiles or Litter Cat Identifier) ---------- */

class CatCardBase extends LitterCard {
  lookup() {
    const r = entityMap(this._hass, this._config.device_id);
    this._src = catSource(this._hass, r.dev);
    return r;
  }
  extraKey() { return catIds(this._src).map((id) => this._hass.states[id]?.last_updated).join("|"); }
  noCats() {
    return `<div class="empty">${esc(t(this._hass, "no_cats"))}</div>${this.addControls(true)}`;
  }

  /** UAHPET's own cats can be added from the card; the rest (photo, notifications…) in the integration. */
  canAdd() { return !!this._dev && (!this._src || this._src.kind === DOMAIN); }

  addControls(big = false) {
    const h = this._hass;
    if (!this.canAdd()) return "";
    if (this._adding) {
      const n = this._src ? this._src.cats.length : 0;
      return `<div class="addform">
        <label>${esc(t(h, "f_name"))}<input id="cat-name" type="text" autocomplete="off"></label>
        <label>${esc(t(h, "f_weight"))}<input id="cat-weight" type="number" min="0.5" max="15" step="0.05" value="4"></label>
        <label class="color">${esc(t(h, "f_color"))}<input id="cat-color" type="color" value="${PALETTE[n % PALETTE.length]}"></label>
        <div class="sub">${esc(t(h, "add_hint"))}</div>
        <div class="dlg-b"><button class="btn" data-act="add-cancel">${esc(t(h, "cancel"))}</button>
          <button class="btn primary" data-act="add-save">${esc(t(h, "add_btn"))}</button></div></div>`;
    }
    return `<div class="addrow ${big ? "big" : ""}">
      <button class="${big ? "btn primary" : "link"}" data-act="add-open"><ha-icon icon="mdi:plus"></ha-icon>${esc(t(h, "add_cat"))}</button>
      <button class="link" data-act="manage"><ha-icon icon="mdi:cog-outline"></ha-icon>${esc(t(h, "manage_cats"))}</button></div>`;
  }

  handleAdd(act) {
    const h = this._hass;
    if (act === "add-open") { this._adding = true; this._freeze = false; setTimeout(() => { this._freeze = true; this.shadowRoot.getElementById("cat-name")?.focus(); }, 0); return true; }
    if (act === "add-cancel") { this._adding = false; this._freeze = false; return true; }
    if (act === "manage") {
      history.pushState(null, "", `/config/integrations/integration/${DOMAIN}`);
      window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
      return true;
    }
    if (act === "add-save") {
      const root = this.shadowRoot;
      const name = root.getElementById("cat-name")?.value.trim();
      const weight = parseFloat(root.getElementById("cat-weight")?.value);
      if (!name || !(weight > 0)) { root.getElementById(name ? "cat-weight" : "cat-name")?.focus(); return true; }
      const entry = h.devices?.[this._dev]?.config_entries?.[0];
      h.callService(DOMAIN, "add_cat", { name, weight, color: root.getElementById("cat-color")?.value, ...(entry ? { config_entry_id: entry } : {}) });
      this._adding = false; this._freeze = false;
      return true;
    }
    return false;
  }

  tile(cat, big = false) {
    const h = this._hass, c = this._config;
    const color = catColor(h, cat, this._src.cats.indexOf(cat), c);
    const w = num(h.states[cat.weight]);
    const visits = h.states[cat.visits]?.state ?? "0";
    const last = h.states[cat.last];
    const lastTxt = known(last) ? t(h, "last_at", { t: fmtClock(h, new Date(last.state)) }) : t(h, "never");
    const health = h.states[cat.health];
    const alerts = health?.state === "on" ? (health.attributes.reasons || []).map((r) => t(h, `hl_${r}`, { v: health.attributes[r] })) : [];
    const pic = c.show_photo !== false && catPicture(h, cat);
    const size = Number(c.avatar_size) || 0;
    const sub = [c.show_visits !== false ? t(h, "today_n", { n: visits }) : "", c.show_last !== false ? lastTxt : ""].filter(Boolean).join(" · ");
    return `<button class="cat-tile ${big ? "big" : ""} ${c.layout === "vertical" ? "vertical" : ""} ${alerts.length ? "sick" : ""}" data-act="cat" data-val="${esc(cat.weight || cat.visits)}"
      ${size ? `style="--avatar:${size}px"` : ""}>
      ${pic ? `<img class="avatar" src="${esc(pic)}" alt="">` : `<span class="avatar" style="color:${esc(color)}"><ha-icon icon="mdi:cat"></ha-icon></span>`}
      <span class="cat-body"><span class="cat-name">${esc(cat.name)}</span>
        ${c.show_weight !== false && w !== null ? `<span class="cat-kg">${esc(fmtNum(h, w, 2))} kg</span>` : ""}
        ${sub ? `<span class="sub">${esc(sub)}</span>` : ""}
        ${alerts.map((a) => `<span class="cat-alert"><ha-icon icon="mdi:heart-pulse"></ha-icon>${esc(a)}</span>`).join("")}</span></button>`;
  }

  handle(act, key, val) {
    if (this.handleAdd(act)) return;
    if (act === "cat" && val) fire(this, "hass-more-info", { entityId: val });
  }
}

class UahpetCatsCard extends CatCardBase {
  static defaults = { columns: 2, layout: "horizontal", show_photo: true, show_weight: true, show_visits: true, show_last: true, show_add: true };
  static getConfigElement() { return document.createElement("uahpet-cats-card-editor"); }
  static getStubConfig() { return {}; }
  body() {
    const h = this._hass, c = this._config;
    const head = c.title === "" ? "" : `<div class="card-head"><div class="title">${esc(c.title || t(h, "cats"))}</div></div>`;
    if (!this._src) return head + this.noCats();
    const wanted = Array.isArray(c.cats) && c.cats.length ? c.cats : null;
    const tiles = this._src.cats.filter((cat) => !wanted || wanted.includes(cat.name)).map((cat) => this.tile(cat)).join("");
    return `${head}<div class="cat-grid" style="--cols:${Number(c.columns) || 2}">${tiles}</div>${c.show_add !== false ? this.addControls() : ""}`;
  }
}

class UahpetCatCard extends CatCardBase {
  static defaults = { layout: "horizontal", show_photo: true, show_weight: true, show_visits: true, show_last: true };
  static getConfigElement() { return document.createElement("uahpet-cat-card-editor"); }
  static getStubConfig(hass) { return { cat: catSource(hass, litterDevices(hass)[0])?.cats[0]?.name || "" }; }
  getCardSize() { return 2; }
  body() {
    if (!this._src) return this.noCats();
    const cat = this._src.cats.find((x) => x.name === this._config.cat);
    return cat ? this.tile(cat, true) : `<div class="empty">${esc(t(this._hass, "pick_cat"))}</div>`;
  }
}

class UahpetVisitsCard extends CatCardBase {
  static defaults = { count: 8, collapsible: false, expanded_count: 20, show_weight: true, show_duration: true, show_unidentified: true, show_toggle: true };
  static getConfigElement() { return document.createElement("uahpet-visits-card-editor"); }
  static getStubConfig() { return { count: 8 }; }

  extraKey() { return `${super.extraKey()}|${this._mode}|${this._fullVersion || 0}`; }

  _wanted() {
    const c = this._config, count = Number(c.count) || 8;
    if (!c.collapsible) return count;
    if (this._mode === "all") return Infinity;
    if (this._mode === "expanded") return Math.max(count, Number(c.expanded_count) || 20);
    return count;
  }

  handle(act, key, val) {
    const h = this._hass, src = this._src;
    if (act === "mode") this._mode = val;
    else if (act === "unk-toggle" && src?.showSwitch) h.callService("switch", "toggle", { entity_id: src.showSwitch });
    else if (act === "unk-clear" && src?.clearButton) {
      this._ask(t(h, "dlg_clear_t"), t(h, "dlg_clear"), () => h.callService("button", "press", { entity_id: src.clearButton }), t(h, "dlg_clear_ok"));
    } else super.handle(act, key, val);
  }

  async _fetch(limit, key) {
    this._fullKey = key;
    try {
      const res = await this._hass.callWS({ ...this._src.ws, limit: limit === Infinity ? 0 : limit });
      if (this._fullKey !== key) return;
      this._full = res.history;
      this._total = res.total;
    } catch (e) { this._full = null; }
    this._fullVersion = (this._fullVersion || 0) + 1;
    this._key = null;
    this._render();
  }

  body() {
    const h = this._hass, c = this._config;
    const head = `<div class="card-head"><div class="title">${esc(c.title || t(h, "visits_card"))}</div></div>`;
    if (!this._src) return head + this.noCats();
    const latest = h.states[this._src.lastVisit]?.attributes?.history || [];
    const wanted = this._wanted();
    let all = latest, loading = false;
    if (wanted > latest.length && latest.length >= 20 && h.callWS) {
      const key = `${h.states[this._src.lastVisit]?.last_updated}|${wanted}`;
      if (this._fullKey === key && this._full) all = this._full;
      else { loading = true; if (this._fullKey !== key) this._fetch(wanted, key); }
    }
    // card option and the integration's "show unidentified visits" switch must both allow them
    const hiding = h.states[this._src.showSwitch]?.state === "off";
    const visits = c.show_unidentified && !hiding ? all : all.filter((v) => v.cat !== "unidentified");
    const unk = all.filter((v) => v.cat === "unidentified").length;
    const tools = c.show_toggle && (unk || hiding) ? `<div class="tools">
      ${this._src.showSwitch ? `<button class="link" data-act="unk-toggle"><ha-icon icon="${hiding ? "mdi:eye-outline" : "mdi:eye-off-outline"}"></ha-icon>${esc(hiding ? t(h, "show_unk", { n: unk }) : t(h, "hide_unk"))}</button>` : ""}
      ${this._src.clearButton && unk ? `<button class="link" data-act="unk-clear"><ha-icon icon="mdi:broom"></ha-icon>${esc(t(h, "clear_unk"))}</button>` : ""}</div>` : "";
    if (!visits.length) return `${head}${tools}<div class="empty">${esc(t(h, "no_events"))}</div>`;
    const shown = visits.slice(0, wanted);
    const rows = shown.map((v) => {
      const d = new Date(v.time);
      const today = d.toDateString() === new Date().toDateString();
      const when = today ? fmtClock(h, d) : `${new Intl.DateTimeFormat(locale(h), { day: "numeric", month: "short" }).format(d)} ${fmtClock(h, d)}`;
      let cat = esc(v.cat);
      if (v.cat === "unidentified") {
        const why = v.reason ? t(h, `r_${v.reason}`, { cat: v.likely_cat || "?" }) : "";
        cat = `<span class="unk">${esc(t(h, "unidentified"))}</span>${why ? `<span class="why">${esc(why)}</span>` : ""}`;
      }
      return `<tr><td class="when">${esc(when)}</td><td>${cat}</td>
        ${c.show_weight ? `<td class="n">${typeof v.weight === "number" ? `${esc(fmtNum(h, v.weight, 2))} kg` : "—"}</td>` : ""}
        ${c.show_duration ? `<td class="n">${typeof v.duration === "number" ? esc(fmtDur(v.duration)) : "—"}</td>` : ""}</tr>`;
    }).join("");
    const th = `<tr><th>${esc(t(h, "th_time"))}</th><th>${esc(t(h, "th_cat"))}</th>${c.show_weight ? `<th class="n">${esc(t(h, "th_weight"))}</th>` : ""}${c.show_duration ? `<th class="n">${esc(t(h, "th_duration"))}</th>` : ""}</tr>`;
    let foot = "";
    if (c.collapsible) {
      const count = Number(c.count) || 8, expanded = Math.max(count, Number(c.expanded_count) || 20), mode = this._mode || "collapsed";
      const btn = (m, icon, label) => `<button class="link" data-act="mode" data-val="${m}"><ha-icon icon="${icon}"></ha-icon>${esc(label)}</button>`;
      const btns = [];
      if (loading) btns.push(`<span class="sub">${esc(t(h, "loading"))}</span>`);
      if (mode === "collapsed" && expanded > count && (visits.length > count || latest.length >= 20)) btns.push(btn("expanded", "mdi:chevron-down", t(h, "more")));
      if (mode !== "all" && (visits.length > shown.length || latest.length >= 20)) btns.push(btn("all", "mdi:history", `${t(h, "all_hist")}${this._total ? ` (${this._total})` : ""}`));
      if (mode !== "collapsed") btns.push(btn("collapsed", "mdi:chevron-up", t(h, "less")));
      foot = btns.length ? `<div class="foot">${btns.join("")}</div>` : "";
    }
    return `${head}${tools}<div class="tbl ${shown.length > 20 ? "scroll" : ""}"><table>${th}${rows}</table></div>${foot}`;
  }
}

const PALETTE = ["#4e79a7", "#f28e2b", "#59a14f", "#e15759", "#b07aa1", "#edc948", "#76b7b2", "#ff9da7"];
const GREY = "#9e9e9e";

class UahpetVisitsChartCard extends CatCardBase {
  static defaults = { days: 7, show_unidentified: true };
  static getConfigElement() { return document.createElement("uahpet-visits-chart-card-editor"); }
  static getStubConfig() { return { days: 7 }; }

  handle(act, key, val) {
    if (act === "days") { this._days = Number(val); this._picked = null; }
    else if (act === "day") this._picked = this._picked === Number(val) ? null : Number(val);
    else if (act === "leg") { const s = new Set(this._hidden || []); s.has(val) ? s.delete(val) : s.add(val); this._hidden = s; }
  }

  _range() { return this._days || Number(this._config.days) || 7; }

  _series() {
    const h = this._hass, src = this._src;
    const list = src.cats.map((c, i) => ({ name: c.name, id: c.visits, color: catColor(h, c, i, this._config) }));
    if (this._config.show_unidentified && src.unidentified) list.push({ name: t(h, "unidentified"), id: src.unidentified, color: GREY });
    return list;
  }

  extraKey() {
    const days = this._range();
    if (this._src && this._hass.callWS && (!this._fetchedAt || Date.now() - this._fetchedAt > 300000 || this._fetchedDays !== days)) this._fetch(days);
    return `${super.extraKey()}|${this._version || 0}|${days}|${this._picked}|${[...(this._hidden || [])].join(",")}`;
  }

  async _fetch(days) {
    this._fetchedAt = Date.now();
    this._fetchedDays = days;
    const start = startOfToday();
    start.setDate(start.getDate() - (days - 1));
    try {
      this._stats = await this._hass.callWS({
        type: "recorder/statistics_during_period", start_time: start.toISOString(),
        statistic_ids: this._series().map((s) => s.id).filter(Boolean), period: "day", types: ["change"],
      });
    } catch (e) { this._stats = {}; }
    this._version = (this._version || 0) + 1;
    this._key = null;
    this._render();
  }

  body() {
    const h = this._hass, c = this._config, days = this._range();
    const range = [7, 30].map((d) => `<button class="chip ${d === days ? "sel" : ""}" data-act="days" data-val="${d}">${esc(t(h, "days_n", { n: d }))}</button>`).join("");
    const head = `<div class="card-head"><div class="title">${esc(c.title || t(h, "chart"))}</div><div class="range">${range}</div></div>`;
    if (!this._src) return head + this.noCats();
    if (!this._stats) return `${head}<div class="empty">${esc(t(h, "loading"))}</div>`;
    const start = startOfToday();
    start.setDate(start.getDate() - (days - 1));
    const dayAt = (i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; };
    const series = this._series().map((s) => {
      const byDay = {};
      for (const row of this._stats[s.id] || []) byDay[new Date(typeof row.start === "number" ? row.start : Date.parse(row.start)).toDateString()] = row.change || 0;
      const values = Array.from({ length: days }, (_, i) => byDay[dayAt(i).toDateString()] || 0);
      const live = num(h.states[s.id]);
      if (live !== null) values[days - 1] = live;
      return { ...s, values };
    });
    const hidden = this._hidden || new Set();
    const shown = series.filter((s) => !hidden.has(s.name));
    const W = 320, H = this._chartH(W, 160) - 20, top = 14, slot = W / days, group = slot * 0.82, bw = shown.length ? group / shown.length : 0;
    const max = Math.max(1, ...shown.flatMap((s) => s.values));
    let bars = "", labels = "", hits = "";
    for (let i = 0; i < days; i++) {
      const x0 = slot * i + (slot - group) / 2;
      shown.forEach((s, j) => {
        const v = s.values[i], bh = (v / max) * (H - top);
        if (v > 0) {
          bars += `<rect x="${(x0 + j * bw + 0.5).toFixed(2)}" y="${(H - bh).toFixed(2)}" width="${Math.max(1, bw - 1).toFixed(2)}" height="${bh.toFixed(2)}" rx="${Math.min(3, bw / 3).toFixed(2)}" fill="${esc(s.color)}"/>`;
          if (days <= 7 && bw >= 9) bars += `<text class="v" x="${(x0 + j * bw + bw / 2).toFixed(2)}" y="${(H - bh - 3).toFixed(2)}">${v}</text>`;
        }
      });
      if (days <= 7 || i % 5 === (days - 1) % 5) {
        const label = days <= 7 ? new Intl.DateTimeFormat(locale(h), { weekday: "short" }).format(dayAt(i)) : dayAt(i).getDate();
        labels += `<text class="x ${i === days - 1 ? "today" : ""}" x="${(slot * i + slot / 2).toFixed(2)}" y="${H + 14}">${esc(label)}</text>`;
      }
      hits += `<rect class="hit ${this._picked === i ? "picked" : ""}" data-act="day" data-val="${i}" x="${(slot * i).toFixed(2)}" y="0" width="${slot.toFixed(2)}" height="${H}"/>`;
    }
    const summary = this._picked !== null && this._picked !== undefined
      ? `${new Intl.DateTimeFormat(locale(h), { weekday: "long", day: "numeric", month: "short" }).format(dayAt(this._picked))}: ${shown.map((s) => `${s.name} ${s.values[this._picked]}`).join(" · ")}`
      : t(h, "last_days", { n: days });
    const legend = series.map((s) => {
      const total = s.values.reduce((a, b) => a + b, 0);
      return `<button class="leg ${hidden.has(s.name) ? "off" : ""}" data-act="leg" data-val="${esc(s.name)}" aria-pressed="${!hidden.has(s.name)}">
        <span class="dot" style="background:${esc(s.color)}"></span>${esc(s.name)}<span class="sub">${total} · ${esc(t(h, "per_day", { v: fmtNum(h, total / days) }))}</span></button>`;
    }).join("");
    return `${head}<div class="sub">${esc(summary)}</div>
      <div class="chart-box"><svg class="gchart" viewBox="0 0 ${W} ${H + 20}" role="img"><line class="axis" x1="0" x2="${W}" y1="${H + 0.5}" y2="${H + 0.5}"/>
      <text class="max" x="0" y="9">${max}</text>${hits}${bars}${labels}</svg></div><div class="legend">${legend}</div>`;
  }
}

/* ---------- weight per cat ---------- */

class UahpetWeightChartCard extends CatCardBase {
  static defaults = { days: 30 };
  static getConfigElement() { return document.createElement("uahpet-weight-chart-card-editor"); }
  static getStubConfig() { return { days: 30 }; }

  _range() { return this._days || Number(this._config.days) || 30; }

  handle(act, key, val) {
    if (act === "days") { this._days = Number(val); this._picked = null; }
    else if (act === "slot") this._picked = this._picked === Number(val) ? null : Number(val);
    else if (act === "leg") { const s = new Set(this._hidden || []); s.has(val) ? s.delete(val) : s.add(val); this._hidden = s; }
  }

  extraKey() {
    const days = this._range();
    if (this._src && this._hass.callWS && (!this._fetchedAt || Date.now() - this._fetchedAt > 600000 || this._fetchedDays !== days)) this._fetch(days);
    return `${super.extraKey()}|${this._version || 0}|${days}|${this._picked}|${[...(this._hidden || [])].join(",")}`;
  }

  async _fetch(days) {
    this._fetchedAt = Date.now();
    this._fetchedDays = days;
    try {
      this._stats = await this._hass.callWS({
        type: "recorder/statistics_during_period", start_time: new Date(Date.now() - days * 86400000).toISOString(),
        statistic_ids: this._src.cats.map((c) => c.weight).filter(Boolean), period: days <= 7 ? "hour" : "day", types: ["mean"],
      });
    } catch (e) { this._stats = {}; }
    this._version = (this._version || 0) + 1;
    this._key = null;
    this._render();
  }

  body() {
    const h = this._hass, c = this._config, days = this._range();
    const range = [7, 30, 90].map((d) => `<button class="chip ${d === days ? "sel" : ""}" data-act="days" data-val="${d}">${esc(t(h, "days_n", { n: d }))}</button>`).join("");
    const head = `<div class="card-head"><div class="title">${esc(c.title || t(h, "weight_chart"))}</div><div class="range">${range}</div></div>`;
    if (!this._src) return head + this.noCats();
    if (!this._stats) return `${head}<div class="empty">${esc(t(h, "loading"))}</div>`;
    const tsOfRow = (row) => (typeof row.start === "number" ? row.start : Date.parse(row.start));
    const series = this._src.cats.map((cat, i) => {
      const pts = new Map((this._stats[cat.weight] || []).filter((r) => r.mean != null).map((r) => [tsOfRow(r), r.mean]));
      const live = num(h.states[cat.weight]);
      if (live !== null) pts.set(Date.now(), live);  // the current learned weight closes the line
      return { name: cat.name, color: catColor(h, cat, i, c), pts };
    });
    const hidden = this._hidden || new Set();
    const shown = series.filter((s) => !hidden.has(s.name));
    const times = [...new Set(shown.flatMap((s) => [...s.pts.keys()]))].sort((a, b) => a - b);
    const values = shown.flatMap((s) => [...s.pts.values()]);
    if (!times.length || !values.length) return `${head}<div class="empty">${esc(t(h, "no_data"))}</div>`;
    const W = 320, H = this._chartH(W, 170) - 20, padY = 14;
    const vmin = Math.min(...values), vmax = Math.max(...values);
    let lo = vmin, hi = vmax;
    if (hi - lo < 0.4) { const mid = (hi + lo) / 2; lo = mid - 0.2; hi = mid + 0.2; }
    lo -= (hi - lo) * 0.08; hi += (hi - lo) * 0.08;
    const t0 = times[0], t1 = times[times.length - 1] === t0 ? t0 + 1 : times[times.length - 1];
    const X = (ts) => ((ts - t0) / (t1 - t0)) * W, Y = (v) => H - padY - ((v - lo) / (hi - lo)) * (H - 2 * padY);
    let lines = "";
    for (const s of shown) {
      const pts = [...s.pts.entries()].sort((a, b) => a[0] - b[0]);
      lines += `<polyline class="wline" stroke="${esc(s.color)}" points="${pts.map(([ts, v]) => `${X(ts).toFixed(1)},${Y(v).toFixed(1)}`).join(" ")}"/>`;
      if (pts.length <= 40) lines += pts.map(([ts, v]) => `<circle class="wdot" cx="${X(ts).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="2.6" fill="${esc(s.color)}"/>`).join("");
    }
    const slots = times.length;
    let hits = "", picked = "";
    times.forEach((ts, i) => {
      const x0 = i === 0 ? 0 : (X(times[i - 1]) + X(ts)) / 2, x1 = i === slots - 1 ? W : (X(ts) + X(times[i + 1])) / 2;
      hits += `<rect class="hit" data-act="slot" data-val="${i}" x="${x0.toFixed(1)}" y="0" width="${Math.max(1, x1 - x0).toFixed(1)}" height="${H}"/>`;
    });
    if (this._picked !== null && this._picked !== undefined && times[this._picked] !== undefined) {
      const x = X(times[this._picked]);
      picked = `<line class="cursor" x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="0" y2="${H}"/>`;
    }
    const fmtDay = (ts) => new Intl.DateTimeFormat(locale(h), days <= 7 ? { weekday: "short", hour: "2-digit", minute: "2-digit" } : { day: "numeric", month: "short" }).format(new Date(ts));
    const labels = `<line class="grid" x1="0" x2="${W}" y1="${Y(vmax).toFixed(1)}" y2="${Y(vmax).toFixed(1)}"/>
      <line class="grid" x1="0" x2="${W}" y1="${Y(vmin).toFixed(1)}" y2="${Y(vmin).toFixed(1)}"/>
      <text class="ylab" x="0" y="${(Y(vmax) - 3).toFixed(1)}">${esc(fmtNum(h, vmax, 2))} kg</text>
      <text class="ylab" x="0" y="${(Y(vmin) + 11).toFixed(1)}">${esc(fmtNum(h, vmin, 2))} kg</text>
      <text class="x" x="2" y="${H + 14}" text-anchor="start">${esc(new Intl.DateTimeFormat(locale(h), { day: "numeric", month: "short" }).format(new Date(t0)))}</text>
      <text class="x today" x="${W - 2}" y="${H + 14}" text-anchor="end">${esc(t(h, "today_h"))}</text>`;
    let summary;
    if (this._picked !== null && this._picked !== undefined && times[this._picked] !== undefined) {
      const ts = times[this._picked];
      summary = `${fmtDay(ts)}: ${shown.filter((s) => s.pts.has(ts)).map((s) => `${s.name} ${fmtNum(h, s.pts.get(ts), 2)} kg`).join(" · ")}`;
    } else summary = t(h, "last_days", { n: days });
    const legend = series.map((s) => {
      const pts = [...s.pts.entries()].sort((a, b) => a[0] - b[0]);
      const last = pts.length ? pts[pts.length - 1][1] : null, first = pts.length ? pts[0][1] : null;
      const delta = last !== null && first !== null ? last - first : null;
      const d = delta === null ? "" : `${delta > 0 ? "+" : delta < 0 ? "−" : "±"}${fmtNum(h, Math.abs(delta), 2)}`;
      return `<button class="leg ${hidden.has(s.name) ? "off" : ""}" data-act="leg" data-val="${esc(s.name)}" aria-pressed="${!hidden.has(s.name)}">
        <span class="dot" style="background:${esc(s.color)}"></span>${esc(s.name)}
        ${last !== null ? `<b>${esc(fmtNum(h, last, 2))} kg</b>` : ""}${d ? `<span class="sub">${esc(t(h, "change", { v: d, n: days }))}</span>` : ""}</button>`;
    }).join("");
    return `${head}<div class="sub">${esc(summary)}</div>
      <div class="chart-box"><svg class="gchart wchart" viewBox="0 0 ${W} ${H + 20}" role="img"><line class="axis" x1="0" x2="${W}" y1="${H + 0.5}" y2="${H + 0.5}"/>
      ${hits}${picked}${lines}${labels}</svg></div><div class="legend">${legend}</div>`;
  }
}

/* ---------- compact maintenance ---------- */

class UahpetMaintenanceMiniCard extends LitterCard {
  static getConfigElement() { return document.createElement("uahpet-litterbox-maintenance-mini-card-editor"); }
  static getStubConfig(hass) { return { device_id: litterDevices(hass)[0] || "" }; }
  getCardSize() { return 1; }
  getGridOptions() { return { columns: 6, min_columns: 4, rows: 1 }; }
  body() {
    const h = this._hass;
    if (!this._map.work_status) return this.notFound();
    const bin = this._state("bin_status");
    const emptied = this._state("last_bin_emptied");
    const alerts = ALERTS.filter((k) => this._state(k)?.state === "on");
    const tone = alerts.length ? "bad" : !known(bin) || bin.state === "bin_normal" ? "ok" : "warn";
    const title = alerts.length ? t(h, `a_${alerts[0]}`) + (alerts.length > 1 ? ` +${alerts.length - 1}` : "") : known(bin) ? t(h, `bin_${bin.state}`) : t(h, "maintenance");
    const sub = known(emptied) ? t(h, "emptied_ago", { t: fmtAgo(h, new Date(emptied.state)) }) : t(h, "never_emptied");
    return `<div class="mini"><button class="badge small ${tone}" data-act="info" data-key="${alerts.length ? alerts[0] : "bin_status"}">
        <ha-icon icon="${alerts.length ? ALERT_ICONS[alerts[0]] : "mdi:delete-outline"}"></ha-icon></button>
      <div class="titles"><div class="title">${esc(title)}</div><div class="sub">${esc(sub)}</div></div>
      ${alerts.length ? `<span class="count bad">${alerts.length}</span>` : `<ha-icon class="ok-mark" icon="mdi:check-circle-outline"></ha-icon>`}</div>`;
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

  /** The fan entity has a speed setting but only one value: speeds can't be set (Tuya cloud). */
  _speedLocked(fan) { return !!fan && Number(fan.attributes.percentage_step) >= 100; }

  /** Spin time (s) of the fan icon: sleep is the slowest, then each speed; auto follows its current speed. */
  _spin(fan) {
    const mode = fan?.attributes.preset_mode;
    if (!fan || fan.state !== "on") return 3;
    if (mode === "sleep") return 5;
    const speeds = this._speeds(fan), pct = Number(fan.attributes.percentage) || 0;
    const idx = speeds.length && pct ? Math.max(0, Math.ceil((pct * speeds.length) / 100) - 1) : -1;
    if (idx < 0) return 2.4;
    const f = speeds.length > 1 ? idx / (speeds.length - 1) : 1;  // 0 slowest .. 1 fastest
    return Number((3.8 - 2.8 * f).toFixed(2));
  }

  /** Speeds the fan entity offers. A single one (the Tuya cloud's definition of this purifier) can't be chosen: none. */
  _speeds(fan) {
    const step = Number(fan.attributes.percentage_step);
    const n = step > 0 ? Math.round(100 / step) : 0;
    if (n <= 1) return [];
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
          <ha-icon class="${on ? "spin" : ""}" style="animation-duration:${this._spin(fan)}s"
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
      ${c.show_speed && this._speedLocked(fan) ? `<div class="group"><div class="glabel">${esc(t(this._hass, "speed"))}</div><div class="help">${esc(t(this._hass, "speed_cloud"))}</div></div>` : ""}
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


/* ---------- compact air purifier ---------- */

class UahpetPurifierMiniCard extends UahpetPurifierCard {
  static getConfigElement() { return document.createElement("uahpet-purifier-mini-card-editor"); }
  getCardSize() { return 1; }
  getGridOptions() { return { columns: 6, min_columns: 4, rows: 1 }; }
  body() {
    const h = this._hass;
    if (!this._map.fan) return `<div class="empty">${esc(t(h, "purifier_not_found"))}</div>`;
    const fan = this._state("fan"), offline = isOff(fan), on = fan?.state === "on";
    const pct = Number(fan?.attributes.percentage) || 0, mode = fan?.attributes.preset_mode;
    const aq = this._state("air_quality"), filter = this._state("filter_utilization");
    const tilted = mode === TILT_MODE;
    const sub = offline ? t(h, "offline") : tilted ? t(h, "tilted") : [
      on ? (mode ? t(h, `mode_${mode}`) : t(h, "on")) : t(h, "off"),
      known(aq) ? t(h, `aq_${aq.state}`) : "",
      known(filter) ? `${t(h, "filter")} ${Math.round(num(filter))} %` : "",
    ].filter(Boolean).join(" · ");
    return `<div class="mini"><button class="badge small ${tilted ? "bad" : on ? "busy" : offline ? "bad" : "idle"}" data-act="info" data-key="fan">
        <ha-icon class="${on ? "spin" : ""}" style="animation-duration:${this._spin(fan)}s" icon="${offline ? "mdi:lan-disconnect" : "mdi:fan"}"></ha-icon></button>
      <div class="titles"><div class="title">${esc(this._config.title || this._deviceName(this._dev) || t(h, "c_purifier"))}</div><div class="sub ${tilted ? "bad-text" : ""}">${esc(sub)}</div></div>
      <button class="power ${on ? "on" : ""}" data-act="power" aria-label="${esc(t(h, "power"))}" aria-pressed="${on}" ${offline ? "disabled" : ""}><ha-icon icon="mdi:power"></ha-icon></button></div>`;
  }
}

/* ---------- air purifier: status line + round buttons ---------- */

const SPEED_ICONS = ["mdi:fan-chevron-down", "mdi:fan-speed-1", "mdi:fan-speed-2", "mdi:fan-speed-3"];

class UahpetPurifierBarCard extends UahpetPurifierCard {
  static defaults = {};
  static getConfigElement() { return document.createElement("uahpet-purifier-bar-card-editor"); }
  getCardSize() { return 2; }

  handle(act, key, val) {
    if (act === "panel") this._panel = !this._panel;
    else if (act === "cycle") {
      const fan = this._state("fan"), speeds = fan ? this._speeds(fan) : [];
      if (!speeds.length) return;
      const pct = Number(fan.attributes.percentage) || 0;
      const idx = pct ? Math.max(0, Math.ceil((pct * speeds.length) / 100) - 1) : -1;
      this._call("fan", "set_percentage", "fan", { percentage: speeds[(idx + 1) % speeds.length].pct });
    } else super.handle(act, key, val);
  }

  extraKey() { return `${this._panel}`; }

  body() {
    const h = this._hass, c = this._config;
    if (!this._map.fan) return `<div class="empty">${esc(t(h, "purifier_not_found"))}</div>`;
    const fan = this._state("fan"), offline = isOff(fan), on = fan?.state === "on";
    const pct = Number(fan?.attributes.percentage) || 0, mode = fan?.attributes.preset_mode, tilted = mode === TILT_MODE;
    const speeds = fan ? this._speeds(fan) : [];
    const speedIdx = speeds.length && pct ? Math.max(0, Math.ceil((pct * speeds.length) / 100) - 1) : -1;
    const aq = this._state("air_quality"), filter = this._state("filter_utilization");
    // a display / backlight light, when the purifier has one (the UAHPET Slim does not)
    const display = this._state("backlight") || this._state("light");
    const aqTone = known(aq) ? AQ_TONE[aq.state] || "ok" : "idle";
    const line = offline ? t(h, "offline") : tilted ? t(h, "tilted") : [
      t(h, on ? "on" : "off"),
      on && mode ? t(h, `mode_${mode}`) : "",
      known(filter) ? `${t(h, "filter")} ${fmtNum(h, num(filter), 1)} %` : "",
      known(display) ? t(h, display.state === "on" ? "display_on" : "display_off") : "",
      known(aq) ? `${t(h, "air_short")}: ${t(h, `aq_${aq.state}`)}` : "",
    ].filter(Boolean).join(" · ");
    const dis = offline ? "disabled" : "";
    const btn = (act, icon, label, active, extra = "") =>
      `<button class="pbtn ${active ? "on" : ""}" data-act="${act}" ${extra} aria-label="${esc(label)}" aria-pressed="${!!active}" title="${esc(label)}" ${dis}><ha-icon icon="${icon}"></ha-icon></button>`;
    const modes = fan?.attributes.preset_modes || [];
    const buttons = [
      btn("power", "mdi:power", t(h, "power"), on),
      modes.includes("auto") ? btn("mode", "mdi:fan-auto", t(h, "auto_mode"), on && mode === "auto", 'data-val="auto"') : "",
      speeds.length ? btn("cycle", (speeds.length === 4 ? SPEED_ICONS : SPEED_ICONS.slice(1))[Math.max(0, speedIdx)] || "mdi:fan", t(h, "next_speed"), on && mode === "manual") : "",
      `<button class="pbtn ${this._panel ? "on" : ""}" data-act="panel" aria-label="${esc(t(h, "more_settings"))}" aria-expanded="${!!this._panel}" title="${esc(t(h, "more_settings"))}"><ha-icon icon="mdi:tune-variant"></ha-icon></button>`,
      modes.includes("sleep") ? btn("mode", "mdi:sleep", t(h, "sleep_mode_p"), on && mode === "sleep", 'data-val="sleep"') : "",
    ].join("");
    let panel = "";
    if (this._panel) {
      const timer = this._state("countdown"), lock = this._state("child_lock"), reset = this._map.filter_cartridge_reset;
      const seg = (act, items, active) => `<div class="seg">${items.map(([val, label]) => `<button class="${val === active ? "on" : ""}" data-act="${act}" data-val="${esc(val)}" ${dis}><span>${esc(label)}</span></button>`).join("")}</div>`;
      panel = `<div class="ppanel">
        ${this._speedLocked(fan) ? `<div class="help">${esc(t(h, "speed_cloud"))}</div>` : ""}
        ${speeds.length ? `<div class="group"><div class="glabel">${esc(t(h, "speed"))}</div>${seg("speed", speeds.map((x) => [String(x.pct), x.label]), on && speedIdx >= 0 ? String(speeds[speedIdx].pct) : null)}</div>` : ""}
        ${timer?.attributes.options?.length ? `<div class="group"><div class="glabel">${esc(t(h, "timer"))}</div>${seg("timer", timer.attributes.options.map((o) => [o, o === "cancel" ? t(h, "timer_cancel") : o]), timer.state)}</div>` : ""}
        ${lock || reset ? `<div class="toggles">
          ${lock ? `<button class="toggle ${lock.state === "on" ? "on" : ""}" data-act="toggle" data-key="child_lock" ${dis}><ha-icon icon="mdi:lock-outline"></ha-icon>${esc(t(h, "child_lock"))}</button>` : ""}
          ${reset ? `<button class="toggle ${this._armed === "filter_cartridge_reset" ? "armed" : ""}" data-act="reset" data-key="filter_cartridge_reset" ${dis}><ha-icon icon="mdi:restore"></ha-icon>${esc(t(h, this._armed === "filter_cartridge_reset" ? "confirm" : "filter_reset"))}</button>` : ""}
        </div>` : ""}</div>`;
    }
    return `<style>
        ha-card { padding: 12px 14px; gap: 10px; }
        .head { gap: 10px; } .head .badge { width: 40px; height: 40px; } .head .badge ha-icon { --mdc-icon-size: 22px; }
        .head .title { font-size: 1.02em; }
        .head .sub { font-size: .8em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pbar { padding: 4px 6px; } .pbtn { width: 38px; height: 38px; } .pbtn ha-icon { --mdc-icon-size: 21px; }
        .ppanel { gap: 10px; }
      </style><div class="head">
        <button class="badge ${tilted || offline ? "bad" : on ? aqTone : "idle"}" data-act="info" data-key="${known(aq) ? "air_quality" : "fan"}">
          <ha-icon class="${on ? "spin" : ""}" style="animation-duration:${this._spin(fan)}s" icon="${offline ? "mdi:lan-disconnect" : "mdi:fan"}"></ha-icon></button>
        <div class="titles"><div class="title">${esc(c.title || this._deviceName(this._dev) || t(h, "c_purifier"))}</div>
          <div class="sub ${tilted ? "bad-text" : ""}">${esc(line)}</div></div>
      </div>
      <div class="pbar">${buttons}</div>${panel}`;
  }
}

/* ---------- styles ---------- */

const STYLE = `<style>
  :host { display: block; height: 100%; }
  :host { --ok: var(--success-color, #43a047); --warn: var(--warning-color, #ffa000); --bad: var(--error-color, #db4437);
    --busy: var(--primary-color, #03a9f4); --muted: var(--secondary-text-color); --soft: var(--secondary-background-color, rgba(127,127,127,.08));
    --box-body: #4fb393; --box-base: #2a6b5a; --box-rim: #e6f0ec; --box-hole: #163a32; --box-litter: #e3c48c; }
  ha-card { padding: 16px; display: flex; flex-direction: column; gap: 14px; position: relative; overflow: hidden; height: 100%; box-sizing: border-box; }
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
  .art { --lg: #2c8a6f; --lg-soft: #5cc3a2; }
  .v-drum .shell { fill: var(--box-body); } .base { fill: var(--box-base); transition: fill .3s, stroke .3s; } .rim { fill: var(--box-rim); }
  .hole { fill: var(--box-hole); } .litter { fill: var(--box-litter); } .led { fill: #a8f2d6; }
  .drum circle { fill: none; stroke: rgba(255,255,255,.26); stroke-width: 3; stroke-dasharray: 7 9; }
  .drum { transform-box: fill-box; transform-origin: center; } .grains, .wave { transform-box: view-box; }
  .screen { fill: #2b3138; } .steel-rim { fill: #f1f4f6; } .v-cube .base { fill: var(--steel-base, #6e7a86); }
  .grains circle { fill: var(--box-litter); opacity: 0; }
  /* the cat inside, peeking out (live weight says a cat is in) */
  .peek-head { fill: var(--cat-color, #f7f1e7); } .peek-ear { fill: #f3b8b0; } .peek-eye { fill: var(--cat-eye, var(--box-hole)); } .peek-nose { fill: #e58f86; }
  .peek { opacity: 0; transition: opacity .4s; } .art.cat-in .peek, .art.cat-always .peek { opacity: 1; }
  .art.cat-always.s-cleaning .peek, .art.cat-always.s-clearing .peek, .art.cat-always.s-leveling .peek { opacity: 0; }
  /* the cat next to the box: a cat nearby (radar) */
  .cat path { fill: var(--cat-color, var(--primary-text-color)); opacity: .8; } .cat .eye { fill: var(--cat-eye, var(--card-background-color, #fff)); }
  .cat { opacity: 0; transition: opacity .3s; }
  .pulse circle { fill: none; stroke: var(--warn); stroke-width: 2; opacity: 0; transform-box: fill-box; transform-origin: center; }
  .v-circle .pulse circle { stroke-width: 5; }
  /* minimalist version: lines in the logo's green, soft fills */
  .min .shell, .min .base, .min .rim, .min .screen { stroke: var(--lg); stroke-width: 2.2px; vector-effect: non-scaling-stroke; }
  .min .shell { fill: color-mix(in srgb, var(--lg-soft) 16%, transparent); }
  .min .base { fill: color-mix(in srgb, var(--lg) 12%, transparent); }
  .min .rim { fill: var(--card-background-color, #fff); }
  .min .screen { fill: none; }
  .min .hole { fill: color-mix(in srgb, var(--lg-soft) 14%, transparent); }
  .min .litter { fill: color-mix(in srgb, var(--box-litter) 75%, transparent); }
  .min .drum circle { stroke: var(--lg); opacity: .5; }
  .min .led { fill: var(--lg-soft); } .min .cat path { opacity: 1; }
  .min .peek-head { fill: var(--cat-color, var(--card-background-color, #fff)); stroke: var(--lg); stroke-width: 1.6px; vector-effect: non-scaling-stroke; }
  .min .peek-ear { fill: color-mix(in srgb, var(--lg-soft) 40%, transparent); } .min .peek-eye { fill: var(--cat-eye, var(--lg)); } .min .peek-nose { fill: var(--lg); }
  .min .cat path { fill: var(--cat-color, var(--lg)); }
  .art.min.bin-full .base { fill: color-mix(in srgb, var(--bad) 12%, transparent); stroke: var(--bad); }
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
  .action.stop { background: var(--bad); color: var(--text-primary-color, #fff); }
  .toggle { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 18px;
    border: 1px solid var(--divider-color); color: var(--muted); }
  .toggle ha-icon { --mdc-icon-size: 18px; }
  .toggle.on { background: color-mix(in srgb, var(--primary-color) 15%, transparent); border-color: transparent; color: var(--primary-color); }
  .toggle.armed { background: var(--bad); border-color: transparent; color: var(--text-primary-color, #fff); }

  .cat-row { display: flex; flex-wrap: wrap; gap: 8px; }
  .cat-chip { display: inline-flex; align-items: center; gap: 8px; padding: 4px 12px 4px 4px; border-radius: 22px; background: var(--soft); }
  .cat-chip img, .cat-ic { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; flex: none; display: grid; place-items: center;
    background: var(--card-background-color, #fff); color: var(--primary-color); }
  .cat-ic ha-icon { --mdc-icon-size: 20px; }
  .cat-n { font-weight: 500; } .cat-v { color: var(--muted); font-variant-numeric: tabular-nums; }
  .cat-h { --mdc-icon-size: 18px; color: var(--bad); }
  .cat-chip.sick { background: color-mix(in srgb, var(--bad) 12%, transparent); }

  /* dialog */
  .dlg-back { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: grid; place-items: center; padding: 16px; z-index: 2; }
  .dlg { background: var(--card-background-color, #fff); border-radius: 16px; padding: 18px; max-width: 320px; box-shadow: 0 6px 24px rgba(0,0,0,.3); }
  .dlg-t { font-weight: 500; font-size: 1.05em; margin-bottom: 6px; }
  .dlg-x { color: var(--muted); }
  .dlg-b { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
  .btn { padding: 8px 14px; border-radius: 18px; color: var(--primary-color); font-weight: 500; }
  .btn.primary { background: var(--primary-color); color: var(--text-primary-color, #fff); }
  .dlg.danger .btn.primary { background: var(--bad); }
  .dlg-i { color: var(--bad); --mdc-icon-size: 28px; display: block; margin-bottom: 6px; }
  .btn.small { padding: 4px 12px; margin-top: 6px; font-size: .9em; }

  /* timeline */
  .summary { margin-top: -8px; }
  .timeline { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
  .timeline li { display: grid; grid-template-columns: 5.2em 28px 1fr auto; align-items: center; gap: 8px; padding: 6px 0; position: relative; }
  .timeline li:not(.day)::before { content: ""; position: absolute; left: calc(5.2em + 8px + 13px); top: 0; bottom: 0; width: 2px; background: var(--divider-color); }
  .timeline li:first-child::before { top: 50%; } .timeline li:last-child::before { bottom: 50%; }
  .timeline li.day { display: block; font-size: .8em; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; padding-top: 10px; }
  .tl-time { color: var(--muted); font-variant-numeric: tabular-nums; font-size: .9em; white-space: nowrap; }
  .tl-dot { width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; z-index: 1;
    background: var(--card-background-color, #fff); border: 2px solid var(--divider-color); }
  .tl-dot ha-icon { --mdc-icon-size: 16px; }
  .tl-visit .tl-dot { border-color: var(--cat, var(--primary-color)); color: var(--cat, var(--primary-color)); }
  .tl-alert .tl-dot { border-color: var(--bad); color: var(--bad); }
  .tl-status .tl-dot, .tl-bin .tl-dot, .tl-bury .tl-dot { color: var(--muted); }
  .tl-bury .tl-text { color: var(--muted); font-size: .9em; } .tl-bury .tl-dot { width: 22px; height: 22px; justify-self: center; }
  .tl-text { min-width: 0; }
  .tl-w { font-weight: 500; font-variant-numeric: tabular-nums; }

  /* stats */
  .range { display: flex; gap: 6px; }
  .big { font-size: 1.3em; font-weight: 500; font-variant-numeric: tabular-nums; }
  .chart { display: block; overflow: visible; }
  ha-card > * { flex-shrink: 0; }
  .chart-box { flex: 1 1 150px; min-height: 60px; position: relative; flex-shrink: 1; }
  .chart-box > svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
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
  .stepper button { width: 32px; height: 32px; border-radius: 50%; background: var(--soft); display: grid; place-items: center; padding: 0; }
  .stepper button ha-icon { --mdc-icon-size: 18px; display: flex; }
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
  .fix.info { background: color-mix(in srgb, var(--warn) 14%, transparent); } .fix.info > ha-icon { color: var(--warn); }
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
  .round.stop { background: var(--bad); color: var(--text-primary-color, #fff); }
  .power.on { background: var(--primary-color); border-color: transparent; color: var(--text-primary-color, #fff); }
  .alert { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 16px; font-size: .9em;
    background: color-mix(in srgb, var(--bad) 18%, transparent); color: var(--bad); }
  .alert ha-icon { --mdc-icon-size: 18px; }
  .group { display: flex; flex-direction: column; gap: 6px; }
  .glabel { font-size: .8em; color: var(--muted); }

  /* cats */
  .addrow { display: flex; justify-content: flex-end; gap: 14px; flex-wrap: wrap; }
  .addrow.big { justify-content: flex-start; align-items: center; }
  .addrow .btn { display: inline-flex; align-items: center; gap: 6px; }
  .addrow ha-icon, .btn ha-icon { --mdc-icon-size: 18px; }
  .addform { display: flex; flex-direction: column; gap: 10px; padding: 12px; border-radius: 14px; background: var(--soft); }
  .addform label { display: flex; flex-direction: column; gap: 4px; font-size: .85em; color: var(--muted); }
  .addform input { font: inherit; font-size: 1.1em; color: var(--primary-text-color); background: var(--card-background-color, #fff);
    border: 1px solid var(--divider-color); border-radius: 10px; padding: 8px 10px; }
  .addform label.color { flex-direction: row; align-items: center; justify-content: space-between; }
  .addform input[type="color"] { width: 48px; height: 32px; padding: 2px; }
  .addform .dlg-b { margin-top: 0; }
  .cat-grid { display: grid; grid-template-columns: repeat(var(--cols, 2), minmax(0, 1fr)); gap: 10px; }
  .cat-tile { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 14px; background: var(--soft); min-width: 0; }
  .cat-tile.big { background: none; padding: 0; }
  .cat-tile.sick { background: color-mix(in srgb, var(--bad) 10%, transparent); }
  .avatar { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; flex: none; display: grid; place-items: center;
    background: var(--card-background-color, #fff); color: var(--primary-color); }
  .cat-tile.big .avatar { width: var(--avatar, 72px); height: var(--avatar, 72px); background: var(--soft); }
  .cat-tile .avatar { width: var(--avatar, 52px); height: var(--avatar, 52px); }
  .cat-tile .avatar ha-icon { --mdc-icon-size: calc(var(--avatar, 52px) * .55); }
  .cat-tile.vertical { flex-direction: column; text-align: center; } .cat-tile.vertical .cat-body { align-items: center; width: 100%; }
  .avatar ha-icon { --mdc-icon-size: 28px; }
  .cat-body { display: flex; flex-direction: column; min-width: 0; }
  .cat-name { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cat-kg { font-size: 1.3em; font-weight: 500; font-variant-numeric: tabular-nums; }
  .cat-tile.big .cat-kg { font-size: 1.6em; }
  .cat-alert { display: flex; align-items: center; gap: 4px; color: var(--bad); font-size: .85em; margin-top: 2px; }
  .cat-alert ha-icon { --mdc-icon-size: 16px; flex: none; }
  .tbl { overflow-x: auto; } .tbl.scroll { max-height: 420px; overflow-y: auto; }
  .tbl table { width: 100%; border-collapse: collapse; }
  .tbl th { text-align: left; font-weight: 500; color: var(--muted); font-size: .85em; padding: 4px 6px; }
  .tbl td { padding: 7px 6px; border-top: 1px solid var(--divider-color); vertical-align: top; }
  .tbl .n { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .tbl .when { white-space: nowrap; color: var(--muted); font-variant-numeric: tabular-nums; }
  .unk { color: var(--muted); } .why { display: block; font-size: .8em; color: var(--muted); }
  .tools { display: flex; justify-content: flex-end; gap: 14px; flex-wrap: wrap; margin-top: -6px; }
  .foot { display: flex; justify-content: center; align-items: center; gap: 14px; flex-wrap: wrap; }
  .link { display: inline-flex; align-items: center; gap: 4px; color: var(--primary-color); font-size: .9em; }
  .link ha-icon { --mdc-icon-size: 18px; }
  .gchart { display: block; overflow: visible; }
  .gchart text { fill: var(--muted); font-size: 10px; text-anchor: middle; }
  .gchart text.max { text-anchor: start; } .gchart text.x.today { fill: var(--primary-text-color); font-weight: 600; }
  .gchart text.v { font-size: 9px; fill: var(--primary-text-color); }
  .gchart .axis { stroke: var(--divider-color); }
  .gchart .hit { fill: transparent; cursor: pointer; } .gchart .hit.picked { fill: var(--soft); }
  .legend { display: flex; flex-wrap: nowrap; gap: 6px; overflow-x: auto; scrollbar-width: none; }
  .legend::-webkit-scrollbar { display: none; } .legend .leg { flex: none; }
  .wchart .wline { fill: none; stroke-width: 2.4; stroke-linejoin: round; stroke-linecap: round; vector-effect: non-scaling-stroke; }
  .wchart .ylab { text-anchor: start; } .wchart .grid { stroke: var(--divider-color); stroke-dasharray: 2 4; } .wchart .cursor { stroke: var(--muted); stroke-dasharray: 3 3; }
  .leg { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 16px; background: var(--soft); font-size: .9em; }
  .leg.off { opacity: .45; } .leg .dot { width: 10px; height: 10px; border-radius: 50%; } .leg .sub { font-size: .9em; }
  .count { min-width: 26px; height: 26px; padding: 0 6px; border-radius: 13px; display: grid; place-items: center; font-weight: 600;
    background: var(--bad); color: var(--text-primary-color, #fff); flex: none; }
  .ok-mark { color: var(--ok); flex: none; }
  .bad-text { color: var(--bad); }
  .pbar { display: flex; justify-content: space-around; align-items: center; gap: 6px; padding: 8px; border-radius: 28px; background: var(--soft); }
  .pbtn { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; color: var(--muted); flex: none; }
  .pbtn.on { color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 14%, transparent); }
  .pbtn[data-act="power"].on { color: var(--bad); background: color-mix(in srgb, var(--bad) 14%, transparent); }
  .ppanel { display: flex; flex-direction: column; gap: 12px; }
  @media (max-width: 420px) { .art { width: 104px; } .stats.three { grid-template-columns: 1fr 1fr; } }
</style>`;

/* ---------- registration ---------- */

const define = (name, cls) => { if (!customElements.get(name)) customElements.define(name, cls); };
const D = (cls) => cls.defaults;
define("uahpet-litterbox-card", UahpetLitterboxCard);
define("uahpet-litterbox-card-editor", makeEditor((h) => [DEVICE_FIELD, TITLE_FIELD, bool("show_art"), { name: "art_style", selector: { select: { mode: "dropdown", options: ART_STYLES.map((v) => {
    const [m, variant] = v.split("-");
    return { value: v, label: t(h, `art_${m}`) + (variant ? ` – ${t(h, `art_v_${variant}`)}` : "") };
  }) } } }, { name: "box_color", selector: { color_rgb: {} } }, { name: "cat_color", selector: { color_rgb: {} } }, bool("show_stats"), bool("show_cats"), bool("show_actions"), bool("show_quick")], D(UahpetLitterboxCard)));
define("uahpet-litterbox-timeline-card", UahpetLitterboxTimelineCard);
define("uahpet-litterbox-timeline-card-editor", makeEditor((h) => [DEVICE_FIELD, TITLE_FIELD,
  choice(h, "range", ["today", "24h"], (v) => (v === "today" ? "timeline" : "last24")),
  { name: "max_items", selector: { number: { min: 5, max: 50, mode: "box" } } }, bool("show_cleanings"), bool("show_burying"), bool("show_alerts")], D(UahpetLitterboxTimelineCard)));
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
const catNames = (hass, config) => catSource(hass, config?.device_id || litterDevices(hass)[0])?.cats.map((c) => c.name) || [];
define("uahpet-cats-card", UahpetCatsCard);
define("uahpet-cats-card-editor", makeEditor((h, c) => [DEVICE_FIELD, TITLE_FIELD,
  { name: "cats", selector: { select: { multiple: true, mode: "list", options: catNames(h, c) } } },
  { name: "columns", selector: { number: { min: 1, max: 4, mode: "box" } } }, { name: "layout", selector: { select: { mode: "dropdown", options: ["horizontal", "vertical"].map((v) => ({ value: v, label: t(h, `lay_${v}`) })) } } }, { name: "avatar_size", selector: { number: { min: 24, max: 200, step: 4, mode: "box", unit_of_measurement: "px" } } }, bool("show_photo"), bool("show_weight"), bool("show_visits"), bool("show_last"), bool("show_add")], D(UahpetCatsCard)));
define("uahpet-cat-card", UahpetCatCard);
define("uahpet-cat-card-editor", makeEditor((h, c) => [DEVICE_FIELD,
  { name: "cat", selector: { select: { mode: "dropdown", options: catNames(h, c) } } }, { name: "layout", selector: { select: { mode: "dropdown", options: ["horizontal", "vertical"].map((v) => ({ value: v, label: t(h, `lay_${v}`) })) } } }, { name: "avatar_size", selector: { number: { min: 24, max: 200, step: 4, mode: "box", unit_of_measurement: "px" } } }, bool("show_photo"), bool("show_weight"), bool("show_visits"), bool("show_last")], D(UahpetCatCard)));
define("uahpet-visits-card", UahpetVisitsCard);
define("uahpet-visits-card-editor", makeEditor(() => [DEVICE_FIELD, TITLE_FIELD,
  { name: "count", selector: { number: { min: 1, max: 50, mode: "box" } } }, bool("collapsible"),
  { name: "expanded_count", selector: { number: { min: 5, max: 500, mode: "box" } } },
  bool("show_weight"), bool("show_duration"), bool("show_unidentified"), bool("show_toggle")], D(UahpetVisitsCard)));
define("uahpet-visits-chart-card", UahpetVisitsChartCard);
define("uahpet-visits-chart-card-editor", makeEditor((h) => [DEVICE_FIELD, TITLE_FIELD, choice(h, "days", [7, 30]), bool("show_unidentified")], D(UahpetVisitsChartCard)));
define("uahpet-weight-chart-card", UahpetWeightChartCard);
define("uahpet-weight-chart-card-editor", makeEditor((h) => [DEVICE_FIELD, TITLE_FIELD, choice(h, "days", [7, 30, 90])], D(UahpetWeightChartCard)));
define("uahpet-litterbox-maintenance-mini-card", UahpetMaintenanceMiniCard);
define("uahpet-litterbox-maintenance-mini-card-editor", makeEditor(() => [DEVICE_FIELD]));
define("uahpet-purifier-mini-card", UahpetPurifierMiniCard);
define("uahpet-purifier-mini-card-editor", makeEditor(() => [PURIFIER_DEVICE_FIELD, TITLE_FIELD]));
define("uahpet-purifier-bar-card", UahpetPurifierBarCard);
define("uahpet-purifier-bar-card-editor", makeEditor(() => [PURIFIER_DEVICE_FIELD, TITLE_FIELD]));
define("uahpet-purifier-card", UahpetPurifierCard);
define("uahpet-purifier-card-editor", makeEditor(() => [PURIFIER_DEVICE_FIELD, TITLE_FIELD, bool("show_modes"), bool("show_speed"), bool("show_timer"), bool("show_extras")], D(UahpetPurifierCard)));

window.customCards = window.customCards || [];
const tl = (k) => t(document.querySelector("home-assistant")?.hass, k);
for (const [type, name] of [
  ["uahpet-litterbox-card", "c_main"], ["uahpet-litterbox-timeline-card", "c_timeline"], ["uahpet-litterbox-stats-card", "c_stats"],
  ["uahpet-litterbox-settings-card", "c_settings"], ["uahpet-litterbox-maintenance-card", "c_maint"], ["uahpet-litterbox-mini-card", "c_mini"],
  ["uahpet-litterbox-maintenance-mini-card", "c_maint_mini"],
  ["uahpet-cats-card", "c_cats"], ["uahpet-cat-card", "c_cat"], ["uahpet-visits-card", "c_visits"], ["uahpet-visits-chart-card", "c_chart"], ["uahpet-weight-chart-card", "c_weight"],
  ["uahpet-purifier-card", "c_purifier"], ["uahpet-purifier-bar-card", "c_purifier_bar"], ["uahpet-purifier-mini-card", "c_purifier_mini"],
]) {
  if (!window.customCards.some((c) => c.type === type)) {
    window.customCards.push({ type, name: tl(name), description: tl(`${name}_d`), preview: true, documentationURL: DOCS });
  }
}
console.info(`%c UAHPET %c ${VERSION} `, "background:#3a7d44;color:#fff", "background:#ddd;color:#000");
