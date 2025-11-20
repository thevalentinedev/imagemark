'use client'

import { Upload, Download, Settings, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface UnifiedToolbarProps {
  onUpload?: () => void
  onDownload?: () => void
  onSettings?: () => void
  onAddMore?: () => void
  fileCount?: number
  isProcessing?: boolean
  className?: string
}

export function UnifiedToolbar({
  onUpload,
  onDownload,
  onSettings,
  onAddMore,
  fileCount = 0,
  isProcessing = false,
  className,
}: UnifiedToolbarProps) {
  const hasFiles = fileCount > 0

  return (
    <div
      className={cn(
        'sticky top-16 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Left: Upload/Add More */}
          <div className="flex items-center gap-2">
            {!hasFiles && onUpload && (
              <Button
                onClick={onUpload}
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white"
                disabled={isProcessing}
              >
                <Upload className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Upload</span>
              </Button>
            )}

            {hasFiles && onAddMore && (
              <Button onClick={onAddMore} variant="outline" size="sm" className="border-gray-300">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Add More</span>
              </Button>
            )}
          </div>

          {/* Right: Settings & Download */}
          <div className="flex items-center gap-2">
            {onSettings && (
              <Button
                onClick={onSettings}
                variant="outline"
                size="sm"
                className="border-gray-300 hover:border-teal-400 hover:text-teal-600"
              >
                <Settings className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            )}

            {onDownload && hasFiles && (
              <Button
                onClick={onDownload}
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white"
                disabled={isProcessing}
              >
                <Download className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">
                  {isProcessing ? 'Processing...' : 'Download All'}
                </span>
                <span className="sm:hidden">{isProcessing ? '...' : 'All'}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
