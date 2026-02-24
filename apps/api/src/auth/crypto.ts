import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

export function hashPassword(password: string, salt = randomBytes(16).toString('hex')): string {
  const digest = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${digest}`
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, digest] = storedHash.split(':')
  if (!salt || !digest) {
    return false
  }

  const candidate = scryptSync(password, salt, 64)
  const expected = Buffer.from(digest, 'hex')

  if (candidate.length !== expected.length) {
    return false
  }

  return timingSafeEqual(candidate, expected)
}

export function createOpaqueToken(): string {
  return randomBytes(32).toString('hex')
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
