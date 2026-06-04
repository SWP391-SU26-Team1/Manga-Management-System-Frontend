import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { PenTool, PencilRuler, FileSignature, Sparkles, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { validateUsername, validateEmail, validatePassword, validateConfirmPassword } from '@/utils/validators'
import { MOCK_USERS } from '@/data/mockUsers'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState<'mangaka' | 'assistant' | 'editor'>('mangaka')

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  })

  const getInputClass = (field: 'username' | 'email' | 'password' | 'confirmPassword', extraClasses = '') => {
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
    
    return `w-full py-2 border-b-2 bg-transparent focus:outline-none transition-colors text-sm placeholder:text-gray-300 ${borderClass} ${extraClasses}`
  }

  const validateField = (field: string, val: string) => {
    let error = ''
    switch (field) {
      case 'username':
        error = validateUsername(val) || ''
        break
      case 'email':
        error = validateEmail(val) || ''
        break
      case 'password':
        error = validatePassword(val) || ''
        if (touched.confirmPassword) {
          const cErr = validateConfirmPassword(val, confirmPassword) || ''
          setErrors((prev) => ({ ...prev, confirmPassword: cErr }))
        }
        break
      case 'confirmPassword':
        error = validateConfirmPassword(password, val) || ''
        break
    }
    setErrors((prev) => ({ ...prev, [field]: error }))
  }

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const val = field === 'username' ? username : field === 'email' ? email : field === 'password' ? password : confirmPassword
    validateField(field, val)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const val = e.target.value
    switch (field) {
      case 'username': setUsername(val); break
      case 'email': setEmail(val); break
      case 'password': setPassword(val); break
      case 'confirmPassword': setConfirmPassword(val); break
    }
    if (touched[field as keyof typeof touched]) {
      validateField(field, val)
    }
  }

  const isFormValid =
    username && email && password && confirmPassword &&
    !errors.username && !errors.email && !errors.password && !errors.confirmPassword &&
    !validateUsername(username) && !validateEmail(email) && !validatePassword(password) && !validateConfirmPassword(password, confirmPassword)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const uErr = validateUsername(username) || ''
    const eErr = validateEmail(email) || ''
    const pErr = validatePassword(password) || ''
    const cErr = validateConfirmPassword(password, confirmPassword) || ''

    setErrors({
      username: uErr,
      email: eErr,
      password: pErr,
      confirmPassword: cErr,
    })

    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    })

    if (uErr || eErr || pErr || cErr) {
      return
    }

    // Add user to MOCK_USERS simulation
    const userRole = role.toUpperCase() as any
    const exists = MOCK_USERS.some(u => u.email.toLowerCase() === email.trim().toLowerCase())
    if (exists) {
      setErrors(prev => ({ ...prev, email: 'Email đã tồn tại trên hệ thống.' }))
      return
    }

    MOCK_USERS.push({
      id: `usr_${role}_${Date.now()}`,
      username: username,
      email: email,
      password: password,
      role: userRole,
      fullName: username,
      avatarUrl: `https://i.pravatar.cc/150?u=${username}`,
      bio: `Mô tả về ${username}.`,
      stats: { projectsCompleted: 0, activeProjects: 0 }
    })

    alert('Đăng ký thành công!')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] relative flex items-center justify-center p-4 md:p-8 font-sans overflow-hidden">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 md:top-10 md:left-10 z-50 p-2 bg-white text-manga-ink manga-border manga-shadow-sm hover:translate-y-1 hover:manga-shadow-none transition-all flex items-center justify-center"
        aria-label="Quay lại"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Background Manga Panels */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-5%] left-[-5%] w-[400px] h-[500px] border-[6px] border-manga-ink -rotate-12 bg-gray-100" style={{ backgroundImage: "url('/images/cover-1.png')", backgroundSize: 'cover', opacity: 0.3, filter: 'grayscale(100%)' }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[400px] border-[6px] border-manga-ink rotate-6 bg-gray-100" style={{ backgroundImage: "url('/images/hero.png')", backgroundSize: 'cover', opacity: 0.3, filter: 'grayscale(100%)' }} />
      </div>

      <div className="w-full max-w-5xl z-10 flex flex-col md:flex-row manga-border manga-shadow bg-white">

        {/* Left Block - Intro */}
        <div className="w-full md:w-5/12 bg-manga-ink text-white p-10 md:p-14 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }} />

          <div className="relative z-10">
            <div className="inline-block font-manga font-bold text-xl tracking-widest text-white mb-2">
              MANGAFLOW
            </div>
            <div className="w-12 h-1 bg-manga-red mb-12" />

            <h1 className="font-manga text-5xl md:text-6xl font-bold uppercase leading-[0.9] tracking-wide mb-6">
              Gia nhập<br />Cộng đồng
            </h1>

            <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-sm">
              Hành trình sáng tạo không đơn độc. Tìm kiếm đồng đội, quản lý bản thảo và xuất bản tác phẩm của bạn.
            </p>
          </div>

          <div className="relative z-10 mt-16 flex items-center gap-3 text-white/50">
            <PenTool className="w-6 h-6" />
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Right Block - Form */}
        <div className="w-full md:w-7/12 bg-white p-10 md:p-14 relative z-10">
          <form onSubmit={handleSubmit} className="flex flex-col h-full justify-center">

            <h2 className="font-manga text-2xl font-bold uppercase mb-6 tracking-wide">
              Bạn là ai?
            </h2>

            {/* Roles Selection */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 mb-10">
              {/* Mangaka */}
              <button
                type="button"
                onClick={() => setRole('mangaka')}
                className={`flex flex-col items-center justify-center p-4 border-2 transition-all ${
                  role === 'mangaka'
                    ? 'border-manga-ink bg-manga-ink text-white'
                    : 'border-manga-ink bg-white text-manga-ink hover:bg-gray-50'
                }`}
              >
                <PenTool className="w-6 h-6 mb-2" />
                <span className="text-xs font-bold uppercase tracking-wider">Mangaka</span>
              </button>

              {/* Assistant */}
              <button
                type="button"
                onClick={() => setRole('assistant')}
                className={`flex flex-col items-center justify-center p-4 border-2 transition-all ${
                  role === 'assistant'
                    ? 'border-manga-ink bg-manga-ink text-white'
                    : 'border-manga-ink bg-white text-manga-ink hover:bg-gray-50'
                }`}
              >
                <PencilRuler className="w-6 h-6 mb-2" />
                <span className="text-xs font-bold uppercase tracking-wider">Trợ lý</span>
              </button>

              {/* Editor */}
              <button
                type="button"
                onClick={() => setRole('editor')}
                className={`flex flex-col items-center justify-center p-4 border-2 transition-all ${
                  role === 'editor'
                    ? 'border-manga-ink bg-manga-ink text-white'
                    : 'border-manga-ink bg-white text-manga-ink hover:bg-gray-50'
                }`}
              >
                <FileSignature className="w-6 h-6 mb-2" />
                <span className="text-xs font-bold uppercase tracking-wider text-center">Biên tập viên</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* Username Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-manga-ink">
                  Tên đăng ký
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => handleChange(e, 'username')}
                  onBlur={() => handleBlur('username')}
                  placeholder="Nhập tên đăng nhập của bạn (VD: nguyen_van_a)"
                  className={getInputClass('username')}
                />
                {errors.username && <p className="text-manga-red text-xs font-bold mt-1">{errors.username}</p>}
              </div>

              {/* Email Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-manga-ink">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleChange(e, 'email')}
                  onBlur={() => handleBlur('email')}
                  placeholder="example@studio.com"
                  className={getInputClass('email')}
                />
                {errors.email && <p className="text-manga-red text-xs font-bold mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password Input */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-manga-ink">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => handleChange(e, 'password')}
                      onBlur={() => handleBlur('password')}
                      placeholder="••••••••"
                      className={getInputClass('password', 'pr-10')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-manga-ink transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password ? (
                    <p className="text-manga-red text-xs font-bold mt-1">{errors.password}</p>
                  ) : (
                    <p className="text-gray-400 text-[10px] mt-1 leading-tight">
                      Mật khẩu 8–32 ký tự, gồm chữ hoa, chữ thường, số và ký tự ! @ # $ % ^ & * _ - ?
                    </p>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-manga-ink">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => handleChange(e, 'confirmPassword')}
                      onBlur={() => handleBlur('confirmPassword')}
                      placeholder="••••••••"
                      className={getInputClass('confirmPassword', 'pr-10')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-manga-ink transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-manga-red text-xs font-bold mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-10">
              <button
                type="submit"
                disabled={!isFormValid}
                className="w-full bg-manga-red text-white font-bold uppercase tracking-widest py-4 px-8 manga-border manga-shadow-sm hover:translate-y-1 hover:manga-shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:manga-shadow-sm"
              >
                Bắt đầu sáng tạo
              </button>
            </div>

            {/* Bottom Link */}
            <div className="mt-6 text-center text-xs font-medium text-gray-500">
              Đã có tài khoản?{' '}
              <Link
                to="/login"
                className="font-bold text-manga-red underline decoration-2 underline-offset-4 hover:text-manga-ink transition-colors"
              >
                Đăng nhập tại đây
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
