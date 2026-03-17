import { useState } from 'react'
import { useAuth } from '../hooks/use-auth'
import LoginForm from './login-form'
import PasswordResetForm from './password-reset-form'

export default function AuthLayout({ children }) {
  const auth = useAuth()
  const [authView, setAuthView] = useState('login') // 'login' | 'reset'

  // Allow public subscribe links to bypass auth
  const params = new URLSearchParams(window.location.search)
  if (params.get('subscribe') === 'true') {
    return children
  }

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
