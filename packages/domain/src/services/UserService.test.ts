import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}))

import bcrypt from 'bcryptjs'
import { UserService } from './UserService'

describe('UserService', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('validates email formats as a pure domain rule', () => {
    expect(UserService.validateEmail('user@example.com')).toBe(true)
    expect(UserService.validateEmail('invalid-email')).toBe(false)
  })

  it('hashPassword delegates to bcrypt with the configured salt rounds', async () => {
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-value' as never)

    await expect(UserService.hashPassword('plain-password')).resolves.toBe('hashed-value')
    expect(bcrypt.hash).toHaveBeenCalledWith('plain-password', 10)
  })

  it('verifyPassword delegates comparison to bcrypt', async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never)

    await expect(UserService.verifyPassword('plain-password', 'stored-hash')).resolves.toBe(true)
    expect(bcrypt.compare).toHaveBeenCalledWith('plain-password', 'stored-hash')
  })

  it('createUser throws for invalid email before hashing', async () => {
    await expect(UserService.createUser('invalid-email', 'password123')).rejects.toThrow('Invalid email')
    expect(bcrypt.hash).not.toHaveBeenCalled()
  })

  it('createUser returns email and hashedPassword for valid input', async () => {
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never)

    await expect(UserService.createUser('user@example.com', 'password123')).resolves.toEqual({
      email: 'user@example.com',
      hashedPassword: 'hashed-password',
    })
  })
})
