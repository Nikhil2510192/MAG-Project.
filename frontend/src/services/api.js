import axios from 'axios'

const API_URL = '/api'

// Create axios instance with credentials for cookie handling
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/register', userData)
    return response.data
  },

  login: async (email, password) => {
    const response = await api.post('/login', { email, password })
    return response.data
  },

  logout: async () => {
    const response = await api.post('/logout')
    return response.data
  },
}

export const userAPI = {
  getUserInfo: async () => {
    const response = await api.get('/userInfo')
    return response.data
  },
}

export const formAPI = {
  saveForm: async (formData) => {
    const response = await api.post('/save-form', formData)
    return response.data
  },
}

export const postAPI = {
  savePastPost: async (data) => {
    const response = await api.post('/past-posts', data)
    return response.data
  },
  saveLikedPost: async (data) => {
    const response = await api.post('/liked-posts', data)
    return response.data
  },
  generatePost: async (data) => {
    const response = await api.post('/generate-linkedin-post', data)
    return response.data
  },
  saveGenPost: async (data) => {
    const response = await api.post('/generate-post', data)
    return response.data
  },
}

export default api


