import { NextRequest } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { validateRequest, videoUploadSchema, sanitizeFilename } from '@/lib/validation/schema'
import { validateVideoFile } from '@/utils/validation'
import { handleError, ErrorCodes } from '@/lib/error-handler'
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/response'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('video') as File | null

    if (!file) {
      return validationErrorResponse('No video file provided')
    }

    // Validate using Zod schema
    const validation = await validateRequest(videoUploadSchema, { video: file })
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    // Validate file content (magic bytes)
    const contentValidation = await validateVideoFile(file)
    if (!contentValidation.valid) {
      return validationErrorResponse(contentValidation.error || 'Invalid video file')
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename with sanitization
    const timestamp = Date.now()
    const sanitizedName = sanitizeFilename(file.name)
    const filename = `${timestamp}-${sanitizedName}`
    const filepath = join(uploadsDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Return file info
    return successResponse({
      filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadPath: `/uploads/${filename}`,
    })
  } catch (error) {
    const { error: appError } = handleError(error, ErrorCodes.FILE_PROCESSING_ERROR)
    return errorResponse(appError, appError.statusCode, appError.code)
  }
}
