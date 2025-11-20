/**
 * Feature Pipeline
 *
 * System for applying multiple features to images in sequence
 */

import type { EditorImage, AppliedFeature, FeatureHandler } from './types'

/**
 * Apply a single feature to an image
 */
export async function applyFeature(
  image: File | Blob | string,
  featureId: string,
  handler: FeatureHandler,
  settings: Record<string, any>
): Promise<Blob | string> {
  try {
    const result = await handler(image, settings)
    return result
  } catch (error) {
    console.error(`Error applying feature ${featureId}:`, error)
    throw error
  }
}

/**
 * Apply multiple features to an image in sequence
 * Each feature receives the result from the previous feature
 */
export async function applyFeaturePipeline(
  image: File | Blob | string,
  features: Array<{
    featureId: string
    handler: FeatureHandler
    settings: Record<string, any>
  }>
): Promise<Blob | string> {
  let currentImage: File | Blob | string = image

  for (const feature of features) {
    currentImage = await applyFeature(
      currentImage,
      feature.featureId,
      feature.handler,
      feature.settings
    )
  }

  return currentImage
}

/**
 * Process an editor image through its applied features
 */
export async function processEditorImage(
  editorImage: EditorImage,
  featureHandlers: Map<string, FeatureHandler>
): Promise<EditorImage> {
  if (editorImage.appliedFeatures.length === 0) {
    return {
      ...editorImage,
      processedUrl: editorImage.originalUrl,
      status: 'completed',
    }
  }

  try {
    const processingImage: EditorImage = {
      ...editorImage,
      status: 'processing',
    }

    const features = editorImage.appliedFeatures
      .sort((a, b) => a.order - b.order)
      .map((appliedFeature) => {
        const handler = featureHandlers.get(appliedFeature.featureId)
        if (!handler) {
          throw new Error(`No handler found for feature: ${appliedFeature.featureId}`)
        }
        return {
          featureId: appliedFeature.featureId,
          handler,
          settings: appliedFeature.settings,
        }
      })

    const result = await applyFeaturePipeline(editorImage.originalFile, features)

    let processedUrl: string
    if (result instanceof Blob) {
      processedUrl = URL.createObjectURL(result)
    } else if (typeof result === 'string') {
      processedUrl = result
    } else {
      throw new Error('Invalid result type from feature pipeline')
    }

    return {
      ...processingImage,
      processedUrl,
      status: 'completed',
      preview: processedUrl,
    }
  } catch (error) {
    return {
      ...editorImage,
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'Processing failed',
    }
  }
}
