import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { validateEmail, validatePassword } from '@/utils/validators'
import authService from '@/services/auth.service'
import { userService } from '@/services/user.service'

export default function LoginPage() {
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  })

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  })

  const [loginError, setLoginError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const getInputClass = (field: 'email' | 'password', extraPaddingRight = 'pr-4') => {
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

  const validateField = (field: 'email' | 'password', value: string) => {
    let error = ''
    if (field === 'email') {
      error = validateEmail(value) || ''
    } else if (field === 'password') {
      error = validatePassword(value) || ''
    }
    setErrors((prev) => ({ ...prev, [field]: error }))
  }

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const val = field === 'email' ? email : password
    validateField(field, val)
  }

  const handleChange = (field: 'email' | 'password', val: string) => {
    if (field === 'email') {
      setEmail(val)
    } else {
      setPassword(val)
    }
    
    if (touched[field]) {
      validateField(field, val)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)

    const emailErr = validateEmail(email) || ''
    const passwordErr = validatePassword(password) || ''

    setErrors({
      email: emailErr,
      password: passwordErr,
    })

    setTouched({
      email: true,
      password: true,
    })

    if (emailErr || passwordErr) {
      return
    }

    setLoading(true)
    try {
      const data = await authService.login({ email, password })
      
      // Lưu data cơ bản từ login trước (token cần có để gọi /api/auth/me)
      const storedUserData = {
        ...data.user,
        token: data.token
      }
      localStorage.setItem('mangaflow_user', JSON.stringify(storedUserData))

      // Gọi /api/auth/me để lấy profile đầy đủ nhất (bao gồm avatar_url mới nhất)
      try {
        const freshProfile = await userService.getMe()
        const refreshed = {
          ...storedUserData,
          fullName: freshProfile.fullName || storedUserData.fullName,
          avatarUrl: freshProfile.avatarUrl || storedUserData.avatarUrl,
          bio: freshProfile.bio || storedUserData.bio,
        }
        localStorage.setItem('mangaflow_user', JSON.stringify(refreshed))
      } catch {
        // Không block login nếu /api/auth/me thất bại
      }

      if (storedUserData.role === 'MANGAKA') {
        navigate('/dashboard/mangaka')
      } else if (storedUserData.role === 'ASSISTANT') {
        navigate('/dashboard/assistant')
      } else if (storedUserData.role === 'EDITOR') {
        navigate('/dashboard/tantou-editor')
      } else if (storedUserData.role === 'BOARD') {
        navigate('/dashboard/editorial-board')
      } else {
        navigate('/')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      const errorMsg = err.response?.data?.message || 'Email hoặc mật khẩu không chính xác.'
      setLoginError(errorMsg)
      setLoading(false)
    }
  }

  const isFormValid =
    email &&
    password &&
    !errors.email &&
    !errors.password

  return (
    <div className="min-h-screen bg-white relative flex items-center justify-center p-4 font-sans overflow-hidden">
      <button
        onClick={() => navigate('/register')}
        className="absolute top-6 left-6 md:top-10 md:left-10 z-50 p-2 bg-white text-manga-ink manga-border manga-shadow-sm hover:translate-y-1 hover:manga-shadow-none transition-all flex items-center justify-center"
        aria-label="Quay lại"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Background Manga Panels (Decorative) */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 w-64 h-80 border-4 border-manga-ink -rotate-6 bg-gray-50" />
        <div className="absolute bottom-20 right-20 w-96 h-64 border-4 border-manga-ink rotate-3 bg-gray-50" />
        <div className="absolute -top-10 right-32 w-72 h-72 border-4 border-manga-ink rotate-12 bg-gray-50" />
        <div className="absolute bottom-10 left-20 w-80 h-40 border-4 border-manga-ink -rotate-2 bg-gray-50" />
      </div>

      <div className="w-full max-w-lg z-10">
        {/* Form Card */}
        <div className="manga-border manga-shadow bg-white flex flex-col">
          {/* Header Card */}
          <div className="bg-manga-ink p-8 text-white relative">
            <div className="absolute -top-4 left-6 bg-white text-manga-ink font-manga font-bold px-3 py-1 text-sm manga-border">
              MANGAFLOW
            </div>
            <h1 className="font-manga text-4xl font-bold uppercase mt-2 mb-2 tracking-wide">
              Tiếp tục hành trình
            </h1>
            <p className="text-gray-300 text-sm">
              Đăng nhập để vào không gian sáng tác
            </p>
          </div>

          {/* Body Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              {loginError && (
                <div className="bg-manga-red/10 border-l-4 border-manga-red p-3 text-sm text-manga-red font-bold">
                  {loginError}
                </div>
              )}

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
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="mangaka@example.com"
                    className={getInputClass('email', 'pr-4')}
                  />
                </div>
                {errors.email && (
                  <p className="text-manga-red text-xs font-bold mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-bold uppercase tracking-wider text-manga-ink">
                    Mật khẩu
                  </label>
                  <Link to="/forgot-password" className="text-xs font-bold text-manga-red hover:underline">
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder="••••••••"
                    className={getInputClass('password', 'pr-10')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-manga-ink transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="text-manga-red text-xs font-bold mt-1">{errors.password}</p>
                ) : (
                  <p className="text-gray-400 text-[10px] mt-1">
                    Mật khẩu 8–32 ký tự, gồm chữ hoa, chữ thường, số và ký tự ! @ # $ % ^ & * _ -
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="w-full mt-4 bg-manga-red text-white font-bold uppercase tracking-widest py-3 px-8 manga-border manga-shadow-sm hover:translate-y-1 hover:manga-shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:manga-shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'} <span>→</span>
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="h-px bg-manga-ink flex-1" />
              <span className="font-manga text-sm font-bold uppercase">Hoặc</span>
              <div className="h-px bg-manga-ink flex-1" />
            </div>

            {/* Social Login */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 bg-white text-manga-ink font-bold py-2 px-4 manga-border manga-shadow-sm hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" />
                </svg>
                Google
              </button>
              <button className="flex items-center justify-center gap-2 bg-manga-ink text-white font-bold py-2 px-4 manga-border border-manga-ink manga-shadow-sm hover:bg-gray-900 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Twitter
              </button>
            </div>

            {/* Bottom Link */}
            <div className="mt-8 text-center text-sm font-medium">
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="font-bold underline decoration-2 underline-offset-4 hover:text-manga-red transition-colors"
              >
                Tạo bản thảo mới
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
