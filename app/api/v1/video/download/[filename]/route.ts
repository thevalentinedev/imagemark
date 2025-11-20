import { NextRequest } from 'next/server'
import { join } from 'path'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { validatePathParams, videoDownloadSchema } from '@/lib/validation/schema'
import { handleError, ErrorCodes } from '@/lib/error-handler'
import {
  fileResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
} from '@/lib/api/response'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params

    // Validate path parameters
    const validation = validatePathParams(videoDownloadSchema, { filename })
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    const sanitizedFilename = validation.data.filename

    const filepath = join(process.cwd(), 'uploads', sanitizedFilename)

    if (!existsSync(filepath)) {
      return notFoundResponse('File')
    }

    const fileBuffer = await readFile(filepath)

    // Return file with appropriate headers
    return fileResponse(fileBuffer, sanitizedFilename, 'video/mp4')
  } catch (error) {
    const { error: appError } = handleError(error, ErrorCodes.FILE_READ_ERROR)
    return errorResponse(appError, appError.statusCode, appError.code)
  }
}
