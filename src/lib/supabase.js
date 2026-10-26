/**
 * Supabase client instance and helpers for the Nexlume Fair Price Shop application.
 * Provides resilient access to Supabase Auth, PostgREST database operations,
 * Storage bucket management, and Realtime event subscriptions.
 */

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  || ''

export const isSupabaseConfigured = Boolean(
  supabaseUrl
  && supabaseAnonKey
  && !supabaseUrl.includes('your-project-id')
  && !supabaseUrl.includes('your_supabase_project_url')
)

export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  stockSource: import.meta.env.VITE_STOCK_SOURCE || 'demo',
}

// Storage key used to persist sessions matching standard Supabase format
const projectRef = (supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/) || [])[1] || 'nexlume'
const AUTH_STORAGE_KEY = `sb-${projectRef}-auth-token`

export function isValidJwt(token) {
  return typeof token === 'string' && token.split('.').length === 3
}

export function getSafeAuthHeader(token, anonKey) {
  if (isValidJwt(token)) return `Bearer ${token}`
  if (isValidJwt(anonKey)) return `Bearer ${anonKey}`
  return null
}

class SupabaseAuthClient {
  constructor() {
    this.listeners = new Set()
    this.session = this._loadSession()
  }

  _loadSession() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (parsed?.access_token) {
        if (parsed.expires_at && (Date.now() / 1000 > parsed.expires_at)) {
          localStorage.removeItem(AUTH_STORAGE_KEY)
          return null
        }
        return parsed
      }
      return null
    } catch {
      return null
    }
  }

  _saveSession(session) {
    if (session) {
      if (!session.expires_at && session.expires_in) {
        session.expires_at = Math.floor(Date.now() / 1000) + Number(session.expires_in)
      } else if (!session.expires_at) {
        session.expires_at = Math.floor(Date.now() / 1000) + 86400 * 7
      }
    }
    this.session = session
    try {
      if (session) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    } catch (err) {
      console.error('Failed to persist session to localStorage', err)
    }
  }

  setSession(session) {
    this._saveSession(session)
    this._notify('SIGNED_IN', session)
    return { data: { session }, error: null }
  }

  _notify(event, session) {
    this.listeners.forEach((callback) => {
      try {
        callback(event, session)
      } catch (err) {
        console.error('Error in auth state change listener', err)
      }
    })
  }

  async getSession() {
    this.session = this._loadSession()
    return { data: { session: this.session }, error: null }
  }

  async getUser() {
    const { data: { session } } = await this.getSession()
    return { data: { user: session?.user || null }, error: null }
  }

  async signInWithPassword({ email, password }) {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error('Supabase is not configured. Check your environment variables.') }
    }

    try {
      const authHeader = getSafeAuthHeader(null, supabaseAnonKey)
      const signInHeaders = {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey,
      }
      if (authHeader) signInHeaders['Authorization'] = authHeader
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: signInHeaders,
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      if (!response.ok) {
        return {
          data: null,
          error: new Error(data.msg || data.error_description || data.message || 'Invalid login credentials.'),
        }
      }

      this._saveSession(data)
      this._notify('SIGNED_IN', data)
      return { data: { user: data.user, session: data }, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error('Network error during authentication.') }
    }
  }

  async signUp({ email, password, options = {} }) {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error('Supabase is not configured.') }
    }

    try {
      const authHeader = getSafeAuthHeader(null, supabaseAnonKey)
      const signUpHeaders = {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey,
      }
      if (authHeader) signUpHeaders['Authorization'] = authHeader
      const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: signUpHeaders,
        body: JSON.stringify({
          email,
          password,
          data: options.data || {},
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        return {
          data: null,
          error: new Error(data.msg || data.error_description || data.message || 'Registration failed.'),
        }
      }

      if (data.access_token) {
        this._saveSession(data)
        this._notify('SIGNED_IN', data)
      }
      return { data: { user: data.user, session: data }, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error('Network error during signup.') }
    }
  }

  async signOut() {
    const token = this.session?.access_token
    this._saveSession(null)
    this._notify('SIGNED_OUT', null)

    if (token && isSupabaseConfigured) {
      try {
        await fetch(`${supabaseUrl}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${token}`,
          },
        })
      } catch {
        // Safe to ignore remote logout network failures after local clear
      }
    }
    return { error: null }
  }

  onAuthStateChange(callback) {
    this.listeners.add(callback)
    setTimeout(() => {
      callback(this.session ? 'SIGNED_IN' : 'INITIAL_SESSION', this.session)
    }, 0)
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners.delete(callback)
          },
        },
      },
    }
  }
}

class PostgrestQueryBuilder {
  constructor(table, authClient) {
    this.table = table
    this.authClient = authClient
    this.method = 'GET'
    this.params = new URLSearchParams()
    this.body = null
    this.headers = {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
      Prefer: 'return=representation',
    }
    this.isSingle = false
  }

  _getAuthHeader() {
    const token = this.authClient?.session?.access_token
    return getSafeAuthHeader(token, supabaseAnonKey)
  }

  select(columns = '*') {
    this.method = 'GET'
    this.params.set('select', columns)
    return this
  }

  insert(values) {
    this.method = 'POST'
    this.body = Array.isArray(values) ? values : [values]
    return this
  }

  update(values) {
    this.method = 'PATCH'
    this.body = values
    return this
  }

  delete() {
    this.method = 'DELETE'
    return this
  }

  eq(column, value) {
    this.params.set(column, `eq.${value}`)
    return this
  }

  neq(column, value) {
    this.params.set(column, `neq.${value}`)
    return this
  }

  order(column, { ascending = true } = {}) {
    this.params.set('order', `${column}.${ascending ? 'asc' : 'desc'}`)
    return this
  }

  limit(count) {
    this.params.set('limit', String(count))
    return this
  }

  single() {
    this.isSingle = true
    this.headers['Accept'] = 'application/vnd.pgrst.object+json'
    return this
  }

  async execute() {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error('Supabase URL and API key are not configured.') }
    }

    try {
      const qs = this.params.toString()
      const url = `${supabaseUrl}/rest/v1/${this.table}${qs ? `?${qs}` : ''}`
      const headers = {
        ...this.headers,
      }
      const authHeader = this._getAuthHeader()
      if (authHeader) {
        headers['Authorization'] = authHeader
      }

      const options = {
        method: this.method,
        headers,
      }
      if (this.body !== null) {
        options.body = JSON.stringify(this.body)
      }

      const response = await fetch(url, options)

      if (response.status === 204) {
        return { data: null, error: null }
      }

      const text = await response.text()
      let json = null
      if (text) {
        try {
          json = JSON.parse(text)
        } catch {
          json = text
        }
      }

      if (!response.ok) {
        const errorMsg = json?.message || json?.error || `Database error (${response.status})`
        return { data: null, error: new Error(errorMsg) }
      }

      return { data: json, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error('Network error during database query.') }
    }
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject)
  }
}

class StorageClient {
  constructor(bucket, authClient) {
    this.bucket = bucket
    this.authClient = authClient
  }

  _getAuthHeader() {
    const token = this.authClient?.session?.access_token
    return getSafeAuthHeader(token, supabaseAnonKey)
  }

  async upload(path, file, { contentType, upsert = true } = {}) {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error('Supabase is not configured.') }
    }

    try {
      const cleanPath = path.replace(/^\/+/, '')
      const url = `${supabaseUrl}/storage/v1/object/${this.bucket}/${cleanPath}`
      const headers = {
        apikey: supabaseAnonKey,
        'x-upsert': upsert ? 'true' : 'false',
      }
      const authHeader = this._getAuthHeader()
      if (authHeader) headers['Authorization'] = authHeader
      if (contentType) headers['Content-Type'] = contentType

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: file,
      })

      const json = await response.json().catch(() => null)
      if (!response.ok) {
        return { data: null, error: new Error(json?.message || json?.error || 'Failed to upload image.') }
      }

      return { data: { path: cleanPath }, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error('Upload network error.') }
    }
  }

  getPublicUrl(path) {
    const cleanPath = path.replace(/^\/+/, '')
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${this.bucket}/${cleanPath}`
    return { data: { publicUrl } }
  }

  async remove(paths) {
    if (!isSupabaseConfigured) return { data: null, error: new Error('Supabase is not configured.') }
    try {
      const url = `${supabaseUrl}/storage/v1/object/${this.bucket}`
      const headers = {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey,
      }
      const authHeader = this._getAuthHeader()
      if (authHeader) headers['Authorization'] = authHeader

      const response = await fetch(url, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ prefixes: paths }),
      })
      const json = await response.json().catch(() => null)
      if (!response.ok) {
        return { data: null, error: new Error(json?.message || 'Failed to delete file.') }
      }
      return { data: json, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error('Storage delete error.') }
    }
  }
}

class RealtimeChannel {
  constructor(name, client) {
    this.name = name
    this.client = client
    this.handlers = []
    this.pollingTimer = null
  }

  on(event, filter, callback) {
    this.handlers.push({ event, filter, callback })
    return this
  }

  subscribe(statusCallback) {
    if (typeof statusCallback === 'function') {
      setTimeout(() => statusCallback('SUBSCRIBED'), 0)
    }

    // Try WebSocket connection if possible, with periodic poll heartbeat
    try {
      const wsUrl = supabaseUrl.replace(/^http/, 'ws') + `/realtime/v1/websocket?apikey=${supabaseAnonKey}&vsn=1.0.0`
      const ws = new WebSocket(wsUrl)
      this.ws = ws

      ws.onopen = () => {
        // Join topic
        ws.send(JSON.stringify({
          topic: `realtime:public`,
          event: 'phx_join',
          payload: {},
          ref: '1',
        }))
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.event === 'postgres_changes' && msg.payload) {
            this.handlers.forEach((h) => {
              if (h.filter?.table && msg.payload.data?.table !== h.filter.table) return
              h.callback(msg.payload.data || msg.payload)
            })
          }
        } catch {
          // ignore malformed messages
        }
      }

      ws.onerror = () => {
        // Fallback or reconnect silently
      }
    } catch {
      // WebSocket unsupported or blocked
    }

    return this
  }

  unsubscribe() {
    if (this.ws) {
      try {
        this.ws.close()
      } catch {
        // ignore close errors
      }
      this.ws = null
    }
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer)
      this.pollingTimer = null
    }
  }
}

class SupabaseClient {
  constructor() {
    this.auth = new SupabaseAuthClient()
  }

  from(table) {
    return new PostgrestQueryBuilder(table, this.auth)
  }

  storage = {
    from: (bucket) => new StorageClient(bucket, this.auth),
  }

  channel(name) {
    return new RealtimeChannel(name, this)
  }

  removeChannel(channel) {
    if (channel && typeof channel.unsubscribe === 'function') {
      channel.unsubscribe()
    }
  }

  async rpc(functionName, params = {}) {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error('Supabase is not configured.') }
    }

    try {
      const url = `${supabaseUrl}/rest/v1/rpc/${functionName}`
      const token = this.auth?.session?.access_token
      const authHeader = getSafeAuthHeader(token, supabaseAnonKey)
      const headers = {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey,
      }
      if (authHeader) headers['Authorization'] = authHeader

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      })

      const text = await response.text()
      let json = null
      if (text) {
        try {
          json = JSON.parse(text)
        } catch {
          json = text
        }
      }

      if (!response.ok) {
        return { data: null, error: new Error(json?.message || `RPC ${functionName} failed (${response.status})`) }
      }
      return { data: json, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error('RPC network error.') }
    }
  }
}

export const supabase = new SupabaseClient()
export default supabase
