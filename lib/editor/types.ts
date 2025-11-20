/**
 * Editor Types
 *
 * Type definitions for the editor system that supports
 * applying multiple features to images
 */

import type { Feature } from '@/constants/features'

/**
 * Represents an image in the editor
 */
export interface EditorImage {
  id: string
  originalFile: File
  originalUrl: string
  processedUrl: string | null
  status: 'idle' | 'processing' | 'completed' | 'error'
  errorMessage?: string
  /** Applied features in order */
  appliedFeatures: AppliedFeature[]
  /** Current preview after all features applied */
  preview?: string
}

/**
 * Represents a feature that has been applied to an image
 */
export interface AppliedFeature {
  featureId: string
  featureName: string
  settings: Record<string, any>
  /** Order in which this feature was applied */
  order: number
  /** Result after applying this feature */
  result?: string | Blob
}

/**
 * Feature handler function type
 * Takes an image (File or Blob) and settings, returns processed result
 */
export type FeatureHandler = (
  image: File | Blob | string,
  settings: Record<string, any>
) => Promise<Blob | string>

/**
 * Feature configuration for the editor
 */
export interface EditorFeatureConfig {
  feature: Feature
  /** Component to render for this feature's settings */
  settingsComponent?: React.ComponentType<any>
  /** Handler function to process images with this feature */
  handler?: FeatureHandler
  /** Default settings for this feature */
  defaultSettings?: Record<string, any>
}
