import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from './ui/Spinner'

// Redirects authenticated users away from login/register pages
const GuestRoute = () => {
  const { user, loading } = useAuth()

  if (loading) return <PageLoader />
  if (user) return <Navigate to="/dashboard" replace />

  return <Outlet />
}

export default GuestRoute
