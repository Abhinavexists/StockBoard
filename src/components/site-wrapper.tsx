"use client"

import { ReactNode } from "react"
import { Navbar } from "@/components/navbar"

interface SiteWrapperProps {
  children: ReactNode
}

export function SiteWrapper({ children }: SiteWrapperProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-6 md:py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4 px-4 sm:px-6 lg:px-8 text-sm text-muted-foreground">
          <p>© 2025 StockBoard.</p>
          <p>
            Built with Next.js, Tailwind CSS, and ShadCN UI
          </p>
        </div>
      </footer>
    </div>
  )
} 