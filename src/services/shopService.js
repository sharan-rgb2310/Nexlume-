import { isSupabaseConfigured, supabase } from '../lib/supabase'

export const fallbackShops = [
  {
    id: 'TN-RS-1001',
    shop_code: 'TN-RS-1001',
    name: 'Anna Nagar Fair Price Shop #1',
    district: 'Chennai',
    location: '12, 2nd Avenue, Anna Nagar West, Chennai',
    pincode: '600040',
    contact_person: 'R. Soundararajan',
    contact_number: '9840123456',
    status: 'Active',
  },
  {
    id: 'TN-RS-1002',
    shop_code: 'TN-RS-1002',
    name: 'T. Nagar Central Fair Price Shop',
    district: 'Chennai',
    location: '45, South Usman Road, T. Nagar, Chennai',
    pincode: '600017',
    contact_person: 'M. Selvakumar',
    contact_number: '9840987654',
    status: 'Active',
  },
  {
    id: 'TN-RS-2001',
    shop_code: 'TN-RS-2001',
    name: 'Gandhipuram Public Outlet #3',
    district: 'Coimbatore',
    location: '88, Cross Cut Road, Gandhipuram, Coimbatore',
    pincode: '641012',
    contact_person: 'K. Murugesan',
    contact_number: '9443123450',
    status: 'Active',
  },
]

export async function getShops() {
  if (!isSupabaseConfigured) {
    return fallbackShops
  }

  try {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .order('name', { ascending: true })

    if (error || !data || data.length === 0) {
      return fallbackShops
    }
    return data
  } catch (err) {
    console.warn('Failed to load shops from Supabase, using fallback list', err)
    return fallbackShops
  }
}

export async function createShop(shop) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.')
  }

  const { data, error } = await supabase
    .from('shops')
    .insert([shop])
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to create shop in Supabase.')
  }
  return data
}

export async function updateShop(id, updates) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.')
  }

  const { data, error } = await supabase
    .from('shops')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to update shop in Supabase.')
  }
  return data
}

export async function deleteShop(id) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.')
  }

  const { error } = await supabase
    .from('shops')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message || 'Failed to delete shop from Supabase.')
  }
  return true
}
