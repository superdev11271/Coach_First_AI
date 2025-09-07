# Flagged Answers Functionality

This document describes the new flagged answers functionality that has been added to the application.

## Overview

The flagged answers feature allows administrators to review and process answers that have been flagged for review. This is useful for quality control, content moderation, and ensuring the AI responses meet the required standards.

## Features

- **View Flagged Answers**: Display all flagged answers in a table format
- **Status Filtering**: Filter by status (Not Processed, Processed, Rejected, All)
- **Search Functionality**: Search through questions and answers
- **Pagination**: Handle large numbers of flagged answers efficiently
- **Status Management**: Mark answers as processed or rejected
- **Detailed Processing Page**: Dedicated page for reviewing and managing flagged answers
- **Document Management**: Add, edit, and remove related documents
- **Real-time Updates**: Refresh data and see status changes immediately

## Database Schema

### Flagged Answers Table

The `flagged_answers` table has the following structure:

```sql
CREATE TABLE flagged_answers (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  status TEXT DEFAULT 'not_processed',
  document_ids BIGINT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Documents Table

The `documents` table stores related document content:

```sql
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Database Function

A custom function retrieves flagged answers with their associated documents:

```sql
CREATE OR REPLACE FUNCTION get_flagged_answer(flagged_id bigint)
RETURNS jsonb
LANGUAGE sql
AS $$
  SELECT jsonb_build_object(
    'id', fa.id,
    'question', fa.question,
    'answer', fa.answer,
    'status', fa.status,
    'created_at', fa.created_at,
    'documents', COALESCE(
        json_agg(
          jsonb_build_object(
            'id', d.id,
            'content', d.content
          )
        ) FILTER (WHERE d.id IS NOT NULL), '[]'::json
    )
  )
  FROM flagged_answers fa
  LEFT JOIN LATERAL unnest(fa.document_ids) AS doc_id ON true
  LEFT JOIN documents d ON d.id = doc_id
  WHERE fa.id = flagged_id
  GROUP BY fa.id, fa.question, fa.answer, fa.status, fa.created_at;
$$;
```

### Fields

**Flagged Answers:**
- `id`: Unique identifier (auto-increment)
- `question`: The original question that was asked
- `answer`: The AI-generated answer that was flagged
- `status`: Processing status (not_processed, processed, rejected)
- `document_ids`: Array of document IDs related to this flagged answer
- `created_at`: Timestamp when the answer was flagged

**Documents:**
- `id`: Unique identifier (auto-increment)
- `content`: The document content text
- `created_at`: Timestamp when the document was created

## Status Values

- **not_processed**: Answer has been flagged but not yet reviewed
- **processed**: Answer has been reviewed and approved
- **rejected**: Answer has been reviewed and rejected

## Setup Instructions

### 1. Create the Database Table

Run the SQL script in `supabase_migrations.sql` in your Supabase SQL editor:

```sql
-- Create flagged_answers table
CREATE TABLE IF NOT EXISTS flagged_answers (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  status TEXT DEFAULT 'not_processed',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_flagged_answers_status ON flagged_answers(status);
CREATE INDEX IF NOT EXISTS idx_flagged_answers_created_at ON flagged_answers(created_at);
```

### 2. Navigation

The flagged answers page is accessible through the sidebar navigation:
- Navigate to "Flagged Answers" in the sidebar
- URL: `/dashboard/flagged`

## Usage

### Viewing Flagged Answers

1. Navigate to the Flagged Answers page
2. View all flagged answers in the table
3. Use the search bar to find specific questions or answers
4. Use the status filter to show only specific statuses
5. Use pagination to navigate through large lists

### Processing Flagged Answers

1. Click the eye icon to navigate to the processing page
2. Review the complete question and answer
3. Manage related documents:
   - **Add Document**: Click "Add Document" to add new content
   - **Edit Document**: Click the edit icon to modify document content
   - **Remove Document**: Click the trash icon to delete a document
4. Choose one of the following actions:
   - **Mark as Processed**: Approve the answer
   - **Mark as Rejected**: Reject the answer
5. The status will be updated immediately

### Filtering and Search

- **Status Filter**: Select from "All Status", "Not Processed", "Processed", or "Rejected"
- **Search**: Type in the search box to find specific questions or answers
- **Combined Filtering**: Both filters work together for precise results

## UI Components

### Main Table
- **Question Column**: Shows truncated question text
- **Answer Column**: Shows truncated answer text
- **Status Column**: Shows status with colored badge and icon
- **Created At Column**: Shows when the answer was flagged
- **Actions Column**: Contains action buttons

### Status Badges
- **Not Processed**: Yellow badge with clock icon
- **Processed**: Green badge with checkmark icon
- **Rejected**: Red badge with X icon

### Action Buttons
- **View Details** (Eye icon): Navigates to processing page
- **Mark as Processed** (Checkmark icon): Only visible for not_processed items
- **Mark as Rejected** (X icon): Only visible for not_processed items

### Processing Page
- **Full Question**: Complete question text in a gray box
- **Full Answer**: Complete answer text with line breaks preserved
- **Document Management**: Add, edit, and remove related documents
- **Status Information**: Current status and creation date
- **Action Buttons**: Process or reject the answer
- **Navigation**: Back button to return to flagged answers list

## API Integration

### Database Operations

- `SELECT`: Fetch flagged answers with ordering and filtering
- `UPDATE`: Update answer status and document_ids array
- `INSERT`: Add new flagged answers and documents
- `DELETE`: Remove documents
- `RPC`: Call custom function `get_flagged_answer()` to fetch with documents

### Error Handling

- Database errors are logged and displayed to users
- Network errors are handled gracefully
- User feedback through toast notifications

## Future Enhancements

- **Bulk Actions**: Select multiple answers for batch processing
- **Export Functionality**: Export flagged answers to CSV/Excel
- **Advanced Filtering**: Filter by date range, user, etc.
- **Comments**: Add review comments to flagged answers
- **Document Templates**: Pre-defined document templates for common scenarios
- **Document Categories**: Categorize documents by type or purpose
- **Version History**: Track changes to documents over time
- **Automated Flagging**: AI system integration for automatic flagging
- **Notification System**: Alert administrators of new flagged answers
- **Analytics**: Track flagging patterns and trends

## Testing

### Manual Testing

1. **Add Test Data**: Insert sample flagged answers into the database
2. **Test Filtering**: Verify status and search filters work correctly
3. **Test Actions**: Confirm status updates work properly
4. **Test Pagination**: Verify pagination works with large datasets
5. **Test Modal**: Ensure detail modal displays correctly

### Database Verification

Check the `flagged_answers` table in Supabase to verify:
- Data is being fetched correctly
- Status updates are working
- Timestamps are being set properly

## Troubleshooting

### Common Issues

1. **Table not found**: Ensure the `flagged_answers` table exists in Supabase
2. **No data showing**: Check if there are any flagged answers in the database
3. **Status not updating**: Verify database permissions and connection
4. **Modal not opening**: Check for JavaScript errors in browser console

### Debug Steps

1. Check browser console for JavaScript errors
2. Verify Supabase connection in the browser
3. Check database table structure and permissions
4. Test database operations directly in Supabase
5. Verify the route is properly configured

## Security Considerations

- **Access Control**: Ensure only authorized users can access flagged answers
- **Data Privacy**: Flagged answers may contain sensitive information
- **Audit Trail**: Consider logging all status changes for compliance
- **Row Level Security**: Implement RLS policies if needed

## Support

If you encounter issues with the flagged answers functionality:

1. Check the browser console for error messages
2. Verify your Supabase configuration
3. Ensure the database table exists and has proper permissions
4. Check the network tab for failed API requests
5. Verify the route configuration in the Dashboard component
