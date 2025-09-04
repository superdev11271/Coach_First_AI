# Video Links Functionality

This document describes the new video links functionality that has been added to the application.

## Overview

The video links feature allows users to add video URLs (YouTube, Vimeo, etc.) to their coaching materials. Each video link is processed through RAG (Retrieval-Augmented Generation) and has a status that tracks its processing state.

## Features

- **Add Video Links**: Users can add video URLs through a simple input form
- **Status Tracking**: Each video link has a status (pending, processing, processed, failed)
- **RAG Processing**: Video links are automatically sent to the Flask backend for processing
- **Database Storage**: Video links are stored in a dedicated `videolinks` table in Supabase
- **Export Support**: Video links are included in the export functionality

## Database Schema

The `videolinks` table has the following structure:

```sql
CREATE TABLE videolinks (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Fields

- `id`: Unique identifier (auto-increment)
- `url`: The video URL (YouTube, Vimeo, etc.)
- `status`: Processing status (pending, processing, processed, failed)
- `created_at`: Timestamp when the link was added

## Status Values

- **pending**: Link has been added but not yet processed
- **processing**: Link is currently being processed by RAG
- **processed**: Link has been successfully processed
- **failed**: Processing failed for this link

## Setup Instructions

### 1. Create the Database Table

Run the SQL script in `supabase_migrations.sql` in your Supabase SQL editor:

```sql
-- Create videolinks table
CREATE TABLE IF NOT EXISTS videolinks (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videolinks_status ON videolinks(status);
CREATE INDEX IF NOT EXISTS idx_videolinks_created_at ON videolinks(created_at);
```

### 2. Flask Backend Endpoint

Ensure your Flask backend has a `/process-video-link` endpoint that accepts:

```json
{
  "video_url": "https://youtube.com/watch?v=abc123",
  "user_id": "user-uuid",
  "video_link_id": 123
}
```

The endpoint should return:

```json
{
  "status": true,
  "message": "Video link sent for processing"
}
```

### 3. Environment Variables

Make sure your Flask backend URL is set in your environment:

```env
VITE_FLASK_BACKEND_URL=http://localhost:5000
```

## Usage

### Adding Video Links

1. Navigate to the Upload Data page
2. Scroll to the "Add Video Links" section
3. Enter a video URL (YouTube, Vimeo, etc.)
4. Click "Add Link"
5. The link will be saved to the database and sent for RAG processing

### Viewing Video Links

- Video links are displayed in the Upload Data page with their current status
- Each link shows the URL, added date, and processing status
- Links can be refreshed to see updated statuses
- Links can be deleted if needed

### Exporting Video Links

- Video links are included in the Export Data page
- They can be exported individually or as part of all data
- The export includes URL, status, and added date

## API Endpoints

### Frontend to Backend

- `POST /process-video-link` - Send video link for RAG processing

### Database Operations

- `INSERT` - Add new video link
- `SELECT` - Fetch video links for display
- `UPDATE` - Update link status
- `DELETE` - Remove video link

## Error Handling

- Database errors are logged and displayed to users
- Network errors when calling the Flask backend are handled gracefully
- Failed processing attempts are marked with 'failed' status
- Users can manually mark links as processed for testing

## Testing

### Manual Status Updates

For testing purposes, you can manually mark video links as processed:

1. Add a video link (it will start with 'pending' status)
2. The link will be sent to the Flask backend
3. Click the checkmark icon on processing links to mark them as processed
4. The status will update in the database and UI

### Database Verification

Check the `videolinks` table in Supabase to verify:

- Links are being saved correctly
- Status updates are working
- Timestamps are being set properly

## Future Enhancements

- **User Association**: Link video links to specific users
- **Processing History**: Track processing attempts and errors
- **Batch Processing**: Process multiple video links simultaneously
- **Video Metadata**: Extract and store video titles, descriptions, etc.
- **Processing Queue**: Implement a proper job queue for video processing

## Troubleshooting

### Common Issues

1. **Table not found**: Ensure the `videolinks` table exists in Supabase
2. **RAG processing fails**: Check Flask backend logs and endpoint availability
3. **Status not updating**: Verify database permissions and connection
4. **Links not saving**: Check Supabase connection and table structure

### Debug Steps

1. Check browser console for JavaScript errors
2. Verify Supabase connection in the browser
3. Check Flask backend logs for processing errors
4. Verify database table structure and permissions
5. Test database operations directly in Supabase

## Support

If you encounter issues with the video links functionality:

1. Check the browser console for error messages
2. Verify your Supabase configuration
3. Ensure the Flask backend is running and accessible
4. Check the database table structure matches the expected schema
