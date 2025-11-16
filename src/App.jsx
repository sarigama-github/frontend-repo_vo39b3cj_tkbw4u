import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { Menu, LayoutDashboard, KeyRound, Settings, LogOut, Moon, Sun, Plus, Copy } from 'lucide-react'
import Spline from '@splinetool/react-spline'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])
  return { theme, setTheme }
}

function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u) : null
  })

  const login = (t, u) => {
    setToken(t)
    setUser(u)
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))
  }
  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    } catch {}
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])

  return { token, user, login, logout, headers, setUser }
}

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'register') {
        const res = await fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: form.username, email: form.email, password: form.password }) })
        if (!res.ok) throw new Error((await res.json()).detail || 'Gagal mendaftar')
      }
      const loginRes = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email, password: form.password }) })
      if (!loginRes.ok) throw new Error((await loginRes.json()).detail || 'Login gagal')
      const data = await loginRes.json()
      onLogin(data.token, data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative bg-white dark:bg-gray-950">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/VJLoxp84lCdVfdZu/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white dark:from-gray-950/90 dark:via-gray-950/70 dark:to-gray-950" />
      </div>
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/40 dark:border-white/10 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">nexus-explorer</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Buat dan kelola API key dengan dashboard elegan</p>
          </div>

          <div className="flex gap-2 mb-6">
            <button onClick={() => setMode('login')} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${mode==='login'?'bg-indigo-600 text-white':'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}>Masuk</button>
            <button onClick={() => setMode('register')} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${mode==='register'?'bg-indigo-600 text-white':'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}>Daftar</button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Username</label>
                <input value={form.username} onChange={e=>setForm({ ...form, username: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="username" required />
              </div>
            )}
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Email</label>
              <input type="email" value={form.email} onChange={e=>setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Password</label>
              <input type="password" value={form.password} onChange={e=>setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="••••••••" required />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button disabled={loading} className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition disabled:opacity-60">{loading? 'Mohon tunggu...' : (mode==='login'?'Masuk':'Daftar & Masuk')}</button>
          </form>
        </div>
      </div>
    </div>
  )
}

function Sidebar({ open, setOpen, current, setCurrent, onLogout, theme, setTheme }) {
  const Item = ({ id, icon: Icon, label }) => (
    <button onClick={() => { setCurrent(id); setOpen(false) }} className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm font-medium transition ${current===id? 'bg-indigo-600 text-white':'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
      <Icon size={18} /> {label}
    </button>
  )
  return (
    <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200/60 dark:border-gray-800/60 p-4 transition-transform ${open? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">nexus-explorer</div>
        <button onClick={()=>setOpen(false)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><Menu size={18}/></button>
      </div>
      <div className="space-y-2">
        <Item id="dashboard" icon={LayoutDashboard} label="Dashboard" />
        <Item id="api" icon={KeyRound} label="API" />
        <Item id="settings" icon={Settings} label="Setting" />
      </div>
      <div className="absolute bottom-4 inset-x-4 space-y-2">
        <button onClick={()=>setTheme(theme==='dark'?'light':'dark')} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
          {theme==='dark'? <Sun size={16}/> : <Moon size={16}/>} {theme==='dark'? 'Tema Terang' : 'Tema Gelap'}
        </button>
        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/90 hover:bg-red-600 text-white">
          <LogOut size={16}/> Keluar
        </button>
      </div>
    </div>
  )
}

function Topbar({ setOpen, title }) {
  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 p-4 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60">
      <button onClick={()=>setOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><Menu size={18} /></button>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
    </div>
  )
}

function DashboardPage({ headers }) {
  const [stats, setStats] = useState({ total_keys: 0, total_usage: 0 })
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`${API_BASE}/stats`, { headers })
        const data = await res.json()
        setStats(data)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [headers])
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card title="Total Pemakaian API">
        <div className="text-4xl font-extrabold text-indigo-600">{loading? '...' : stats.total_usage}</div>
      </Card>
      <Card title="Jumlah API Keys">
        <div className="text-4xl font-extrabold text-indigo-600">{loading? '...' : stats.total_keys}</div>
      </Card>
    </div>
  )
}

function ApiPage({ headers }) {
  const [keys, setKeys] = useState([])
  const [openModal, setOpenModal] = useState(false)
  const [label, setLabel] = useState('')
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState('')

  const loadKeys = async () => {
    const res = await fetch(`${API_BASE}/api-keys`, { headers })
    const data = await res.json()
    setKeys(data)
  }
  useEffect(()=>{ loadKeys() }, [])

  const createKey = async () => {
    setCreating(true)
    try {
      const res = await fetch(`${API_BASE}/api-keys/create`, { method: 'POST', headers, body: JSON.stringify({ username: label || undefined }) })
      const data = await res.json()
      setOpenModal(false)
      setLabel('')
      await loadKeys()
      alert(`API key berhasil dibuat: ${data.key}`)
    } finally {
      setCreating(false)
    }
  }

  const copy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(()=>setCopied(''), 2000)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">API Keys</h3>
          <p className="text-sm text-gray-500">Jumlah dimiliki: {keys.length}</p>
        </div>
        <button onClick={()=>setOpenModal(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"><Plus size={16}/> Create API Key</button>
      </div>

      <div className="grid gap-3">
        {keys.map(k => (
          <div key={k.id} className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <div>
              <div className="font-mono text-sm text-gray-900 dark:text-gray-100">{k.key}</div>
              <div className="text-xs text-gray-500">Label: {k.label || '-'} • Dipakai: {k.usage_count}x</div>
            </div>
            <button onClick={()=>copy(k.key)} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 inline-flex items-center gap-2">
              <Copy size={14}/> {copied===k.key? 'Tersalin' : 'Copy'}
            </button>
          </div>
        ))}
        {keys.length===0 && (
          <div className="text-center text-sm text-gray-500">Belum ada API key. Buat yang pertama.</div>
        )}
      </div>

      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h4 className="text-lg font-semibold mb-3">Create API Key</h4>
            <label className="block text-sm mb-1">username</label>
            <input value={label} onChange={e=>setLabel(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-4" placeholder="opsional"/>
            <div className="flex justify-end gap-2">
              <button onClick={()=>setOpenModal(false)} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">Batal</button>
              <button disabled={creating} onClick={createKey} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white">{creating? 'Membuat...' : 'Done'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SettingsPage({ headers, user, setUser }) {
  const [form, setForm] = useState({ username: user?.username || '', email: user?.email || '' })
  const [saving, setSaving] = useState(false)
  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/me`, { method: 'PATCH', headers, body: JSON.stringify({ username: form.username, email: form.email }) })
      if (!res.ok) {
        const d = await res.json(); throw new Error(d.detail || 'Gagal menyimpan')
      }
      setUser({ ...user, username: form.username, email: form.email })
      localStorage.setItem('user', JSON.stringify({ ...user, username: form.username, email: form.email }))
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-xl space-y-4">
      <Card title="Edit Profile">
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input value={form.username} onChange={e=>setForm({ ...form, username: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"/>
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" value={form.email} onChange={e=>setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"/>
          </div>
          <button disabled={saving} onClick={save} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white">{saving? 'Menyimpan...' : 'Simpan'}</button>
        </div>
      </Card>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 p-5 shadow">
      {title && <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</div>}
      {children}
    </div>
  )
}

function AppShell() {
  const { theme, setTheme } = useTheme()
  const { token, user, login, logout, headers, setUser } = useAuth()
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('api')

  if (!token) {
    return <AuthScreen onLogin={login} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <Sidebar open={open} setOpen={setOpen} current={current} setCurrent={setCurrent} onLogout={logout} theme={theme} setTheme={setTheme} />
      <div className="md:pl-72">
        <Topbar setOpen={setOpen} title={current==='dashboard' ? 'Dashboard' : current==='api' ? 'API' : 'Setting'} />
        {current === 'dashboard' && <DashboardPage headers={headers} />}
        {current === 'api' && <ApiPage headers={headers} />}
        {current === 'settings' && <SettingsPage headers={headers} user={user} setUser={setUser} />}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />} />
      </Routes>
    </BrowserRouter>
  )
}
