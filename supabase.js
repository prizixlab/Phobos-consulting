// ═══════════════════════════════════════════
// PHOBOS CONSULTING — Supabase Client v3
// Multi-tenant — all queries scoped to org_id
// ═══════════════════════════════════════════

const SUPABASE_URL = 'https://qihnbkrpmockrzdkomdp.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpaG5ia3JwbW9ja3J6ZGtvbWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MTQ5MTYsImV4cCI6MjA5MjA5MDkxNn0.w-SGv294gfmOC8NlDoyOQs6iU2RbTKCudpiPs4JPs8A';

const sb = {
  url: SUPABASE_URL,
  key: SUPABASE_ANON,

  // ── SESSION ──
  getSession() {
    try {
      const raw = localStorage.getItem('phobos_session');
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (s.expires_at && Date.now() / 1000 > s.expires_at) {
        localStorage.removeItem('phobos_session');
        return null;
      }
      return s;
    } catch { return null; }
  },

  setSession(s) {
    if (s) localStorage.setItem('phobos_session', JSON.stringify(s));
    else localStorage.removeItem('phobos_session');
  },

  getUser() {
    const s = this.getSession();
    return s ? s.user : null;
  },

  // ── ORG ──
  getOrgId() {
    try {
      const raw = localStorage.getItem('phobos_org');
      return raw ? JSON.parse(raw).id : null;
    } catch { return null; }
  },

  getOrg() {
    try {
      const raw = localStorage.getItem('phobos_org');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  setOrg(org) {
    if (org) localStorage.setItem('phobos_org', JSON.stringify(org));
    else localStorage.removeItem('phobos_org');
  },

  // Load org from profile after login
  async loadOrg() {
    const user = this.getUser();
    if (!user) return null;
    const res = await fetch(
      `${this.url}/rest/v1/profiles?select=org_id,org_role,organizations(*)&id=eq.${user.id}`,
      { headers: this.headers() }
    );
    const data = await res.json();
    if (data && data[0] && data[0].organizations) {
      const org = { ...data[0].organizations, org_role: data[0].org_role };
      this.setOrg(org);
      return org;
    }
    return null;
  },

  // ── AUTH ──
  headers() {
    const s = this.getSession();
    return {
      'Content-Type': 'application/json',
      'apikey': this.key,
      'Authorization': `Bearer ${s ? s.access_token : this.key}`
    };
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
      await this.loadOrg();
      return { data, error: null };
    }
    return { data: null, error: data };
  },

  async signOut() {
    try {
      await fetch(`${this.url}/auth/v1/logout`, { method: 'POST', headers: this.headers() });
    } catch(e) {}
    this.setSession(null);
    this.setOrg(null);
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

  // ── DATA — all queries auto-scoped to org ──
  async select(table, query = '*', filters = {}) {
    let url = `${this.url}/rest/v1/${table}?select=${encodeURIComponent(query)}`;
    // Auto-inject org_id for tenant tables
    const orgTables = ['containers', 'movement_log'];
    const orgId = this.getOrgId();
    if (orgTables.includes(table) && orgId) {
      url += `&org_id=eq.${orgId}`;
    }
    for (const [k, v] of Object.entries(filters)) {
      url += `&${k}=eq.${encodeURIComponent(v)}`;
    }
    url += '&order=created_at.desc';
    const res = await fetch(url, { headers: { ...this.headers(), 'Prefer': 'return=representation' } });
    const data = await res.json();
    return { data: Array.isArray(data) ? data : [], error: res.ok ? null : data };
  },

  async insert(table, row) {
    // Auto-inject org_id for tenant tables
    const orgTables = ['containers', 'movement_log'];
    const orgId = this.getOrgId();
    if (orgTables.includes(table) && orgId) {
      row = { ...row, org_id: orgId };
    }
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

// ── AUTH GUARD ──
function requireAuth() {
  if (!sb.getSession()) { window.location.href = 'login.html'; return false; }
  return true;
}

async function signOut() {
  await sb.signOut();
  window.location.href = 'login.html';
}

// ── TOAST ──
window.showToast = function(msg, type) {
  const color = type==='success'?'#16a34a':type==='error'?'#ba1a1a':'#1e293b';
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:1.5rem;right:1.5rem;z-index:99999;background:${color};color:#fff;padding:0.75rem 1.25rem;border-radius:0.25rem;font-family:Inter,sans-serif;font-size:0.8rem;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,0.2);transition:opacity 0.3s;`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';setTimeout(()=>t.remove(),300);},2800);
};

// ── SPIN ANIMATION ──
if (!document.getElementById('sb-spin-style')) {
  const s = document.createElement('style');
  s.id = 'sb-spin-style';
  s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
  document.head && document.head.appendChild(s);
}
