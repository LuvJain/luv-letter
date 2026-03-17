import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/auth-context'
import AuthLayout from './components/auth-layout'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AuthLayout>
        <App />
      </AuthLayout>
    </AuthProvider>
  </StrictMode>,
)
