import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="next-themes-provider">{children}</div>,
  useTheme: vi.fn(() => ({ setTheme: vi.fn() })),
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: { id: '1', email: 'test@example.com', name: 'Test' }, loading: false })),
}))

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => <button type="button" onClick={onClick}>{children}</button>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ModeToggle } from '@/components/mode-toggle'
import { ProtectedRoute } from '@/components/protected-route'
import { ThemeProvider } from '@/components/theme-provider'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

describe('presentation components', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders Button with merged classes without throwing', () => {
    render(<Button className="custom-class">Click me</Button>)

    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeTruthy()
    expect(button.className).toContain('custom-class')
    expect(button.getAttribute('data-slot')).toBe('button')
  })

  it('renders Card composition without throwing in jsdom', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    )

    expect(screen.getByText('Title')).toBeTruthy()
    expect(screen.getByText('Description')).toBeTruthy()
    expect(screen.getByText('Body')).toBeTruthy()
    expect(screen.getByText('Footer')).toBeTruthy()
  })

  it('renders ThemeProvider children using mocked next-themes provider', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div>Child content</div>
      </ThemeProvider>,
    )

    expect(screen.getByTestId('next-themes-provider')).toBeTruthy()
    expect(screen.getByText('Child content')).toBeTruthy()
  })

  it('renders ModeToggle and applies selected theme via mediator mock', () => {
    const setTheme = vi.fn()
    vi.mocked(useTheme).mockReturnValue({ setTheme } as never)

    render(<ModeToggle />)

    fireEvent.click(screen.getByRole('button', { name: 'Dark' }))

    expect(setTheme).toHaveBeenCalledWith('dark')
  })

  it('ProtectedRoute renders loading state while auth is loading', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: true, isAuthenticated: false } as never)

    render(<ProtectedRoute><div>Secret</div></ProtectedRoute>)

    expect(screen.getByText('Loading...')).toBeTruthy()
    expect(screen.queryByText('Secret')).toBeNull()
  })

  it('ProtectedRoute redirects unauthenticated users and renders nothing', () => {
    const push = vi.fn()
    vi.mocked(useRouter).mockReturnValue({ push } as never)
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, isAuthenticated: false } as never)

    const { container } = render(<ProtectedRoute redirectTo="/login"><div>Secret</div></ProtectedRoute>)

    expect(push).toHaveBeenCalledWith('/login')
    expect(container.innerHTML).toBe('')
  })

  it('ProtectedRoute renders children for authenticated users', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
      loading: false,
      isAuthenticated: true,
    } as never)

    render(<ProtectedRoute><div>Secret</div></ProtectedRoute>)

    expect(screen.getByText('Secret')).toBeTruthy()
  })
})
