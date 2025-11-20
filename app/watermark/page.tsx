'use client'

import type React from 'react'
import { useState, useRef, useCallback, useMemo, Suspense, lazy } from 'react'
import { Settings, ChevronDown, Shield, Zap, Download } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

// Watermark feature
import type { WatermarkSettings, ImageItem, PositionPreset, VideoItem } from '@/features/watermark'
import {
  DEFAULT_SETTINGS,
  ACCEPTED_FILE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  useWatermark,
  useImageUpload,
  useVideoUpload,
  createImageFromFile,
  downloadBlob,
  canvasToBlob,
  createVideoFromFile,
} from '@/features/watermark'

// Editor components
import {
  UploadArea,
  ImageGrid,
  VideoGrid,
  SettingsPanel,
  FullscreenImageModal,
  FullscreenVideoModal,
} from '@/features/watermark/components/editor'

// Shared hooks
import { useDebounce } from '@/hooks/useDebounce'

// Layout components
import { Footer } from '@/components/layout'
import { UnifiedToolbar } from '@/components/layout'

// Common components
import { ImageMarkLogo } from '@/components/common'
import { LoadingSpinner } from '@/components/common'
import { FAQ } from '@/components/common'
import { FAQ_DATA } from '@/data/faq'

// Lazy load heavy components
const ImageSettingsModal = lazy(() => import('@/features/watermark/components/ImageSettingsModal'))
const VideoSettingsModal = lazy(() => import('@/features/watermark/components/VideoSettingsModal'))

export default function WatermarkingTool() {
  // State
  const [mounted, setMounted] = useState(false)
  const [images, setImages] = useState<ImageItem[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [watermarkImage, setWatermarkImage] = useState<HTMLImageElement | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [hasEditedSettings, setHasEditedSettings] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [settings, setSettings] = useState<WatermarkSettings>(DEFAULT_SETTINGS)
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)
  const [fullscreenVideoBlob, setFullscreenVideoBlob] = useState<Promise<Blob> | null>(null)
  const [editingImageId, setEditingImageId] = useState<string | null>(null)
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null)
  const [showPositionPresets, setShowPositionPresets] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Custom Hooks
  const { processFiles, isProcessing } = useImageUpload()
  const { processVideos, isProcessingVideos } = useVideoUpload()
  const { analysisCanvasRef, analyzeBrightness, processImage, hasWatermark } = useWatermark(
    settings,
    watermarkImage
  )

  // Debounced settings for performance
  const debouncedSettings = useDebounce(settings, 300)

  // Effects
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update canvases when settings change (debounced)
  useEffect(() => {
    if (images.length > 0 && hasWatermark) {
      setImages((prev) =>
        prev.map((imageItem) => ({
          ...imageItem,
          canvas: processImage(imageItem),
        }))
      )
    }
  }, [debouncedSettings, hasWatermark, watermarkImage]) // Remove processImage and images.length from dependencies to prevent infinite loops

  // Replace the video processing useEffect with this corrected version:
  useEffect(() => {
    if (videos.length > 0) {
      const processVideos = async () => {
        const updatedVideos = await Promise.all(
          videos.map(async (videoItem) => {
            try {
              if (!videoItem.canvas) {
                const videoSettings = videoItem.customSettings || settings
                const processedBlob = await createVideoFromFile(
                  videoItem.file,
                  hasWatermark ? videoSettings : undefined,
                  watermarkImage
                )
                return {
                  ...videoItem,
                  canvas: Promise.resolve(processedBlob),
                }
              }
              return videoItem
            } catch (error) {
              console.error('Error processing video:', error)
              return videoItem
            }
          })
        )
        setVideos(updatedVideos)
      }

      processVideos()
    }
  }, [debouncedSettings, hasWatermark, watermarkImage, videos.length])

  // Keyboard event handler - only run on client side
  useEffect(() => {
    if (!mounted) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (fullscreenImage) {
          closeFullscreen()
        } else if (editingImageId) {
          setEditingImageId(null)
        } else if (fullscreenVideoBlob) {
          closeFullscreenVideo()
        } else if (editingVideoId) {
          setEditingVideoId(null)
        }
      }
    }

    if (fullscreenImage || editingImageId || fullscreenVideoBlob || editingVideoId) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [mounted, fullscreenImage, editingImageId, fullscreenVideoBlob, editingVideoId])

  // Memoized handlers
  const handleFileUpload = useCallback(
    async (files: FileList) => {
      const newImages = await processFiles(files)

      if (newImages.length > 0) {
        // Analyze brightness for the first image
        const fontMode = analyzeBrightness(newImages[0].image)
        setSettings((prev) => ({ ...prev, fontMode }))

        // Add images first
        setImages((prev) => [...prev, ...newImages])

        // Process canvases after a short delay to ensure state is updated
        setTimeout(() => {
          setImages((current) =>
            current.map((imageItem) => ({
              ...imageItem,
              canvas: processImage(imageItem),
            }))
          )
        }, 100)
      }
    },
    [processFiles, analyzeBrightness, processImage]
  )

  // Also update the video upload handler:
  const handleVideoUpload = useCallback(
    async (files: FileList | File[]) => {
      const newVideos = await processVideos(files)

      if (newVideos.length > 0) {
        // Add videos first
        setVideos((prev) => [...prev, ...newVideos])

        // Process videos after a short delay
        setTimeout(async () => {
          const processedVideos = await Promise.all(
            newVideos.map(async (videoItem) => {
              try {
                const videoSettings = videoItem.customSettings || settings
                const processedBlob = await createVideoFromFile(
                  videoItem.file,
                  hasWatermark ? videoSettings : undefined,
                  watermarkImage
                )
                return {
                  ...videoItem,
                  canvas: Promise.resolve(processedBlob),
                }
              } catch (error) {
                console.error('Error processing video:', error)
                return {
                  ...videoItem,
                  canvas: Promise.resolve(new Blob([videoItem.file], { type: 'video/mp4' })),
                }
              }
            })
          )

          setVideos((current) => {
            const existingVideos = current.filter((v) => !newVideos.find((nv) => nv.id === v.id))
            return [...existingVideos, ...processedVideos]
          })
        }, 100)
      }
    },
    [processVideos, settings, hasWatermark, watermarkImage]
  )

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (files) {
        const fileArray = Array.from(files)
        const imageFiles = fileArray.filter((file) =>
          ACCEPTED_FILE_TYPES.includes(file.type as any)
        )
        const videoFiles = fileArray.filter((file) =>
          ACCEPTED_VIDEO_TYPES.includes(file.type as any)
        )

        if (imageFiles.length > 0) {
          handleFileUpload(imageFiles as any)
        }

        if (videoFiles.length > 0) {
          handleVideoUpload(videoFiles)
        }
      }
    },
    [handleFileUpload, handleVideoUpload]
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

      if (e.dataTransfer.files) {
        const files = e.dataTransfer.files
        const imageFiles = Array.from(files).filter((file) =>
          ACCEPTED_FILE_TYPES.includes(file.type as any)
        )
        const videoFiles = Array.from(files).filter((file) =>
          ACCEPTED_VIDEO_TYPES.includes(file.type as any)
        )

        if (imageFiles.length > 0) {
          handleFileUpload(imageFiles as any)
        }

        if (videoFiles.length > 0) {
          handleVideoUpload(videoFiles)
        }
      }
    },
    [handleFileUpload, handleVideoUpload]
  )

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }, [])

  const removeVideo = useCallback((id: string) => {
    setVideos((prev) => prev.filter((vid) => vid.id !== id))
  }, [])

  const goHome = useCallback(() => {
    setImages([])
    setVideos([])
    setShowSettings(false)
    setHasEditedSettings(false)
    setWatermarkImage(null)
    setEditingImageId(null)
    setEditingVideoId(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const toggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev)
    if (!showSettings) {
      setHasEditedSettings(true)
    }
  }, [showSettings])

  const downloadSingleImage = useCallback(async (imageItem: ImageItem) => {
    if (!imageItem.canvas) return

    try {
      const blob = await canvasToBlob(imageItem.canvas)
      const filename = `watermarked-${imageItem.file.name.split('.')[0]}.png`
      await downloadBlob(blob, filename)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }, [])

  // And update the downloadSingleVideo function:
  const downloadSingleVideo = useCallback(async (videoItem: VideoItem) => {
    if (!videoItem.canvas) return

    try {
      const blob = await videoItem.canvas
      if (!blob || blob.size === 0) {
        throw new Error('Invalid video blob')
      }

      const filename = `watermarked-${videoItem.file.name.split('.')[0]}.mp4`
      await downloadBlob(blob, filename)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }, [])

  const downloadAllAsZip = useCallback(async () => {
    if (images.length === 0 && videos.length === 0) return

    setIsDownloading(true)

    try {
      // Lazy load JSZip only when needed
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()

      const blobPromises = images.map(async (imageItem) => {
        if (!imageItem.canvas) return

        const blob = await canvasToBlob(imageItem.canvas)
        const fileName = `watermarked-${imageItem.file.name.split('.')[0]}.png`
        zip.file(fileName, blob)
      })

      const videoBlobPromises = videos.map(async (videoItem) => {
        if (!videoItem.canvas) return

        const blob = await videoItem.canvas
        const fileName = `watermarked-${videoItem.file.name.split('.')[0]}.mp4`
        zip.file(fileName, blob)
      })

      await Promise.all([...blobPromises, ...videoBlobPromises])

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const filename = `imagemark-watermarked-${Date.now()}.zip`
      await downloadBlob(zipBlob, filename)
    } catch (error) {
      console.error('Zip download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }, [images, videos])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  const updateSetting = useCallback(
    <K extends keyof WatermarkSettings>(key: K, value: WatermarkSettings[K]) => {
      setSettings((prev) => {
        const newSettings = { ...prev, [key]: value }

        // Clear preset selection if manually updating position
        if (key === 'positionX' || key === 'positionY') {
          newSettings.positionPreset = 'custom'
        }

        // Set opacity to 100% when switching to image watermark type
        if (key === 'type' && value === 'image') {
          newSettings.opacity = 100
        }

        return newSettings
      })
    },
    []
  )

  const handlePositionPresetSelect = useCallback((preset: PositionPreset) => {
    setSettings((prev) => ({
      ...prev,
      positionX: preset.x,
      positionY: preset.y,
      positionPreset: preset.id,
      rotation: 0,
    }))
  }, [])

  const handleWatermarkImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      createImageFromFile(file)
        .then(setWatermarkImage)
        .catch((error) => console.error('Failed to load watermark image:', error))
    }
  }, [])

  // Fullscreen video handler:
  const openFullscreenVideo = useCallback((canvas: Promise<Blob>) => {
    setFullscreenVideoBlob(canvas)
  }, [])

  const closeFullscreenVideo = useCallback(() => {
    setFullscreenVideoBlob(null)
  }, [])

  const openFullscreen = useCallback((canvas: HTMLCanvasElement) => {
    const dataUrl = canvas.toDataURL('image/png')
    setFullscreenImage(dataUrl)
  }, [])

  const closeFullscreen = useCallback(() => {
    setFullscreenImage(null)
  }, [])

  const handleImageSettingsSave = useCallback(
    (imageId: string, newSettings: WatermarkSettings) => {
      setImages((prev) =>
        prev.map((img) => {
          if (img.id === imageId) {
            const isGlobalSettings = JSON.stringify(newSettings) === JSON.stringify(settings)
            const updatedItem = {
              ...img,
              customSettings: isGlobalSettings ? undefined : newSettings,
            }
            // Update canvas immediately
            updatedItem.canvas = processImage(updatedItem)
            return updatedItem
          }
          return img
        })
      )
    },
    [settings, processImage]
  )

  const handleVideoSettingsSave = useCallback(
    async (videoId: string, newSettings: WatermarkSettings) => {
      setVideos((prev) =>
        prev.map((vid) => {
          if (vid.id === videoId) {
            const isGlobalSettings = JSON.stringify(newSettings) === JSON.stringify(settings)
            const updatedItem = {
              ...vid,
              customSettings: isGlobalSettings ? undefined : newSettings,
            }
            // Update canvas immediately with new settings
            updatedItem.canvas = createVideoFromFile(updatedItem.file, newSettings, watermarkImage)
            return updatedItem
          }
          return vid
        })
      )
    },
    [settings, watermarkImage]
  )

  const editingImage = useMemo(() => {
    return editingImageId ? images.find((img) => img.id === editingImageId) : null
  }, [editingImageId, images])

  const editingVideo = useMemo(() => {
    return editingVideoId ? videos.find((vid) => vid.id === editingVideoId) : null
  }, [editingVideoId, videos])

  const togglePositionPresets = useCallback(() => {
    setShowPositionPresets((prev) => {
      const newValue = !prev
      // If opening position presets, close advanced settings
      if (newValue) {
        setShowAdvancedSettings(false)
      }
      return newValue
    })
  }, [])

  const toggleAdvancedSettings = useCallback(() => {
    setShowAdvancedSettings((prev) => {
      const newValue = !prev
      // If opening advanced settings, close position presets
      if (newValue) {
        setShowPositionPresets(false)
      }
      return newValue
    })
  }, [])

  // Loading state
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Results view - after images and videos are uploaded
  if (images.length > 0 || videos.length > 0) {
    return (
      <div className="min-h-screen bg-white">
        {/* Unified Toolbar */}
        <UnifiedToolbar
          onUpload={() => fileInputRef.current?.click()}
          onDownload={downloadAllAsZip}
          onSettings={toggleSettings}
          onAddMore={() => fileInputRef.current?.click()}
          fileCount={images.length + videos.length}
          isProcessing={isDownloading || isProcessing || isProcessingVideos}
        />

        <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
          {/* Watermark Notice */}
          {!showSettings && !hasEditedSettings && (
            <div className="mb-4 sm:mb-6 bg-teal-50 border border-teal-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Settings className="w-5 h-5 text-teal-600 mt-0.5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-teal-800">
                    <span className="font-medium">Watermark applied!</span>{' '}
                    <button
                      onClick={toggleSettings}
                      className="underline hover:no-underline font-medium"
                    >
                      Click Edit
                    </button>{' '}
                    to customize your watermark text, position, and style.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Settings Panel */}
          {showSettings && (
            <SettingsPanel
              settings={settings}
              showPositionPresets={showPositionPresets}
              showAdvancedSettings={showAdvancedSettings}
              onUpdateSetting={updateSetting}
              onPositionPresetSelect={handlePositionPresetSelect}
              onWatermarkImageUpload={handleWatermarkImageUpload}
              onTogglePositionPresets={togglePositionPresets}
              onToggleAdvancedSettings={toggleAdvancedSettings}
              onResetSettings={resetSettings}
            />
          )}

          {/* Images Grid */}
          <ImageGrid
            images={images}
            onRemove={removeImage}
            onEdit={setEditingImageId}
            onDownload={downloadSingleImage}
            onFullscreen={openFullscreen}
          />

          {/* Videos Grid */}
          <VideoGrid
            videos={videos}
            onRemove={removeVideo}
            onEdit={setEditingVideoId}
            onDownload={downloadSingleVideo}
            onFullscreen={openFullscreenVideo}
          />

          {/* Individual Image Settings Modal */}
          {editingImage && (
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <ImageSettingsModal
                imageItem={editingImage}
                globalSettings={settings}
                watermarkImage={watermarkImage}
                onClose={() => setEditingImageId(null)}
                onSave={(newSettings) => handleImageSettingsSave(editingImage.id, newSettings)}
              />
            </Suspense>
          )}

          {/* Individual Video Settings Modal */}
          {editingVideo && (
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <VideoSettingsModal
                videoItem={editingVideo}
                globalSettings={settings}
                watermarkImage={watermarkImage}
                onClose={() => setEditingVideoId(null)}
                onSave={(newSettings) => handleVideoSettingsSave(editingVideo.id, newSettings)}
              />
            </Suspense>
          )}

          {/* Fullscreen Modals */}
          <FullscreenImageModal imageUrl={fullscreenImage} onClose={closeFullscreen} />
          <FullscreenVideoModal videoBlob={fullscreenVideoBlob} onClose={closeFullscreenVideo} />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={[...ACCEPTED_FILE_TYPES, ...ACCEPTED_VIDEO_TYPES].join(',')}
          multiple
          onChange={handleInputChange}
          className="hidden"
        />

        <canvas ref={analysisCanvasRef} style={{ display: 'none' }} />
      </div>
    )
  }

  // Landing page - before image or video upload
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero section */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-16 text-center">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Add Watermarks{' '}
            <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full font-semibold">
              Free
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Protect your images and videos with custom watermarks. Fast, secure, and completely
            free.
          </p>
        </div>

        {/* Upload area */}
        <UploadArea
          dragActive={dragActive}
          isProcessing={isProcessing}
          isProcessingVideos={isProcessingVideos}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onFileSelect={handleInputChange}
          fileInputRef={fileInputRef}
        />

        {/* Features */}
        <div className="grid sm:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-gray-600 text-sm">Process multiple images and videos in seconds</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">100% Private</h3>
            <p className="text-gray-600 text-sm">Files never leave your browser</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Download className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Always Free</h3>
            <p className="text-gray-600 text-sm">No limits, no subscriptions</p>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600">
                Quick answers to common questions about ImageMark
              </p>
            </div>

            <FAQ items={FAQ_DATA} maxItems={3} />

            <div className="text-center mt-8">
              <Link
                href="/faq"
                className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium"
              >
                View all FAQs
                <ChevronDown className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <canvas ref={analysisCanvasRef} style={{ display: 'none' }} />
    </div>
  )
}
