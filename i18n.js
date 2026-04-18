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
    const res = await fetch(`langs/${lang}.json?v=${Date.now()}`);
    _strings = await res.json();
  } catch(e) {
    console.warn('i18n: could not load', lang, e);
    _strings = {};
  }
  _currentLang = lang;
  localStorage.setItem('phobos_lang', lang);
  applyLang();
}

// Get a string by key
function t(key) {
  return _strings[key] || key;
}

// Apply all data-i18n attributes on the page
function applyLang() {
  const cfg = PHOBOS_LANGS[_currentLang];

  // Direction
  document.documentElement.dir = cfg.dir;
  document.documentElement.lang = _currentLang;

  // RTL body class
  if (cfg.dir === 'rtl') {
    document.body.classList.add('rtl');
  } else {
    document.body.classList.remove('rtl');
  }

  // Apply text to all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (_strings[key]) el.textContent = _strings[key];
  });

  // Apply placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (_strings[key]) el.placeholder = _strings[key];
  });

  // Load non-Latin font if needed
  if (cfg.font) {
    const fontId = 'i18n-font-' + _currentLang;
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${cfg.font.replace(/ /g,'+')}:wght@400;600;700&display=swap`;
      document.head.appendChild(link);
    }
    document.body.style.fontFamily = `'${cfg.font}', Inter, sans-serif`;
  } else {
    document.body.style.fontFamily = '';
  }

  // Update switcher active state
  document.querySelectorAll('.lang-opt').forEach(el => {
    const isActive = el.getAttribute('data-lang') === _currentLang;
    el.style.background = isActive ? '#e25700' : '';
    el.style.color = isActive ? '#fff' : '';
  });
}

// Inject the language switcher into a nav element
function i18nInjectSwitcher(targetEl) {
  if (!targetEl) return;

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:relative;display:inline-block;';

  // Trigger button
  const btn = document.createElement('button');
  btn.id = 'lang-switcher-btn';
  btn.style.cssText = `
    display:flex;align-items:center;gap:0.4rem;
    background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);
    color:#fff;border-radius:4px;padding:0.35rem 0.65rem;
    font-family:'Space Grotesk',sans-serif;font-size:0.7rem;font-weight:700;
    text-transform:uppercase;letter-spacing:0.06em;cursor:pointer;
    transition:background 0.15s;white-space:nowrap;
  `;
  btn.innerHTML = `<span id="lang-flag">${PHOBOS_LANGS[_currentLang].flag}</span><span id="lang-label">${PHOBOS_LANGS[_currentLang].label}</span><span style="font-size:0.6rem;opacity:0.7;">▼</span>`;

  // Dropdown
  const dropdown = document.createElement('div');
  dropdown.id = 'lang-dropdown';
  dropdown.style.cssText = `
    display:none;position:absolute;top:calc(100% + 6px);right:0;
    background:#0f172a;border:1px solid rgba(255,255,255,0.1);
    border-radius:6px;min-width:160px;z-index:99999;
    box-shadow:0 8px 24px rgba(0,0,0,0.4);overflow:hidden;
  `;

  Object.entries(PHOBOS_LANGS).forEach(([code, cfg]) => {
    const opt = document.createElement('button');
    opt.className = 'lang-opt';
    opt.setAttribute('data-lang', code);
    opt.style.cssText = `
      display:flex;align-items:center;gap:0.6rem;width:100%;
      padding:0.5rem 0.9rem;background:none;border:none;
      font-family:'Space Grotesk',sans-serif;font-size:0.78rem;font-weight:600;
      color:#e2e8f0;cursor:pointer;text-align:left;transition:background 0.1s;
    `;
    opt.innerHTML = `<span style="font-size:1.1rem;">${cfg.flag}</span><span>${cfg.label}</span>`;
    opt.onmouseover = () => { if (code !== _currentLang) opt.style.background = 'rgba(255,255,255,0.08)'; };
    opt.onmouseout  = () => { if (code !== _currentLang) opt.style.background = ''; };
    opt.addEventListener('click', () => {
      i18nLoad(code);
      dropdown.style.display = 'none';
      document.getElementById('lang-flag').textContent = cfg.flag;
      document.getElementById('lang-label').textContent = cfg.label;
    });
    dropdown.appendChild(opt);
  });

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  });
  document.addEventListener('click', () => { dropdown.style.display = 'none'; });

  wrapper.appendChild(btn);
  wrapper.appendChild(dropdown);
  targetEl.appendChild(wrapper);
}

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  const saved = localStorage.getItem('phobos_lang') || 'en';
  await i18nLoad(saved);
  // Inject switcher into header
  const header = document.querySelector('header .flex.items-center.gap-6, header .flex.items-center.gap-4');
  if (header) i18nInjectSwitcher(header);
});
