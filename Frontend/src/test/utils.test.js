import { describe, it, expect } from 'vitest'
import { getInitials } from '../layouts/TopNavbar'

describe('getInitials utility (from Navbar)', () => {
  it('should return empty string for empty input', () => {
    expect(getInitials('')).toBe('')
    expect(getInitials(undefined)).toBe('')
  })

  it('should return two initials for a full name', () => {
    expect(getInitials('John Doe')).toBe('JD')
  })

  it('should handle single names', () => {
    expect(getInitials('John')).toBe('J')
  })

  it('should handle more than two names by taking the first two', () => {
    expect(getInitials('John Quincy Adams')).toBe('JQ')
  })

  it('should handle extra whitespace', () => {
    expect(getInitials('  John   Doe  ')).toBe('JD')
  })

  it('should return uppercase initials even if input is lowercase', () => {
    expect(getInitials('john doe')).toBe('JD')
  })
})
