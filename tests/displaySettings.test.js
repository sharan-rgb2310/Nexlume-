import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeTvPadding } from '../src/services/displaySettings.js'

test('TV padding defaults to an enlarged top edge and no bottom inset', () => {
  assert.deepEqual(normalizeTvPadding(), {
    tvPaddingTop: 16,
    tvPaddingRight: 4,
    tvPaddingBottom: 0,
    tvPaddingLeft: 4,
  })
})

test('TV padding preserves custom edge values and clamps invalid ranges', () => {
  assert.deepEqual(normalizeTvPadding({
    tvPaddingTop: 25,
    tvPaddingRight: 8,
    tvPaddingBottom: 3,
    tvPaddingLeft: 120,
  }), {
    tvPaddingTop: 25,
    tvPaddingRight: 8,
    tvPaddingBottom: 3,
    tvPaddingLeft: 100,
  })
})

test('TV padding migrates a saved legacy margin to all edges', () => {
  assert.deepEqual(normalizeTvPadding({ tvMargin: 9 }), {
    tvPaddingTop: 9,
    tvPaddingRight: 9,
    tvPaddingBottom: 9,
    tvPaddingLeft: 9,
  })
})

test('TV padding migrates the previous built-in defaults to the new defaults', () => {
  assert.deepEqual(normalizeTvPadding({
    tvPaddingTop: 12,
    tvPaddingRight: 4,
    tvPaddingBottom: 2,
    tvPaddingLeft: 4,
  }), {
    tvPaddingTop: 16,
    tvPaddingRight: 4,
    tvPaddingBottom: 0,
    tvPaddingLeft: 4,
  })
})
