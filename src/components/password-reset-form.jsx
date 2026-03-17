import { useState } from 'react'
import { useAuth } from '../hooks/use-auth'

export default function PasswordResetForm({ onSwitchToLogin }) {
  const auth = useAuth()
  const [step, setStep] = useState('request') // 'request' | 'reset'
  const [phoneNumber, setPhoneNumber] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  const validateRequest = () => {
    const errors = {}
    if (!phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required'
    }
    return errors
  }

  const validateReset = () => {
    const errors = {}
    if (!resetCode.trim()) {
      errors.resetCode = 'Reset code is required'
    }
    if (!newPassword) {
      errors.newPassword = 'New password is required'
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters'
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    return errors
  }

  const handleRequestCode = async (e) => {
    e.preventDefault()
    setFieldErrors({})
    setSuccessMessage('')

    const errors = validateRequest()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    try {
      await auth.requestPasswordReset(phoneNumber.trim())
      setStep('reset')
      setSuccessMessage('If an account exists with that number, a reset code has been sent via SMS.')
    } catch {
      // error is set in auth context
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setFieldErrors({})
    setSuccessMessage('')

    const errors = validateReset()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    try {
      await auth.resetPassword(phoneNumber.trim(), resetCode.trim(), newPassword)
      setSuccessMessage('Password reset successfully! You can now sign in.')
      setTimeout(() => onSwitchToLogin(), 2000)
    } catch {
      // error is set in auth context
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-rose-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-slide-up">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔑</div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent mb-2">
            {step === 'request' ? 'reset password' : 'enter reset code'}
          </h1>
          <p className="text-sm text-gray-500">
            {step === 'request'
              ? 'we\'ll send a code to your phone'
              : 'check your texts for the 6-digit code'
            }
          </p>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-600 mb-4">
            {successMessage}
          </div>
        )}

        {auth.error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-rose-600 mb-4">
            {auth.error}
          </div>
        )}

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
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                autoComplete="tel"
              />
              {fieldErrors.phoneNumber && (
                <p className="text-xs text-rose-500 mt-1">{fieldErrors.phoneNumber}</p>
              )}
            </div>

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
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
                reset code
              </label>
              <input
                type="text"
                className="input-field text-center text-lg tracking-widest"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              {fieldErrors.resetCode && (
                <p className="text-xs text-rose-500 mt-1">{fieldErrors.resetCode}</p>
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
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="at least 8 characters"
                autoComplete="new-password"
              />
              {fieldErrors.newPassword && (
                <p className="text-xs text-rose-500 mt-1">{fieldErrors.newPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wide text-gray-500">
                confirm password
              </label>
              <input
                type="password"
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="confirm your password"
                autoComplete="new-password"
              />
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-rose-500 mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

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
                  resetting...
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
                setSuccessMessage('')
              }}
              className="btn-secondary w-full"
            >
              resend code
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
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
  )
}
