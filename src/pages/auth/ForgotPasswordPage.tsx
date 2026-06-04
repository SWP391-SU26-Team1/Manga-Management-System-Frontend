import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, Mail, Sparkles, Lock, Eye, EyeOff } from 'lucide-react'
import { validateEmail, validatePassword, validateConfirmPassword } from '@/utils/validators'
import { MOCK_USERS } from '@/data/mockUsers'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [errors, setErrors] = useState({
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [touched, setTouched] = useState({
    email: false,
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  })

  const [submitted, setSubmitted] = useState(false)

  const getInputClass = (field: 'email' | 'oldPassword' | 'newPassword' | 'confirmPassword', extraPaddingRight = 'pr-4') => {
    const isTouched = touched[field]
    const error = errors[field]
    
    let borderClass = 'border-manga-ink focus:border-manga-red'
    
    if (isTouched) {
      if (error) {
        borderClass = 'border-manga-red focus:border-manga-red'
      } else {
        borderClass = 'border-green-500 focus:border-green-500'
      }
    }
    
    return `w-full pl-8 ${extraPaddingRight} py-2 border-b-2 bg-transparent focus:outline-none transition-colors ${borderClass}`
  }

  const validateField = (field: string) => {
    let error = ''
    switch (field) {
      case 'email':
        error = validateEmail(email) || ''
        break
      case 'oldPassword':
        if (!oldPassword) {
          error = 'Mật khẩu cũ là bắt buộc.'
        }
        break
      case 'newPassword':
        error = validatePassword(newPassword) || ''
        if (touched.confirmPassword) {
          const cErr = validateConfirmPassword(newPassword, confirmPassword) || ''
          setErrors((prev) => ({ ...prev, confirmPassword: cErr }))
        }
        break
      case 'confirmPassword':
        error = validateConfirmPassword(newPassword, confirmPassword) || ''
        break
    }
    setErrors((prev) => ({ ...prev, [field]: error }))
  }

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    validateField(field)
  }

  const handleChange = (val: string, field: string) => {
    switch (field) {
      case 'email': setEmail(val); break
      case 'oldPassword': setOldPassword(val); break
      case 'newPassword': setNewPassword(val); break
      case 'confirmPassword': setConfirmPassword(val); break
    }
    
    if (touched[field as keyof typeof touched]) {
      setErrors((prev) => {
        let error = ''
        if (field === 'email') error = validateEmail(val) || ''
        if (field === 'oldPassword') error = val ? '' : 'Mật khẩu cũ là bắt buộc.'
        if (field === 'newPassword') {
          error = validatePassword(val) || ''
          if (touched.confirmPassword) {
            const cErr = validateConfirmPassword(val, confirmPassword) || ''
            setTimeout(() => setErrors((p) => ({ ...p, confirmPassword: cErr })), 0)
          }
        }
        if (field === 'confirmPassword') error = validateConfirmPassword(newPassword, val) || ''
        return { ...prev, [field]: error }
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const emailErr = validateEmail(email) || ''
    const oldPasswordErr = oldPassword ? '' : 'Mật khẩu cũ là bắt buộc.'
    const newPasswordErr = validatePassword(newPassword) || ''
    const confirmPasswordErr = validateConfirmPassword(newPassword, confirmPassword) || ''

    setErrors({
      email: emailErr,
      oldPassword: oldPasswordErr,
      newPassword: newPasswordErr,
      confirmPassword: confirmPasswordErr,
    })

    setTouched({
      email: true,
      oldPassword: true,
      newPassword: true,
      confirmPassword: true,
    })

    if (emailErr || oldPasswordErr || newPasswordErr || confirmPasswordErr) {
      return
    }

    // Database simulation validation
    const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    if (!user) {
      setErrors((prev) => ({ ...prev, email: 'Email không tồn tại trong hệ thống.' }))
      return
    }

    if (user.password !== oldPassword) {
      setErrors((prev) => ({ ...prev, oldPassword: 'Mật khẩu cũ không chính xác.' }))
      return
    }

    // Save new password
    user.password = newPassword
    setSubmitted(true)
  }

  const isFormValid =
    email &&
    oldPassword &&
    newPassword &&
    confirmPassword &&
    !errors.email &&
    !errors.oldPassword &&
    !errors.newPassword &&
    !errors.confirmPassword

  return (
    <div className="min-h-screen bg-white relative flex items-center justify-center p-4 font-sans overflow-hidden">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 md:top-10 md:left-10 z-50 p-2 bg-white text-manga-ink manga-border manga-shadow-sm hover:translate-y-1 hover:manga-shadow-none transition-all flex items-center justify-center"
        aria-label="Quay lại"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Background Decorative */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 w-64 h-80 border-4 border-manga-ink -rotate-6 bg-gray-50" />
        <div className="absolute bottom-20 right-20 w-96 h-64 border-4 border-manga-ink rotate-3 bg-gray-50" />
      </div>

      <div className="w-full max-w-lg z-10">
        <div className="manga-border manga-shadow bg-white flex flex-col">
          {/* Header */}
          <div className="bg-manga-ink p-8 text-white relative">
            <div className="absolute -top-4 left-6 bg-white text-manga-ink font-manga font-bold px-3 py-1 text-sm manga-border">
              MANGAFLOW
            </div>
            <h1 className="font-manga text-4xl font-bold uppercase mt-2 mb-2 tracking-wide">
              Khôi phục mật khẩu
            </h1>
            <p className="text-gray-300 text-sm">
              Nhập thông tin bên dưới để thay đổi mật khẩu của bạn
            </p>
          </div>

          {/* Body */}
          <div className="p-8">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-manga-red rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="font-manga text-2xl font-bold uppercase text-manga-ink mb-2">
                  Đặt lại thành công!
                </h2>
                <p className="text-sm font-bold text-gray-600 mb-6">
                  Mật khẩu tài khoản <strong>{email}</strong> đã được thay đổi. Bạn có thể sử dụng mật khẩu mới để đăng nhập ngay bây giờ.
                </p>
                <Link
                  to="/login"
                  className="inline-block bg-manga-ink text-white font-bold uppercase tracking-widest py-3 px-8 manga-border manga-shadow-sm hover:translate-y-1 hover:manga-shadow-none transition-all"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold uppercase tracking-wider text-manga-ink">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => handleChange(e.target.value, 'email')}
                      onBlur={() => handleBlur('email')}
                      placeholder="mangaka@example.com"
                      className={getInputClass('email', 'pr-4')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-manga-red text-xs font-bold mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Old Password Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold uppercase tracking-wider text-manga-ink">
                    Mật khẩu cũ
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => handleChange(e.target.value, 'oldPassword')}
                      onBlur={() => handleBlur('oldPassword')}
                      placeholder="••••••••"
                      className={getInputClass('oldPassword', 'pr-10')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-manga-ink transition-colors"
                    >
                      {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.oldPassword && (
                    <p className="text-manga-red text-xs font-bold mt-1">{errors.oldPassword}</p>
                  )}
                </div>

                {/* New Password Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold uppercase tracking-wider text-manga-ink">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => handleChange(e.target.value, 'newPassword')}
                      onBlur={() => handleBlur('newPassword')}
                      placeholder="••••••••"
                      className={getInputClass('newPassword', 'pr-10')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-manga-ink transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.newPassword ? (
                    <p className="text-manga-red text-xs font-bold mt-1">{errors.newPassword}</p>
                  ) : (
                    <p className="text-gray-400 text-[10px] mt-1">
                      Mật khẩu 8–32 ký tự, gồm chữ hoa, chữ thường, số và ký tự ! @ # $ % ^ & * _ -
                    </p>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold uppercase tracking-wider text-manga-ink">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => handleChange(e.target.value, 'confirmPassword')}
                      onBlur={() => handleBlur('confirmPassword')}
                      placeholder="••••••••"
                      className={getInputClass('confirmPassword', 'pr-10')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-manga-ink transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-manga-red text-xs font-bold mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!isFormValid}
                  className="w-full bg-manga-red text-white font-bold uppercase tracking-widest py-3 px-8 manga-border manga-shadow-sm hover:translate-y-1 hover:manga-shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Xác nhận đổi mật khẩu
                </button>

                <div className="text-center text-sm font-medium">
                  Đã nhớ mật khẩu?{' '}
                  <Link to="/login" className="font-bold underline decoration-2 underline-offset-4 hover:text-manga-red transition-colors">
                    Đăng nhập
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

