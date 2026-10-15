import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

const { hashMock, compareMock } = vi.hoisted(() => ({
  hashMock: vi.fn(),
  compareMock: vi.fn(),
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: hashMock,
    compare: compareMock,
  },
}))

import { UserService } from './UserService'

describe('UserService', () => {
  beforeEach(() => {
    hashMock.mockReset()
    compareMock.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('validates well-formed email addresses', () => {
    expect(UserService.validateEmail('user@example.com')).toBe(true)
  })

  it('rejects malformed email addresses', () => {
    expect(UserService.validateEmail('invalid-email')).toBe(false)
  })

  it('hashes passwords with the configured salt rounds', async () => {
    hashMock.mockResolvedValue('hashed-value')

    await expect(UserService.hashPassword('plain-secret')).resolves.toBe('hashed-value')
    expect(hashMock).toHaveBeenCalledWith('plain-secret', 10)
  })

  it('verifies passwords against a stored hash', async () => {
    compareMock.mockResolvedValue(true)

    await expect(UserService.verifyPassword('plain-secret', 'stored-hash')).resolves.toBe(true)
    expect(compareMock).toHaveBeenCalledWith('plain-secret', 'stored-hash')
  })

  it('creates users with a hashed password when the email is valid', async () => {
    hashMock.mockResolvedValue('hashed-password')

    await expect(UserService.createUser('user@example.com', 'plain-secret')).resolves.toEqual({
      email: 'user@example.com',
      hashedPassword: 'hashed-password',
    })
  })

  it('throws before hashing when the email is invalid', async () => {
    await expect(UserService.createUser('bad-email', 'plain-secret')).rejects.toThrow('Invalid email')
    expect(hashMock).not.toHaveBeenCalled()
  })
})
