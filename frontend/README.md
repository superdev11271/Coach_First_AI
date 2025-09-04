# Telegram AI Coaching Assistant

A beautiful, modern web application for managing an AI-powered Telegram coaching assistant. This application provides coaches with a comprehensive dashboard to upload content, view chat logs, export data, and configure bot settings.

## Features

### 🔐 Authentication
- **Sign Up**: Complete registration with personal information (first name, last name, email, Telegram ID)
- **Sign In**: Secure login with email and password
- **Forgot Password**: Password reset functionality
- **Protected Routes**: Only authorized admins can access the main dashboard

### 📊 Dashboard Overview
- **Statistics Cards**: View total users, active chats, documents, and response rates
- **Recent Users**: See recently active users with online/offline status
- **Recent Chats**: Quick overview of latest conversations
- **Quick Actions**: Fast access to main features

### 📁 Content Management
- **File Upload**: Drag & drop support for PDF, Word, and text files
- **Video Links**: Add YouTube, Vimeo, or other video URLs
- **File Management**: View, search, and delete uploaded content
- **Status Tracking**: Monitor file processing status

### 💬 Chat History
- **User Selection**: Choose from list of users
- **Period Filtering**: Filter by today, this week, this month, or all time
- **Telegram-like Interface**: Familiar chat UI with message bubbles
- **Search Functionality**: Find specific users or conversations

### 📤 Data Export
- **Multiple Formats**: Export as CSV, Excel, or JSON
- **Filtered Exports**: Export by type, date range, or specific data
- **Comprehensive Data**: Include uploaded files and chat history
- **Sortable Tables**: Organize data by any column

### ⚙️ Settings & Configuration
- **Profile Management**: Update personal information and Telegram ID
- **Security**: Change password with current password verification
- **Bot Configuration**: Switch between bot mode (AI) and direct mode (manual)
- **Customization**: Set response delays, language, and notifications

## Tech Stack

- **Frontend**: React 18 + JavaScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM

## Prerequisites

- Node.js 16+ 
- npm or yarn
- Supabase account

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd telegram-coaching-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key
   - Create the following table in your database:

   ```sql
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users(id) PRIMARY KEY,
     first_name TEXT,
     last_name TEXT,
     telegram_id TEXT,
     email TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

4. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx      # Dashboard header with search
│   ├── LoadingSpinner.jsx # Loading animation
│   └── Sidebar.jsx     # Navigation sidebar
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication state management
├── pages/              # Page components
│   ├── SignIn.jsx      # Login page
│   ├── SignUp.jsx      # Registration page
│   ├── ForgotPassword.jsx # Password reset
│   └── dashboard/      # Dashboard pages
│       ├── Overview.jsx    # Dashboard overview
│       ├── UploadData.jsx  # File upload management
│       ├── ViewLogs.jsx    # Chat history viewer
│       ├── ExportData.jsx  # Data export tools
│       └── Settings.jsx    # User settings
├── App.jsx             # Main app component
├── main.jsx            # App entry point
└── index.css           # Global styles
```

## Key Features Implementation

### Authentication Flow
- Supabase authentication with email/password
- Protected routes using React Router
- User profile management with custom fields

### File Upload System
- Drag & drop interface using react-dropzone
- File type validation (PDF, DOC, DOCX, TXT)
- Upload progress tracking
- File management with delete functionality

### Chat Interface
- Telegram-like chat bubbles
- User status indicators (online/offline)
- Message timestamps
- Responsive design for mobile and desktop

### Data Export
- Sortable data tables
- Search and filtering capabilities
- Multiple export formats
- Date range selection

## Customization

### Styling
The application uses Tailwind CSS with custom color schemes:
- Primary colors: Blue palette
- Telegram colors: Light blue palette
- Custom animations and transitions

### Components
All components are built with reusability in mind:
- Consistent button styles (primary, secondary, danger)
- Form input components with icons
- Card layouts for content organization
- Responsive grid systems

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
1. Push your code to GitHub
2. Connect your repository to Vercel or Netlify
3. Set environment variables in your deployment platform
4. Deploy automatically on push

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the GitHub repository.

---

**Built with ❤️ using React, Tailwind CSS, and Supabase**

