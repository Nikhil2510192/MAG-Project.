import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { userAPI } from '../services/api'

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    try {
      const response = await userAPI.getUserInfo()
      if (response.success) {
        setIsAuthenticated(true)
      }
    } catch (err) {
      // If unauthorized or any error, user is not authenticated
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Render protected component if authenticated
  return children
}

export default ProtectedRoute



