import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizePricePrefix } from '../../src/lib/format-price.ts'

test('normalizePricePrefix: empty values become null', () => {
  assert.equal(normalizePricePrefix(null), null)
  assert.equal(normalizePricePrefix(undefined), null)
  assert.equal(normalizePricePrefix('   '), null)
})

test('normalizePricePrefix: equivalent "mulai" variants collapse', () => {
  for (const value of ['mulai', 'Mulai', 'mulai dari', 'MULAI DARI', 'start from']) {
    assert.equal(normalizePricePrefix(value), 'Mulai dari')
  }
})

test('normalizePricePrefix: equivalent "fixed price" variants collapse', () => {
  for (const value of ['harga tetap', 'Tetap', 'fixed', 'fixed price']) {
    assert.equal(normalizePricePrefix(value), 'Harga tetap')
  }
})

test('normalizePricePrefix: custom text is trimmed and capitalized, not dropped', () => {
  assert.equal(normalizePricePrefix('  mulai dari 1 juta '), 'Mulai dari 1 juta')
  assert.equal(normalizePricePrefix('nego'), 'Nego')
})
