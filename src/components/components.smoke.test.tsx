import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const pushMock = vi.fn()
const useAuthMock = vi.fn()
const setThemeMock = vi.fn()
const originalEnv = process.env

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}))

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

import { ModeToggle } from '@/components/mode-toggle'
import { ProtectedRoute } from '@/components/protected-route'
import { ThemeProvider } from '@/components/theme-provider'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

describe('UI component smoke tests', () => {
  beforeEach(() => {
    process.env = { ...originalEnv, TEST_API_KEY: 'test-mock-key' }
    pushMock.mockReset()
    useAuthMock.mockReset()
    setThemeMock.mockReset()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    process.env = originalEnv
  })

  it('renders base UI components without throwing and applies expected slots', () => {
    render(
      <div>
        <Button variant="outline">Press</Button>
        <Card>
          <CardHeader>
            <CardTitle>Card title</CardTitle>
            <CardDescription>Card description</CardDescription>
            <CardAction>Action</CardAction>
          </CardHeader>
          <CardContent>Body</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
        <Alert>
          <AlertTitle>Heads up</AlertTitle>
          <AlertDescription>Useful details</AlertDescription>
        </Alert>
        <Input type="email" placeholder="name@example.com" />
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Section</AccordionTrigger>
            <AccordionContent>Accordion body</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>,
    )

    expect(screen.getByRole('button', { name: 'Press' }).getAttribute('data-slot')).toBe('button')
    expect(screen.getByText('Card title').getAttribute('data-slot')).toBe('card-title')
    expect(screen.getByRole('alert').getAttribute('data-slot')).toBe('alert')
    expect(screen.getByPlaceholderText('name@example.com').getAttribute('data-slot')).toBe('input')
    expect(screen.getByText('Section').getAttribute('data-slot')).toBe('accordion-trigger')
  })

  it('passes props and children through ThemeProvider', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <span>child content</span>
      </ThemeProvider>,
    )

    expect(screen.getByTestId('theme-provider').getAttribute('data-props')).toBe(
      JSON.stringify({ attribute: 'class', defaultTheme: 'dark' }),
    )
    expect(screen.getByText('child content')).toBeTruthy()
  })

  it('renders a loading fallback while authentication state is pending', () => {
    useAuthMock.mockReturnValue({ user: null, loading: true })

    render(
      <ProtectedRoute loadingComponent={<div>Custom loading</div>}>
        <div>Private area</div>
      </ProtectedRoute>,
    )

    expect(screen.getByText('Custom loading')).toBeTruthy()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('redirects unauthenticated users and keeps protected content hidden', () => {
    useAuthMock.mockReturnValue({ user: null, loading: false })

    render(
      <ProtectedRoute redirectTo="/sign-in">
        <div>Private area</div>
      </ProtectedRoute>,
    )

    expect(pushMock).toHaveBeenCalledWith('/sign-in')
    expect(screen.queryByText('Private area')).toBeNull()
  })

  it('renders protected content for authenticated users', () => {
    useAuthMock.mockReturnValue({
      user: { id: '1', email: 'user@example.com', name: 'User' },
      loading: false,
    })

    render(
      <ProtectedRoute>
        <div>Private area</div>
      </ProtectedRoute>,
    )

    expect(screen.getByText('Private area')).toBeTruthy()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('renders the mode toggle trigger without throwing', () => {
    render(<ModeToggle />)

    expect(screen.getByRole('button', { name: 'Toggle theme' })).toBeTruthy()
    expect(setThemeMock).not.toHaveBeenCalled()
  })
})
