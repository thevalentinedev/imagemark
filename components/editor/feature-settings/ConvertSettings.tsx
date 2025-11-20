/**
 * Convert Feature Settings Component
 *
 * Shows current file type and target format selector
 */

'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ConvertSettingsProps {
  /** Current file format (detected from images) */
  currentFormat?: string
  /** Callback when format is applied */
  onApply: (targetFormat: string) => void
  /** Whether processing is in progress */
  isProcessing?: boolean
}

const SUPPORTED_FORMATS = [
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WebP' },
  { value: 'avif', label: 'AVIF' },
  { value: 'gif', label: 'GIF' },
] as const

export function ConvertSettings({
  currentFormat,
  onApply,
  isProcessing = false,
}: ConvertSettingsProps) {
  const [targetFormat, setTargetFormat] = useState<string>('webp')

  const handleApply = () => {
    if (targetFormat) {
      onApply(targetFormat)
    }
  }

  // Normalize format for display
  const displayFormat = currentFormat
    ? currentFormat.toLowerCase().replace('image/', '').replace('jpeg', 'jpg')
    : 'Unknown'

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Current Format</label>
        <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5">
          {displayFormat.toUpperCase()}
        </Badge>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Convert To</label>
        <Select value={targetFormat} onValueChange={setTargetFormat}>
          <SelectTrigger className="w-full bg-white border-2 border-gray-200 hover:border-teal-300 focus:border-teal-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border-2 border-gray-200">
            {SUPPORTED_FORMATS.map((format) => (
              <SelectItem
                key={format.value}
                value={format.value}
                className="hover:bg-teal-50 focus:bg-teal-50 cursor-pointer"
              >
                {format.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleApply}
        disabled={isProcessing || !targetFormat}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        {isProcessing ? 'Processing...' : 'Apply Convert'}
      </Button>
    </div>
  )
}
