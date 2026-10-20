import BlackGramBowl from '../components/graphics/BlackGramBowl'
import PalmOilBottle from '../components/graphics/PalmOilBottle'
import RiceBowl from '../components/graphics/RiceBowl'
import SugarBowl from '../components/graphics/SugarBowl'
import ToorDalBowl from '../components/graphics/ToorDalBowl'
import WheatBowl from '../components/graphics/WheatBowl'

const productDisplay = {
  Rice: { ta: 'அரிசி', unitTa: 'கிலோ', graphic: RiceBowl },
  Sugar: { ta: 'சர்க்கரை', unitTa: 'கிலோ', graphic: SugarBowl },
  'Black Gram': { ta: 'கருப்பு உளுந்து', unitTa: 'கிலோ', graphic: BlackGramBowl },
  'Toor Dal': { ta: 'துவரம் பருப்பு', unitTa: 'கிலோ', graphic: ToorDalBowl },
  'Palm Oil': { ta: 'பாமாயில்', unitTa: 'லிட்டர்', graphic: PalmOilBottle },
  Wheat: { ta: 'கோதுமை', unitTa: 'கிலோ', graphic: WheatBowl },
}

export function normalizeStockResponse(payload) {
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.products)) {
    throw new Error('The stock API returned an invalid response: products must be an array.')
  }

  const { shopId, district, products, apiConfig } = payload
  if (typeof shopId !== 'string' || typeof district !== 'string') {
    throw new Error('The stock API response must include shopId and district.')
  }
  if (!apiConfig || typeof apiConfig !== 'object') {
    throw new Error('The stock API response must include apiConfig.')
  }
  if (typeof apiConfig.autoRefreshEnabled !== 'boolean'
    || !Number.isFinite(apiConfig.refreshIntervalMs)
    || apiConfig.refreshIntervalMs < 1000) {
    throw new Error('The stock API returned invalid refresh settings.')
  }

  const mappedProducts = products.map((product, index) => {
    if (!product || typeof product !== 'object'
      || typeof product.productId !== 'string'
      || typeof product.productName !== 'string'
      || !Number.isFinite(product.availableQuantity)
      || !Number.isFinite(product.lowStockThreshold)
      || typeof product.unit !== 'string') {
      throw new Error(`The stock API returned invalid data for product ${index + 1}.`)
    }

    if (!['in_stock', 'low_stock', 'out_of_stock'].includes(product.status)) {
      throw new Error(`The stock API returned an invalid stock status for ${product.productName}.`)
    }

    const display = productDisplay[product.productName] ?? {}
    const isLitre = product.unit.toLowerCase() === 'litre' || product.unit.toLowerCase() === 'liter'

    return {
      id: product.productId,
      ta: display.ta ?? product.productName,
      en: product.productName,
      stock: product.availableQuantity,
      unitTa: display.unitTa ?? (isLitre ? 'லிட்டர்' : 'கிலோ'),
      unitEn: isLitre ? 'Litre' : 'Kg',
      graphic: display.graphic ?? RiceBowl,
      status: product.status,
      lowStockThreshold: product.lowStockThreshold,
    }
  })

  return {
    shopInfo: {
      code: shopId,
      locationTa: district === 'Chennai' ? 'சென்னை, தமிழ்நாடு' : district,
      locationEn: `${district}, Tamil Nadu`,
    },
    products: mappedProducts,
    apiConfig: {
      autoRefreshEnabled: apiConfig.autoRefreshEnabled,
      refreshIntervalMs: apiConfig.refreshIntervalMs,
    },
    isDummyData: payload.isDummyData === true,
  }
}
