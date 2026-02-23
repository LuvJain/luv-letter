import { useState } from 'react'
import { useAuth } from '../hooks/use-auth'

export default function PasswordResetForm({ onBack }) {
  const auth = useAuth()
  const [step, setStep] = useState('request') // 'request' | 'reset'
  const [phoneNumber, setPhoneNumber] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/[^\d+]/g, '')
    if (!digits.startsWith('+') && digits.length > 0) {
      return '+1' + digits
    }
    return digits
  }

  const validateRequest = () => {
    const errors = {}

    if (!phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required'
    } else if (!/^\+\d{10,15}$/.test(phoneNumber.replace(/[\s()-]/g, ''))) {
      errors.phoneNumber = 'Enter a valid phone number (e.g. +11234567890)'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateReset = () => {
    const errors = {}

    if (!resetCode.trim()) {
      errors.resetCode = 'Reset code is required'
    } else if (!/^\d{6}$/.test(resetCode.trim())) {
      errors.resetCode = 'Enter the 6-digit code from your SMS'
    }

    if (!newPassword) {
      errors.newPassword = 'New password is required'
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters'
    }

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleRequestCode = async (e) => {
    e.preventDefault()

    if (!validateRequest()) return

    try {
      await auth.requestPasswordReset(phoneNumber)
      setStep('reset')
      setFieldErrors({})
    } catch {
      // Error is set in auth context
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (!validateReset()) return

    try {
      await auth.resetPassword(phoneNumber, resetCode.trim(), newPassword)
      setSuccessMessage('Password reset successfully! You can now sign in.')
      setTimeout(() => {
        onBack()
      }, 2000)
    } catch {
      // Error is set in auth context
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-rose-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 animate-slide-up">
          <div className="text-6xl mb-4">{step === 'request' ? '🔑' : '📲'}</div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent mb-2">
            {step === 'request' ? 'reset password' : 'enter reset code'}
          </h1>
          <p className="text-sm text-gray-500">
            {step === 'request'
              ? "enter your phone number and we'll send a code"
              : 'check your SMS for the 6-digit code'}
          </p>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-600 mb-4 animate-fade-in">
            {successMessage}
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequestCode} className="card space-y-4 animate-fade-in">
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
                  sending code...
                </>
              ) : (
                'send reset code'
              )}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full text-center text-sm text-gray-500 hover:text-rose-500 transition-colors duration-200"
            >
              back to sign in
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="card space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
                reset code
              </label>
              <input
                type="text"
                inputMode="numeric"
                className={`input-field text-center text-lg tracking-widest ${fieldErrors.resetCode ? 'border-red-300 focus:ring-red-400' : ''}`}
                value={resetCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setResetCode(val)
                  if (fieldErrors.resetCode) {
                    setFieldErrors((prev) => ({ ...prev, resetCode: undefined }))
                  }
                }}
                placeholder="000000"
                maxLength={6}
                autoComplete="one-time-code"
              />
              {fieldErrors.resetCode && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.resetCode}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
                new password
              </label>
              <input
                type="password"
                className={`input-field ${fieldErrors.newPassword ? 'border-red-300 focus:ring-red-400' : ''}`}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  if (fieldErrors.newPassword) {
                    setFieldErrors((prev) => ({ ...prev, newPassword: undefined }))
                  }
                }}
                placeholder="new password (8+ characters)"
                autoComplete="new-password"
              />
              {fieldErrors.newPassword && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.newPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
                confirm password
              </label>
              <input
                type="password"
                className={`input-field ${fieldErrors.confirmPassword ? 'border-red-300 focus:ring-red-400' : ''}`}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                  }
                }}
                placeholder="confirm new password"
                autoComplete="new-password"
              />
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
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
                  resetting password...
                </>
              ) : (
                'reset password'
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('request')
                setResetCode('')
                setNewPassword('')
                setConfirmPassword('')
                setFieldErrors({})
              }}
              className="w-full text-center text-sm text-gray-500 hover:text-rose-500 transition-colors duration-200"
            >
              try a different number
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
