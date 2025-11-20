'use client'

import type React from 'react'
import { X, Download, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageCanvas } from '@/features/watermark'
import { LoadingSpinner } from '@/components/common'
import type { ImageItem } from '@/features/watermark'

interface ImageGridProps {
  images: ImageItem[]
  onRemove: (id: string) => void
  onEdit: (id: string) => void
  onDownload: (imageItem: ImageItem) => void
  onFullscreen: (canvas: HTMLCanvasElement) => void
}

export function ImageGrid({ images, onRemove, onEdit, onDownload, onFullscreen }: ImageGridProps) {
  if (images.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {images.map((imageItem) => (
        <div key={imageItem.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 relative group">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(imageItem.id)}
            className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white w-6 h-6 sm:w-8 sm:h-8 p-0"
            title="Remove image"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>

          {/* Custom Settings Indicator */}
          {imageItem.customSettings && (
            <div className="absolute top-1 left-1 sm:top-2 sm:left-2 z-10 bg-teal-600 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
              <span className="text-xs font-bold">•</span>
            </div>
          )}

          {imageItem.canvas ? (
            <ImageCanvas
              canvas={imageItem.canvas}
              onClick={() => onFullscreen(imageItem.canvas!)}
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <LoadingSpinner size="md" className="mb-2" />
                <span className="text-xs text-gray-500">Processing...</span>
              </div>
            </div>
          )}

          <div className="mt-2 sm:mt-3 flex items-center justify-between">
            <span
              className="text-xs sm:text-sm text-gray-600 truncate flex-1 mr-2"
              title={imageItem.file.name}
            >
              {imageItem.file.name}
            </span>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(imageItem.id)}
                className="text-xs border-gray-300 hover:border-teal-300 hover:text-teal-600 px-1.5 sm:px-3 h-7 sm:h-8 min-w-[2rem] sm:min-w-[auto]"
                title="Customize watermark for this image"
              >
                <Edit3 className="w-3 h-3 sm:mr-1" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(imageItem)}
                className="text-xs border-gray-300 hover:border-teal-300 hover:text-teal-600 px-1.5 sm:px-3 h-7 sm:h-8 min-w-[2rem] sm:min-w-[auto]"
                title="Download this image"
              >
                <Download className="w-3 h-3 sm:mr-1" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
