import BlackGramBowl from '../components/graphics/BlackGramBowl'
import PalmOilBottle from '../components/graphics/PalmOilBottle'
import RiceBowl from '../components/graphics/RiceBowl'
import SugarBowl from '../components/graphics/SugarBowl'
import ToorDalBowl from '../components/graphics/ToorDalBowl'
import WheatBowl from '../components/graphics/WheatBowl'

export const productDisplay = {
  Rice: { ta: 'அரிசி', unitTa: 'கிலோ', graphic: RiceBowl },
  Sugar: { ta: 'சர்க்கரை', unitTa: 'கிலோ', graphic: SugarBowl },
  'Black Gram': { ta: 'கருப்பு உளுந்து', unitTa: 'கிலோ', graphic: BlackGramBowl },
  'Toor Dal': { ta: 'துவரம் பருப்பு', unitTa: 'கிலோ', graphic: ToorDalBowl },
  'Palm Oil': { ta: 'பாமாயில்', unitTa: 'லிட்டர்', graphic: PalmOilBottle },
  Wheat: { ta: 'கோதுமை', unitTa: 'கிலோ', graphic: WheatBowl },
  'Green Gram': { ta: 'பாசிப் பருப்பு', unitTa: 'கிலோ', graphic: BlackGramBowl },
}

export function getCommodityGraphic(name) {
  if (!name) return RiceBowl
  const match = Object.keys(productDisplay).find(
    (key) => key.toLowerCase() === name.toLowerCase()
  )
  return match ? productDisplay[match].graphic : RiceBowl
}

export function formatUnitLabel(unit) {
  const normalized = (unit || 'kg').toLowerCase()
  switch (normalized) {
    case 'kg':
    case 'kilogram':
      return { en: 'Kg', ta: 'கிலோ' }
    case 'g':
    case 'gram':
      return { en: 'Gram', ta: 'கிராம்' }
    case 'l':
    case 'litre':
    case 'liter':
      return { en: 'Litre', ta: 'லிட்டர்' }
    case 'ml':
    case 'millilitre':
      return { en: 'ml', ta: 'மி.லி' }
    case 'oz':
    case 'ounce':
      return { en: 'Oz', ta: 'அவுன்ஸ்' }
    case 'pcs':
    case 'piece':
    case 'count':
      return { en: 'Pieces', ta: 'எண்ணிக்கை' }
    default:
      return { en: unit, ta: unit }
  }
}

export function normalizeStockResponse(payload) {
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.products)) {
    throw new Error('The stock API returned an invalid response: products must be an array.')
  }

  const { shopId, district, products, apiConfig } = payload

  const mappedProducts = products.map((product) => {
    const name = product.productName || product.name || 'Commodity'
    const display = productDisplay[name] ?? {}
    const unitInfo = formatUnitLabel(product.unit)

    return {
      id: product.productId || product.id,
      ta: product.name_ta || display.ta || name,
      en: name,
      stock: Number(product.availableQuantity ?? product.quantity ?? 0),
      unitTa: display.unitTa || unitInfo.ta,
      unitEn: unitInfo.en,
      graphic: display.graphic || RiceBowl,
      image_url: product.image_url || null,
      status: product.status || (product.availableQuantity <= 0 ? 'out_of_stock' : product.availableQuantity <= (product.lowStockThreshold || 20) ? 'low_stock' : 'in_stock'),
      lowStockThreshold: product.lowStockThreshold || 20,
    }
  })

  return {
    shopInfo: {
      code: shopId || 'TN-RS-1001',
      locationTa: district === 'Chennai' ? 'சென்னை, தமிழ்நாடு' : (district || 'தமிழ்நாடு'),
      locationEn: `${district || 'Chennai'}, Tamil Nadu`,
    },
    products: mappedProducts,
    apiConfig: {
      autoRefreshEnabled: apiConfig?.autoRefreshEnabled ?? true,
      refreshIntervalMs: apiConfig?.refreshIntervalMs || 10000,
    },
    isDummyData: payload.isDummyData === true,
  }
}
