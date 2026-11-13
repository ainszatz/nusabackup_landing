import { test } from 'node:test'
import assert from 'node:assert/strict'
import { leadSchema } from '../../src/lib/validations/lead.ts'

const base = {
  name: 'Budi Santoso',
  preferred_channel: 'whatsapp' as const,
  consent: 'on',
}

test('leadSchema: accepts a lead with only a phone number', () => {
  const result = leadSchema.safeParse({ ...base, phone: '08123456789' })
  assert.equal(result.success, true)
})

test('leadSchema: accepts a lead with only an email address', () => {
  const result = leadSchema.safeParse({ ...base, email: 'budi@example.com' })
  assert.equal(result.success, true)
})

test('leadSchema: rejects a lead with no reachable channel', () => {
  const result = leadSchema.safeParse(base)
  assert.equal(result.success, false)
  if (!result.success) {
    assert.equal(result.error.issues[0]?.message, 'Isi minimal salah satu: nomor WhatsApp atau email.')
  }
})

test('leadSchema: rejects malformed phone numbers', () => {
  const result = leadSchema.safeParse({ ...base, phone: '12345' })
  assert.equal(result.success, false)
})

test('leadSchema: requires consent', () => {
  const result = leadSchema.safeParse({ name: 'Budi', phone: '08123456789', preferred_channel: 'whatsapp' })
  assert.equal(result.success, false)
  if (!result.success) {
    assert.match(String(result.error.issues[0]?.message), /Persetujuan Kebijakan Privasi/)
  }
})
