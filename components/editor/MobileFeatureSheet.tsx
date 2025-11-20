/**
 * Mobile Feature Sheet Component
 *
 * Bottom sheet for mobile devices to access features
 */

'use client'

import { X, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { ReactNode } from 'react'

interface MobileFeatureSheetProps {
  /** Whether sheet is open */
  isOpen: boolean
  /** Callback when sheet should close */
  onClose: () => void
  /** Sheet title */
  title: string
  /** Sheet content */
  children: ReactNode
  /** Whether this is a settings view */
  isSettingsView?: boolean
  /** Callback when back button is clicked (for settings view) */
  onBack?: () => void
}

export function MobileFeatureSheet({
  isOpen,
  onClose,
  title,
  children,
  isSettingsView = false,
  onBack,
}: MobileFeatureSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="h-[85vh] max-h-[600px] rounded-t-2xl p-0 flex flex-col bg-white [&>button]:hidden"
      >
        <SheetHeader className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            {isSettingsView && onBack ? (
              <div className="flex items-center gap-2 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <SheetTitle className="text-base font-semibold text-gray-900">{title}</SheetTitle>
              </div>
            ) : (
              <SheetTitle className="text-base font-semibold text-gray-900">{title}</SheetTitle>
            )}
            {!isSettingsView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
