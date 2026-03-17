import { useState } from 'react'
import { useAuth } from '../hooks/use-auth'

export default function LoginForm({ onSwitchToReset }) {
  const auth = useAuth()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const validate = () => {
    const errors = {}
    if (!phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required'
    }
    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFieldErrors({})

    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    try {
      await auth.login(phoneNumber.trim(), password)
    } catch {
      // error is set in auth context
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-rose-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-slide-up">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💌</div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent mb-2">
            welcome back
          </h1>
          <p className="text-sm text-gray-500">
            sign in to send some luv
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
              phone number
            </label>
            <input
              type="tel"
              className="input-field"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              autoComplete="tel"
            />
            {fieldErrors.phoneNumber && (
              <p className="text-xs text-rose-500 mt-1">{fieldErrors.phoneNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
              password
            </label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="your password"
              autoComplete="current-password"
            />
            {fieldErrors.password && (
              <p className="text-xs text-rose-500 mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {auth.error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-rose-600">
              {auth.error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2"
            disabled={auth.loading}
          >
            {auth.loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                signing in...
              </>
            ) : (
              'sign in'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onSwitchToReset}
            className="text-sm text-gray-500 hover:text-rose-500 transition-colors"
          >
            forgot your password?
          </button>
        </div>
      </div>
    </div>
  )
}
