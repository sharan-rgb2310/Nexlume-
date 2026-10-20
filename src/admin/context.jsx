import { useEffect, useRef, useState } from 'react'
import { initialData } from './data'
import { StoreContext } from './storeContext'

const STORAGE_KEY = 'tn-ration-display-data'

function isSeedShop(shop) {
  return /^\d{5}$/.test(shop.id) && Number(shop.id) >= 1234 && Number(shop.id) <= 1283
}

function isSeedDevice(device) {
  const match = /^DEV-(\d{3})$/.exec(device.id)
  return match !== null && Number(match[1]) >= 1 && Number(match[1]) <= 50
}

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved && Array.isArray(saved.shops) && saved.shops.every((item) => item && typeof item === 'object'
      && ['id', 'name', 'district', 'location', 'tvId', 'status'].every((key) => typeof item[key] === 'string'))
      && Array.isArray(saved.devices) && saved.devices.every((item) => item && typeof item === 'object'
        && ['id', 'tvId', 'shopId', 'location', 'resolution', 'status', 'internet'].every((key) => typeof item[key] === 'string'))
      && saved.settings && typeof saved.settings === 'object' && !Array.isArray(saved.settings)) {
      const settings = { ...initialData.settings, ...saved.settings }
      const shops = saved.shops.filter((shop) => !isSeedShop(shop))
      const devices = saved.devices.filter((device) => !isSeedDevice(device))
      Object.entries(initialData.settings).forEach(([key, defaultValue]) => {
        if (typeof settings[key] !== typeof defaultValue) settings[key] = defaultValue
      })
      const settingOptions = {
        timezone: ['Asia/Kolkata', 'UTC', 'Asia/Singapore'],
        dateFormat: ['DD MMM YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY'],
        timeFormat: ['12-hour', '24-hour'],
        language: ['English', 'Tamil'],
        theme: ['Light', 'Dark', 'System'],
        resolution: ['1920 × 1080', '1366 × 768', '1280 × 720', '3840 × 2160'],
        orientation: ['Landscape', 'Portrait'],
        displayMode: ['Information Display', 'Announcement Board', 'Mixed Content'],
        connectionStatus: ['Online', 'Offline', 'Degraded'],
        role: ['Admin', 'Manager', 'Group Manager', 'Editor', 'Viewer'],
      }
      Object.entries(settingOptions).forEach(([key, options]) => {
        if (!options.includes(settings[key])) settings[key] = initialData.settings[key]
      })
      Object.entries(initialData.settings).forEach(([key, defaultValue]) => {
        if (typeof defaultValue === 'number' && (!Number.isFinite(settings[key]) || settings[key] < 1)) settings[key] = defaultValue
      })
      if (shops.length !== saved.shops.length || devices.length !== saved.devices.length) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...saved, shops, devices }))
        } catch (error) {
          console.error('Legacy Admin demo records could not be removed from localStorage.', error)
        }
      }
      return { ...initialData, ...saved, shops, devices, settings }
    }
  } catch (error) {
    console.warn('Saved application data could not be loaded; using default settings.', error)
  }
  return initialData
}

export function StoreProvider({ children }) {
  const [data, setData] = useState(loadData)
  const [toast, setToast] = useState(null)
  const dataRef = useRef(data)
  const toastTimer = useRef(null)

  function update(next) {
    const resolved = typeof next === 'function' ? next(dataRef.current) : next
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resolved))
    } catch (error) {
      console.error('Application data could not be saved to localStorage.', error)
      notify('Changes could not be saved in this browser.', 'error')
      return false
    }
    dataRef.current = resolved
    setData(resolved)
    return true
  }

  function notify(message, type = 'success') {
    window.clearTimeout(toastTimer.current)
    setToast({ message, type })
    toastTimer.current = window.setTimeout(() => setToast(null), 3200)
  }
  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  function saveShop(shop, previousId) {
    const saved = update((current) => {
      const previousShop = current.shops.find((item) => item.id === previousId)
      const shops = current.shops.filter((item) => item.id !== previousId)
      const existing = current.shops.find((item) => item.id === shop.id)
      shops.push({ ...existing, ...shop })
      const devices = current.devices.map((device) => {
        const belongedToPrevious = device.shopId === previousId || device.tvId === previousShop?.tvId
        if (belongedToPrevious && device.tvId !== shop.tvId) return { ...device, shopId: '', location: '' }
        if (shop.tvId && device.tvId === shop.tvId) return { ...device, shopId: shop.id, location: shop.location }
        if (belongedToPrevious) return { ...device, shopId: shop.id, location: shop.location }
        return device
      })
      return { ...current, shops: shops.sort((a, b) => a.id.localeCompare(b.id)), devices }
    })
    if (saved) notify(previousId ? 'Shop updated successfully.' : 'Shop added successfully.')
    return saved
  }

  function deleteShop(id) {
    if (update((current) => ({
      ...current,
      shops: current.shops.filter((shop) => shop.id !== id),
      devices: current.devices.map((device) => device.shopId === id ? { ...device, shopId: '', location: '' } : device),
    }))) notify('Shop deleted.')
  }

  function saveDevice(device, previousId) {
    const saved = update((current) => {
      const previousDevice = current.devices.find((item) => item.id === previousId)
      const devices = current.devices.filter((item) => item.id !== previousId)
      devices.push({ ...current.devices.find((item) => item.id === device.id), ...device })
      const shops = current.shops.map((shop) => {
        if (shop.id === device.shopId) return { ...shop, tvId: device.tvId, location: device.location || shop.location }
        if (shop.tvId === device.tvId || shop.tvId === previousDevice?.tvId || shop.id === previousDevice?.shopId) return { ...shop, tvId: '' }
        return shop
      })
      return { ...current, devices: devices.sort((a, b) => a.id.localeCompare(b.id)), shops }
    })
    if (saved) notify(previousId ? 'TV device updated successfully.' : 'TV device added successfully.')
    return saved
  }

  function saveShopWithDevice(shop, device) {
    const saved = update((current) => ({
      ...current,
      shops: [...current.shops, { ...shop, tvId: device.tvId }].sort((a, b) => a.id.localeCompare(b.id)),
      devices: [...current.devices, device].sort((a, b) => a.id.localeCompare(b.id)),
    }))
    if (saved) notify('Shop and TV display added successfully.')
    return saved
  }

  function deleteDevice(id) {
    if (update((current) => {
      const removed = current.devices.find((item) => item.id === id)
      return {
      ...current,
      devices: current.devices.filter((device) => device.id !== id),
      shops: current.shops.map((shop) => shop.tvId === removed?.tvId ? { ...shop, tvId: '' } : shop),
      }
    })) notify('TV device deleted.')
  }

  const value = {
    data, toast, notify, saveShop, deleteShop, saveDevice, saveShopWithDevice, deleteDevice,
    saveSettings(settings) {
      if (update((current) => ({ ...current, settings }))) notify('Settings saved to this browser.')
    },
    resetSettings() {
      if (update((current) => ({ ...current, settings: initialData.settings }))) notify('Settings reset to defaults.')
    },
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
