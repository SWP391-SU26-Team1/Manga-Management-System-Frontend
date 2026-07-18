import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { ShieldCheck, Mail, ArrowRight, RotateCcw, ArrowLeft } from 'lucide-react'
import authService from '@/services/auth.service'

export default function OtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get email from URL if present
  const queryParams = new URLSearchParams(location.search)
  const email = queryParams.get('email') || 'example@gmail.com'
  
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''))
  const [activeInput, setActiveInput] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(59)
  const [canResend, setCanResend] = useState(false)
  const [modal, setModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'info' | 'error';
    onConfirm?: () => void;
  }>({ show: false, title: '', message: '', type: 'success' })
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Resend countdown timer
  useEffect(() => {
    let interval: any
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    } else {
      setCanResend(true)
    }
    return () => clearInterval(interval)
  }, [timer])

  // Focus on active input
  useEffect(() => {
    if (inputRefs.current[activeInput]) {
      inputRefs.current[activeInput]?.focus()
    }
  }, [activeInput])

  const handleChange = (val: string, index: number) => {
    // Only accept numeric inputs
    if (isNaN(Number(val))) return

    const newOtp = [...otp]
    // Get last char if user typed multiple (e.g. paste or double type)
    newOtp[index] = val.slice(-1)
    setOtp(newOtp)
    setError(null)

    // Move focus to next input
    if (val && index < 5) {
      setActiveInput(index + 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp]
      
      if (!otp[index] && index > 0) {
        // If current box is empty, move focus to prev box and delete its value
        newOtp[index - 1] = ''
        setOtp(newOtp)
        setActiveInput(index - 1)
      } else {
        // Delete current value
        newOtp[index] = ''
        setOtp(newOtp)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setActiveInput(index - 1)
    } else if (e.key === 'ArrowRight' && index < 5) {
      setActiveInput(index + 1)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    
    // Check if pasted data is 6 digit number
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('')
      setOtp(newOtp)
      setActiveInput(5)
      setError(null)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    setLoading(true)
    setError(null)
    try {
      await authService.resendRegisterOtp(email)
      setTimer(59)
      setCanResend(false)
      setOtp(new Array(6).fill(''))
      setActiveInput(0)
      setModal({
        show: true,
        title: 'Đã gửi lại OTP',
        message: `Một mã OTP mới đã được gửi lại vào địa chỉ: ${email}`,
        type: 'info'
      })
    } catch (err: any) {
      console.error('Resend OTP error:', err)
      const errorMsg = err.response?.data?.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join('')
    
    if (otpCode.length < 6) {
      setError('Vui lòng nhập đầy đủ mã OTP 6 chữ số.')
      return
    }

    setLoading(true)
    setError(null)

    const pendingRegisterEmail = sessionStorage.getItem('pending_register_email')
    const pendingUserStr = sessionStorage.getItem('pending_google_user')

    try {
      if (pendingRegisterEmail) {
        const data = await authService.verifyRegisterOtp(pendingRegisterEmail, otpCode)
        const storedUserData = {
          ...data.user,
          token: data.token
        }
        localStorage.setItem('mangaflow_user', JSON.stringify(storedUserData))
        sessionStorage.removeItem('pending_register_email')
        
        setModal({
          show: true,
          title: 'Thành Công!',
          message: 'Xác thực OTP đăng ký thành công! Hãy bắt đầu hành trình của bạn.',
          type: 'success',
          onConfirm: () => {
            const role = data.user.role?.toUpperCase()
            if (role === 'MANGAKA') {
              navigate('/dashboard/mangaka')
            } else if (role === 'ASSISTANT') {
              navigate('/dashboard/assistant')
            } else if (role === 'EDITOR') {
              navigate('/dashboard/tantou-editor')
            } else if (role === 'ADMIN') {
              navigate('/dashboard/admin')
            } else if (['BOARD', 'CHIEF_EDITOR'].includes(role)) {
              navigate('/dashboard/editorial-board')
            } else {
              navigate('/')
            }
          }
        })
      } else if (pendingUserStr) {
        const parsed = JSON.parse(pendingUserStr)
        localStorage.setItem('mangaflow_user', JSON.stringify(parsed))
        sessionStorage.removeItem('pending_google_user')
        
        const role = parsed.role?.toUpperCase()
        if (role === 'MANGAKA') {
          navigate('/dashboard/mangaka')
        } else if (role === 'ASSISTANT') {
          navigate('/dashboard/assistant')
        } else if (role === 'EDITOR') {
          navigate('/dashboard/tantou-editor')
        } else if (role === 'ADMIN') {
          navigate('/dashboard/admin')
        } else if (['BOARD', 'CHIEF_EDITOR'].includes(role)) {
          navigate('/dashboard/editorial-board')
        } else {
          navigate('/')
        }
      } else {
        setModal({
          show: true,
          title: 'Thành Công!',
          message: 'Xác thực OTP thành công (Chế độ mô phỏng)!',
          type: 'success',
          onConfirm: () => {
            navigate('/')
          }
        })
      }
    } catch (err: any) {
      console.error('OTP verification error:', err)
      const errorMsg = err.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const isOtpComplete = otp.every(val => val !== '')

  return (
    <div className="min-h-screen bg-[#fcfcfc] w-full relative flex items-center justify-center p-4 md:p-8 font-sans overflow-hidden">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/register')} 
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

      {/* Card Wrapper */}
      <div className="w-full max-w-md z-10 bg-white manga-border manga-shadow p-8 relative overflow-hidden">
        {/* Manga accent top line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-manga-red" />
        
        {/* Content */}
        <div className="text-center space-y-6">
          {/* Icon Badge */}
          <div className="inline-flex items-center justify-center w-14 h-14 bg-manga-paper rounded-none manga-border manga-shadow-sm text-manga-red mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="font-manga text-3xl font-extrabold tracking-tight uppercase text-manga-ink">
              XÁC THỰC TÀI KHOẢN
            </h1>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-500">
              <Mail className="w-3.5 h-3.5" />
              <span>Gửi đến: <strong className="text-manga-ink font-bold">{email}</strong></span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-0.5 bg-manga-ink opacity-20 my-4" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input boxes block */}
            <div className="space-y-3">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-manga-ink text-left">
                Nhập mã OTP 6 số:
              </label>
              
              <div className="flex justify-between gap-2" onPaste={handlePaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    pattern="\d*"
                    maxLength={1}
                    value={digit}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    onChange={(e) => handleChange(e.target.value, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className={`w-12 h-14 text-center font-manga text-2xl font-bold bg-manga-paper border-2 manga-shadow-sm focus:outline-none transition-all
                      ${activeInput === idx 
                        ? 'border-manga-red scale-105 shadow-[3px_3px_0px_0px_rgba(230,57,70,1)]' 
                        : 'border-manga-ink'
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-manga-red border border-manga-red/30 py-2.5 px-4 text-xs font-bold text-left manga-shadow-sm animate-pulse">
                ⚠️ {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isOtpComplete || loading}
              className="w-full bg-manga-red text-white font-bold uppercase tracking-widest py-3.5 px-8 manga-border manga-shadow-sm hover:translate-y-0.5 hover:manga-shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:manga-shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                'Đang xác thực...'
              ) : (
                <>
                  Hoàn tất đăng ký <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Resend and Counter */}
          <div className="pt-2 text-xs font-bold text-manga-ink">
            {canResend ? (
              <button 
                onClick={handleResend}
                className="inline-flex items-center gap-1.5 text-manga-red hover:underline uppercase decoration-2 underline-offset-4"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Gửi lại mã OTP
              </button>
            ) : (
              <span className="text-gray-400">
                Gửi lại mã OTP sau: <span className="text-manga-ink font-extrabold">{timer}s</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Manga-style Success/Info Modal */}
      {modal.show && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-[4px] border-manga-ink manga-shadow p-6 max-w-sm w-full relative transform scale-100 transition-all animate-bounce-short">
            {/* Manga accent corner tag */}
            <div className="absolute -top-3.5 left-4 bg-manga-ink text-white text-[10px] font-extrabold uppercase px-3 py-1 tracking-widest border-2 border-white">
              Thông báo
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4 pt-2">
              {/* Type Badge icon */}
              <div className={`w-14 h-14 rounded-none border-2 border-manga-ink flex items-center justify-center font-bold text-2xl manga-shadow-sm
                ${modal.type === 'success' ? 'bg-[#e8f5e9] text-green-600' : ''}
                ${modal.type === 'info' ? 'bg-[#e3f2fd] text-blue-600' : ''}
                ${modal.type === 'error' ? 'bg-manga-red/10 text-manga-red' : ''}
              `}>
                {modal.type === 'success' ? '✨' : modal.type === 'info' ? 'ℹ️' : '⚠️'}
              </div>
              
              <h2 className="font-manga text-xl font-bold uppercase tracking-tight text-manga-ink">
                {modal.title}
              </h2>
              
              <p className="text-xs font-bold text-gray-500 leading-relaxed">
                {modal.message}
              </p>
              
              {/* Comic action buttons */}
              <button
                onClick={() => {
                  setModal(prev => ({ ...prev, show: false }))
                  if (modal.onConfirm) modal.onConfirm()
                }}
                className="w-full mt-4 bg-manga-red hover:bg-manga-ink text-white font-extrabold uppercase tracking-widest py-3 border-2 border-manga-ink manga-shadow-sm hover:translate-y-0.5 hover:manga-shadow-none transition-all duration-150 cursor-pointer"
              >
                Đồng ý (OK)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
