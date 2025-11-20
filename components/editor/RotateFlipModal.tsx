/**
 * Rotate and Flip Modal Component
 *
 * Provides a modal interface for rotating and flipping images
 */

'use client'

import { X, RotateCw, RotateCcw, FlipHorizontal, FlipVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RotateFlipModalProps {
  /** Whether modal is open */
  isOpen: boolean
  /** Callback when modal should close */
  onClose: () => void
  /** Callback when rotate action is triggered */
  onRotate: (direction: 'clockwise' | 'counterclockwise') => void
  /** Callback when flip action is triggered */
  onFlip: (direction: 'horizontal' | 'vertical') => void
  /** Image URL to display */
  imageUrl?: string
  /** Current rotation angle (for display) */
  rotation?: number
  /** Whether image is flipped horizontally */
  flippedHorizontal?: boolean
  /** Whether image is flipped vertically */
  flippedVertical?: boolean
}

export function RotateFlipModal({
  isOpen,
  onClose,
  onRotate,
  onFlip,
  imageUrl,
  rotation = 0,
  flippedHorizontal = false,
  flippedVertical = false,
}: RotateFlipModalProps) {
  if (!isOpen) return null

  const transformStyle = {
    transform: `rotate(${rotation}deg) scaleX(${flippedHorizontal ? -1 : 1}) scaleY(${flippedVertical ? -1 : 1})`,
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Rotate and Flip Image</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image Preview */}
          {imageUrl && (
            <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[200px] max-h-[400px] overflow-hidden">
              <div className="transition-transform duration-300 ease-in-out" style={transformStyle}>
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-w-full max-h-[350px] object-contain"
                />
              </div>
            </div>
          )}
          {/* Rotate Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Rotate Image</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2 border-2 hover:border-teal-500 hover:bg-teal-50 transition-colors"
                onClick={() => onRotate('clockwise')}
              >
                <RotateCw className="w-6 h-6 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">Clockwise</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2 border-2 hover:border-teal-500 hover:bg-teal-50 transition-colors"
                onClick={() => onRotate('counterclockwise')}
              >
                <RotateCcw className="w-6 h-6 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">Counter-Clockwise</span>
              </Button>
            </div>
            {rotation !== 0 && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Rotated {rotation > 0 ? '+' : ''}
                {rotation}°
              </p>
            )}
          </div>

          {/* Flip Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Flip Image</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className={cn(
                  'h-20 flex flex-col items-center justify-center gap-2 border-2 transition-colors',
                  flippedHorizontal
                    ? 'border-teal-500 bg-teal-50'
                    : 'hover:border-teal-500 hover:bg-teal-50'
                )}
                onClick={() => onFlip('horizontal')}
              >
                <FlipHorizontal className="w-6 h-6 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">Horizontally</span>
              </Button>
              <Button
                variant="outline"
                className={cn(
                  'h-20 flex flex-col items-center justify-center gap-2 border-2 transition-colors',
                  flippedVertical
                    ? 'border-teal-500 bg-teal-50'
                    : 'hover:border-teal-500 hover:bg-teal-50'
                )}
                onClick={() => onFlip('vertical')}
              >
                <FlipVertical className="w-6 h-6 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">Vertically</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
