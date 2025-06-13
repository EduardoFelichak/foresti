import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import AppLayout from './components/layout/AppLayout'
import ClientListPage from './pages/ClientListPage'
import DashboardPage from './pages/DashboardPage'
import ProjectListPage from './pages/ProjectListPage'

function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return(
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />

          <Route path='/clients' element={<ClientListPage />} />
          <Route path="/projects" element={<ProjectListPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App
