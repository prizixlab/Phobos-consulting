// ═══════════════════════════════════════════
// PHOBOS i18n — Direct DOM replacement engine
// ═══════════════════════════════════════════

var PHOBOS_LANGS = {
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

// All translatable strings — English text → translation key
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
  'Yard Layout': 'yard_layout',
  'Container ID': 'container_id',
  'Status': 'status',
  'Location': 'location',
  'Last Updated': 'last_updated',
  'Actions': 'actions',
  'Loading...': 'loading',
  'Loading containers...': 'loading',
};

var _strings = {};
var _currentLang = 'en';
// Store original text for each node so we can restore it
var _nodeMap = new Map();

async function i18nLoad(lang) {
  if (!PHOBOS_LANGS[lang]) lang = 'en';
  if (lang !== 'en') {
    try {
      var res = await fetch('langs/' + lang + '.json?v=3');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      _strings = await res.json();
    } catch(e) {
      console.error('i18n: failed to load ' + lang, e);
      _strings = {};
      lang = 'en';
    }
  } else {
    _strings = {};
  }
  _currentLang = lang;
  localStorage.setItem('phobos_lang', lang);
  applyTranslations();
  updateSwitcherUI();
}

// Walk all text nodes, skip material icon spans, tag translatable ones
function buildNodeMap() {
  _nodeMap.clear();

  function walk(node) {
    // Skip script, style, and material icon elements
    if (node.nodeType === 1) {
      if (['SCRIPT','STYLE','NOSCRIPT'].includes(node.tagName)) return;
      // Skip material symbols spans - they contain icon names not UI text
      if (node.tagName === 'SPAN' && node.classList.contains('material-symbols-outlined')) return;
      node.childNodes.forEach(walk);
    } else if (node.nodeType === 3) {
      var text = node.textContent.trim();
      if (text && TEXT_MAP[text]) {
        _nodeMap.set(node, text); // store original English
      }
    }
  }

  if (document.body) walk(document.body);
}

function applyTranslations() {
  var cfg = PHOBOS_LANGS[_currentLang];

  // Direction
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

  // Replace text nodes
  _nodeMap.forEach(function(origText, node) {
    var key = TEXT_MAP[origText];
    if (!key) return;
    var translated = (_currentLang !== 'en' && _strings[key]) ? _strings[key] : origText;
    // Preserve surrounding whitespace
    var raw = node.textContent;
    var leadSpace = raw.match(/^(\s*)/)[1];
    var trailSpace = raw.match(/(\s*)$/)[1];
    node.textContent = leadSpace + translated + trailSpace;
  });

  // Also handle explicit data-i18n attributes
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    var orig = el.getAttribute('data-i18n-orig');
    if (!orig) { orig = el.textContent.trim(); el.setAttribute('data-i18n-orig', orig); }
    el.textContent = (_currentLang !== 'en' && _strings[key]) ? _strings[key] : orig;
  });
}

function updateSwitcherUI() {
  var cfg = PHOBOS_LANGS[_currentLang];
  var flagEl = document.getElementById('lang-flag');
  var labelEl = document.getElementById('lang-label');
  if (flagEl) flagEl.textContent = cfg.flag;
  if (labelEl) labelEl.textContent = cfg.label;

  document.querySelectorAll('.lang-opt').forEach(function(el) {
    var active = el.getAttribute('data-lang') === _currentLang;
    el.style.background = active ? '#e25700' : '#0f172a';
    el.style.color = active ? '#fff' : '#e2e8f0';
  });
}

function injectSwitcher() {
  if (document.getElementById('lang-switcher-btn')) return;

  var header = document.querySelector('header');
  if (!header) return;

  // Find the last div in the header (right side actions)
  var divs = Array.from(header.children).filter(function(el){ return el.tagName === 'DIV'; });
  var target = divs[divs.length - 1];
  if (!target) { target = header; }

  var wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:relative;display:inline-flex;align-items:center;margin-left:0.5rem;flex-shrink:0;z-index:100;';

  var btn = document.createElement('button');
  btn.id = 'lang-switcher-btn';
  btn.type = 'button';
  var cur = PHOBOS_LANGS[_currentLang];
  btn.style.cssText = 'display:flex;align-items:center;gap:0.35rem;background:rgba(0,0,0,0.07);border:1px solid rgba(0,0,0,0.12);color:#45464d;border-radius:4px;padding:0.3rem 0.65rem;font-family:Space Grotesk,sans-serif;font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;cursor:pointer;white-space:nowrap;';
  btn.innerHTML =
    '<span id="lang-flag" style="font-size:1rem;line-height:1;">' + cur.flag + '</span>' +
    '<span id="lang-label" style="max-width:60px;overflow:hidden;text-overflow:ellipsis;">' + cur.label + '</span>' +
    '<span style="font-size:0.5rem;opacity:0.5;margin-left:1px;">▼</span>';

  var dd = document.createElement('div');
  dd.id = 'lang-dropdown';
  dd.style.cssText = 'display:none;position:absolute;top:calc(100% + 8px);right:0;background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:6px;min-width:200px;z-index:99999;box-shadow:0 8px 32px rgba(0,0,0,0.4);overflow:hidden;';

  var grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;';

  Object.keys(PHOBOS_LANGS).forEach(function(code) {
    var cfg = PHOBOS_LANGS[code];
    var opt = document.createElement('button');
    opt.type = 'button';
    opt.className = 'lang-opt';
    opt.setAttribute('data-lang', code);
    opt.style.cssText = 'display:flex;align-items:center;gap:0.45rem;padding:0.55rem 0.75rem;background:#0f172a;border:none;font-family:Space Grotesk,sans-serif;font-size:0.73rem;font-weight:600;color:#e2e8f0;cursor:pointer;text-align:left;';
    opt.innerHTML = '<span style="font-size:1.1rem;line-height:1;">' + cfg.flag + '</span><span>' + cfg.label + '</span>';
    opt.addEventListener('mouseenter', function(){ if(code!==_currentLang) opt.style.background='rgba(255,255,255,0.1)'; });
    opt.addEventListener('mouseleave', function(){ if(code!==_currentLang) opt.style.background='#0f172a'; });
    opt.addEventListener('click', function(e){
      e.stopPropagation();
      dd.style.display = 'none';
      i18nLoad(code);
    });
    grid.appendChild(opt);
  });

  dd.appendChild(grid);

  btn.addEventListener('click', function(e){
    e.stopPropagation();
    dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
  });

  document.addEventListener('click', function(){
    dd.style.display = 'none';
  });

  wrapper.appendChild(btn);
  wrapper.appendChild(dd);
  target.appendChild(wrapper);
}

// Init on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  buildNodeMap();
  injectSwitcher();
  var saved = localStorage.getItem('phobos_lang') || 'en';
  i18nLoad(saved);
});
