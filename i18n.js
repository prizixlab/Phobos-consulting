// ═══════════════════════════════════════════
// PHOBOS i18n — Full text replacement engine
// ═══════════════════════════════════════════

const PHOBOS_LANGS = {
  en: { label: 'English',    flag: '🇬🇧', dir: 'ltr', font: null },
  es: { label: 'Español',    flag: '🇪🇸', dir: 'ltr', font: null },
  hi: { label: 'हिंदी',      flag: '🇮🇳', dir: 'ltr', font: 'Noto Sans Devanagari' },
  bn: { label: 'বাংলা',      flag: '🇮🇳', dir: 'ltr', font: 'Noto Sans Bengali' },
  zh: { label: '中文',       flag: '🇨🇳', dir: 'ltr', font: 'Noto Sans SC' },
  pt: { label: 'Português',  flag: '🇧🇷', dir: 'ltr', font: null },
  ru: { label: 'Русский',    flag: '🇷🇺', dir: 'ltr', font: null },
  fr: { label: 'Français',   flag: '🇫🇷', dir: 'ltr', font: null },
  ar: { label: 'العربية',   flag: '🇸🇦', dir: 'rtl', font: 'Noto Sans Arabic' },
  de: { label: 'Deutsch',    flag: '🇩🇪', dir: 'ltr', font: null },
  ja: { label: '日本語',     flag: '🇯🇵', dir: 'ltr', font: 'Noto Sans JP' },
  ko: { label: '한국어',     flag: '🇰🇷', dir: 'ltr', font: 'Noto Sans KR' },
};

// Master English→translated map for every string on every page
// Key = exact English text, Value = translation key
const TEXT_MAP = {
  // Nav
  'Dashboard': 'nav_dashboard',
  'Containers': 'nav_containers',
  'Movement Log': 'nav_movement',
  'Analytics': 'nav_analytics',
  'Settings': 'nav_settings',
  'Add Entry': 'nav_add_entry',
  'Sign Out': 'nav_logout',

  // Dashboard
  'Platform Dashboard': 'dashboard_title',
  'Total Containers': 'dashboard_total',
  'In Transit': 'dashboard_transit',
  'Dwell Warning': 'dashboard_dwell',
  'Processing': 'dashboard_processing',
  'Container Inventory': 'dashboard_inventory',
  'Recent Activity': 'dashboard_recent',
  'Last Updated': 'last_updated',
  'Container ID': 'container_id',
  'Status': 'status',
  'Location': 'location',
  'Actions': 'actions',
  'View All': 'view_all',
  'Yard Capacity': 'yard_capacity',
  'TEU available': 'teu_available',

  // Containers page
  'All Statuses': 'all_statuses',
  'Export CSV': 'containers_export',
  'Open Details': 'containers_open',
  'No containers found.': 'no_data',
  'Identity & Ownership': 'identity_ownership',
  'Physical Specifications': 'physical_specs',
  'Operational Notes': 'op_notes',
  'Carrier / Owner': 'carrier_owner',
  'Bill of Lading': 'bill_of_lading',
  'Seal Number': 'seal_number',
  'Operator ID': 'operator_id',
  'Container Size': 'container_size',
  'Entry Type': 'entry_type',
  'Hazmat Classification': 'hazmat_class',
  'Current Location': 'current_location',
  'Current Status': 'current_status',
  'Date Added': 'date_added',
  'View Movement History': 'view_movement',
  'Log New Entry': 'log_new_entry',

  // Movement log
  'EXPORT CSV': 'containers_export',
  'Apply Parameters': 'apply_params',
  'Event Type': 'event_type',
  'Gate-In (Terminal)': 'gate_in',
  'Gate-Out (Dispatch)': 'gate_out',
  'Intra-Yard Movement': 'intra_yard',
  'Inspection / Damage Log': 'inspection',
  'System Status': 'system_status',
  'Active': 'status_active',
  'Pending': 'status_pending',
  'Flagged': 'status_flagged',
  'Yard Density': 'yard_density',

  // Analytics
  'Utilization Rate': 'analytics_utilization',
  'Throughput': 'analytics_throughput',
  'Efficiency Score': 'analytics_efficiency',
  'Avg. Dwell Time': 'analytics_dwell',
  'Container Throughput': 'chart_throughput',
  'Status Distribution': 'status_distribution',
  'Dwell Time by Sector': 'dwell_by_sector',
  'Live yard inventory status': 'live_inventory',
  'Total Units': 'total_units',

  // Settings
  'Profile': 'settings_profile',
  'Yard Configuration': 'settings_yard',
  'SAVE CHANGES': 'settings_save',
  'APPLY CONFIGURATION': 'settings_apply',
  'SAVE CAPACITY SETTINGS': 'settings_capacity',
  'Full Name': 'full_name',
  'Email Address': 'login_email',
  'System Role': 'system_role',
  'Terminal Identifier': 'terminal_id',
  'Dwell Warning (HRS)': 'dwell_warning_hrs',
  'Critical Alert (HRS)': 'critical_alert_hrs',
  'Maximum Yard Capacity (TEU)': 'max_capacity_label',
  'Notification Preferences': 'notif_prefs',
  'Security': 'tab_security',
  'Integrations': 'tab_integrations',
  'Permissions': 'tab_permissions',
  'Account': 'tab_account',

  // Login
  'Sign In': 'login_button',
  'Email Address': 'login_email',
  'Password': 'login_password',
  'Forgot password?': 'login_forgot',
  'Remember me': 'login_remember',

  // Common
  'Loading...': 'loading',
  'No data found.': 'no_data',
  'Save': 'save',
  'Cancel': 'cancel',
  'Delete': 'delete',
  'Edit': 'edit',
  'days': 'days',
};

// Store original English text for all tagged nodes
var _originals = new Map();
var _currentLang = 'en';
var _strings = {};

async function i18nLoad(lang) {
  if (!PHOBOS_LANGS[lang]) lang = 'en';
  if (lang !== 'en') {
    try {
      var res = await fetch('langs/' + lang + '.json?v=2');
      _strings = await res.json();
    } catch(e) {
      console.warn('i18n: failed to load', lang);
      _strings = {};
    }
  } else {
    _strings = {};
  }
  _currentLang = lang;
  localStorage.setItem('phobos_lang', lang);
  applyTranslations();
}

function applyTranslations() {
  var cfg = PHOBOS_LANGS[_currentLang];

  // Direction + RTL
  document.documentElement.dir = cfg.dir;
  document.documentElement.lang = _currentLang;
  document.body.classList.toggle('rtl', cfg.dir === 'rtl');

  // Font
  if (cfg.font) {
    var fontId = 'i18n-font-' + _currentLang;
    if (!document.getElementById(fontId)) {
      var lnk = document.createElement('link');
      lnk.id = fontId;
      lnk.rel = 'stylesheet';
      lnk.href = 'https://fonts.googleapis.com/css2?family=' + cfg.font.replace(/ /g,'+') + ':wght@400;600;700&display=swap';
      document.head.appendChild(lnk);
    }
    document.body.style.fontFamily = "'" + cfg.font + "', Inter, sans-serif";
  } else {
    document.body.style.fontFamily = '';
  }

  // Walk all tagged text nodes and replace
  _originals.forEach(function(origText, node) {
    var key = TEXT_MAP[origText];
    if (!key) return;
    if (_currentLang === 'en' || !_strings[key]) {
      node.textContent = origText; // restore English
    } else {
      node.textContent = _strings[key];
    }
  });

  // Also handle data-i18n attributes
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    var orig = el.getAttribute('data-i18n-orig') || el.textContent;
    el.setAttribute('data-i18n-orig', orig);
    el.textContent = (_currentLang !== 'en' && _strings[key]) ? _strings[key] : orig;
  });

  // Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
    var key = el.getAttribute('data-i18n-placeholder');
    if (_strings[key]) el.placeholder = _strings[key];
  });

  // Update switcher
  var flagEl = document.getElementById('lang-flag');
  var labelEl = document.getElementById('lang-label');
  if (flagEl) flagEl.textContent = cfg.flag;
  if (labelEl) labelEl.textContent = cfg.label;

  document.querySelectorAll('.lang-opt').forEach(function(el) {
    var active = el.getAttribute('data-lang') === _currentLang;
    el.style.background = active ? '#e25700' : '';
    el.style.color = active ? '#fff' : '';
  });
}

// Walk DOM and tag all text nodes that match our TEXT_MAP
function tagTextNodes() {
  var skip = ['SCRIPT','STYLE','NOSCRIPT','OPTION'];
  function walk(node) {
    if (node.nodeType === 3) { // text node
      var text = node.textContent.trim();
      if (text && TEXT_MAP[text] && !_originals.has(node)) {
        _originals.set(node, text);
      }
    } else if (node.nodeType === 1 && !skip.includes(node.tagName)) {
      node.childNodes.forEach(walk);
    }
  }
  walk(document.body);
}

function i18nInjectSwitcher() {
  if (document.getElementById('lang-switcher-btn')) return;
  var header = document.querySelector('header');
  if (!header) return;

  // Find rightmost div in header
  var divs = Array.from(header.children).filter(function(el){ return el.tagName === 'DIV'; });
  var target = divs[divs.length - 1] || header;

  var wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:relative;display:inline-flex;align-items:center;margin-left:0.5rem;flex-shrink:0;';

  var btn = document.createElement('button');
  btn.id = 'lang-switcher-btn';
  btn.style.cssText = 'display:flex;align-items:center;gap:0.35rem;background:rgba(0,0,0,0.07);border:1px solid rgba(0,0,0,0.12);color:#45464d;border-radius:4px;padding:0.3rem 0.6rem;font-family:Space Grotesk,sans-serif;font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;cursor:pointer;white-space:nowrap;';
  var cur = PHOBOS_LANGS[_currentLang];
  btn.innerHTML = '<span id="lang-flag" style="font-size:1rem;">' + cur.flag + '</span><span id="lang-label">' + cur.label + '</span><span style="font-size:0.55rem;opacity:0.5;margin-left:2px;">▼</span>';

  var dd = document.createElement('div');
  dd.id = 'lang-dropdown';
  dd.style.cssText = 'display:none;position:absolute;top:calc(100% + 6px);right:0;background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:6px;min-width:180px;z-index:99999;box-shadow:0 8px 32px rgba(0,0,0,0.4);overflow:hidden;';

  var grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:1px;background:rgba(255,255,255,0.05);';

  Object.keys(PHOBOS_LANGS).forEach(function(code) {
    var cfg = PHOBOS_LANGS[code];
    var opt = document.createElement('button');
    opt.className = 'lang-opt';
    opt.setAttribute('data-lang', code);
    opt.style.cssText = 'display:flex;align-items:center;gap:0.45rem;padding:0.5rem 0.75rem;background:#0f172a;border:none;font-family:Space Grotesk,sans-serif;font-size:0.72rem;font-weight:600;color:#e2e8f0;cursor:pointer;text-align:left;transition:background 0.1s;';
    opt.innerHTML = '<span style="font-size:1rem;">' + cfg.flag + '</span><span>' + cfg.label + '</span>';
    opt.addEventListener('mouseenter', function(){ if(code!==_currentLang) opt.style.background='rgba(255,255,255,0.08)'; });
    opt.addEventListener('mouseleave', function(){ if(code!==_currentLang) opt.style.background='#0f172a'; });
    opt.addEventListener('click', function(){
      i18nLoad(code);
      dd.style.display = 'none';
    });
    grid.appendChild(opt);
  });

  dd.appendChild(grid);
  btn.addEventListener('click', function(e){ e.stopPropagation(); dd.style.display = dd.style.display==='none'?'block':'none'; });
  document.addEventListener('click', function(){ dd.style.display='none'; });
  wrapper.appendChild(btn);
  wrapper.appendChild(dd);
  target.appendChild(wrapper);
}

// Init
document.addEventListener('DOMContentLoaded', async function() {
  tagTextNodes();
  i18nInjectSwitcher();
  var saved = localStorage.getItem('phobos_lang') || 'en';
  await i18nLoad(saved);
});
