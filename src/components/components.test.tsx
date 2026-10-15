import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'
import { ThemeProvider } from '@/components/theme-provider'
import { ModeToggle } from '@/components/mode-toggle'
import { ProtectedRoute } from '@/components/protected-route'

const setThemeMock = vi.fn()
const pushMock = vi.fn()
const useAuthMock = vi.fn()

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider" data-props={JSON.stringify(props)}>
      {children}
    </div>
  ),
  useTheme: () => ({
    setTheme: setThemeMock,
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}))

describe('presentation components', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
  })

  it('renders Button with merged classes and no exceptions', () => {
    render(
      <Button className="px-2 px-4" variant="outline">
        Click me
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeTruthy()
    expect(button.className).toContain('px-4')
    expect(button.className).not.toContain('px-2')
  })

  it('renders ThemeProvider children with mocked theme provider', () => {
    vi.stubEnv('TEST_API_KEY', 'test-mock-key')

    render(
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <span>inside provider</span>
      </ThemeProvider>,
    )

    expect(screen.getByTestId('theme-provider')).toBeTruthy()
    expect(screen.getByText('inside provider')).toBeTruthy()
  })

  it('renders ModeToggle trigger without external I/O', () => {
    render(<ModeToggle />)

    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeTruthy()
    expect(setThemeMock).not.toHaveBeenCalled()
  })

  it('renders loading state in ProtectedRoute while auth is loading', () => {
    useAuthMock.mockReturnValue({ user: null, loading: true })

    render(
      <ProtectedRoute loadingComponent={<div>Custom loading</div>}>
        <div>Secret content</div>
      </ProtectedRoute>,
    )

    expect(screen.getByText('Custom loading')).toBeTruthy()
    expect(screen.queryByText('Secret content')).toBeNull()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('redirects unauthenticated users and renders nothing', () => {
    useAuthMock.mockReturnValue({ user: null, loading: false })

    const { container } = render(
      <ProtectedRoute redirectTo="/custom-login">
        <div>Secret content</div>
      </ProtectedRoute>,
    )

    expect(pushMock).toHaveBeenCalledWith('/custom-login')
    expect(container.innerHTML).toBe('')
  })

  it('renders children for authenticated users', () => {
    useAuthMock.mockReturnValue({
      user: { id: '1', email: 'user@example.com', name: 'User' },
      loading: false,
    })

    render(
      <ProtectedRoute>
        <div>Secret content</div>
      </ProtectedRoute>,
    )

    expect(screen.getByText('Secret content')).toBeTruthy()
    expect(pushMock).not.toHaveBeenCalled()
  })
})
