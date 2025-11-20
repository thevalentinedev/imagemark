import { NextRequest } from 'next/server'
import { handleError, ErrorCodes } from '@/lib/error-handler'
import { errorResponse } from '@/lib/api/response'

/**
 * GET /api/v1/image/proxy
 * Proxy endpoint to fetch images from external URLs (e.g., ShortPixel)
 * This avoids CORS issues by fetching on the server side
 *
 * Query params:
 * - url: The URL of the image to fetch
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      const { error } = handleError(
        new Error('Missing required parameter: url'),
        ErrorCodes.VALIDATION_ERROR
      )
      return errorResponse(error, error.statusCode, error.code)
    }

    try {
      const url = new URL(imageUrl)
      if (!url.hostname.includes('shortpixel.com') && !url.hostname.includes('localhost')) {
        const { error } = handleError(
          new Error('Invalid image URL. Only ShortPixel URLs are allowed.'),
          ErrorCodes.VALIDATION_ERROR
        )
        return errorResponse(error, 403, error.code)
      }
    } catch {
      const { error } = handleError(new Error('Invalid URL format'), ErrorCodes.VALIDATION_ERROR)
      return errorResponse(error, 400, error.code)
    }

    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'ImageMark/1.0',
      },
    })

    if (!imageResponse.ok) {
      const { error } = handleError(
        new Error(`Failed to fetch image: ${imageResponse.statusText}`),
        ErrorCodes.IMAGE_PROCESSING_ERROR
      )
      return errorResponse(error, imageResponse.status, error.code)
    }

    const imageBlob = await imageResponse.blob()

    const contentType = imageResponse.headers.get('content-type') || imageBlob.type || 'image/jpeg'

    return new Response(imageBlob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    })
  } catch (error) {
    const { error: appError } = handleError(error, ErrorCodes.IMAGE_PROCESSING_ERROR)
    return errorResponse(appError, appError.statusCode, appError.code)
  }
}
