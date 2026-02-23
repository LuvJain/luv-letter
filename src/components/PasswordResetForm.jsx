import { useState } from 'react'
import useAuth from '../hooks/use-auth'

export default function PasswordResetForm({ onSwitchToLogin }) {
  const { requestPasswordReset, resetPassword, loading, error } = useAuth()
  const [step, setStep] = useState('request') // 'request' or 'reset'
  const [phoneNumber, setPhoneNumber] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  const validateRequest = () => {
    const errors = {}
    if (!phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateReset = () => {
    const errors = {}
    if (!resetCode.trim()) {
      errors.resetCode = 'Reset code is required'
    }
    if (!newPassword) {
      errors.newPassword = 'New password is required'
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleRequestCode = async (e) => {
    e.preventDefault()
    if (!validateRequest()) return

    try {
      await requestPasswordReset(phoneNumber.trim())
      setStep('reset')
      setFieldErrors({})
      setSuccessMessage('')
    } catch {
      // Error is handled by auth context
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!validateReset()) return

    try {
      await resetPassword(phoneNumber.trim(), resetCode.trim(), newPassword)
      setSuccessMessage('Password reset successfully! You can now sign in.')
      setTimeout(() => {
        onSwitchToLogin()
      }, 2000)
    } catch {
      // Error is handled by auth context
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-rose-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔑</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent mb-2">
            reset password
          </h1>
          <p className="text-sm text-gray-500">
            {step === 'request'
              ? "we'll send a code to your phone"
              : 'enter the code and your new password'}
          </p>
        </div>

        <div className="card">
          {step === 'request' ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
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
                {loading ? 'sending code...' : 'send reset code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
                  reset code
                </label>
                <input
                  type="text"
                  className="input-field text-center tracking-widest text-lg"
                  value={resetCode}
                  onChange={(e) => {
                    setResetCode(e.target.value)
                    setFieldErrors((prev) => ({ ...prev, resetCode: undefined }))
                  }}
                  placeholder="000000"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
                {fieldErrors.resetCode && (
                  <p className="text-rose-500 text-xs mt-1">{fieldErrors.resetCode}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
                  new password
                </label>
                <input
                  type="password"
                  className="input-field"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setFieldErrors((prev) => ({ ...prev, newPassword: undefined }))
                  }}
                  placeholder="new password"
                  autoComplete="new-password"
                />
                {fieldErrors.newPassword && (
                  <p className="text-rose-500 text-xs mt-1">{fieldErrors.newPassword}</p>
                )}
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-rose-600 text-sm">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-600 text-sm">
                  {successMessage}
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
                {loading ? 'resetting...' : 'reset password'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('request')
                  setResetCode('')
                  setNewPassword('')
                  setFieldErrors({})
                }}
                className="w-full text-sm text-gray-500 hover:text-rose-500 transition-colors"
              >
                resend code
              </button>
            </form>
          )}

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-sm text-gray-500 hover:text-rose-500 transition-colors"
            >
              back to sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
