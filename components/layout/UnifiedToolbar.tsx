'use client'

import { useState } from 'react'
import { Upload, Download, Settings, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { FEATURES } from '@/constants/features'

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
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId) ? prev.filter((id) => id !== featureId) : [...prev, featureId]
    )
  }

  const enabledFeatures = FEATURES.filter((f) => f.enabled)

  return (
    <div
      className={cn(
        'sticky top-16 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Left: Upload & Actions */}
          <div className="flex items-center gap-2">
            {onUpload && (
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

            {onAddMore && fileCount > 0 && (
              <Button onClick={onAddMore} variant="outline" size="sm" className="border-gray-300">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Add More</span>
              </Button>
            )}

            {fileCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {fileCount} file{fileCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Center: Feature Quick Actions (only enabled features) */}
          {enabledFeatures.length > 0 && fileCount > 0 && (
            <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
              <span className="text-xs text-gray-500 mr-2">Quick Actions:</span>
              {enabledFeatures.map((feature) => {
                const IconComponent = feature.icon
                return (
                  <Button
                    key={feature.id}
                    variant={selectedFeatures.includes(feature.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleFeature(feature.id)}
                    className={cn(
                      'text-xs',
                      selectedFeatures.includes(feature.id)
                        ? 'bg-teal-600 hover:bg-teal-700 text-white'
                        : 'border-gray-300'
                    )}
                  >
                    <IconComponent className="w-3 h-3 mr-1" />
                    {feature.name}
                  </Button>
                )
              })}
            </div>
          )}

          {/* Right: Settings & Download */}
          <div className="flex items-center gap-2">
            {onSettings && (
              <Button onClick={onSettings} variant="outline" size="sm" className="border-gray-300">
                <Settings className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            )}

            {onDownload && fileCount > 0 && (
              <Button
                onClick={onDownload}
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white"
                disabled={isProcessing}
              >
                <Download className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">
                  {isProcessing ? 'Processing...' : 'Download'}
                </span>
                <span className="sm:hidden">{isProcessing ? '...' : 'DL'}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Selected Features Indicator */}
        {selectedFeatures.length > 0 && (
          <div className="flex items-center gap-2 pb-2 pt-1 border-t border-gray-100">
            <span className="text-xs text-gray-500">Active:</span>
            {selectedFeatures.map((featureId) => {
              const feature = FEATURES.find((f) => f.id === featureId)
              if (!feature) return null
              const IconComponent = feature.icon
              return (
                <Badge
                  key={featureId}
                  variant="secondary"
                  className="text-xs flex items-center gap-1"
                >
                  <IconComponent className="w-3 h-3" />
                  {feature.name}
                  <button
                    onClick={() => toggleFeature(featureId)}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
