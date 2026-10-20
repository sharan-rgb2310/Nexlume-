import { useEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import './admin.css'
import {
  AlertTriangle, ArrowDown, ArrowUp, Building2, CalendarDays, Check, CheckCircle2, Clock3,
  ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Filter, LayoutDashboard,
  Menu, Monitor, Pencil, Plus, Search, Settings as SettingsIcon, ShieldCheck,
  SlidersHorizontal, Store, Trash2, CircleUserRound, Wifi, X, Eye,
} from 'lucide-react'
import { StoreProvider } from './context'
import { initialData } from './data'
import { useStore } from './useStore'
import governmentSeal from '../assets/Seal_of_Tamil_Nadu.svg.webp'
import nexlumeLogo from '../assets/Nexlume Futuristic X Logo.png'

const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/shops', label: 'Shops', icon: Store },
  { to: '/admin/settings', label: 'Settings', icon: SettingsIcon },
]
const cls = (...args) => args.filter(Boolean).join(' ')
const inputClass = 'form-input'
const appStartTime = new Date()
const roleCapabilities = (role) => ({ write: role !== 'Viewer', remove: role === 'Admin' || role === 'Manager' })

function Shell() {
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [now, setNow] = useState(appStartTime)
  const { data } = useStore()
  const settings = data.settings
  const locale = settings.language === 'Tamil' ? 'ta-IN' : 'en-IN'
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    document.title = `${settings.applicationTitle || 'Ration Shop TV Display System'} | ${settings.branding || 'NEXLUME'}`
  }, [settings.applicationTitle, settings.branding])

  return (
    <div className="admin-app-root">
      <div className="app-shell" data-theme={settings.theme?.toLowerCase() || 'light'}>
      <header className="topbar">
        <button aria-label="Open navigation" className="mobile-menu" onClick={() => setMobileNav(!mobileNav)}><Menu size={21} /></button>
        <div className="government-brand">
          <img src={governmentSeal} alt="Tamil Nadu emblem" />
          <span><b>Government of Tamil Nadu</b><small>Department of Consumer Affairs<br />and Public Distribution</small></span>
        </div>
        <div className="brand-divider" />
        <div className="nexlume-brand"><img src={nexlumeLogo} alt="NEXLUME" /></div>
        <div className="brand-divider second-divider" />
        <div className="system-heading"><b>{settings.applicationTitle || 'Ration Shop TV Display System'}</b><small>Live Monitoring Dashboard</small></div>
        <div className="header-actions">
          <div className="date-widget">
            <span className="date-block"><CalendarDays size={19} /><span>{formatDate(now, settings, locale)}</span></span>
            <span className="time-block"><Clock3 size={16} /><b>{formatTime(now, settings, locale)}</b></span>
          </div>
          <div className="profile-wrap">
            <button className="profile-button" onClick={() => setProfileOpen(!profileOpen)}><CircleUserRound size={19} /><span><b>{data.settings.name || 'Admin'}</b><small>{data.settings.role || 'System Administrator'}</small></span><ChevronDown size={14} /></button>
            {profileOpen && <div className="profile-menu"><b>{data.settings.name || 'Admin'}</b><span>{data.settings.email || 'admin@tn.gov.in'}</span><NavLink to="/admin/settings" onClick={() => setProfileOpen(false)}>Profile settings</NavLink></div>}
          </div>
        </div>
      </header>
      <div className="body-shell">
        {mobileNav && <button aria-label="Close navigation" className="mobile-scrim" onClick={() => setMobileNav(false)} />}
        <aside className={cls('sidebar', mobileNav && 'sidebar-open')}>
          <nav className="side-nav">{nav.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/admin'} onClick={() => setMobileNav(false)} className={({ isActive }) => cls('side-link', isActive && 'active')}><Icon size={20} /><span>{label}</span></NavLink>)}</nav>
          <div className="sidebar-online"><i /><span><b>System Online</b><small>All services are running</small></span></div>
        </aside>
        <main className="main-content">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="shops" element={<ShopsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
          <footer className="footer-note"><span>{data.settings.systemName || 'Ration Shop TV Display System'}</span><span>Frontend preview · Local browser data</span></footer>
        </main>
      </div>
      <Toast />
    </div>
    </div>
  )
}

function Toast() {
  const { toast } = useStore()
  if (!toast) return null
  return <div className={cls('toast', toast.type === 'error' && 'toast-error')}><CheckCircle2 size={18} />{toast.message}</div>
}

function formatDate(date, settings, locale) {
  const options = { day: '2-digit', month: settings.dateFormat === 'DD MMM YYYY' ? 'short' : '2-digit', year: 'numeric', timeZone: settings.timezone || 'Asia/Kolkata' }
  const parts = new Intl.DateTimeFormat(locale, options).formatToParts(date)
  const day = parts.find((part) => part.type === 'day')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const year = parts.find((part) => part.type === 'year')?.value
  return settings.dateFormat === 'MM/DD/YYYY' ? `${month}/${day}/${year}` : settings.dateFormat === 'DD/MM/YYYY' ? `${day}/${month}/${year}` : `${day} ${month} ${year}`
}

function formatTime(date, settings, locale) {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: settings.timeFormat !== '24-hour',
    timeZone: settings.timezone || 'Asia/Kolkata',
  }).format(date)
}

function StatusBadge({ value }) {
  const normalized = (value || 'Unassigned').toLowerCase()
  const clsName = normalized === 'running' || normalized === 'active' || normalized === 'connected'
    ? 'green' : normalized === 'error' ? 'amber' : normalized === 'stopped' || normalized === 'offline' || normalized === 'disconnected' ? 'red' : 'gray'
  return <span className={`status-badge ${clsName}`}><i />{value || 'Unassigned'}</span>
}

function PageHeading({ title, description, children }) {
  return <div className="page-heading"><div className="heading-icon"><Monitor size={24} /></div><div className="heading-copy"><h1>{title}</h1><p>{description}</p></div>{children}</div>
}

function SummaryCard({ icon: Icon, title, value, trend, trendTone, trendDirection, hideTrend, color }) {
  const TrendIcon = trendDirection === 'down' ? ArrowDown : ArrowUp
  return <div className={`summary-card ${color}`}><div className="summary-icon"><Icon size={19} strokeWidth={2.2} /></div><div className="summary-text"><span>{title}</span><b>{value}</b>{!hideTrend && <small className={trendTone ? `trend-${trendTone}` : ''}>{trendDirection && <TrendIcon size={13} fill="currentColor" />}{trend || 'Updated just now'}</small>}</div><Icon className="summary-watermark" size={32} /></div>
}

function AddNewButton({ onClick }) {
  return <button type="button" className="primary-button add-new-button" onClick={onClick}><Plus size={17} /> Add New</button>
}

function Dashboard() {
  const { data } = useStore()
  const permissions = roleCapabilities(data.settings.role)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [internet, setInternet] = useState('All connections')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const online = data.devices.filter((device) => device.status === 'Running').length
  const offline = data.devices.length - online
  const filtered = data.shops.filter((shop) => {
    const device = data.devices.find((item) => item.tvId === shop.tvId || item.shopId === shop.id)
    const queryMatch = `${shop.id} ${shop.location} ${shop.tvId} ${shop.name}`.toLowerCase().includes(search.toLowerCase())
    const statusMatch = status === 'All statuses' || device?.status === status
    const internetMatch = internet === 'All connections' || device?.internet === internet
    return queryMatch && statusMatch && internetMatch
  })
  const pages = Math.max(1, Math.ceil(filtered.length / 10))
  const rows = filtered.slice((page - 1) * 10, page * 10)
  function updateSearch(value) { setSearch(value); setPage(1) }
  return <>
    <PageHeading title={`Welcome, ${data.settings.name || 'Admin'}`} description="Monitor and manage all ration shop TV displays from here." />
    <div className="summary-grid dashboard-summary-grid">
      <SummaryCard icon={Monitor} title="Total Displays" value={data.devices.length} hideTrend color="blue" />
      <SummaryCard icon={Wifi} title="Online" value={online} hideTrend color="green" />
      <SummaryCard icon={AlertTriangle} title="Offline" value={offline} hideTrend color="red" />
    </div>
    <section className="panel dashboard-table-panel">
      <div className="panel-heading"><h2><Store size={21} /> Shops List</h2><div className="table-tools">
        <label className="search-box"><Search size={16} /><input value={search} onChange={(event) => updateSearch(event.target.value)} placeholder="Search by Shop ID, Location or TV ID..." /><button aria-label="Clear search" onClick={() => updateSearch('')} className={search ? '' : 'hidden'}><X size={14} /></button></label>
        {permissions.write && <AddNewButton onClick={() => setModal({ type: 'combined', mode: 'add' })} />}
        <button className={cls('outline-button', showFilters && 'selected')} onClick={() => setShowFilters(!showFilters)}><Filter size={16} /> Filter</button>
      </div></div>
      {showFilters && <div className="filter-row"><select aria-label="Filter TV status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}><option>All statuses</option><option>Running</option><option>Stopped</option><option>Error</option><option>Offline</option></select><select aria-label="Filter internet status" value={internet} onChange={(event) => { setInternet(event.target.value); setPage(1) }}><option>All connections</option><option>Connected</option><option>Disconnected</option></select></div>}
      <div className="table-scroll"><table className="data-table dashboard-table"><thead><tr><th>#</th><th>Shop ID</th><th>Location</th><th>TV ID</th><th>TV Status</th><th>Internet</th></tr></thead><tbody>
        {rows.map((shop, index) => { const device = data.devices.find((item) => item.tvId === shop.tvId || item.shopId === shop.id); return <tr key={shop.id}><td>{(page - 1) * 10 + index + 1}</td><td className="strong-cell">{shop.id}</td><td>{shop.location}</td><td>{shop.tvId || '—'}</td><td><StatusBadge value={device?.status} /></td><td><span className={`internet-cell ${device?.internet === 'Connected' ? 'is-connected' : 'is-disconnected'}`}><Wifi size={16} />{device?.internet || 'Unknown'}</span></td></tr> })}
        {!rows.length && <tr><td className="empty-cell" colSpan="6"><Search size={25} /><b>No shops found</b><span>Try changing your search or filters.</span></td></tr>}
      </tbody></table></div>
      <Pagination page={page} pages={pages} total={filtered.length} onChange={setPage} label="shops" />
    </section>
    {modal?.type === 'combined' && <AddShopDisplayModal onClose={() => setModal(null)} />}
    {modal && modal.type !== 'combined' && <RecordModal modal={modal} onClose={() => setModal(null)} />}
  </>
}

function Pagination({ page, pages, total, onChange, label }) {
  const from = total ? (page - 1) * 10 + 1 : 0
  const to = Math.min(page * 10, total)
  const firstPage = Math.min(Math.max(1, page - 2), Math.max(1, pages - 4))
  const visiblePages = Array.from({ length: Math.min(5, pages) }, (_, index) => firstPage + index)
  return <div className="pagination"><div className="page-controls"><button aria-label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft size={17} /></button>{visiblePages.map((number) => <button key={number} className={number === page ? 'current' : ''} onClick={() => onChange(number)}>{number}</button>)}<button aria-label="Next page" disabled={page >= pages} onClick={() => onChange(page + 1)}><ChevronRight size={17} /></button></div><span>Showing {from} - {to} of {total} {label}</span></div>
}

function ShopsPage() {
  const { data, deleteShop } = useStore()
  const permissions = roleCapabilities(data.settings.role)
  const [query, setQuery] = useState('')
  const [district, setDistrict] = useState('All districts')
  const [status, setStatus] = useState('All statuses')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const shops = data.shops.filter((shop) => {
    const device = data.devices.find((item) => item.shopId === shop.id || item.tvId === shop.tvId)
    return `${shop.id} ${shop.name} ${shop.location} ${shop.district}`.toLowerCase().includes(query.toLowerCase())
      && (district === 'All districts' || shop.district === district)
      && (status === 'All statuses' || (status === 'Online' ? device?.status === 'Running' : device?.status !== 'Running'))
  })
  const pages = Math.max(1, Math.ceil(shops.length / 10))
  const rows = shops.slice((page - 1) * 10, page * 10)
  const onlineShops = data.shops.filter((shop) => data.devices.some((device) => device.shopId === shop.id && device.status === 'Running')).length
  function updateFilter(setter, value) { setter(value); setPage(1) }
  return <>
    <PageHeading title="Shops" description="Manage ration shops, locations and assigned TV displays.">
      {permissions.write && <AddNewButton onClick={() => setModal({ type: 'combined', mode: 'add' })} />}
    </PageHeading>
    <div className="summary-grid compact-summary">
      <SummaryCard icon={Store} title="Total Shops" value={data.shops.length} color="blue" />
      <SummaryCard icon={CheckCircle2} title="Online Shops" value={onlineShops} color="green" />
      <SummaryCard icon={AlertTriangle} title="Offline Shops" value={data.shops.length - onlineShops} color="red" />
      <SummaryCard icon={Building2} title="Total Locations" value={new Set(data.shops.map((shop) => shop.district)).size} color="orange" />
    </div>
    <section className="panel">
      <div className="panel-heading"><h2><Store size={20} /> Shop Directory <span className="count-label">{shops.length} records</span></h2>
        <div className="table-tools"><label className="search-box"><Search size={16} /><input placeholder="Search shop, location or district..." value={query} onChange={(event) => updateFilter(setQuery, event.target.value)} /></label><select className="toolbar-select" value={district} onChange={(event) => updateFilter(setDistrict, event.target.value)}><option>All districts</option>{[...new Set(data.shops.map((shop) => shop.district))].sort().map((item) => <option key={item}>{item}</option>)}</select><select className="toolbar-select" value={status} onChange={(event) => updateFilter(setStatus, event.target.value)}><option>All statuses</option><option>Online</option><option>Offline</option></select></div>
      </div>
      <div className="table-scroll"><table className="data-table"><thead><tr><th>Shop ID</th><th>Shop Name</th><th>District</th><th>Location</th><th>Assigned TV</th><th>Status</th><th className="actions-header">Actions</th></tr></thead><tbody>
        {rows.map((shop) => { const device = data.devices.find((item) => item.shopId === shop.id || item.tvId === shop.tvId); return <tr key={shop.id}><td className="strong-cell">{shop.id}</td><td>{shop.name}</td><td>{shop.district}</td><td>{shop.location}</td><td>{device?.tvId || '—'}</td><td><StatusBadge value={device?.status === 'Running' ? 'Active' : 'Offline'} /></td><td><RowActions canEdit={permissions.write} canDelete={permissions.remove} onView={() => setModal({ type: 'shop', mode: 'view', record: shop })} onEdit={() => setModal({ type: 'shop', mode: 'edit', record: shop })} onDelete={() => window.confirm(`Delete shop ${shop.id}? Its assigned TV will be unassigned.`) && deleteShop(shop.id)} /></td></tr> })}
        {!rows.length && <EmptyRow colSpan={7} />}
      </tbody></table></div>
      <Pagination page={page} pages={pages} total={shops.length} onChange={setPage} label="shops" />
    </section>
    {modal?.type === 'combined' && <AddShopDisplayModal onClose={() => setModal(null)} />}
    {modal && modal.type !== 'combined' && <RecordModal modal={modal} onClose={() => setModal(null)} />}
  </>
}

function EmptyRow({ colSpan }) {
  return <tr><td colSpan={colSpan} className="empty-cell"><CircleHelp size={25} /><b>No records found</b><span>Adjust your search or filters and try again.</span></td></tr>
}

function RowActions({ onView, onEdit, onDelete, canEdit = true, canDelete = true }) {
  return <div className="row-actions"><button title="View details" aria-label="View details" onClick={onView}><Eye size={16} /></button>{canEdit && <button title="Edit" aria-label="Edit" onClick={onEdit}><Pencil size={16} /></button>}{canDelete && <button title="Delete" aria-label="Delete" className="delete-action" onClick={onDelete}><Trash2 size={16} /></button>}</div>
}

const shopFields = [
  ['id', 'Shop ID', 'text', true, '5 digit ID'],
  ['name', 'Shop Name', 'text', true],
  ['district', 'District', 'district', true],
  ['location', 'Full Address / Location', 'text', true],
  ['pincode', 'Pincode', 'text', true],
  ['contactPerson', 'Contact Person', 'text', true],
  ['contactNumber', 'Contact Number', 'tel', true],
  ['tvId', 'Assigned TV Device', 'tv', false],
  ['status', 'Shop Status', 'shop-status', true],
  ['remarks', 'Additional Remarks', 'textarea', false],
]
const deviceFields = [
  ['id', 'Device ID', 'text', true],
  ['tvId', 'TV ID', 'text', true],
  ['displayName', 'Display Name', 'text', true],
  ['shopId', 'Assigned Shop', 'shop', false],
  ['location', 'Location', 'text', true],
  ['resolution', 'Screen Resolution', 'resolution', true],
  ['orientation', 'Screen Orientation', 'orientation', true],
  ['connectionType', 'Connection Type', 'connection', true],
  ['status', 'Device Status', 'device-status', true],
  ['internet', 'Internet Status', 'internet', true],
  ['fullScreen', 'Full-screen Mode', 'checkbox', false],
  ['autoStart', 'Auto-start Enabled', 'checkbox', false],
  ['remarks', 'Remarks', 'textarea', false],
]

const initialNewShop = {
  id: '', name: '', district: '', location: '', pincode: '', contactPerson: '',
  contactNumber: '', tvId: '', status: 'Active', remarks: '',
}
const initialNewDevice = {
  id: '', tvId: '', displayName: '', resolution: '1920 × 1080', orientation: 'Landscape',
  connectionType: 'Wi-Fi', status: 'Running', internet: 'Connected',
  fullScreen: true, autoStart: true, remarks: '',
}

function AddShopDisplayModal({ onClose }) {
  const { data, saveShopWithDevice } = useStore()
  const [shop, setShop] = useState(initialNewShop)
  const [device, setDevice] = useState(initialNewDevice)
  const [errors, setErrors] = useState({})
  const districts = [...new Set([...data.shops.map((item) => item.district), 'Chennai', 'Coimbatore', 'Madurai'])].sort()

  function updateShop(key, value) {
    setShop((current) => ({ ...current, [key]: value }))
  }

  function updateDevice(key, value) {
    setDevice((current) => ({ ...current, [key]: value }))
  }

  function submit(event) {
    event.preventDefault()
    const nextErrors = {}
    const requiredShopFields = [
      ['id', 'Shop ID'], ['name', 'Shop Name'], ['district', 'District'],
      ['location', 'Full Address / Location'], ['pincode', 'Pincode'],
      ['contactPerson', 'Contact Person'], ['contactNumber', 'Contact Number'],
    ]
    const requiredDeviceFields = [
      ['tvId', 'TV ID'], ['displayName', 'Display Name'],
    ]
    requiredShopFields.forEach(([key, label]) => {
      if (!String(shop[key] || '').trim()) nextErrors[key] = `${label} is required.`
    })
    requiredDeviceFields.forEach(([key, label]) => {
      if (!String(device[key] || '').trim()) nextErrors[key] = `${label} is required.`
    })
    if (!String(device.id || '').trim()) nextErrors.deviceId = 'Device ID is required.'
    if (shop.id && !/^\d{5}$/.test(shop.id)) nextErrors.id = 'Enter a 5-digit Shop ID.'
    if (shop.contactNumber && !/^\d{10}$/.test(shop.contactNumber)) nextErrors.contactNumber = 'Enter a valid 10-digit contact number.'
    if (shop.pincode && !/^\d{6}$/.test(shop.pincode)) nextErrors.pincode = 'Enter a valid 6-digit pincode.'
    if (data.shops.some((item) => item.id === shop.id)) nextErrors.id = 'This Shop ID already exists.'
    if (data.devices.some((item) => item.id.toLowerCase() === device.id.toLowerCase())) nextErrors.deviceId = 'This Device ID already exists.'
    if (data.devices.some((item) => item.tvId.toLowerCase() === device.tvId.toLowerCase())) nextErrors.tvId = 'This TV ID already exists.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const saved = saveShopWithDevice(shop, { ...device, shopId: shop.id, location: shop.location })
    if (saved) onClose()
  }

  function fieldError(key) {
    return errors[key] && <small className="field-error">{errors[key]}</small>
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="modal-card combined-modal-card" role="dialog" aria-modal="true" aria-labelledby="add-shop-display-title">
      <div className="modal-header">
        <div><h2 id="add-shop-display-title">Add Shop &amp; TV Display</h2><p>Enter the ration shop details and its new TV display.</p></div>
        <button type="button" aria-label="Close dialog" className="icon-button" onClick={onClose}><X size={20} /></button>
      </div>
      <form onSubmit={submit} noValidate>
        <div className="combined-form-body">
          <fieldset className="combined-form-section">
            <legend><Store size={16} /> Shop Details</legend>
            <div className="form-grid">
              <label className="field-wrap"><span className="field-label">Shop ID *</span><input className={inputClass} value={shop.id} maxLength={5} inputMode="numeric" onChange={(event) => updateShop('id', event.target.value)} />{fieldError('id')}</label>
              <label className="field-wrap"><span className="field-label">Shop Name *</span><input className={inputClass} value={shop.name} onChange={(event) => updateShop('name', event.target.value)} />{fieldError('name')}</label>
              <label className="field-wrap"><span className="field-label">District *</span><select className={inputClass} value={shop.district} onChange={(event) => updateShop('district', event.target.value)}><option value="">Select district</option>{districts.map((district) => <option key={district}>{district}</option>)}</select>{fieldError('district')}</label>
              <label className="field-wrap"><span className="field-label">Pincode *</span><input className={inputClass} inputMode="numeric" maxLength={6} value={shop.pincode} onChange={(event) => updateShop('pincode', event.target.value)} />{fieldError('pincode')}</label>
              <label className="field-wrap field-wide"><span className="field-label">Full Address / Location *</span><input className={inputClass} value={shop.location} onChange={(event) => updateShop('location', event.target.value)} />{fieldError('location')}</label>
              <label className="field-wrap"><span className="field-label">Contact Person *</span><input className={inputClass} value={shop.contactPerson} onChange={(event) => updateShop('contactPerson', event.target.value)} />{fieldError('contactPerson')}</label>
              <label className="field-wrap"><span className="field-label">Contact Number *</span><input className={inputClass} type="tel" inputMode="numeric" maxLength={10} value={shop.contactNumber} onChange={(event) => updateShop('contactNumber', event.target.value)} />{fieldError('contactNumber')}</label>
            </div>
          </fieldset>
          <fieldset className="combined-form-section">
            <legend><Monitor size={16} /> TV Display Details</legend>
            <div className="form-grid">
              <label className="field-wrap"><span className="field-label">Device ID *</span><input className={inputClass} value={device.id} onChange={(event) => updateDevice('id', event.target.value)} />{fieldError('deviceId')}</label>
              <label className="field-wrap"><span className="field-label">TV ID *</span><input className={inputClass} value={device.tvId} onChange={(event) => updateDevice('tvId', event.target.value)} />{fieldError('tvId')}</label>
              <label className="field-wrap field-wide"><span className="field-label">Display Name *</span><input className={inputClass} value={device.displayName} onChange={(event) => updateDevice('displayName', event.target.value)} />{fieldError('displayName')}</label>
              <label className="field-wrap"><span className="field-label">Screen Resolution</span><select className={inputClass} value={device.resolution} onChange={(event) => updateDevice('resolution', event.target.value)}>{['1920 × 1080', '1366 × 768', '1280 × 720', '3840 × 2160'].map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="field-wrap"><span className="field-label">Screen Orientation</span><select className={inputClass} value={device.orientation} onChange={(event) => updateDevice('orientation', event.target.value)}>{['Landscape', 'Portrait'].map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="field-wrap"><span className="field-label">Connection Type</span><select className={inputClass} value={device.connectionType} onChange={(event) => updateDevice('connectionType', event.target.value)}>{['Wi-Fi', 'Ethernet', '4G'].map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="field-wrap"><span className="field-label">Device Status</span><select className={inputClass} value={device.status} onChange={(event) => updateDevice('status', event.target.value)}>{['Running', 'Stopped', 'Offline', 'Error'].map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="field-wrap"><span className="field-label">Internet Status</span><select className={inputClass} value={device.internet} onChange={(event) => updateDevice('internet', event.target.value)}>{['Connected', 'Disconnected'].map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="check-field"><input type="checkbox" checked={device.fullScreen} onChange={(event) => updateDevice('fullScreen', event.target.checked)} /><span>Full-screen Mode</span></label>
              <label className="check-field"><input type="checkbox" checked={device.autoStart} onChange={(event) => updateDevice('autoStart', event.target.checked)} /><span>Auto-start Enabled</span></label>
            </div>
          </fieldset>
        </div>
        {Object.keys(errors).length > 0 && <p className="form-error-summary">Please correct the highlighted fields.</p>}
        <div className="modal-footer"><button type="button" className="outline-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button"><Check size={16} /> Save Shop &amp; TV</button></div>
      </form>
    </section>
  </div>
}

function RecordModal({ modal, onClose }) {
  const { data, saveShop, saveDevice } = useStore()
  const isShop = modal.type === 'shop'
  const fields = isShop ? shopFields : deviceFields
  const record = modal.record || (isShop
    ? { id: '', name: '', district: '', location: '', pincode: '', contactPerson: '', contactNumber: '', tvId: '', status: 'Active', remarks: '' }
    : { id: '', tvId: '', displayName: '', shopId: '', location: '', resolution: '1920 × 1080', orientation: 'Landscape', connectionType: 'Wi-Fi', status: 'Running', internet: 'Connected', fullScreen: true, autoStart: true, remarks: '' })
  const [values, setValues] = useState(record)
  const [errors, setErrors] = useState({})
  const readOnly = modal.mode === 'view'
  const handleChange = (key, value) => setValues((current) => {
    const next = { ...current, [key]: value }
    if (!isShop && key === 'shopId' && !current.location) next.location = data.shops.find((shop) => shop.id === value)?.location || ''
    return next
  })
  function submit(event) {
    event.preventDefault()
    const nextErrors = {}
    fields.forEach(([key, label, , required]) => {
      const value = values[key]
      if (required && (value === undefined || value === null || String(value).trim() === '')) nextErrors[key] = `${label} is required.`
    })
    if (isShop) {
      if (values.id && !/^\d{5}$/.test(values.id)) nextErrors.id = 'Enter a 5-digit Shop ID.'
      if (values.contactNumber && !/^\d{10}$/.test(values.contactNumber)) nextErrors.contactNumber = 'Enter a valid 10-digit contact number.'
      if (values.pincode && !/^\d{6}$/.test(values.pincode)) nextErrors.pincode = 'Enter a valid 6-digit pincode.'
      if (data.shops.some((shop) => shop.id === values.id && shop.id !== modal.record?.id)) nextErrors.id = 'This Shop ID already exists.'
      if (values.tvId && data.devices.some((device) => device.tvId === values.tvId && device.tvId !== modal.record?.tvId)) nextErrors.tvId = 'This TV is already assigned.'
    } else {
      if (data.devices.some((device) => device.id.toLowerCase() === values.id.toLowerCase() && device.id !== modal.record?.id)) nextErrors.id = 'This Device ID already exists.'
      if (data.devices.some((device) => device.tvId.toLowerCase() === values.tvId.toLowerCase() && device.id !== modal.record?.id)) nextErrors.tvId = 'This TV ID already exists.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    const saved = isShop
      ? saveShop(values, modal.record?.id)
      : saveDevice(values, modal.record?.id)
    if (saved) onClose()
  }
  function options(type) {
    if (type === 'district') return [...new Set([...data.shops.map((s) => s.district), 'Chennai', 'Coimbatore', 'Madurai'])].sort()
    if (type === 'tv') return ['', ...data.devices.map((d) => d.tvId)]
    if (type === 'shop') return ['', ...data.shops.map((s) => s.id)]
    if (type === 'resolution') return ['1920 × 1080', '1366 × 768', '1280 × 720', '3840 × 2160']
    if (type === 'orientation') return ['Landscape', 'Portrait']
    if (type === 'connection') return ['Wi-Fi', 'Ethernet', '4G']
    if (type === 'device-status') return ['Running', 'Stopped', 'Offline', 'Error']
    if (type === 'internet') return ['Connected', 'Disconnected']
    if (type === 'shop-status') return ['Active', 'Inactive']
    return []
  }
  const title = `${modal.mode === 'add' ? 'Add' : modal.mode === 'edit' ? 'Edit' : 'View'} ${isShop ? 'Shop' : 'TV Device'}`
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal-card"><div className="modal-header"><div><h2>{title}</h2><p>{readOnly ? 'Record details' : `Enter the ${isShop ? 'shop' : 'display device'} information below.`}</p></div><button aria-label="Close dialog" className="icon-button" onClick={onClose}><X size={20} /></button></div>
    {readOnly ? <div className="details-grid">{fields.map(([key, label]) => <div key={key}><small>{label}</small><b>{typeof values[key] === 'boolean' ? values[key] ? 'Enabled' : 'Disabled' : values[key] || '—'}</b></div>)}</div> :
      <form onSubmit={submit} noValidate><div className="form-grid">{fields.map(([key, label, type, required]) => <label key={key} className={cls('field-wrap', type === 'textarea' && 'field-wide', type === 'checkbox' && 'check-field')}>
        {type === 'checkbox' ? <><input type="checkbox" checked={Boolean(values[key])} disabled={readOnly} onChange={(event) => handleChange(key, event.target.checked)} /><span>{label}</span></> : <><span className="field-label">{label}{required && <i> *</i>}</span>
          {['district', 'tv', 'shop', 'resolution', 'orientation', 'connection', 'device-status', 'internet', 'shop-status'].includes(type)
            ? <select className={inputClass} disabled={readOnly} value={values[key] ?? ''} onChange={(event) => { handleChange(key, event.target.value); if (type === 'shop' && event.target.value) handleChange('location', data.shops.find((s) => s.id === event.target.value)?.location || '') }}><option value="">{type === 'tv' || type === 'shop' ? 'Unassigned' : `Select ${label.toLowerCase()}`}</option>{options(type).filter(Boolean).map((item) => <option key={item} value={item}>{type === 'shop' ? `${data.shops.find((s) => s.id === item)?.name} (${item})` : item}</option>)}</select>
            : type === 'textarea' ? <textarea className={inputClass} rows="3" value={values[key] || ''} disabled={readOnly} onChange={(event) => handleChange(key, event.target.value)} />
              : <input className={inputClass} type={type} value={values[key] || ''} disabled={readOnly} onChange={(event) => handleChange(key, event.target.value)} />}
          {errors[key] && <small className="field-error">{errors[key]}</small>}</>}
      </label>)}</div>
      {Object.keys(errors).length > 0 && <p className="form-error-summary">Please correct the highlighted fields.</p>}
      <div className="modal-footer"><button type="button" className="outline-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button"><Check size={16} /> Save {isShop ? 'Shop' : 'Device'}</button></div></form>}
    {readOnly && <div className="modal-footer"><button className="outline-button" onClick={onClose}>Close</button></div>}
  </section></div>
}

const settingSections = {
  General: [
    ['systemName', 'System Name', 'text'], ['applicationTitle', 'Application Title', 'text'],
    ['department', 'Government Department Name', 'text'], ['branding', 'Company / Branding Name', 'text'],
    ['timezone', 'Time Zone', 'timezone'], ['dateFormat', 'Date Format', 'date-format'],
    ['timeFormat', 'Time Format', 'time-format'], ['language', 'Default Language', 'language'], ['theme', 'Theme Preference', 'theme'],
  ],
  Display: [
    ['resolution', 'Default Screen Resolution', 'resolution'], ['orientation', 'Screen Orientation', 'orientation'],
    ['fullScreen', 'Full-screen Display', 'checkbox'], ['autoStart', 'Auto-start Display', 'checkbox'],
    ['refreshInterval', 'Content Refresh Interval (seconds)', 'number'], ['displayMode', 'Default Display Mode', 'display-mode'],
  ],
  Network: [
    ['connectionStatus', 'Connection Status (preview only)', 'connection-status'],
    ['networkRefresh', 'Network Refresh Interval (seconds)', 'number'],
    ['timeout', 'Connection Timeout (seconds)', 'number'], ['retries', 'Retry Attempts', 'number'],
  ],
  'User & Access': [
    ['name', 'Admin Name', 'text'], ['email', 'Admin Email', 'email'], ['role', 'Role', 'role'],
    ['sessionTimeout', 'Session Timeout (minutes)', 'number'],
  ],
  Notifications: [
    ['notifyOffline', 'Offline Device Notifications', 'checkbox'],
    ['notifyErrors', 'Device Error Notifications', 'checkbox'],
    ['notifyConnection', 'Connection Lost Notifications', 'checkbox'],
    ['notifySystem', 'System Alerts', 'checkbox'],
  ],
}

function SettingsPage() {
  const { data, saveSettings, notify, resetSettings } = useStore()
  const [tab, setTab] = useState('General')
  const [values, setValues] = useState(data.settings)
  const [dirty, setDirty] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [passwordError, setPasswordError] = useState('')
  const settingOptions = {
    timezone: ['Asia/Kolkata', 'UTC', 'Asia/Singapore'], 'date-format': ['DD MMM YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY'],
    'time-format': ['12-hour', '24-hour'], language: ['English', 'Tamil'], theme: ['Light', 'Dark', 'System'],
    resolution: ['1920 × 1080', '1366 × 768', '1280 × 720', '3840 × 2160'], orientation: ['Landscape', 'Portrait'],
    'display-mode': ['Information Display', 'Announcement Board', 'Mixed Content'],
    'connection-status': ['Online', 'Offline', 'Degraded'],
    role: ['Admin', 'Manager', 'Group Manager', 'Editor', 'Viewer'],
  }
  function setField(key, value) { setValues((current) => ({ ...current, [key]: value })); setDirty(true) }
  function save() {
    const invalidNumber = ['refreshInterval', 'networkRefresh', 'timeout', 'retries', 'sessionTimeout'].find((key) => !Number.isFinite(values[key]) || values[key] < 1)
    if (invalidNumber) {
      notify('Numeric settings must be at least 1.', 'error')
      return
    }
    saveSettings(values)
    setDirty(false)
  }
  function cancel() { setValues(data.settings); setDirty(false); notify('Unsaved changes discarded.') }
  function changePassword(event) {
    event.preventDefault()
    if (!passwords.current) { setPasswordError('Enter your current password to continue.'); return }
    if (passwords.next.length < 8) { setPasswordError('Use at least 8 characters for the new password.'); return }
    if (passwords.next !== passwords.confirm) { setPasswordError('The new passwords do not match.'); return }
    setPasswordError('')
    setPasswords({ current: '', next: '', confirm: '' })
    setPasswordOpen(false)
    notify('Password change validated for this preview. No password was stored.')
  }
  return <>
    <PageHeading title="Settings" description="Manage application preferences, display defaults and admin profile." />
    <div className="settings-layout">
      <aside className="settings-nav">{Object.keys(settingSections).map((item) => <button key={item} onClick={() => setTab(item)} className={tab === item ? 'selected' : ''}><SlidersHorizontal size={16} />{item}</button>)}<div className="settings-note"><ShieldCheck size={17} /><span><b>Frontend preview</b><small>Settings are saved in this browser. Network and device controls do not configure hardware.</small></span></div></aside>
      <section className="panel settings-panel">
        <div className="panel-heading settings-panel-heading"><div><h2>{tab} Settings</h2><p>Changes apply to this browser preview.</p></div><span className="local-tag"><i /> Local configuration</span></div>
        <div className="settings-fields">{settingSections[tab].map(([key, label, type]) => <label key={key} className={cls('setting-field', type === 'checkbox' && 'setting-checkbox')}>
          {type === 'checkbox' ? <><span><b>{label}</b><small>{key === 'fullScreen' || key === 'autoStart' ? 'Default preference for display devices' : 'Enable this notification preference'}</small></span><input type="checkbox" checked={Boolean(values[key])} onChange={(event) => setField(key, event.target.checked)} /></>
            : <><span className="field-label">{label}</span>{settingOptions[type]
              ? <select className={inputClass} value={values[key] || ''} onChange={(event) => setField(key, event.target.value)}>{settingOptions[type].map((option) => <option key={option}>{option}</option>)}</select>
              : <input className={inputClass} type={type} min={type === 'number' ? 1 : undefined} value={values[key] ?? ''} onChange={(event) => setField(key, type === 'number' ? Number(event.target.value) : event.target.value)} />}</>}
        </label>)}</div>
        {tab === 'User & Access' && <div className="password-section"><div><b>Password</b><small>Password changes are not saved in localStorage.</small></div><button className="outline-button" onClick={() => setPasswordOpen(!passwordOpen)}>{passwordOpen ? 'Cancel' : 'Change Password'}</button>
          {passwordOpen && <form className="password-form" onSubmit={changePassword}><input type="password" placeholder="Current password" autoComplete="current-password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} /><input type="password" placeholder="New password (8+ characters)" autoComplete="new-password" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} /><input type="password" placeholder="Confirm new password" autoComplete="new-password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} /><button className="primary-button">Validate Change</button>{passwordError && <small className="field-error">{passwordError}</small>}</form>}
        </div>}
        <div className="settings-footer"><button className="danger-text-button" onClick={() => { if (window.confirm('Reset settings to defaults? Shop and TV device records will be preserved.')) { resetSettings(); setValues(initialData.settings); setDirty(false) } }}><ArrowDown size={15} /> Reset to Defaults</button><div><button className="outline-button" onClick={cancel} disabled={!dirty}>Cancel Changes</button><button className="primary-button" onClick={save} disabled={!dirty}>Save Settings</button></div></div>
      </section>
    </div>
  </>
}

export default function AdminApp() {
  return <StoreProvider><Shell /></StoreProvider>
}
