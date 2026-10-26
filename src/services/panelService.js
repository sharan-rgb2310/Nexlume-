import { isSupabaseConfigured, supabase } from '../lib/supabase'

export const fallbackPanels = [
  {
    id: 'PNL-001',
    panel_code: 'PNL-001',
    name: 'Main Counter TV #1',
    shop_id: 'TN-RS-1001',
    resolution: '1920 × 1080',
    status: 'Running',
  },
  {
    id: 'PNL-002',
    panel_code: 'PNL-002',
    name: 'Entrance Information Display',
    shop_id: 'TN-RS-1001',
    resolution: '1920 × 1080',
    status: 'Running',
  },
  {
    id: 'PNL-003',
    panel_code: 'PNL-003',
    name: 'T. Nagar Hall TV #1',
    shop_id: 'TN-RS-1002',
    resolution: '1920 × 1080',
    status: 'Running',
  },
  {
    id: 'PNL-004',
    panel_code: 'PNL-004',
    name: 'Coimbatore Counter Display',
    shop_id: 'TN-RS-2001',
    resolution: '1920 × 1080',
    status: 'Running',
  },
]

export async function getPanels(shopId = null) {
  if (!isSupabaseConfigured) {
    if (shopId) return fallbackPanels.filter((p) => p.shop_id === shopId)
    return fallbackPanels
  }

  try {
    let query = supabase.from('panels').select('*').order('name', { ascending: true })
    if (shopId) {
      query = query.eq('shop_id', shopId)
    }
    const { data, error } = await query

    if (error || !data || data.length === 0) {
      if (shopId) return fallbackPanels.filter((p) => p.shop_id === shopId)
      return fallbackPanels
    }
    return data
  } catch (err) {
    console.warn('Failed to load panels from Supabase, using fallback list', err)
    if (shopId) return fallbackPanels.filter((p) => p.shop_id === shopId)
    return fallbackPanels
  }
}

export async function createPanel(panel) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.')
  }

  const { data, error } = await supabase
    .from('panels')
    .insert([panel])
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to create panel in Supabase.')
  }
  return data
}

export async function updatePanel(id, updates) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.')
  }

  const { data, error } = await supabase
    .from('panels')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to update panel in Supabase.')
  }
  return data
}

export async function deletePanel(id) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.')
  }

  const { error } = await supabase
    .from('panels')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message || 'Failed to delete panel from Supabase.')
  }
  return true
}
