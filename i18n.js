// PHOBOS i18n v6 — Simple and direct

var PHOBOS_LANGS = {
  en: { label: 'English',   flag: '🇬🇧', dir: 'ltr', font: null },
  es: { label: 'Español',   flag: '🇪🇸', dir: 'ltr', font: null },
  hi: { label: 'हिंदी',     flag: '🇮🇳', dir: 'ltr', font: 'Noto Sans Devanagari' },
  bn: { label: 'বাংলা',     flag: '🇮🇳', dir: 'ltr', font: 'Noto Sans Bengali' },
  zh: { label: '中文',      flag: '🇨🇳', dir: 'ltr', font: 'Noto Sans SC' },
  pt: { label: 'Português', flag: '🇧🇷', dir: 'ltr', font: null },
  ru: { label: 'Русский',   flag: '🇷🇺', dir: 'ltr', font: null },
  fr: { label: 'Français',  flag: '🇫🇷', dir: 'ltr', font: null },
  ar: { label: 'العربية',  flag: '🇸🇦', dir: 'rtl', font: 'Noto Sans Arabic' },
  de: { label: 'Deutsch',   flag: '🇩🇪', dir: 'ltr', font: null },
  ja: { label: '日本語',    flag: '🇯🇵', dir: 'ltr', font: 'Noto Sans JP' },
  ko: { label: '한국어',    flag: '🇰🇷', dir: 'ltr', font: 'Noto Sans KR' },
};

var TEXT_MAP = {
  'Dashboard': 'nav_dashboard',
  'Containers': 'nav_containers',
  'Movement Log': 'nav_movement',
  'Analytics': 'nav_analytics',
  'Settings': 'nav_settings',
  'Add Entry': 'nav_add_entry',
  'Sign Out': 'nav_logout',
  'Platform Dashboard': 'dashboard_title',
  'Total Containers': 'dashboard_total',
  'In Transit': 'dashboard_transit',
  'Dwell Warning': 'dashboard_dwell',
  'Dwell Warnings': 'dashboard_dwell',
  'Processing': 'dashboard_processing',
  'Container Inventory': 'dashboard_inventory',
  'Movement History': 'dashboard_recent',
  'Utilization Rate': 'analytics_utilization',
  'Throughput': 'analytics_throughput',
  'Efficiency Score': 'analytics_efficiency',
  'Avg. Dwell Time': 'analytics_dwell',
  'Container Throughput': 'chart_throughput',
  'Status Distribution': 'status_distribution',
  'Dwell Time by Sector': 'dwell_by_sector',
  'Total Units': 'total_units',
  'Export CSV': 'containers_export',
  'Profile': 'settings_profile',
  'Yard Configuration': 'settings_yard',
  'SAVE CHANGES': 'settings_save',
  'APPLY CONFIGURATION': 'settings_apply',
  'SAVE CAPACITY SETTINGS': 'settings_capacity',
  'Container ID': 'container_id',
  'Status': 'status',
  'Location': 'location',
  'Last Updated': 'last_updated',
  'Actions': 'actions',
};

var _strings = {};
var _currentLang = 'en';
var _nodeMap = new Map();
var _ddOpen = false;

// ── PICK LANGUAGE — called directly from onclick ──
window.phobosSetLang = function(code) {
  _ddOpen = false;
  var dd = document.getElementById('lang-dropdown');
  if (dd) dd.style.display = 'none';
  i18nLoad(code);
};

window.phobosToggleDD = function() {
  var dd = document.getElementById('lang-dropdown');
  if (!dd) return;
  _ddOpen = !_ddOpen;
  dd.style.display = _ddOpen ? 'block' : 'none';
};

async function i18nLoad(lang) {
  if (!PHOBOS_LANGS[lang]) lang = 'en';
  if (lang !== 'en') {
    try {
      var res = await fetch('langs/' + lang + '.json');
      _strings = await res.json();
    } catch(e) {
      console.error('i18n load failed for ' + lang, e);
      _strings = {};
    }
  } else {
    _strings = {};
  }
  _currentLang = lang;
  localStorage.setItem('phobos_lang', lang);
  applyTranslations();
}

function buildNodeMap() {
  _nodeMap.clear();
  function walk(node) {
    if (node.nodeType === 1) {
      if (['SCRIPT','STYLE','NOSCRIPT'].includes(node.tagName)) return;
      if (node.tagName === 'SPAN' && node.classList.contains('material-symbols-outlined')) return;
      node.childNodes.forEach(walk);
    } else if (node.nodeType === 3) {
      var text = node.textContent.trim();
      if (text && TEXT_MAP[text]) {
        _nodeMap.set(node, text);
      }
    }
  }
  walk(document.body);
}

function applyTranslations() {
  var cfg = PHOBOS_LANGS[_currentLang];
  document.documentElement.dir = cfg.dir;
  document.documentElement.lang = _currentLang;
  document.body.classList.toggle('rtl', cfg.dir === 'rtl');

  if (cfg.font) {
    var fontId = 'i18n-font-' + _currentLang;
    if (!document.getElementById(fontId)) {
      var lnk = document.createElement('link');
      lnk.id = fontId; lnk.rel = 'stylesheet';
      lnk.href = 'https://fonts.googleapis.com/css2?family=' + cfg.font.replace(/ /g,'+') + ':wght@400;600;700&display=swap';
      document.head.appendChild(lnk);
    }
    document.body.style.fontFamily = "'" + cfg.font + "', Inter, sans-serif";
  } else {
    document.body.style.fontFamily = '';
  }

  _nodeMap.forEach(function(origText, node) {
    var key = TEXT_MAP[origText];
    var translated = (_currentLang !== 'en' && _strings[key]) ? _strings[key] : origText;
    var raw = node.textContent;
    var lead = raw.match(/^(\s*)/)[1];
    var trail = raw.match(/(\s*)$/)[1];
    node.textContent = lead + translated + trail;
  });

  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    var orig = el.getAttribute('data-i18n-orig');
    if (!orig) { orig = el.textContent.trim(); el.setAttribute('data-i18n-orig', orig); }
    el.textContent = (_currentLang !== 'en' && _strings[key]) ? _strings[key] : orig;
  });

  // Update button display
  var flagEl = document.getElementById('lang-flag');
  var labelEl = document.getElementById('lang-label');
  if (flagEl) flagEl.textContent = cfg.flag;
  if (labelEl) labelEl.textContent = cfg.label;
}

function injectSwitcher() {
  if (document.getElementById('lang-switcher-btn')) return;
  var header = document.querySelector('header');
  if (!header) return;
  var divs = Array.from(header.children).filter(function(el){ return el.tagName === 'DIV'; });
  var target = divs[divs.length - 1] || header;

  var cur = PHOBOS_LANGS[_currentLang];

  // Build dropdown options HTML — use plain onclick with global function
  var opts = Object.keys(PHOBOS_LANGS).map(function(code) {
    var c = PHOBOS_LANGS[code];
    return '<button type="button" onclick="phobosSetLang(\'' + code + '\')" style="display:flex;align-items:center;gap:0.5rem;width:100%;padding:0.5rem 0.75rem;background:none;border:none;font-family:Space Grotesk,sans-serif;font-size:0.73rem;font-weight:600;color:#e2e8f0;cursor:pointer;text-align:left;" onmouseover="this.style.background=\'rgba(255,255,255,0.1)\'" onmouseout="this.style.background=\'none\'">' +
      '<span style="font-size:1rem;">' + c.flag + '</span><span>' + c.label + '</span></button>';
  }).join('');

  var html =
    '<div style="position:relative;display:inline-flex;align-items:center;margin-left:0.5rem;flex-shrink:0;">' +
      '<button id="lang-switcher-btn" type="button" onclick="phobosToggleDD()" style="display:flex;align-items:center;gap:0.35rem;background:rgba(0,0,0,0.07);border:1px solid rgba(0,0,0,0.12);color:#45464d;border-radius:4px;padding:0.3rem 0.65rem;font-family:Space Grotesk,sans-serif;font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;cursor:pointer;white-space:nowrap;">' +
        '<span id="lang-flag" style="font-size:1rem;">' + cur.flag + '</span>' +
        '<span id="lang-label">' + cur.label + '</span>' +
        '<span style="font-size:0.5rem;opacity:0.5;margin-left:2px;">▼</span>' +
      '</button>' +
      '<div id="lang-dropdown" style="display:none;position:absolute;top:calc(100% + 6px);right:0;background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:6px;min-width:200px;z-index:99999;box-shadow:0 8px 32px rgba(0,0,0,0.4);overflow:hidden;">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;">' + opts + '</div>' +
      '</div>' +
    '</div>';

  var wrap = document.createElement('div');
  wrap.innerHTML = html;
  target.appendChild(wrap.firstChild);

  // Close on outside click
  document.addEventListener('click', function(e) {
    if (!_ddOpen) return;
    var btn = document.getElementById('lang-switcher-btn');
    var dd = document.getElementById('lang-dropdown');
    if (btn && !btn.contains(e.target) && dd && !dd.contains(e.target)) {
      _ddOpen = false;
      dd.style.display = 'none';
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  buildNodeMap();
  injectSwitcher();
  var saved = localStorage.getItem('phobos_lang') || 'en';
  i18nLoad(saved);
});
