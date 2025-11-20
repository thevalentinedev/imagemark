/**
 * Standardized API response utilities
 * Provides consistent response format across all API endpoints
 */

import { NextResponse } from 'next/server'
import { AppError, ErrorCodes } from '@/lib/error-handler'

/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    timestamp: string
    requestId?: string
    version?: string
  }
}

/**
 * Success response builder
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  meta?: ApiResponse<T>['meta']
): NextResponse<ApiResponse<T>> {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        ...meta,
      },
    },
    { status }
  )
}

/**
 * Error response builder
 */
export function errorResponse(
  error: Error | AppError | string,
  status: number = 500,
  code?: string,
  details?: unknown
): NextResponse<ApiResponse> {
  let errorCode = code || ErrorCodes.INTERNAL_ERROR
  let errorMessage: string
  let errorDetails: unknown = details

  if (error instanceof AppError) {
    errorCode = error.code
    errorMessage = error.getUserMessage()
    errorDetails = details
  } else if (error instanceof Error) {
    errorMessage = error.message
  } else {
    errorMessage = error
  }

  const errorObj: ApiResponse['error'] = {
    code: errorCode,
    message: errorMessage,
  }

  if (errorDetails) {
    errorObj.details = errorDetails
  }

  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error: errorObj,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
      },
    },
    { status }
  )
}

/**
 * Validation error response builder
 */
export function validationErrorResponse(
  error: string | string[],
  details?: unknown
): NextResponse<ApiResponse> {
  const errorMessage = Array.isArray(error) ? error.join(', ') : error

  return errorResponse(errorMessage, 400, ErrorCodes.VALIDATION_ERROR, details)
}

/**
 * Not found response builder
 */
export function notFoundResponse(resource: string = 'Resource'): NextResponse<ApiResponse> {
  return errorResponse(`${resource} not found`, 404, ErrorCodes.NOT_FOUND)
}

/**
 * Unauthorized response builder
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse<ApiResponse> {
  return errorResponse(message, 401, ErrorCodes.UNAUTHORIZED)
}

/**
 * Forbidden response builder
 */
export function forbiddenResponse(message: string = 'Forbidden'): NextResponse<ApiResponse> {
  return errorResponse(message, 403, ErrorCodes.FORBIDDEN)
}

/**
 * Rate limit exceeded response builder
 */
export function rateLimitResponse(
  message: string = 'Rate limit exceeded',
  retryAfter?: number
): NextResponse<ApiResponse> {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error: {
        code: ErrorCodes.RATE_LIMIT_EXCEEDED,
        message,
        ...(retryAfter && { details: { retryAfter } }),
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
      },
    },
    {
      status: 429,
      headers: retryAfter ? { 'Retry-After': retryAfter.toString() } : undefined,
    }
  )
}

/**
 * File response builder (for file downloads)
 */
export function fileResponse(
  file: Buffer | Blob | ArrayBuffer,
  filename: string,
  contentType: string = 'application/octet-stream'
): NextResponse {
  const headers = new Headers()
  headers.set('Content-Type', contentType)
  headers.set('Content-Disposition', `attachment; filename="${filename}"`)
  headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')

  // Convert Buffer to ArrayBuffer for NextResponse
  let body: BodyInit
  if (Buffer.isBuffer(file)) {
    // Convert Buffer to ArrayBuffer
    body = new Uint8Array(file).buffer
    headers.set('Content-Length', file.length.toString())
  } else if (file instanceof Blob) {
    body = file
  } else {
    body = file
  }

  return new NextResponse(body, {
    status: 200,
    headers,
  })
}

/**
 * Paginated response builder
 */
export interface PaginatedData<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export function paginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number,
  meta?: ApiResponse<PaginatedData<T>>['meta']
): NextResponse<ApiResponse<PaginatedData<T>>> {
  const totalPages = Math.ceil(total / limit)

  return successResponse<PaginatedData<T>>(
    {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
    200,
    meta
  )
}
