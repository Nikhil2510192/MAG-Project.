import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authAPI, postAPI, userAPI } from '../services/api'

function GeneratedPost() {
  const navigate = useNavigate()
  const location = useLocation()
  const { formId, pastPostId, likedPostId } = location.state || {}

  const [userInfo, setUserInfo] = useState({ name: '', email: '' })
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [generatedPost, setGeneratedPost] = useState('')
  const [liked, setLiked] = useState(null) // null, true (thumbs up), false (thumbs down)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    // Check if required IDs exist, if not redirect back to home
    if (!formId || !pastPostId || !likedPostId) {
      navigate('/home')
      return
    }

    // Fetch user info and generate post
    fetchUserInfo()
    generatePost()
  }, [formId, pastPostId, likedPostId, navigate])

  const fetchUserInfo = async () => {
    try {
      const response = await userAPI.getUserInfo()
      if (response.success) {
        setUserInfo(response.data)
      }
    } catch (err) {
      console.error('Error fetching user info:', err)
      if (err.response?.status === 401) {
        navigate('/login')
      }
    }
  }

  const generatePost = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await postAPI.generatePost({
        formId,
        pastPostId,
        likedPostId
      })
      
      if (response.success) {
        setGeneratedPost(response.generatedPost)
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Failed to generate post. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (liked === null) {
      setError('Please indicate whether you liked the post or not')
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await postAPI.saveGenPost({
        formId,
        genPost: generatedPost,
        liked,
        feedback: feedback.trim() || ''
      })
      
      if (response.success) {
        // Clear all localStorage after successful save (entire flow complete)
        localStorage.removeItem('homeFormData')
        localStorage.removeItem('homeRoleOther')
        localStorage.removeItem('homeUpdateTypeOther')
        localStorage.removeItem('homeSelectedRole')
        localStorage.removeItem('homeSelectedUpdateType')
        localStorage.removeItem('pastPostData')
        localStorage.removeItem('likedPostData')
        
        // Navigate back to home with success message
        navigate('/home', { 
          state: { message: 'Post saved successfully!' } 
        })
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Failed to save post. Please try again.'
      )
    } finally {
      setSaving(false)
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Your Generated LinkedIn Post
          </h2>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Generating your post...</p>
            </div>
          ) : (
            <>
              {/* Generated Post Display */}
              <div className="mb-8">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 min-h-[200px]">
                  <pre className="whitespace-pre-wrap text-gray-800 font-sans text-base leading-relaxed">
                    {generatedPost}
                  </pre>
                </div>
              </div>

              {/* Thumbs Up/Down */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Did you like this post?
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setLiked(true)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg border-2 transition-colors ${
                      liked === true
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-green-400'
                    }`}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span className="font-medium">Like</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLiked(false)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg border-2 transition-colors ${
                      liked === false
                        ? 'bg-red-50 border-red-500 text-red-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-red-400'
                    }`}
                  >
                    <svg
                      className="w-6 h-6 transform rotate-180"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span className="font-medium">Dislike</span>
                  </button>
                </div>
              </div>

              {/* Feedback Field */}
              <div className="mb-6">
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback (Optional)
                </label>
                <textarea
                  id="feedback"
                  name="feedback"
                  rows="4"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your thoughts about this post..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Save Button */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>

              {/* Caption */}
              <p className="text-sm text-gray-500 text-center italic">
                Saving this post and your feedback helps us learn your preferences and improve future generations.
              </p>
            </>
          )}
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

export default GeneratedPost

