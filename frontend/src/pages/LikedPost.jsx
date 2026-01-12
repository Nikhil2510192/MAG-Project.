import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authAPI, postAPI, userAPI } from '../services/api'

function LikedPost() {
  const navigate = useNavigate()
  const location = useLocation()
  const formId = location.state?.formId
  const pastPostId = location.state?.pastPostId

  const [userInfo, setUserInfo] = useState({ name: '', email: '' })
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [likedPost, setLikedPost] = useState('')

  useEffect(() => {
    // Check if formId and pastPostId exist, if not redirect back to home
    if (!formId || !pastPostId) {
      navigate('/home')
      return
    }

    // Fetch user info on component mount
    fetchUserInfo()
    
    // Load liked post from localStorage
    const savedLikedPost = localStorage.getItem('likedPostData')
    if (savedLikedPost) {
      setLikedPost(savedLikedPost)
    }
  }, [formId, pastPostId, navigate])

  const fetchUserInfo = async () => {
    try {
      const response = await userAPI.getUserInfo()
      if (response.success) {
        setUserInfo(response.data)
      }
    } catch (err) {
      console.error('Error fetching user info:', err)
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        navigate('/login')
      }
    }
  }

  const handleChange = (e) => {
    const value = e.target.value
    setLikedPost(value)
    // Save to localStorage
    localStorage.setItem('likedPostData', value)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!likedPost.trim()) {
      setError('Please paste a LinkedIn post you liked')
      setLoading(false)
      return
    }

    try {
      const response = await postAPI.saveLikedPost({
        formId,
        likedPost: likedPost.trim()
      })
      
      if (response.success) {
        // Don't clear localStorage here - keep it for back navigation
        // It will be cleared after saving the generated post
        
        // Navigate to generated post page with formId, pastPostId, and likedPostId
        navigate('/generated-post', { 
          state: { 
            formId, 
            pastPostId, 
            likedPostId: response.data._id 
          } 
        })
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Failed to save liked post. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authAPI.logout()
      navigate('/')
    } catch (err) {
      console.error('Logout error:', err)
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Top Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Website Name */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-indigo-600">
                LinkedIn Post Generator
              </h1>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium transition-colors"
              >
                <span>{userInfo.name || 'User'}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">{userInfo.name}</p>
                    <p className="text-sm text-gray-500 truncate">{userInfo.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Page Title */}
          <div className="mb-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Post You Liked
            </h2>
          </div>

          {/* Page Subtitle */}
          <div className="mb-6">
            <p className="text-lg text-gray-600">
              Share a post you enjoyed — we'll learn from its structure.
            </p>
          </div>

          {/* Section Heading */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              🔹 A Post You Liked or Admired
            </h3>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Field Label and Textarea */}
            <div>
              <label htmlFor="likedPost" className="block text-sm font-medium text-gray-700 mb-2">
                Paste a LinkedIn post you liked
              </label>
              <textarea
                id="likedPost"
                name="likedPost"
                rows="12"
                required
                value={likedPost}
                onChange={handleChange}
                placeholder="Paste a LinkedIn post you enjoyed reading…"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Helper Description */}
            <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded">
              <p className="text-sm text-indigo-700">
                We'll use this post for inspiration — focusing on structure and flow
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Generate Post'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  )
}

export default LikedPost


