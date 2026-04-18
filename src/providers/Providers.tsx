'use client'

import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { QueryProvider } from './QueryProvider'
import { AuthProvider } from './AuthProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryProvider>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
