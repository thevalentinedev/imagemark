import { NextRequest } from 'next/server'
import { getJobProgress } from '@/lib/jobs/progress'
import { validatePathParams, videoProgressSchema } from '@/lib/validation/schema'
import { handleError, ErrorCodes } from '@/lib/error-handler'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
} from '@/lib/api/response'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params

    // Validate path parameters
    const validation = validatePathParams(videoProgressSchema, { jobId })
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    const job = getJobProgress(validation.data.jobId)

    if (!job) {
      return notFoundResponse('Job')
    }

    return successResponse(job)
  } catch (error) {
    const { error: appError } = handleError(error, ErrorCodes.API_ERROR)
    return errorResponse(appError, appError.statusCode, appError.code)
  }
}
