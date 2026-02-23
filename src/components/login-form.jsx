import { useState } from 'react'
import { useAuth } from '../hooks/use-auth'

export default function LoginForm({ onForgotPassword }) {
  const auth = useAuth()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/[^\d+]/g, '')
    if (!digits.startsWith('+') && digits.length > 0) {
      return '+1' + digits
    }
    return digits
  }

  const validate = () => {
    const errors = {}

    if (!phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required'
    } else if (!/^\+\d{10,15}$/.test(phoneNumber.replace(/[\s()-]/g, ''))) {
      errors.phoneNumber = 'Enter a valid phone number (e.g. +11234567890)'
    }

    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    try {
      await auth.login(phoneNumber, password)
    } catch {
      // Error is set in auth context
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-rose-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 animate-slide-up">
          <div className="text-6xl mb-4">💌</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent mb-2">
            luv-letter
          </h1>
          <p className="text-sm text-gray-500">
            sign in to send your monthly updates
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 animate-fade-in">
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
              phone number
            </label>
            <input
              type="tel"
              className={`input-field ${fieldErrors.phoneNumber ? 'border-red-300 focus:ring-red-400' : ''}`}
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value)
                if (fieldErrors.phoneNumber) {
                  setFieldErrors((prev) => ({ ...prev, phoneNumber: undefined }))
                }
              }}
              onBlur={() => setPhoneNumber(formatPhoneNumber(phoneNumber))}
              placeholder="+11234567890"
              autoComplete="tel"
            />
            {fieldErrors.phoneNumber && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.phoneNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
              password
            </label>
            <input
              type="password"
              className={`input-field ${fieldErrors.password ? 'border-red-300 focus:ring-red-400' : ''}`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }))
                }
              }}
              placeholder="your password"
              autoComplete="current-password"
            />
            {fieldErrors.password && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {auth.error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
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

          <button
            type="button"
            onClick={onForgotPassword}
            className="w-full text-center text-sm text-gray-500 hover:text-rose-500 transition-colors duration-200"
          >
            forgot password?
          </button>
        </form>
      </div>
    </div>
  )
}
