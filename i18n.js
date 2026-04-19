// ═══════════════════════════════════════════
// PHOBOS i18n — 12-language engine
// ═══════════════════════════════════════════

const PHOBOS_LANGS = {
  en: { label: 'English',    flag: '🇬🇧', dir: 'ltr', font: null },
  es: { label: 'Español',    flag: '🇪🇸', dir: 'ltr', font: null },
  hi: { label: 'हिंदी',       flag: '🇮🇳', dir: 'ltr', font: 'Noto Sans Devanagari' },
  bn: { label: 'বাংলা',       flag: '🇮🇳', dir: 'ltr', font: 'Noto Sans Bengali' },
  zh: { label: '中文',        flag: '🇨🇳', dir: 'ltr', font: 'Noto Sans SC' },
  pt: { label: 'Português',  flag: '🇧🇷', dir: 'ltr', font: null },
  ru: { label: 'Русский',    flag: '🇷🇺', dir: 'ltr', font: null },
  fr: { label: 'Français',   flag: '🇫🇷', dir: 'ltr', font: null },
  ar: { label: 'العربية',    flag: '🇸🇦', dir: 'rtl', font: 'Noto Sans Arabic' },
  de: { label: 'Deutsch',    flag: '🇩🇪', dir: 'ltr', font: null },
  ja: { label: '日本語',      flag: '🇯🇵', dir: 'ltr', font: 'Noto Sans JP' },
  ko: { label: '한국어',      flag: '🇰🇷', dir: 'ltr', font: 'Noto Sans KR' },
};

let _strings = {};
let _currentLang = 'en';

// Load language strings
async function i18nLoad(lang) {
  if (!PHOBOS_LANGS[lang]) lang = 'en';
  try {
    const res = await fetch('langs/' + lang + '.json?v=' + Date.now());
    _strings = await res.json();
  } catch(e) {
    console.warn('i18n: could not load', lang, e);
    _strings = {};
  }
  _currentLang = lang;
  localStorage.setItem('phobos_lang', lang);
  applyLang();
}

function t(key) {
  return _strings[key] || key;
}

function applyLang() {
  var cfg = PHOBOS_LANGS[_currentLang];

  document.documentElement.dir = cfg.dir;
  document.documentElement.lang = _currentLang;

  if (cfg.dir === 'rtl') {
    document.body.classList.add('rtl');
  } else {
    document.body.classList.remove('rtl');
  }

  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    if (_strings[key]) el.textContent = _strings[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
    var key = el.getAttribute('data-i18n-placeholder');
    if (_strings[key]) el.placeholder = _strings[key];
  });

  if (cfg.font) {
    var fontId = 'i18n-font-' + _currentLang;
    if (!document.getElementById(fontId)) {
      var link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=' + cfg.font.replace(/ /g, '+') + ':wght@400;600;700&display=swap';
      document.head.appendChild(link);
    }
    document.body.style.fontFamily = "'" + cfg.font + "', Inter, sans-serif";
  } else {
    document.body.style.fontFamily = '';
  }

  // Update flag + label in button
  var flagEl = document.getElementById('lang-flag');
  var labelEl = document.getElementById('lang-label');
  if (flagEl) flagEl.textContent = cfg.flag;
  if (labelEl) labelEl.textContent = cfg.label;

  document.querySelectorAll('.lang-opt').forEach(function(el) {
    var isActive = el.getAttribute('data-lang') === _currentLang;
    el.style.background = isActive ? '#e25700' : '';
    el.style.color = isActive ? '#fff' : '';
  });
}

function i18nInjectSwitcher() {
  // Find the header's RIGHT side div — it's always the last direct child div of header
  var header = document.querySelector('header');
  if (!header) return;

  // Get all direct child divs of header — the last one is the right-side actions group
  var children = Array.from(header.children).filter(function(el) {
    return el.tagName === 'DIV';
  });
  var target = children[children.length - 1]; // rightmost div
  if (!target) target = header;

  var wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:relative;display:inline-flex;align-items:center;margin-left:0.75rem;';

  var btn = document.createElement('button');
  btn.id = 'lang-switcher-btn';
  btn.style.cssText = [
    'display:flex;align-items:center;gap:0.35rem;',
    'background:rgba(0,0,0,0.06);border:1px solid rgba(0,0,0,0.1);',
    'color:#45464d;border-radius:4px;padding:0.3rem 0.6rem;',
    'font-family:Space Grotesk,sans-serif;font-size:0.68rem;font-weight:700;',
    'text-transform:uppercase;letter-spacing:0.06em;cursor:pointer;',
    'transition:background 0.15s;white-space:nowrap;'
  ].join('');

  var currentCfg = PHOBOS_LANGS[_currentLang];
  btn.innerHTML =
    '<span id="lang-flag" style="font-size:1rem;">' + currentCfg.flag + '</span>' +
    '<span id="lang-label">' + currentCfg.label + '</span>' +
    '<span style="font-size:0.55rem;opacity:0.6;">▼</span>';

  var dropdown = document.createElement('div');
  dropdown.id = 'lang-dropdown';
  dropdown.style.cssText = [
    'display:none;position:absolute;top:calc(100% + 6px);right:0;',
    'background:#0f172a;border:1px solid rgba(255,255,255,0.1);',
    'border-radius:6px;min-width:170px;z-index:99999;',
    'box-shadow:0 8px 32px rgba(0,0,0,0.35);overflow:hidden;'
  ].join('');

  // Grid of languages 
  var grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;';

  Object.entries(PHOBOS_LANGS).forEach(function(entry) {
    var code = entry[0];
    var cfg  = entry[1];
    var opt = document.createElement('button');
    opt.className = 'lang-opt';
    opt.setAttribute('data-lang', code);
    opt.style.cssText = [
      'display:flex;align-items:center;gap:0.5rem;',
      'padding:0.5rem 0.75rem;background:none;border:none;',
      'font-family:Space Grotesk,sans-serif;font-size:0.72rem;font-weight:600;',
      'color:#e2e8f0;cursor:pointer;text-align:left;transition:background 0.1s;',
      code === _currentLang ? 'background:#e25700;color:#fff;' : ''
    ].join('');
    opt.innerHTML = '<span style="font-size:1rem;">' + cfg.flag + '</span><span>' + cfg.label + '</span>';
    opt.addEventListener('mouseenter', function() {
      if (code !== _currentLang) opt.style.background = 'rgba(255,255,255,0.08)';
    });
    opt.addEventListener('mouseleave', function() {
      if (code !== _currentLang) opt.style.background = '';
    });
    opt.addEventListener('click', function() {
      i18nLoad(code);
      dropdown.style.display = 'none';
    });
    grid.appendChild(opt);
  });

  dropdown.appendChild(grid);

  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  });
  document.addEventListener('click', function() {
    dropdown.style.display = 'none';
  });

  wrapper.appendChild(btn);
  wrapper.appendChild(dropdown);
  target.appendChild(wrapper);
}

// Auto-init
document.addEventListener('DOMContentLoaded', async function() {
  var saved = localStorage.getItem('phobos_lang') || 'en';
  await i18nLoad(saved);
  i18nInjectSwitcher();
});
