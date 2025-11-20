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
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadAreaRef = useRef<HTMLDivElement>(null)

  const handleFiles = useCallback((files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith('image/'))

    if (imageFiles.length === 0) return

    const newImages: EditorImage[] = imageFiles.map((file) => {
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

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (images.length > 0 && document.activeElement?.tagName !== 'INPUT') {
        return
      }

      const items = e.clipboardData?.items
      if (!items) return

      const imageFiles: File[] = []

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            imageFiles.push(file)
          }
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault()
        handleFiles(imageFiles)
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => {
      window.removeEventListener('paste', handlePaste)
    }
  }, [images.length, handleFiles])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files)
        handleFiles(files)
      }
    },
    [handleFiles]
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files)
        handleFiles(files)
      }
    },
    [handleFiles]
  )

  const handleFeatureSelect = useCallback((feature: Feature) => {
    setActiveFeature(feature)
    setMobileSheetOpen(true)
  }, [])

  const processConvertImage = useCallback(
    async (
      image: EditorImage,
      targetFormat: string,
      compression: 'lossless' | 'lossy' = 'lossless'
    ) => {
      try {
        const formData = new FormData()
        formData.append('image', image.originalFile)
        formData.append('format', targetFormat)
        formData.append('compression', compression)

        const response = await fetch('/api/v1/image/convert', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error?.message || 'Format conversion failed')
        }

        const data = await response.json()

        if (!data.success || !data.data?.convertedImage) {
          throw new Error('Invalid response from server')
        }

        const dataUrl = data.data.convertedImage
        const directUrl = data.data.convertedImageUrl

        const base64Match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
        if (!base64Match) {
          throw new Error('Invalid data URL format')
        }

        const mimeType = base64Match[1]
        const base64Data = base64Match[2]

        const binaryString = atob(base64Data)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }

        const processedBlob = new Blob([bytes], { type: mimeType })
        const blobUrl = URL.createObjectURL(processedBlob)
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  processedUrl: blobUrl,
                  processedImageUrl: directUrl || null, // Store direct URL for downloads
                  status: 'completed',
                }
              : img
          )
        )
      } catch (error) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                  ...img,
                  status: 'error',
                  errorMessage: error instanceof Error ? error.message : 'Processing failed',
                }
              : img
          )
        )
      }
    },
    []
  )

  const handleApplyFeature = useCallback(
    async (feature: Feature, settings: Record<string, any>) => {
      console.log('Applying feature:', feature.id, settings)

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
            status: 'processing',
          }
        })
      )

      setAppliedFeatures((prev) => (prev.includes(feature.id) ? prev : [...prev, feature.id]))

      if (feature.id === 'convert' && settings.format) {
        setImages((currentImages) => {
          const compression = (settings.compression as 'lossless' | 'lossy') || 'lossless'
          currentImages.forEach((img) => {
            processConvertImage(img, settings.format, compression)
          })
          return currentImages
        })
      }

      setActiveFeature(null)
    },
    [processConvertImage]
  )

  const currentFormat = useMemo(() => {
    if (images.length === 0) return undefined
    const firstImage = images[0]
    const fileType = firstImage.originalFile.type
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

  const sidebarContent = activeFeature ? (
    <div className="p-4">
      {activeFeature && activeFeature.id === 'convert' ? (
        <ConvertSettings
          currentFormat={currentFormat}
          onApply={(targetFormat, compression) => {
            handleApplyFeature(activeFeature, { format: targetFormat, compression })
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
      }}
      settingsTitle={activeFeature?.name || 'Settings'}
      mobileSheetOpen={mobileSheetOpen}
      onMobileSheetToggle={() => setMobileSheetOpen((prev) => !prev)}
    >
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
            onClick={async () => {
              const completedImages = images.filter(
                (img) => img.status === 'completed' && img.processedUrl
              )

              if (completedImages.length === 0) {
                alert('No processed images to download')
                return
              }

              try {
                const { default: JSZip } = await import('jszip')
                const zip = new JSZip()

                await Promise.all(
                  completedImages.map(async (image) => {
                    let downloadUrl: string

                    if (image.processedImageUrl) {
                      downloadUrl = `/api/v1/image/proxy?url=${encodeURIComponent(image.processedImageUrl)}`
                    } else if (image.processedUrl) {
                      downloadUrl = image.processedUrl
                    } else {
                      console.warn(`Skipping image ${image.id}: no download URL available`)
                      return
                    }

                    const response = await fetch(downloadUrl)
                    if (!response.ok) {
                      console.warn(`Failed to fetch image ${image.id} for download`)
                      return
                    }

                    const blob = await response.blob()

                    const convertFeature = image.appliedFeatures.find(
                      (f) => f.featureId === 'convert'
                    )
                    const targetFormat = convertFeature?.settings?.format || 'png'
                    const extension = targetFormat === 'jpg' ? 'jpeg' : targetFormat

                    const originalName = image.originalFile.name.replace(/\.[^/.]+$/, '')
                    zip.file(`${originalName}.${extension}`, blob)
                  })
                )

                const zipBlob = await zip.generateAsync({ type: 'blob' })
                const url = URL.createObjectURL(zipBlob)
                const link = document.createElement('a')
                link.href = url
                link.download = `imagemark-converted-${Date.now()}.zip`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
              } catch (error) {
                console.error('Download all failed:', error)
                alert('Failed to download images. Please try again.')
              }
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white"
            disabled={!images.some((img) => img.status === 'completed' && img.processedUrl)}
          >
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
        )}
      </div>

      <div className="p-6">
        {!hasImages ? (
          <div className="max-w-2xl mx-auto">
            <div
              ref={uploadAreaRef}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer ${
                dragActive
                  ? 'border-teal-400 bg-teal-50 scale-[1.02]'
                  : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />

              <div className="flex flex-col items-center gap-3">
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Choose Images
                </Button>
                <p className="text-xs text-gray-500">
                  or drag and drop images here • or paste from clipboard (Ctrl/Cmd + V)
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
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

                <div className="p-2 sm:p-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate mb-1.5 sm:mb-2">
                    {image.originalFile.name}
                  </p>

                  {image.status === 'completed' && image.appliedFeatures.length > 0 && (
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

                  <div className="flex items-center justify-end gap-1">
                    {image.status === 'completed' && image.processedUrl && (
                      <Button
                        size="sm"
                        onClick={async () => {
                          try {
                            const convertFeature = image.appliedFeatures.find(
                              (f) => f.featureId === 'convert'
                            )
                            const targetFormat = convertFeature?.settings?.format || 'png'
                            const extension = targetFormat === 'jpg' ? 'jpeg' : targetFormat

                            let downloadUrl: string

                            if (image.processedImageUrl) {
                              const proxyUrl = `/api/v1/image/proxy?url=${encodeURIComponent(image.processedImageUrl)}`
                              downloadUrl = proxyUrl
                            } else if (image.processedUrl) {
                              downloadUrl = image.processedUrl
                            } else {
                              throw new Error('No processed image available for download')
                            }

                            const response = await fetch(downloadUrl)
                            if (!response.ok) {
                              throw new Error('Failed to fetch image for download')
                            }

                            const blob = await response.blob()

                            const blobUrl = URL.createObjectURL(blob)
                            const link = document.createElement('a')
                            link.href = blobUrl
                            const originalName = image.originalFile.name.replace(/\.[^/.]+$/, '')
                            link.download = `${originalName}.${extension}`
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)

                            setTimeout(() => {
                              URL.revokeObjectURL(blobUrl)
                            }, 100)
                          } catch (error) {
                            console.error('Download failed:', error)
                            console.error('Image state:', {
                              id: image.id,
                              hasProcessedUrl: !!image.processedUrl,
                              hasProcessedImageUrl: !!image.processedImageUrl,
                              processedImageUrl: image.processedImageUrl,
                              error: error instanceof Error ? error.message : String(error),
                            })
                            alert(
                              error instanceof Error
                                ? error.message
                                : 'Failed to download image. Please try again.'
                            )
                          }
                        }}
                        className="bg-teal-600 hover:bg-teal-700 text-white h-7 w-7 sm:h-8 sm:w-8 p-0"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    {image.status === 'error' && (
                      <span className="text-xs text-red-600" title={image.errorMessage}>
                        Error
                      </span>
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
              console.log('Flip', direction, 'for image:', selectedImageId)
            }
          }}
        />
      )}
    </EditorLayout>
  )
}
