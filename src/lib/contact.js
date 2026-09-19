// Validation for the contact form, kept out of the component so it can be
// tested directly. Client-side checks only keep the obvious junk out — the
// endpoint is the real gate, so passing these is never proof a message arrives.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const MAX_NAME = 80
export const MAX_MESSAGE = 2000
export const MIN_MESSAGE = 10

export function validateContact({ name = '', email = '', message = '' } = {}) {
  const errors = {}

  const trimmedName = name.trim()
  if (!trimmedName) errors.name = 'Please tell me your name.'
  else if (trimmedName.length > MAX_NAME) {
    errors.name = `That name is too long (${MAX_NAME} characters max).`
  }

  const trimmedEmail = email.trim()
  if (!trimmedEmail) errors.email = 'Please add an email so I can reply.'
  else if (!EMAIL_RE.test(trimmedEmail)) {
    errors.email = 'That email address looks incomplete.'
  }

  // Message length is measured untrimmed so trailing whitespace still counts
  // toward the cap, matching what the server would receive.
  if (!message.trim()) errors.message = 'Please write a short message.'
  else if (message.trim().length < MIN_MESSAGE) {
    errors.message = `A little more detail helps (${MIN_MESSAGE} characters min).`
  } else if (message.length > MAX_MESSAGE) {
    errors.message = `That message is too long (${MAX_MESSAGE} characters max).`
  }

  return errors
}
