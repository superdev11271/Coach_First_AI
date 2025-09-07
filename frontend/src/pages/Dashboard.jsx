import { Routes, Route } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Overview from './dashboard/Overview'
import UploadData from './dashboard/UploadData'
import ViewLogs from './dashboard/ViewLogs'
import FlaggedAnswers from './dashboard/FlaggedAnswers'
import ProcessFlaggedAnswer from './dashboard/ProcessFlaggedAnswer'
import ExportData from './dashboard/ExportData'
import Settings from './dashboard/Settings'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/upload" element={<UploadData />} />
            <Route path="/logs" element={<ViewLogs />} />
            <Route path="/flagged" element={<FlaggedAnswers />} />
            <Route path="/flagged/:id" element={<ProcessFlaggedAnswer />} />
            <Route path="/export" element={<ExportData />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

