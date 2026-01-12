import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import PastPost from './pages/PastPost'
import LikedPost from './pages/LikedPost'
import GeneratedPost from './pages/GeneratedPost'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/past-post" 
          element={
            <ProtectedRoute>
              <PastPost />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/liked-post" 
          element={
            <ProtectedRoute>
              <LikedPost />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/generated-post" 
          element={
            <ProtectedRoute>
              <GeneratedPost />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  )
}

export default App


