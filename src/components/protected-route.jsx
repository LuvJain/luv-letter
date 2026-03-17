import { useAuth } from '../hooks/use-auth'
import LoginForm from './login-form'
import PasswordResetForm from './password-reset-form'
import { useState } from 'react'

export default function ProtectedRoute({ children }) {
  const auth = useAuth()
  const [authView, setAuthView] = useState('login') // 'login' | 'reset'

  if (!auth.isAuthenticated) {
    if (authView === 'reset') {
      return (
        <PasswordResetForm
          onSwitchToLogin={() => setAuthView('login')}
        />
      )
    }
    return (
      <LoginForm
        onSwitchToReset={() => setAuthView('reset')}
      />
    )
  }

  return children
}
