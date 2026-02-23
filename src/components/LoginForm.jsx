import { useState } from 'react'
import useAuth from '../hooks/use-auth'

export default function LoginForm({ onSwitchToReset }) {
  const { login, loading, error } = useAuth()
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
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      await login(phoneNumber.trim(), password)
    } catch {
      // Error is handled by auth context
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-rose-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💌</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent mb-2">
            luv-letter
          </h1>
          <p className="text-sm text-gray-500">
            sign in to manage your updates
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
                phone number
              </label>
              <input
                type="tel"
                className="input-field"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value)
                  setFieldErrors((prev) => ({ ...prev, phoneNumber: undefined }))
                }}
                placeholder="+1234567890"
                autoComplete="tel"
              />
              {fieldErrors.phoneNumber && (
                <p className="text-rose-500 text-xs mt-1">{fieldErrors.phoneNumber}</p>
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
                onChange={(e) => {
                  setPassword(e.target.value)
                  setFieldErrors((prev) => ({ ...prev, password: undefined }))
                }}
                placeholder="your password"
                autoComplete="current-password"
              />
              {fieldErrors.password && (
                <p className="text-rose-500 text-xs mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-rose-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {loading ? 'signing in...' : 'sign in'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onSwitchToReset}
              className="text-sm text-gray-500 hover:text-rose-500 transition-colors"
            >
              forgot password?
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
