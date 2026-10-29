export const ADMIN_SETTINGS_STORAGE_KEY = 'tn-ration-display-data'

export const DEFAULT_TV_PADDING = 4
export const DEFAULT_TV_PADDING_TOP = 16
export const DEFAULT_TV_PADDING_BOTTOM = 0
export const MAX_TV_PADDING = 100
export const TV_PADDING_KEYS = [
  'tvPaddingTop',
  'tvPaddingRight',
  'tvPaddingBottom',
  'tvPaddingLeft',
]

const DEFAULT_PADDING_BY_KEY = {
  tvPaddingTop: DEFAULT_TV_PADDING_TOP,
  tvPaddingRight: DEFAULT_TV_PADDING,
  tvPaddingBottom: DEFAULT_TV_PADDING_BOTTOM,
  tvPaddingLeft: DEFAULT_TV_PADDING,
}

const PREVIOUS_DEFAULT_PADDING = {
  tvPaddingTop: 12,
  tvPaddingRight: 4,
  tvPaddingBottom: 2,
  tvPaddingLeft: 4,
}

export function normalizeTvPadding(settings = {}) {
  const legacyPadding = settings.tvMargin
  const hasPreviousDefaultPadding = !Number.isFinite(legacyPadding)
    && TV_PADDING_KEYS.every((key) => settings[key] === PREVIOUS_DEFAULT_PADDING[key])

  return Object.fromEntries(TV_PADDING_KEYS.map((key) => {
    const padding = settings[key] ?? legacyPadding
    return [
      key,
      hasPreviousDefaultPadding
        ? DEFAULT_PADDING_BY_KEY[key]
        : Number.isFinite(padding)
          ? Math.round(Math.min(MAX_TV_PADDING, Math.max(0, padding)))
          : DEFAULT_PADDING_BY_KEY[key],
    ]
  }))
}

export function readTvPadding() {
  try {
    const saved = JSON.parse(localStorage.getItem(ADMIN_SETTINGS_STORAGE_KEY))
    return normalizeTvPadding(saved?.settings)
  } catch {
    // Use the default when no valid admin settings have been saved.
    return normalizeTvPadding()
  }
}
