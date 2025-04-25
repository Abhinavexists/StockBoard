"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      {...props}
      enableSystem
      enableColorScheme
      attribute="class"
      defaultTheme="system"
      storageKey="stock-dashboard-theme"
    >
      {children}
    </NextThemesProvider>
  )
} 