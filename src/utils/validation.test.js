import { describe, it, expect } from 'vitest'
import {
  validatePassword,
  getPasswordStrength,
  getPasswordStrengthLabel,
  validateUsername,
  isValidEmail,
  sanitizeInput
} from './validation'

describe('Password Validation', () => {
  it('should reject empty password', () => {
    const result = validatePassword('')
    expect(result.isValid).toBe(false)
    expect(result.message).toBe('Password is required')
  })

  it('should reject password shorter than 8 characters', () => {
    const result = validatePassword('Ab1')
    expect(result.isValid).toBe(false)
    expect(result.message).toBe('Password must be at least 8 characters long')
  })

  it('should reject password without uppercase', () => {
    const result = validatePassword('abcdefgh')
    expect(result.isValid).toBe(false)
    expect(result.message).toBe('Password must contain at least one uppercase letter')
  })

  it('should reject password without lowercase', () => {
    const result = validatePassword('ABCDEFGH')
    expect(result.isValid).toBe(false)
    expect(result.message).toBe('Password must contain at least one lowercase letter')
  })

  it('should reject password without numbers', () => {
    const result = validatePassword('Abcdefgh')
    expect(result.isValid).toBe(false)
    expect(result.message).toBe('Password must contain at least one number')
  })

  it('should accept valid password', () => {
    const result = validatePassword('Abcdefgh1')
    expect(result.isValid).toBe(true)
  })
})

describe('Password Strength', () => {
  it('should return 0 for empty password', () => {
    expect(getPasswordStrength('')).toBe(0)
  })

  it('should return higher score for longer passwords', () => {
    expect(getPasswordStrength('Abcdefgh1')).toBeGreaterThan(getPasswordStrength('Ab1'))
  })

  it('should give bonus for special characters', () => {
    const withSpecial = getPasswordStrength('Abcdefgh1!')
    expect(withSpecial).toBeGreaterThanOrEqual(3)
  })
})

describe('Password Strength Label', () => {
  it('should return correct label for 0', () => {
    const result = getPasswordStrengthLabel(0)
    expect(result.label).toBe('Very Weak')
  })

  it('should return correct label for 4', () => {
    const result = getPasswordStrengthLabel(4)
    expect(result.label).toBe('Strong')
  })
})

describe('Username Validation', () => {
  it('should reject empty username', () => {
    const result = validateUsername('')
    expect(result.isValid).toBe(false)
  })

  it('should reject username shorter than 3 characters', () => {
    const result = validateUsername('ab')
    expect(result.isValid).toBe(false)
  })

  it('should reject username longer than 20 characters', () => {
    const result = validateUsername('a'.repeat(21))
    expect(result.isValid).toBe(false)
  })

  it('should reject username with uppercase', () => {
    const result = validateUsername('Username')
    expect(result.isValid).toBe(false)
  })

  it('should accept valid lowercase username', () => {
    const result = validateUsername('john_doe')
    expect(result.isValid).toBe(true)
  })
})

describe('Email Validation', () => {
  it('should return false for empty email', () => {
    expect(isValidEmail('')).toBe(false)
  })

  it('should return true for valid email', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
  })

  it('should return false for invalid email', () => {
    expect(isValidEmail('notanemail')).toBe(false)
  })
})

describe('Input Sanitization', () => {
  it('should sanitize HTML characters', () => {
    const result = sanitizeInput('<script>alert("xss")</script>')
    expect(result).not.toContain('<script>')
    expect(result).toContain('&lt;script&gt;')
  })

  it('should return empty string for null input', () => {
    expect(sanitizeInput(null)).toBe('')
  })

  it('should trim whitespace', () => {
    const result = sanitizeInput('  hello  ')
    expect(result).toBe('hello')
  })
})
