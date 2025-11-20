/**
 * Format Conversion Client
 *
 * Lightweight wrapper for image format conversion operations.
 * Only loads conversion-specific code.
 */

import { getShortPixelClient } from '../lazy-client'
import type { OptimizeResult } from '../types'

/**
 * Convert an image to a different format
 *
 * @param image - Image file, blob, or URL
 * @param targetFormat - Target format (jpeg, png, webp, avif, gif)
 * @param compression - Compression mode: 'lossless' (default) or 'lossy'
 * @returns Conversion result with optimized image
 *
 * @example
 * ```ts
 * const result = await convertImage(file, 'webp', 'lossless')
 * ```
 */
export async function convertImage(
  image: File | Blob | string,
  targetFormat: string,
  compression: 'lossless' | 'lossy' = 'lossless'
): Promise<OptimizeResult> {
  const client = getShortPixelClient()
  return client.convert(image, targetFormat, compression)
}
