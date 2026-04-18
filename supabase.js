// ═══════════════════════════════════════════
// PHOBOS CONSULTING — Supabase Client
// ═══════════════════════════════════════════

const SUPABASE_URL = 'https://qihnbkrpmockrzdkomdp.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpaG5ia3JwbW9ja3J6ZGtvbWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MTQ5MTYsImV4cCI6MjA5MjA5MDkxNn0.w-SGv294gfmOC8NlDoyOQs6iU2RbTKCudpiPs4JPs8A';

// Lightweight Supabase client (no npm needed)
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
      return raw ? JSON.parse(raw) : null;
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
    const session = this.getSession();
    if (session) {
      await fetch(`${this.url}/auth/v1/logout`, {
        method: 'POST',
        headers: { ...this.headers(), 'Authorization': `Bearer ${session.access_token}` }
      }).catch(() => {});
    }
    this.setSession(null);
  },

  async from(table) {
    return new SBQuery(this, table);
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

  async rpc(fn, params = {}) {
    const res = await fetch(`${this.url}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(params)
    });
    const data = await res.json();
    return { data, error: res.ok ? null : data };
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

// Sign out helper
async function signOut() {
  await sb.signOut();
  window.location.href = 'login.html';
}
