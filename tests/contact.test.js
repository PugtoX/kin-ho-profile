// Validates the contact-form rules in src/lib/contact.js.
// Uses Node's built-in test runner — no framework, no dependencies.
//
//   npm test
//
// Note: this guards the *rules*. It does not prove a message is delivered —
// that is checked end to end against the real endpoint (readiness-gate.md G3).

import test from 'node:test'
import assert from 'node:assert/strict'

import {
  MAX_MESSAGE,
  MAX_NAME,
  MIN_MESSAGE,
  validateContact,
  EMAIL_RE,
} from '../src/lib/contact.js'

// The published limits are part of the contract, not an implementation detail.
// Asserting the literals means changing a constant fails here until the test is
// updated on purpose — otherwise the boundary tests below shift with the
// constant and can never fail.
test('exposes the documented limits', () => {
  assert.equal(MAX_NAME, 80)
  assert.equal(MIN_MESSAGE, 10)
  assert.equal(MAX_MESSAGE, 2000)
})

const valid = { name: 'Ada', email: 'ada@example.com', message: 'Hello, I need a site.' }

test('accepts a well-formed submission', () => {
  assert.deepEqual(validateContact(valid), {})
})

test('defaults to empty object when called with nothing', () => {
  const errors = validateContact()
  assert.ok(errors.name && errors.email && errors.message)
})

test('rejects a missing name', () => {
  assert.ok(validateContact({ ...valid, name: '   ' }).name)
})

test('rejects a name past the cap', () => {
  const errors = validateContact({ ...valid, name: 'a'.repeat(MAX_NAME + 1) })
  assert.ok(errors.name)
})

test('accepts a name exactly at the cap', () => {
  assert.equal(validateContact({ ...valid, name: 'a'.repeat(MAX_NAME) }).name, undefined)
})

test('rejects malformed emails', () => {
  for (const email of ['', '   ', 'ada', 'ada@', '@example.com', 'ada@example', 'a b@example.com']) {
    assert.ok(validateContact({ ...valid, email }).email, `should reject: ${JSON.stringify(email)}`)
  }
})

test('accepts plausible emails', () => {
  for (const email of ['ada@example.com', 'a.b+tag@sub.example.co.uk', 'x@y.io']) {
    assert.ok(EMAIL_RE.test(email), `should accept: ${email}`)
    assert.equal(validateContact({ ...valid, email }).email, undefined)
  }
})

test('rejects an empty message', () => {
  assert.ok(validateContact({ ...valid, message: '   ' }).message)
})

test('rejects a message under the minimum', () => {
  assert.ok(validateContact({ ...valid, message: 'a'.repeat(MIN_MESSAGE - 1) }).message)
})

test('accepts a message exactly at the minimum', () => {
  assert.equal(
    validateContact({ ...valid, message: 'a'.repeat(MIN_MESSAGE) }).message,
    undefined,
  )
})

test('rejects a message past the cap', () => {
  assert.ok(validateContact({ ...valid, message: 'a'.repeat(MAX_MESSAGE + 1) }).message)
})

test('accepts a message exactly at the cap', () => {
  assert.equal(
    validateContact({ ...valid, message: 'a'.repeat(MAX_MESSAGE) }).message,
    undefined,
  )
})

test('reports every bad field at once, not just the first', () => {
  const errors = validateContact({ name: '', email: 'nope', message: '' })
  assert.equal(Object.keys(errors).sort().join(','), 'email,message,name')
})
