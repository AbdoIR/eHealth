import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PageHeader from '../components/ui/PageHeader'

describe('PageHeader Component', () => {
  it('renders title correctly', () => {
    render(<PageHeader title="Welcome Page" />)
    expect(screen.getByText('Welcome Page')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<PageHeader title="Title" subtitle="This is a subtitle" />)
    expect(screen.getByText('This is a subtitle')).toBeInTheDocument()
  })

  it('renders action button correctly', () => {
    render(
      <PageHeader 
        title="Title" 
        actionButton={<button data-testid="action-btn">Click Me</button>} 
      />
    )
    expect(screen.getByTestId('action-btn')).toBeInTheDocument()
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })
})
