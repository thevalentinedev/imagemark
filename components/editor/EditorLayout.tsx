/**
 * Editor Layout Component
 *
 * Provides an editor-style interface with:
 * - Left sidebar: Feature list OR Feature settings (switches between views)
 * - Main area: Image workspace/grid
 */

'use client'

import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EditorLayoutProps {
  /** Left sidebar content (feature list or settings) */
  sidebar: ReactNode
  /** Main workspace content */
  children: ReactNode
  /** Whether sidebar is showing settings (vs feature list) */
  isSettingsView?: boolean
  /** Callback when back button is clicked */
  onBack?: () => void
  /** Settings view title */
  settingsTitle?: string
}

export function EditorLayout({
  sidebar,
  children,
  isSettingsView = false,
  onBack,
  settingsTitle = 'Settings',
}: EditorLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Left Sidebar */}
      <aside className="w-80 border-r border-gray-200 bg-white flex-shrink-0 overflow-y-auto">
        {isSettingsView && onBack && (
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-sm font-semibold text-gray-900 truncate">{settingsTitle}</h2>
          </div>
        )}
        {sidebar}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="h-full">{children}</div>
      </main>
    </div>
  )
}
