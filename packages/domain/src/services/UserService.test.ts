import { afterEach, describe, expect, it, vi } from 'vitest'
import bcrypt from 'bcryptjs'
import { UserService } from './UserService'

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}))

describe('UserService', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
  })

  it('validates well-formed email addresses', () => {
    expect(UserService.validateEmail('user@example.com')).toBe(true)
    expect(UserService.validateEmail('invalid-email')).toBe(false)
  })

  it('hashPassword delegates to bcrypt with expected salt rounds', async () => {
    vi.stubEnv('TEST_API_KEY', 'test-mock-key')
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-value')

    await expect(UserService.hashPassword('plain-password')).resolves.toBe('hashed-value')
    expect(bcrypt.hash).toHaveBeenCalledWith('plain-password', 10)
  })

  it('verifyPassword delegates comparison to bcrypt', async () => {
    vi.mocked(bcrypt.compare).mockResolvedValue(true)

    await expect(UserService.verifyPassword('plain-password', 'stored-hash')).resolves.toBe(true)
    expect(bcrypt.compare).toHaveBeenCalledWith('plain-password', 'stored-hash')
  })

  it('createUser returns email and hashed password for valid input', async () => {
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-value')

    await expect(UserService.createUser('user@example.com', 'secret')).resolves.toEqual({
      email: 'user@example.com',
      hashedPassword: 'hashed-value',
    })
  })

  it('createUser rejects invalid email addresses before hashing', async () => {
    await expect(UserService.createUser('invalid', 'secret')).rejects.toThrow('Invalid email')
    expect(bcrypt.hash).not.toHaveBeenCalled()
  })
})
