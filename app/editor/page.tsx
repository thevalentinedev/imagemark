/**
 * Editor Page
 *
 * Main editor interface where users can:
 * - Upload images
 * - Select features from sidebar
 * - Apply multiple features to images
 * - Preview and download results
 */

'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Upload, Download, X, Crop, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/common'
import { EditorLayout } from '@/components/editor/EditorLayout'
import { FeatureSidebar } from '@/components/editor/FeatureSidebar'
import { ConvertSettings } from '@/components/editor/feature-settings/ConvertSettings'
import { RotateFlipModal } from '@/components/editor/RotateFlipModal'
import type { Feature } from '@/constants/features'
import type { EditorImage, AppliedFeature } from '@/lib/editor/types'
import { processEditorImage } from '@/lib/editor/feature-pipeline'
import { FEATURES } from '@/constants/features'

export default function EditorPage() {
  const [mounted, setMounted] = useState(false)
  const [images, setImages] = useState<EditorImage[]>([])
  const [activeFeature, setActiveFeature] = useState<Feature | null>(null)
  const [appliedFeatures, setAppliedFeatures] = useState<string[]>([])
  const [rotateModalOpen, setRotateModalOpen] = useState(false)
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [imageRotation, setImageRotation] = useState<Record<string, number>>({})
  const [imageFlip, setImageFlip] = useState<
    Record<string, { horizontal: boolean; vertical: boolean }>
  >({})
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }, [])

  const handleFiles = useCallback((files: File[]) => {
    const newImages: EditorImage[] = files.map((file, index) => {
      const id = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const originalUrl = URL.createObjectURL(file)
      return {
        id,
        originalFile: file,
        originalUrl,
        processedUrl: null,
        status: 'idle',
        appliedFeatures: [],
      }
    })

    setImages((prev) => [...prev, ...newImages])
  }, [])

  const handleFeatureSelect = useCallback((feature: Feature) => {
    setActiveFeature(feature)
    // Close mobile sheet when feature is selected (it will reopen for settings)
    setMobileSheetOpen(true) // Keep it open to show settings
  }, [])

  const handleApplyFeature = useCallback(
    async (feature: Feature, settings: Record<string, any>) => {
      console.log('Applying feature:', feature.id, settings)

      // Update images with applied feature
      setImages((prev) =>
        prev.map((img) => {
          const existingFeature = img.appliedFeatures.find((f) => f.featureId === feature.id)
          const newFeature: AppliedFeature = {
            featureId: feature.id,
            featureName: feature.name,
            settings,
            order: existingFeature
              ? existingFeature.order
              : img.appliedFeatures.length > 0
                ? Math.max(...img.appliedFeatures.map((f) => f.order)) + 1
                : 0,
          }

          const updatedFeatures = existingFeature
            ? img.appliedFeatures.map((f) => (f.featureId === feature.id ? newFeature : f))
            : [...img.appliedFeatures, newFeature]

          return {
            ...img,
            appliedFeatures: updatedFeatures,
            status: 'idle', // Will be processed
          }
        })
      )

      // Update applied features list
      setAppliedFeatures((prev) => (prev.includes(feature.id) ? prev : [...prev, feature.id]))

      // Return to feature list after applying
      setActiveFeature(null)

      // TODO: Process images through pipeline
      // This requires feature handlers to be implemented
    },
    []
  )

  // Detect current file format from uploaded images
  const currentFormat = useMemo(() => {
    if (images.length === 0) return undefined
    // Get format from first image (assuming all images are same format)
    const firstImage = images[0]
    const fileType = firstImage.originalFile.type
    // Extract format from MIME type (e.g., "image/jpeg" -> "jpeg")
    return fileType.split('/')[1] || undefined
  }, [images])

  const handleRemove = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id)
      if (image) {
        URL.revokeObjectURL(image.originalUrl)
        if (image.processedUrl && image.processedUrl.startsWith('blob:')) {
          URL.revokeObjectURL(image.processedUrl)
        }
      }
      return prev.filter((img) => img.id !== id)
    })
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const hasImages = images.length > 0

  // Render sidebar content based on view
  const sidebarContent = activeFeature ? (
    <div className="p-4">
      {activeFeature && activeFeature.id === 'convert' ? (
        <ConvertSettings
          currentFormat={currentFormat}
          onApply={(targetFormat) => {
            handleApplyFeature(activeFeature, { format: targetFormat })
          }}
          isProcessing={images.some((img) => img.status === 'processing')}
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Configure {activeFeature.name} settings. This feature will be applied to all images.
          </p>
          {/* TODO: Render feature-specific settings component for other features */}
          <Button
            onClick={() => {
              handleApplyFeature(activeFeature, {})
            }}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
          >
            Apply {activeFeature.name}
          </Button>
        </div>
      )}
    </div>
  ) : (
    <FeatureSidebar
      activeFeatureId={undefined}
      onFeatureSelect={handleFeatureSelect}
      appliedFeatures={appliedFeatures}
    />
  )

  return (
    <EditorLayout
      sidebar={sidebarContent}
      isSettingsView={!!activeFeature}
      onBack={() => {
        setActiveFeature(null)
        // Keep sheet open when going back to feature list
      }}
      settingsTitle={activeFeature?.name || 'Settings'}
      mobileSheetOpen={mobileSheetOpen}
      onMobileSheetToggle={() => setMobileSheetOpen((prev) => !prev)}
    >
      {/* Toolbar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!hasImages && (
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Images
            </Button>
          )}
          {hasImages && (
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
              className="border-gray-300"
            >
              <Upload className="w-4 h-4 mr-2" />
              Add More
            </Button>
          )}
        </div>
        {hasImages && (
          <Button
            onClick={() => {
              // TODO: Download all processed images
              console.log('Download all')
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="p-6">
        {!hasImages ? (
          <div className="max-w-2xl mx-auto">
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Upload Images to Get Started
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Select features from the sidebar and apply them to your images
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Choose Images
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Image Preview */}
                <div className="relative aspect-square bg-gray-100 group">
                  {image.status === 'processing' ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <LoadingSpinner size="md" />
                    </div>
                  ) : image.processedUrl ? (
                    <img
                      src={image.processedUrl}
                      alt="Processed"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={image.originalUrl}
                      alt="Original"
                      className="w-full h-full object-contain"
                    />
                  )}

                  {/* Action Icons Overlay */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 bg-black/50 hover:bg-black/70 text-white rounded-full"
                      title="Crop"
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Implement crop functionality
                        console.log('Crop image:', image.id)
                      }}
                    >
                      <Crop className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 bg-black/50 hover:bg-black/70 text-white rounded-full"
                      title="Rotate"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedImageId(image.id)
                        setRotateModalOpen(true)
                      }}
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 bg-black/50 hover:bg-black/70 text-white rounded-full"
                      title="Remove"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(image.id)
                      }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Image Info */}
                <div className="p-2 sm:p-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate mb-1.5 sm:mb-2">
                    {image.originalFile.name}
                  </p>

                  {/* Applied Features */}
                  {image.appliedFeatures.length > 0 && (
                    <div className="mb-2">
                      <div className="flex flex-wrap gap-0.5 sm:gap-1">
                        {image.appliedFeatures.map((feature) => (
                          <span
                            key={feature.featureId}
                            className="text-[10px] sm:text-xs bg-teal-100 text-teal-700 px-1 sm:px-1.5 py-0.5 rounded"
                          >
                            {feature.featureName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1">
                    {image.status === 'completed' && image.processedUrl && (
                      <Button
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = image.processedUrl!
                          link.download = image.originalFile.name
                          link.click()
                        }}
                        className="bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
                        title="Download"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1.5" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Rotate/Flip Modal */}
      {selectedImageId && (
        <RotateFlipModal
          isOpen={rotateModalOpen}
          onClose={() => {
            setRotateModalOpen(false)
            setSelectedImageId(null)
          }}
          imageUrl={
            images.find((img) => img.id === selectedImageId)?.processedUrl ||
            images.find((img) => img.id === selectedImageId)?.originalUrl
          }
          rotation={imageRotation[selectedImageId] || 0}
          flippedHorizontal={imageFlip[selectedImageId]?.horizontal || false}
          flippedVertical={imageFlip[selectedImageId]?.vertical || false}
          onRotate={(direction) => {
            if (selectedImageId) {
              const currentRotation = imageRotation[selectedImageId] || 0
              const newRotation =
                direction === 'clockwise' ? currentRotation + 90 : currentRotation - 90
              setImageRotation((prev) => ({
                ...prev,
                [selectedImageId]: newRotation,
              }))
              // TODO: Apply actual rotation to image
              console.log(
                'Rotate',
                direction,
                'for image:',
                selectedImageId,
                'New angle:',
                newRotation
              )
            }
          }}
          onFlip={(direction) => {
            if (selectedImageId) {
              setImageFlip((prev) => ({
                ...prev,
                [selectedImageId]: {
                  horizontal:
                    direction === 'horizontal'
                      ? !(prev[selectedImageId]?.horizontal || false)
                      : prev[selectedImageId]?.horizontal || false,
                  vertical:
                    direction === 'vertical'
                      ? !(prev[selectedImageId]?.vertical || false)
                      : prev[selectedImageId]?.vertical || false,
                },
              }))
              // TODO: Apply actual flip to image
              console.log('Flip', direction, 'for image:', selectedImageId)
            }
          }}
        />
      )}
    </EditorLayout>
  )
}
