import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'

// Test component that throws an error
const BuggyComponent = () => {
  throw new Error('Test error')
}

// Test component that renders normally
const WorkingComponent = () => {
  return <div data-testid="working">Working!</div>
}

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    // Mock console.error to prevent test output noise
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    )

    expect(screen.getByTestId('working')).toBeInTheDocument()
  })

  it('should display error message when child throws', () => {
    render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
  })

  it('should have a reload button when error occurs', () => {
    render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    )

    const reloadButton = screen.getByRole('button', { name: /try again/i })
    expect(reloadButton).toBeInTheDocument()
  })
})
