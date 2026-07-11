import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, Mail, Sparkles, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react'
import { validateEmail, validatePassword, validateConfirmPassword } from '@/utils/validators'
import authService from '@/services/auth.service'

const translateErrorMessage = (msg: string): string => {
  if (!msg) return 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại.'
  
  const lowerMsg = msg.toLowerCase()
  if (lowerMsg.includes('no account found') || lowerMsg.includes('email không tồn tại')) {
    return 'Email không tồn tại trong hệ thống.'
  }
  if (lowerMsg.includes('invalid or expired otp') || lowerMsg.includes('otp không chính xác')) {
    return 'Mã OTP không chính xác hoặc đã hết hạn.'
  }
  if (lowerMsg.includes('otp verification is required')) {
    return 'Vui lòng xác thực mã OTP trước khi đổi mật khẩu.'
  }
  
  return msg
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''))
  const [activeInput, setActiveInput] = useState<number>(0)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [errors, setErrors] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [touched, setTouched] = useState({
    email: false,
    newPassword: false,
    confirmPassword: false,
  })

  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(59)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Resend countdown timer for step 2
  useEffect(() => {
    let interval: any
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    } else if (timer === 0) {
      setCanResend(true)
    }
    return () => clearInterval(interval)
  }, [step, timer])

  // Focus active input on step 2
  useEffect(() => {
    if (step === 2 && inputRefs.current[activeInput]) {
      inputRefs.current[activeInput]?.focus()
    }
  }, [step, activeInput])

  const getInputClass = (field: 'email' | 'newPassword' | 'confirmPassword', extraPaddingRight = 'pr-4') => {
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
      case 'newPassword': setNewPassword(val); break
      case 'confirmPassword': setConfirmPassword(val); break
    }
    
    if (touched[field as keyof typeof touched]) {
      setErrors((prev) => {
        let error = ''
        if (field === 'email') error = validateEmail(val) || ''
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

  // OTP Handlers
  const handleOtpChange = (val: string, index: number) => {
    if (isNaN(Number(val))) return

    const newOtp = [...otp]
    newOtp[index] = val.slice(-1)
    setOtp(newOtp)
    setErrors((prev) => ({ ...prev, otp: '' }))

    if (val && index < 5) {
      setActiveInput(index + 1)
    }
  }

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp]
      if (!otp[index] && index > 0) {
        newOtp[index - 1] = ''
        setOtp(newOtp)
        setActiveInput(index - 1)
      } else {
        newOtp[index] = ''
        setOtp(newOtp)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setActiveInput(index - 1)
    } else if (e.key === 'ArrowRight' && index < 5) {
      setActiveInput(index + 1)
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    if (/^\d{6}$/.test(pastedData)) {
      setOtp(pastedData.split(''))
      setActiveInput(5)
      setErrors((prev) => ({ ...prev, otp: '' }))
    }
  }

  // Submission Handlers
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const emailErr = validateEmail(email) || ''
    setErrors((prev) => ({ ...prev, email: emailErr }))
    setTouched((prev) => ({ ...prev, email: true }))

    if (emailErr) return

    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setTimer(59)
      setCanResend(false)
      setOtp(new Array(6).fill(''))
      setActiveInput(0)
      setStep(2)
    } catch (err: any) {
      const rawMsg = err.response?.data?.message || 'Email không tồn tại hoặc lỗi hệ thống.'
      const msg = translateErrorMessage(rawMsg)
      setErrors((prev) => ({ ...prev, email: msg }))
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join('')
    if (otpCode.length < 6) {
      setErrors((prev) => ({ ...prev, otp: 'Vui lòng nhập đầy đủ mã OTP 6 chữ số.' }))
      return
    }

    setLoading(true)
    try {
      await authService.verifyPasswordOtp(email, otpCode)
      setStep(3)
    } catch (err: any) {
      const rawMsg = err.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.'
      const msg = translateErrorMessage(rawMsg)
      setErrors((prev) => ({ ...prev, otp: msg }))
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!canResend) return
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setTimer(59)
      setCanResend(false)
      setOtp(new Array(6).fill(''))
      setActiveInput(0)
      setErrors((prev) => ({ ...prev, otp: '' }))
    } catch (err: any) {
      const rawMsg = err.response?.data?.message || 'Có lỗi xảy ra khi gửi lại mã OTP.'
      const msg = translateErrorMessage(rawMsg)
      setErrors((prev) => ({ ...prev, otp: msg }))
    } finally {
      setLoading(false)
    }
  }

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newPasswordErr = validatePassword(newPassword) || ''
    const confirmPasswordErr = validateConfirmPassword(newPassword, confirmPassword) || ''

    setErrors((prev) => ({
      ...prev,
      newPassword: newPasswordErr,
      confirmPassword: confirmPasswordErr,
    }))

    setTouched((prev) => ({
      ...prev,
      newPassword: true,
      confirmPassword: true,
    }))

    if (newPasswordErr || confirmPasswordErr) return

    setLoading(true)
    try {
      await authService.resetPassword({
        email,
        otp: otp.join(''),
        newPassword,
        confirmPassword,
      })
      setStep(4)
    } catch (err: any) {
      const rawMsg = err.response?.data?.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.'
      const msg = translateErrorMessage(rawMsg)
      setErrors((prev) => ({ ...prev, newPassword: msg }))
    } finally {
      setLoading(false)
    }
  }

  const handleBackAction = () => {
    if (step === 2) {
      setStep(1)
    } else if (step === 3) {
      setStep(2)
    } else {
      navigate('/login')
    }
  }

  const isEmailFormValid = email && !errors.email
  const isOtpFormValid = otp.every(val => val !== '')
  const isResetFormValid = newPassword && confirmPassword && !errors.newPassword && !errors.confirmPassword

  return (
    <div className="min-h-screen bg-white relative flex items-center justify-center p-4 font-sans overflow-hidden">
      {/* Back Button */}
      <button
        onClick={handleBackAction}
        disabled={loading}
        className="absolute top-6 left-6 md:top-10 md:left-10 z-50 p-2 bg-white text-manga-ink manga-border manga-shadow-sm hover:translate-y-1 hover:manga-shadow-none transition-all flex items-center justify-center disabled:opacity-50"
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
              {step === 1 && 'Khôi phục mật khẩu'}
              {step === 2 && 'Xác thực mã OTP'}
              {step === 3 && 'Đặt lại mật khẩu'}
              {step === 4 && 'Thành công!'}
            </h1>
            <p className="text-gray-300 text-sm">
              {step === 1 && 'Nhập email của bạn để nhận mã OTP khôi phục'}
              {step === 2 && `Mã xác thực đã được gửi tới email: ${email}`}
              {step === 3 && 'Thiết lập mật khẩu mới cho tài khoản của bạn'}
              {step === 4 && 'Mật khẩu tài khoản của bạn đã được cập nhật'}
            </p>
          </div>

          {/* Body */}
          <div className="p-8">
            {/* STEP 1: Enter Email */}
            {step === 1 && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold uppercase tracking-wider text-manga-ink">
                    Email đăng ký
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
                      disabled={loading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-manga-red text-xs font-bold mt-1">{errors.email}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!isEmailFormValid || loading}
                  className="w-full bg-manga-red text-white font-bold uppercase tracking-widest py-3.5 px-8 manga-border manga-shadow-sm hover:translate-y-0.5 hover:manga-shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? 'Đang gửi...' : 'Gửi mã OTP'} <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center text-sm font-medium">
                  Đã nhớ mật khẩu?{' '}
                  <Link to="/login" className="font-bold underline decoration-2 underline-offset-4 hover:text-manga-red transition-colors">
                    Đăng nhập
                  </Link>
                </div>
              </form>
            )}

            {/* STEP 2: Enter OTP */}
            {step === 2 && (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-manga-ink">
                    Nhập mã OTP 6 số:
                  </label>
                  
                  <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        pattern="\d*"
                        maxLength={1}
                        value={digit}
                        ref={(el) => { inputRefs.current[idx] = el; }}
                        onChange={(e) => handleOtpChange(e.target.value, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        disabled={loading}
                        className={`w-12 h-14 text-center font-manga text-2xl font-bold bg-manga-paper border-2 manga-shadow-sm focus:outline-none transition-all
                          ${activeInput === idx 
                            ? 'border-manga-red scale-105 shadow-[3px_3px_0px_0px_rgba(230,57,70,1)]' 
                            : 'border-manga-ink'
                          }`}
                      />
                    ))}
                  </div>
                  {errors.otp && (
                    <p className="text-manga-red text-xs font-bold mt-1 text-center">{errors.otp}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!isOtpFormValid || loading}
                  className="w-full bg-manga-red text-white font-bold uppercase tracking-widest py-3.5 px-8 manga-border manga-shadow-sm hover:translate-y-0.5 hover:manga-shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? 'Đang xác thực...' : 'Xác nhận OTP'} <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center text-xs font-bold text-manga-ink pt-2">
                  {canResend ? (
                    <button 
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 text-manga-red hover:underline uppercase decoration-2 underline-offset-4 disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Gửi lại mã OTP
                    </button>
                  ) : (
                    <span className="text-gray-400">
                      Gửi lại mã OTP sau: <span className="text-manga-ink font-extrabold">{timer}s</span>
                    </span>
                  )}
                </div>
              </form>
            )}

            {/* STEP 3: Reset Password */}
            {step === 3 && (
              <form onSubmit={handleResetSubmit} className="space-y-6">
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
                      disabled={loading}
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
                      disabled={loading}
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
                  disabled={!isResetFormValid || loading}
                  className="w-full bg-manga-red text-white font-bold uppercase tracking-widest py-3.5 px-8 manga-border manga-shadow-sm hover:translate-y-0.5 hover:manga-shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                </button>
              </form>
            )}

            {/* STEP 4: Success */}
            {step === 4 && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
