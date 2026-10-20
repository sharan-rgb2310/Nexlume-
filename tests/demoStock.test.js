import assert from 'node:assert/strict'
import { test } from 'node:test'
import { advanceDemoProducts } from '../src/data/demoStock.js'

function product(en, stock, lowStockThreshold = 50) {
  return { en, stock, lowStockThreshold, unchanged: true }
}

test('demo stock decreases Rice by 15 and resets after reaching 1200', () => {
  let rice = product('Rice', 1800, 200)
  for (let tick = 0; tick < 39; tick += 1) {
    rice = advanceDemoProducts([rice])[0]
  }
  assert.equal(rice.stock, 1215)
  rice = advanceDemoProducts([rice])[0]
  assert.equal(rice.stock, 1200)
  rice = advanceDemoProducts([rice])[0]
  assert.equal(rice.stock, 1800)
})

test('demo stock decreases Sugar by 2 and resets after reaching 20', () => {
  let sugar = product('Sugar', 45)
  for (let tick = 0; tick < 12; tick += 1) {
    sugar = advanceDemoProducts([sugar])[0]
  }
  assert.equal(sugar.stock, 21)
  sugar = advanceDemoProducts([sugar])[0]
  assert.equal(sugar.stock, 20)
  sugar = advanceDemoProducts([sugar])[0]
  assert.equal(sugar.stock, 45)
})

test('demo stock decreases Black Gram by 2, clamps at 3, then resets to 10', () => {
  let blackGram = product('Black Gram', 10)
  blackGram = advanceDemoProducts([blackGram])[0]
  assert.equal(blackGram.stock, 8)
  blackGram = advanceDemoProducts([blackGram])[0]
  assert.equal(blackGram.stock, 6)
  blackGram = advanceDemoProducts([blackGram])[0]
  assert.equal(blackGram.stock, 4)
  blackGram = advanceDemoProducts([blackGram])[0]
  assert.equal(blackGram.stock, 3)
  blackGram = advanceDemoProducts([blackGram])[0]
  assert.equal(blackGram.stock, 10)
})

test('demo stock advances every listed commodity without mutating live input', () => {
  const products = [
    product('Rice', 1800, 200),
    product('Sugar', 45),
    product('Black Gram', 10),
    product('Palm Oil', 75),
    product('Wheat', 35),
    product('Toor Dal', 120),
    product('Green Gram', 20),
  ]
  const updated = advanceDemoProducts(products)

  assert.deepEqual(updated.map(({ stock }) => stock), [1785, 43, 8, 74, 34, 117, 19])
  assert.deepEqual(products.map(({ stock }) => stock), [1800, 45, 10, 75, 35, 120, 20])
  assert.ok(updated.every(({ unchanged }) => unchanged))
})
