import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Card from '../components/ui/Card'

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(<Card>Hello World</Card>)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('applies default padding', () => {
    const { container } = render(<Card>Content</Card>)
    const div = container.firstChild
    expect(div).toHaveClass('p-5')
  })

  it('can disable padding', () => {
    const { container } = render(<Card padding={false}>Content</Card>)
    const div = container.firstChild
    expect(div).not.toHaveClass('p-5')
  })

  it('merges custom classNames', () => {
    const { container } = render(<Card className="custom-style">Content</Card>)
    const div = container.firstChild
    expect(div).toHaveClass('custom-style')
    expect(div).toHaveClass('rounded-xl') // Check base style still exists
  })
})
