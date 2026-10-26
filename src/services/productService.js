import { isSupabaseConfigured, supabase } from '../lib/supabase'

export const defaultCommodities = [
  {
    id: 'prod-001',
    product_code: 'P001',
    name: 'Rice',
    name_ta: 'அரிசி',
    quantity: 1800,
    unit: 'kg',
    unit_ta: 'கிலோ',
    shop_id: 'TN-RS-1001',
    panel_id: 'PNL-001',
    category: 'Grains',
    description: 'Boiled / Raw Ponni Rice for PDS ration cardholders',
    low_stock_threshold: 200,
    image_url: null,
    image_path: null,
  },
  {
    id: 'prod-002',
    product_code: 'P002',
    name: 'Sugar',
    name_ta: 'சர்க்கரை',
    quantity: 45,
    unit: 'kg',
    unit_ta: 'கிலோ',
    shop_id: 'TN-RS-1001',
    panel_id: 'PNL-001',
    category: 'Essential',
    description: 'Refined crystal white sugar',
    low_stock_threshold: 50,
    image_url: null,
    image_path: null,
  },
  {
    id: 'prod-003',
    product_code: 'P003',
    name: 'Black Gram',
    name_ta: 'கருப்பு உளுந்து',
    quantity: 10,
    unit: 'kg',
    unit_ta: 'கிலோ',
    shop_id: 'TN-RS-1001',
    panel_id: 'PNL-001',
    category: 'Pulses',
    description: 'Whole black gram / urad dal',
    low_stock_threshold: 30,
    image_url: null,
    image_path: null,
  },
  {
    id: 'prod-004',
    product_code: 'P004',
    name: 'Palm Oil',
    name_ta: 'பாமாயில்',
    quantity: 75,
    unit: 'L',
    unit_ta: 'லிட்டர்',
    shop_id: 'TN-RS-1001',
    panel_id: 'PNL-001',
    category: 'Cooking Oil',
    description: 'Fortified refined palm olein oil (1L pack)',
    low_stock_threshold: 25,
    image_url: null,
    image_path: null,
  },
  {
    id: 'prod-005',
    product_code: 'P005',
    name: 'Wheat',
    name_ta: 'கோதுமை',
    quantity: 35,
    unit: 'kg',
    unit_ta: 'கிலோ',
    shop_id: 'TN-RS-1001',
    panel_id: 'PNL-001',
    category: 'Grains',
    description: 'Whole wheat grain',
    low_stock_threshold: 40,
    image_url: null,
    image_path: null,
  },
  {
    id: 'prod-006',
    product_code: 'P006',
    name: 'Toor Dal',
    name_ta: 'துவரம் பருப்பு',
    quantity: 120,
    unit: 'kg',
    unit_ta: 'கிலோ',
    shop_id: 'TN-RS-1001',
    panel_id: 'PNL-001',
    category: 'Pulses',
    description: 'Special PDS yellow split toor dal',
    low_stock_threshold: 30,
    image_url: null,
    image_path: null,
  },
  {
    id: 'prod-007',
    product_code: 'P007',
    name: 'Green Gram',
    name_ta: 'பாசிப் பருப்பு',
    quantity: 20,
    unit: 'kg',
    unit_ta: 'கிலோ',
    shop_id: 'TN-RS-1001',
    panel_id: 'PNL-001',
    category: 'Pulses',
    description: 'High protein green moong dal',
    low_stock_threshold: 25,
    image_url: null,
    image_path: null,
  },
]

const LOCAL_PRODUCTS_KEY = 'nexlume-custom-products'

function getLocalProducts() {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalProduct(product) {
  try {
    const list = getLocalProducts().filter((p) => p.id !== product.id)
    list.unshift(product)
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(list))
  } catch {
    // ignore
  }
}

function removeLocalProduct(id) {
  try {
    const list = getLocalProducts().filter((p) => p.id !== id)
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(list))
  } catch {
    // ignore
  }
}

const tamilNames = {
  Rice: 'அரிசி',
  Sugar: 'சர்க்கரை',
  'Black Gram': 'கருப்பு உளுந்து',
  'Toor Dal': 'துவரம் பருப்பு',
  'Palm Oil': 'பாமாயில்',
  Wheat: 'கோதுமை',
  'Green Gram': 'பாசிப் பருப்பு',
}

const tamilUnits = {
  kg: 'கிலோ',
  g: 'கிராம்',
  L: 'லிட்டர்',
  ml: 'மி.லி',
  oz: 'அவுன்ஸ்',
  pcs: 'எண்ணிக்கை',
}

export function computeProductStatus(quantity, threshold = 20) {
  const num = Number(quantity) || 0
  if (num <= 0) return 'out_of_stock'
  if (num <= Number(threshold)) return 'low_stock'
  return 'in_stock'
}

export async function getProducts(filters = {}) {
  const localList = getLocalProducts()

  if (!isSupabaseConfigured) {
    let list = [...localList, ...defaultCommodities]
    const seen = new Set()
    list = list.filter((item) => {
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
    if (filters.shopId) list = list.filter((p) => p.shop_id === filters.shopId)
    if (filters.panelId) list = list.filter((p) => p.panel_id === filters.panelId)
    return list
  }

  try {
    let query = supabase.from('products').select('*').order('name', { ascending: true })
    if (filters.shopId) {
      query = query.eq('shop_id', filters.shopId)
    }
    if (filters.panelId) {
      query = query.eq('panel_id', filters.panelId)
    }

    const { data, error } = await query
    let merged = []

    if (!error && Array.isArray(data) && data.length > 0) {
      // Merge remote Supabase products with local products
      const seen = new Set(data.map((d) => d.id))
      const extraLocal = localList.filter((l) => !seen.has(l.id))
      merged = [...extraLocal, ...data]
    } else {
      // Table is empty or offline
      const seen = new Set()
      merged = [...localList, ...defaultCommodities].filter((item) => {
        if (seen.has(item.id)) return false
        seen.add(item.id)
        return true
      })
    }

    if (filters.shopId) merged = merged.filter((p) => p.shop_id === filters.shopId)
    if (filters.panelId) merged = merged.filter((p) => p.panel_id === filters.panelId)

    return merged.map((item) => ({
      ...item,
      name_ta: item.name_ta || tamilNames[item.name] || item.name,
      unit_ta: tamilUnits[item.unit] || item.unit,
      status: computeProductStatus(item.quantity, item.low_stock_threshold),
    }))
  } catch (err) {
    console.warn('Failed to load products from Supabase, using defaults', err)
    return [...localList, ...defaultCommodities]
  }
}

export async function createProduct(productData, imageFile = null) {
  let imageUrl = productData.image_url || null
  let imagePath = productData.image_path || null

  if (imageFile) {
    try {
      const uploadResult = await uploadProductImage(imageFile)
      imageUrl = uploadResult.publicUrl
      imagePath = uploadResult.path
    } catch (err) {
      console.warn('Image upload skipped, using preview fallback:', err.message)
    }
  }

  const generatedId = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const payload = {
    id: productData.id || generatedId,
    name: (productData.name || '').trim() || 'Commodity',
    name_ta: productData.name_ta || tamilNames[productData.name] || productData.name || 'பொருள்',
    product_code: productData.product_code || `P${Date.now().toString().slice(-4)}`,
    quantity: Math.max(0, Number(productData.quantity) || 0),
    unit: productData.unit || 'kg',
    shop_id: productData.shop_id || null,
    panel_id: productData.panel_id || null,
    category: productData.category || 'General',
    description: productData.description || '',
    low_stock_threshold: Number(productData.low_stock_threshold) || 20,
    image_url: imageUrl,
    image_path: imagePath,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select()
        .single()

      if (!error && data) {
        saveLocalProduct(data)
        return data
      }
      if (error) {
        // Silently log — local fallback below ensures save always succeeds
        console.warn('Supabase product insert notice (local fallback active):', error.message || error)
      }
    } catch (err) {
      console.warn('Supabase product insert notice:', err.message || err)
    }
  }

  // Gracefully persist locally so admin always succeeds
  saveLocalProduct(payload)
  return payload
}

export async function updateProduct(id, updates, imageFile = null) {
  let imageUrl = updates.image_url
  let imagePath = updates.image_path

  if (imageFile) {
    try {
      const uploadResult = await uploadProductImage(imageFile)
      imageUrl = uploadResult.publicUrl
      imagePath = uploadResult.path
    } catch (err) {
      console.warn('Image update skipped, keeping current image:', err.message)
    }
  }

  const payload = {
    ...updates,
    id,
    quantity: Math.max(0, Number(updates.quantity) || 0),
    low_stock_threshold: Number(updates.low_stock_threshold) || 20,
    image_url: imageUrl,
    image_path: imagePath,
    updated_at: new Date().toISOString(),
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', id)
        .select()
        .single()

      if (!error && data) {
        saveLocalProduct(data)
        return data
      }
      if (error) {
        console.warn('Supabase product update notice (local fallback active):', error.message || error)
      }
    } catch (err) {
      console.warn('Supabase product update notice:', err.message || err)
    }
  }

  saveLocalProduct(payload)
  return payload
}

export async function deleteProduct(id) {
  removeLocalProduct(id)

  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('products')
        .delete()
        .eq('id', id)
    } catch (err) {
      console.warn('Supabase product delete notice:', err)
    }
  }
  return true
}

/**
 * Reads a File as a base64 Data URL (persists across page reloads, unlike blob: URLs).
 */
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => reject(new Error('Failed to read image file.'))
    reader.readAsDataURL(file)
  })
}

export async function uploadProductImage(file) {
  if (!file) throw new Error('No image file provided.')

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/jpg']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file format. Please upload JPG, PNG, WEBP, or SVG images.')
  }

  // Validate file size (max 2MB for localStorage base64 — larger images go to Supabase Storage only)
  const maxLocalSize = 2 * 1024 * 1024
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('Image size exceeds 5MB limit. Please upload a smaller image.')
  }

  // If Supabase is not configured, use base64 Data URL (persists across reloads)
  if (!isSupabaseConfigured) {
    const dataUrl = await readFileAsDataUrl(file)
    return {
      path: `local/${file.name}`,
      publicUrl: dataUrl,
    }
  }

  const fileExt = file.name.split('.').pop() || 'png'
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`
  const filePath = `products/${fileName}`

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: true,
    })

  if (error) {
    // Supabase Storage failed — fall back to base64 Data URL (persists across reloads)
    console.warn('Supabase Storage upload notice (using local base64 fallback):', error.message || error)
    try {
      if (file.size <= maxLocalSize) {
        const dataUrl = await readFileAsDataUrl(file)
        return { path: filePath, publicUrl: dataUrl }
      }
    } catch {
      // ignore read error, fall through to blob
    }
    // Last resort: blob URL (won't persist across reloads, but works in current session)
    return {
      path: filePath,
      publicUrl: URL.createObjectURL(file),
    }
  }

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(data?.path || filePath)

  return {
    path: data?.path || filePath,
    publicUrl: urlData?.publicUrl || URL.createObjectURL(file),
  }
}

export function subscribeToProductChanges(onChange) {
  if (!isSupabaseConfigured) return () => {}

  const channel = supabase
    .channel('products-live-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
      onChange(payload)
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
