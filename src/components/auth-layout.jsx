import { useState } from 'react'
import { useAuth } from '../hooks/use-auth'
import LoginForm from './login-form'
import PasswordResetForm from './password-reset-form'

export default function AuthLayout({ children }) {
  const auth = useAuth()
  const [view, setView] = useState('login') // 'login' | 'reset'

  if (!auth.isAuthenticated) {
    if (view === 'reset') {
      return <PasswordResetForm onBack={() => setView('login')} />
    }

    return <LoginForm onForgotPassword={() => setView('reset')} />
  }

  return children
}
