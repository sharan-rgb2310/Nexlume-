const demoCycles = {
  Rice: { maximum: 1800, minimum: 1200, decrement: 15 },
  Sugar: { maximum: 45, minimum: 20, decrement: 2 },
  'Black Gram': { maximum: 10, minimum: 3, decrement: 2 },
  'Palm Oil': { maximum: 75, minimum: 30, decrement: 1 },
  Wheat: { maximum: 35, minimum: 15, decrement: 1 },
  'Toor Dal': { maximum: 120, minimum: 60, decrement: 3 },
  'Green Gram': { maximum: 20, minimum: 5, decrement: 1 },
}

export function advanceDemoProducts(products) {
  return products.map((product) => {
    const cycle = demoCycles[product.en]
    if (!cycle) return product

    const stock = product.stock <= cycle.minimum
      ? cycle.maximum
      : Math.max(cycle.minimum, product.stock - cycle.decrement)

    return {
      ...product,
      stock,
      status: stock === 0 ? 'out_of_stock' : stock <= product.lowStockThreshold ? 'low_stock' : 'in_stock',
    }
  })
}
