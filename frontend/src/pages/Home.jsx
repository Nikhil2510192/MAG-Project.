import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI, formAPI, userAPI } from '../services/api'

function Home() {
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState({ name: '', email: '' })
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  
  const [formData, setFormData] = useState({
    role: '',
    updatetype: '',
    content: '',
    challenges: '',
    tag: '',
    links: '',
    CTA: '',
    hashtags: '',
    other: '',
  })

  const [roleOther, setRoleOther] = useState('')
  const [updateTypeOther, setUpdateTypeOther] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedUpdateType, setSelectedUpdateType] = useState('')

  const roleOptions = [
    'Software Engineer',
    'Full Stack Developer',
    'Mobile App Developer',
    'DevOps Engineer',
    'Data Engineer',
    'Data Scientist',
    'Machine Learning Engineer',
    'AI Engineer',
    'Cloud Engineer',
    'Cybersecurity Engineer',
    'Product Manager',
    'Technical Product Manager',
    'Product Designer',
    'Business Analyst',
    'Entrepreneur',
    'Engineering Student',
    'Computer Science Student',
    'Intern / Trainee',
    'Tech Lead',
    'Engineering Manager',
    'CTO',
    'Architect',
    'Freelancer',
    'Other'
  ]

  const updateTypeOptions = [
    'Project Update',
    'New Project Launch',
    'Personal Project',
    'Open Source Contribution',
    'Learning / Skill Update',
    'Certification / Course Completion',
    'Hackathon / Competition',
    'Internship Experience',
    'Career Milestone',
    'New Job / Promotion',
    'Career Transition',
    'Job Search Update',
    'Startup / Founder Update',
    'Product Announcement',
    'Feature Release',
    'Community / Networking',
    'Event Participation',
    'Conference / Meetup',
    'General Announcement',
    'Other'
  ]

  useEffect(() => {
    // Fetch user info on component mount
    fetchUserInfo()
    
    // Load form data from localStorage
    const savedFormData = localStorage.getItem('homeFormData')
    const savedRoleOther = localStorage.getItem('homeRoleOther')
    const savedUpdateTypeOther = localStorage.getItem('homeUpdateTypeOther')
    const savedSelectedRole = localStorage.getItem('homeSelectedRole')
    const savedSelectedUpdateType = localStorage.getItem('homeSelectedUpdateType')
    
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData))
    }
    if (savedRoleOther) {
      setRoleOther(savedRoleOther)
    }
    if (savedUpdateTypeOther) {
      setUpdateTypeOther(savedUpdateTypeOther)
    }
    if (savedSelectedRole) {
      setSelectedRole(savedSelectedRole)
    }
    if (savedSelectedUpdateType) {
      setSelectedUpdateType(savedSelectedUpdateType)
    }
  }, [])

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
    } finally {
      setIsLoadingUser(false)
    }
  }

  const handleChange = (e) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value,
    }
    setFormData(newFormData)
    // Save to localStorage
    localStorage.setItem('homeFormData', JSON.stringify(newFormData))
    setError('')
  }

  const handleRoleChange = (e) => {
    const value = e.target.value
    setSelectedRole(value)
    localStorage.setItem('homeSelectedRole', value)
    
    const newFormData = value === 'Other' 
      ? { ...formData, role: roleOther || '' }
      : { ...formData, role: value }
    
    setFormData(newFormData)
    localStorage.setItem('homeFormData', JSON.stringify(newFormData))
    
    if (value !== 'Other') {
      setRoleOther('')
      localStorage.removeItem('homeRoleOther')
    }
    setError('')
  }

  const handleUpdateTypeChange = (e) => {
    const value = e.target.value
    setSelectedUpdateType(value)
    localStorage.setItem('homeSelectedUpdateType', value)
    
    const newFormData = value === 'Other'
      ? { ...formData, updatetype: updateTypeOther || '' }
      : { ...formData, updatetype: value }
    
    setFormData(newFormData)
    localStorage.setItem('homeFormData', JSON.stringify(newFormData))
    
    if (value !== 'Other') {
      setUpdateTypeOther('')
      localStorage.removeItem('homeUpdateTypeOther')
    }
    setError('')
  }

  const handleRoleOtherChange = (e) => {
    const value = e.target.value
    setRoleOther(value)
    localStorage.setItem('homeRoleOther', value)
    
    const newFormData = { ...formData, role: value }
    setFormData(newFormData)
    localStorage.setItem('homeFormData', JSON.stringify(newFormData))
    setError('')
  }

  const handleUpdateTypeOtherChange = (e) => {
    const value = e.target.value
    setUpdateTypeOther(value)
    localStorage.setItem('homeUpdateTypeOther', value)
    
    const newFormData = { ...formData, updatetype: value }
    setFormData(newFormData)
    localStorage.setItem('homeFormData', JSON.stringify(newFormData))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // Ensure we use the correct values if "Other" is selected
    const submitData = {
      ...formData,
      role: selectedRole === 'Other' ? roleOther : formData.role,
      updatetype: selectedUpdateType === 'Other' ? updateTypeOther : formData.updatetype,
    }

    // Validate that role and updatetype are not empty
    if (!submitData.role || !submitData.updatetype) {
      setError('Please select or enter your role and update type')
      setLoading(false)
      return
    }

    try {
      const response = await formAPI.saveForm(submitData)
      if (response.success) {
        // Don't clear localStorage here - keep it for back navigation
        // It will be cleared after saving the generated post
        
        // Navigate to past-post page with formId
        navigate('/past-post', { 
          state: { formId: response.data._id } 
        })
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Failed to save form. Please try again.'
      )
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authAPI.logout()
      navigate('/')
    } catch (err) {
      console.error('Logout error:', err)
      // Navigate anyway
      navigate('/')
    }
  }

  // Show loading state while fetching user info
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
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
            Create Your Post
          </h2>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                1️⃣ Your Professional Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                required
                value={selectedRole}
                onChange={handleRoleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select your role</option>
                {roleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {selectedRole === 'Other' && (
                <input
                  type="text"
                  value={roleOther}
                  onChange={handleRoleOtherChange}
                  placeholder="Enter your role"
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              )}
            </div>

            {/* 2. Update Type */}
            <div>
              <label htmlFor="updatetype" className="block text-sm font-medium text-gray-700 mb-2">
                2️⃣ What kind of update is this? <span className="text-red-500">*</span>
              </label>
              <select
                id="updatetype"
                name="updatetype"
                required
                value={selectedUpdateType}
                onChange={handleUpdateTypeChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select update type</option>
                {updateTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {selectedUpdateType === 'Other' && (
                <input
                  type="text"
                  value={updateTypeOther}
                  onChange={handleUpdateTypeOtherChange}
                  placeholder="Enter your update type"
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              )}
            </div>

            {/* 3. Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                3️⃣ Main Topic or Idea <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows="4"
                value={formData.content}
                onChange={handleChange}
                placeholder="e.g. The core message you want to communicate in this post."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* 4. Challenges */}
            <div>
              <label htmlFor="challenges" className="block text-sm font-medium text-gray-700 mb-2">
                4️⃣ Challenges Faced <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                id="challenges"
                name="challenges"
                rows="3"
                value={formData.challenges}
                onChange={handleChange}
                placeholder="e.g. Handling scalability, rate limits, or system design"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* 5. Tag */}
            <div>
              <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-2">
                5️⃣ People or Companies to Mention <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                id="tag"
                name="tag"
                type="text"
                value={formData.tag}
                onChange={handleChange}
                placeholder="e.g. @OpenAI, @MongoDB, @MyMentor"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* 6. Links */}
            <div>
              <label htmlFor="links" className="block text-sm font-medium text-gray-700 mb-2">
                6️⃣ Relevant Links <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                id="links"
                name="links"
                type="text"
                value={formData.links}
                onChange={handleChange}
                placeholder="e.g. GitHub repo, live demo, blog link"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* 7. CTA */}
            <div>
              <label htmlFor="CTA" className="block text-sm font-medium text-gray-700 mb-2">
                7️⃣ Call To Action <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                id="CTA"
                name="CTA"
                type="text"
                value={formData.CTA}
                onChange={handleChange}
                placeholder="e.g. Share your thoughts, Feedback welcome, Let's connect"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* 8. Hashtags */}
            <div>
              <label htmlFor="hashtags" className="block text-sm font-medium text-gray-700 mb-2">
                8️⃣ Hashtags <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                id="hashtags"
                name="hashtags"
                type="text"
                value={formData.hashtags}
                onChange={handleChange}
                placeholder="e.g. #webdevelopment #ai #career"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* 9. Other Context */}
            <div>
              <label htmlFor="other" className="block text-sm font-medium text-gray-700 mb-2">
                9️⃣ Additional Context <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                id="other"
                name="other"
                rows="3"
                value={formData.other}
                onChange={handleChange}
                placeholder="Anything else you want the AI to know"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Next'}
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

export default Home

