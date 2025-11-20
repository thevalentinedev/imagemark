/**
 * Feature Sidebar Component
 *
 * Displays all enabled features in a simple flat list
 */

'use client'

import { cn } from '@/lib/utils'
import { FEATURES, type Feature } from '@/constants/features'

interface FeatureSidebarProps {
  /** Currently active feature ID */
  activeFeatureId?: string
  /** Callback when a feature is selected */
  onFeatureSelect: (feature: Feature) => void
  /** Features that are currently applied (for visual indication) */
  appliedFeatures?: string[]
}

export function FeatureSidebar({
  activeFeatureId,
  onFeatureSelect,
  appliedFeatures = [],
}: FeatureSidebarProps) {
  const enabledFeatures = FEATURES.filter((f) => f.enabled)

  return (
    <div className="h-full flex flex-col">
      {/* Header - Hidden on mobile (handled by sheet header) */}
      <div className="hidden md:block p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Features</h2>
      </div>

      {/* Feature List - Flat */}
      <div className="flex-1 overflow-y-auto">
        {enabledFeatures.map((feature) => {
          const IconComponent = feature.icon
          const isActive = activeFeatureId === feature.id

          return (
            <button
              key={feature.id}
              onClick={() => onFeatureSelect(feature)}
              className={cn(
                'w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left border-b border-gray-100',
                isActive && 'bg-teal-50 border-r-2 border-teal-600'
              )}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <IconComponent
                  className={cn(
                    'w-5 h-5 flex-shrink-0',
                    isActive ? 'text-teal-600' : 'text-gray-600'
                  )}
                />
                <span
                  className={cn(
                    'text-sm truncate',
                    isActive ? 'text-teal-900 font-medium' : 'text-gray-700'
                  )}
                >
                  {feature.name}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
