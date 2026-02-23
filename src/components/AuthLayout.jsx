import { useState } from 'react'
import useAuth from '../hooks/use-auth'
import LoginForm from './LoginForm'
import PasswordResetForm from './PasswordResetForm'

export default function AuthLayout({ children }) {
  const { user } = useAuth()
  const [authView, setAuthView] = useState('login') // 'login' or 'reset'

  if (!user) {
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
