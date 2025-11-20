# API v1 Documentation

## Overview

This directory contains versioned API routes for ImageMark. All API endpoints follow a standardized response format and are organized by resource type.

## Structure

```
/api/v1/
├── health/          # Health check endpoint
├── video/           # Video processing endpoints
│   ├── upload/      # Upload video files
│   ├── process/     # Process videos with watermarks
│   ├── progress/    # Check processing progress
│   └── download/    # Download processed videos
└── image/           # Image processing endpoints (future)
```

## Response Format

All API responses follow a standardized format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2025-01-XX...",
    "version": "1.0"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly error message",
    "details": {} // Optional additional details
  },
  "meta": {
    "timestamp": "2025-01-XX...",
    "version": "1.0"
  }
}
```

## Endpoints

### Health Check

**GET** `/api/v1/health`

Returns API health status and version information.

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "timestamp": "2025-01-XX...",
    "uptime": 12345,
    "environment": "production"
  }
}
```

### Video Upload

**POST** `/api/v1/video/upload`

Upload a video file for processing.

**Request:**

- `multipart/form-data`
- Field: `video` (File)

**Response:**

```json
{
  "success": true,
  "data": {
    "filename": "1234567890-video.mp4",
    "originalName": "video.mp4",
    "size": 1024000,
    "type": "video/mp4",
    "uploadPath": "/uploads/1234567890-video.mp4"
  }
}
```

### Video Process

**POST** `/api/v1/video/process`

Process a video with watermark settings.

**Request:**

```json
{
  "filename": "1234567890-video.mp4",
  "watermarkSettings": { ... },
  "processingOptions": { ... }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "outputFilename": "processed-1234567890-video.mp4",
    "downloadUrl": "/api/v1/video/download/processed-1234567890-video.mp4",
    "processingTime": 2000
  }
}
```

### Video Progress

**GET** `/api/v1/video/progress/:jobId`

Check the progress of a video processing job.

**Response:**

```json
{
  "success": true,
  "data": {
    "jobId": "job-123",
    "status": "processing",
    "progress": 50,
    "message": "Processing video..."
  }
}
```

### Video Download

**GET** `/api/v1/video/download/:filename`

Download a processed video file.

**Response:**

- Binary file stream
- Headers: `Content-Type: video/mp4`, `Content-Disposition: attachment`

## Error Codes

- `VALIDATION_ERROR` - Request validation failed
- `FILE_TOO_LARGE` - File exceeds size limit
- `INVALID_FILE_TYPE` - Unsupported file type
- `FILE_READ_ERROR` - Unable to read file
- `FILE_PROCESSING_ERROR` - Error during file processing
- `VIDEO_PROCESSING_ERROR` - Error during video processing
- `NOT_FOUND` - Resource not found
- `INTERNAL_ERROR` - Internal server error

## Migration from Legacy Routes

Legacy routes (`/api/video/*`) are still available for backward compatibility but will be deprecated in a future version. New integrations should use `/api/v1/*` routes.
