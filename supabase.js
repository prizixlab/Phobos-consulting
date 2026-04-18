// ═══════════════════════════════════════════
// PHOBOS CONSULTING — Supabase Client v2
// ═══════════════════════════════════════════

const SUPABASE_URL = 'https://qihnbkrpmockrzdkomdp.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpaG5ia3JwbW9ja3J6ZGtvbWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MTQ5MTYsImV4cCI6MjA5MjA5MDkxNn0.w-SGv294gfmOC8NlDoyOQs6iU2RbTKCudpiPs4JPs8A';

const sb = {
  url: SUPABASE_URL,
  key: SUPABASE_ANON,

  headers() {
    const session = this.getSession();
    return {
      'Content-Type': 'application/json',
      'apikey': this.key,
      'Authorization': `Bearer ${session ? session.access_token : this.key}`
    };
  },

  getSession() {
    try {
      const raw = localStorage.getItem('phobos_session');
      if (!raw) return null;
      const session = JSON.parse(raw);
      // Check if expired
      if (session.expires_at && Date.now() / 1000 > session.expires_at) {
        localStorage.removeItem('phobos_session');
        return null;
      }
      return session;
    } catch { return null; }
  },

  setSession(session) {
    if (session) localStorage.setItem('phobos_session', JSON.stringify(session));
    else localStorage.removeItem('phobos_session');
  },

  getUser() {
    const session = this.getSession();
    return session ? session.user : null;
  },

  async signIn(email, password) {
    const res = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': this.key },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.access_token) {
      this.setSession(data);
      return { data, error: null };
    }
    return { data: null, error: data };
  },

  async signOut() {
    try {
      const session = this.getSession();
      if (session) {
        await fetch(`${this.url}/auth/v1/logout`, {
          method: 'POST',
          headers: { ...this.headers() }
        });
      }
    } catch(e) {}
    this.setSession(null);
  },

  async resetPassword(email) {
    const res = await fetch(`${this.url}/auth/v1/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': this.key },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    return { data, error: res.ok ? null : data };
  },

  async select(table, query = '*', filters = {}) {
    let url = `${this.url}/rest/v1/${table}?select=${encodeURIComponent(query)}`;
    for (const [k, v] of Object.entries(filters)) {
      url += `&${k}=eq.${encodeURIComponent(v)}`;
    }
    url += '&order=created_at.desc';
    const res = await fetch(url, { headers: { ...this.headers(), 'Prefer': 'return=representation' } });
    const data = await res.json();
    return { data: Array.isArray(data) ? data : [], error: res.ok ? null : data };
  },

  async insert(table, row) {
    const res = await fetch(`${this.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: { ...this.headers(), 'Prefer': 'return=representation' },
      body: JSON.stringify(row)
    });
    const data = await res.json();
    return { data, error: res.ok ? null : data };
  },

  async update(table, row, match) {
    let url = `${this.url}/rest/v1/${table}`;
    const params = Object.entries(match).map(([k,v]) => `${k}=eq.${encodeURIComponent(v)}`).join('&');
    if (params) url += '?' + params;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { ...this.headers(), 'Prefer': 'return=representation' },
      body: JSON.stringify(row)
    });
    const data = await res.json();
    return { data, error: res.ok ? null : data };
  },

  async delete(table, match) {
    let url = `${this.url}/rest/v1/${table}`;
    const params = Object.entries(match).map(([k,v]) => `${k}=eq.${encodeURIComponent(v)}`).join('&');
    if (params) url += '?' + params;
    const res = await fetch(url, { method: 'DELETE', headers: this.headers() });
    return { error: res.ok ? null : await res.json() };
  }
};

// Guard: redirect to login if not authenticated
function requireAuth() {
  const session = sb.getSession();
  if (!session || !session.access_token) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Global sign out
async function signOut() {
  await sb.signOut();
  window.location.href = 'login.html';
}

// Populate profile UI elements if they exist
(function() {
  const user = sb.getUser();
  if (!user) return;
  // Update profile menu
  const emailEls = document.querySelectorAll('[data-user-email]');
  const nameEls  = document.querySelectorAll('[data-user-name]');
  emailEls.forEach(el => el.textContent = user.email || '');
  nameEls.forEach(el => el.textContent = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Operator');
})();

// Loading state helper
function showLoading(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;padding:2rem;gap:0.75rem;color:#76777d;font-family:Inter,sans-serif;font-size:0.8rem;"><div style="width:16px;height:16px;border:2px solid #e25700;border-top-color:transparent;border-radius:50%;animation:spin 0.7s linear infinite;"></div> Loading...</div>';
}

function hideLoading(containerId) {
  // handled by render functions overwriting content
}

// Add spin animation once
if (!document.getElementById('sb-spin-style')) {
  const style = document.createElement('style');
  style.id = 'sb-spin-style';
  style.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(style);
}

// Toast helper (global)
window.showToast = function(msg, type) {
  const color = type==='success'?'#16a34a':type==='error'?'#ba1a1a':'#1e293b';
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:1.5rem;right:1.5rem;z-index:99999;background:${color};color:#fff;padding:0.75rem 1.25rem;border-radius:0.25rem;font-family:Inter,sans-serif;font-size:0.8rem;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,0.2);transition:opacity 0.3s;`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';setTimeout(()=>t.remove(),300);},2800);
};
