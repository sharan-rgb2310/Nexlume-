import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { normalizeTvPadding } from './displaySettings'

const DISPLAY_SETTINGS_ID = 'global'

export async function getSharedTvPadding() {
  if (!isSupabaseConfigured) return null

  const { data, error } = await supabase
    .from('display_settings')
    .select('settings')
    .eq('id', DISPLAY_SETTINGS_ID)
    .single()

  if (error) throw new Error(`TV display settings could not be loaded: ${error.message}`)
  if (!data?.settings || typeof data.settings !== 'object' || Array.isArray(data.settings)) {
    throw new Error('TV display settings returned an invalid configuration.')
  }
  return normalizeTvPadding(data.settings)
}

export async function saveSharedTvPadding(settings) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase must be configured to sync TV padding across devices.')
  }

  const tvPadding = normalizeTvPadding(settings)
  const { data, error } = await supabase
    .from('display_settings')
    .update({ settings: tvPadding, updated_at: new Date().toISOString() })
    .eq('id', DISPLAY_SETTINGS_ID)

  if (error) throw new Error(`TV padding could not be synced to Supabase: ${error.message}`)
  if (!Array.isArray(data) || data.length !== 1) {
    throw new Error('TV padding was not saved. Apply the shared display settings migration and sign in as an admin.')
  }
}
