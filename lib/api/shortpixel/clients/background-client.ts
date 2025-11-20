/**
 * Background Removal Client
 *
 * Lightweight wrapper for background removal operations.
 * Only loads background removal-specific code.
 */

import { getShortPixelClient } from '../lazy-client'
import type { OptimizeResult } from '../types'

/**
 * Remove background from an image using AI
 *
 * @param image - Image file, blob, or URL
 * @param backgroundColor - Optional: 'transparent' (default), color code '#rrggbbxx', or image URL
 * @param compression - Compression mode: 'lossless' (default) or 'lossy'
 * @returns Processed image with background removed
 *
 * @example
 * ```ts
 * const result = await removeBackground(file, 'transparent', 'lossless')
 * ```
 */
export async function removeBackground(
  image: File | Blob | string,
  backgroundColor: 'transparent' | string = 'transparent',
  compression: 'lossless' | 'lossy' = 'lossless'
): Promise<OptimizeResult> {
  const client = getShortPixelClient()
  return client.removeBackground(image, backgroundColor, compression)
}
