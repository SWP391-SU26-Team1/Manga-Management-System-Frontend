import React from 'react'
import { Monitor, Moon, Sun, Settings } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

export default function WebPreferencesPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12 px-4 sm:px-6 lg:px-8 dark:bg-zinc-900 transition-colors"
         style={{ backgroundImage: 'radial-gradient(#d1d5db 2px, transparent 2px)', backgroundSize: '32px 32px' }}>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-zinc-800 border-[4px] border-black p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-4 mb-8 border-b-[3px] border-black pb-6">
            <div className="w-12 h-12 bg-manga-red flex items-center justify-center border-[2px] border-black">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-manga text-3xl font-bold uppercase text-black dark:text-white">Cài Đặt Trang Web</h1>
              <p className="text-gray-500 dark:text-gray-400 font-bold">Tùy chỉnh trải nghiệm cá nhân của bạn</p>
            </div>
          </div>

          {/* Theme Section */}
          <div className="space-y-6">
            <div>
              <h2 className="font-manga text-xl font-bold uppercase text-black dark:text-white mb-2">Giao Diện</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-bold mb-4">Chọn giao diện sáng, tối hoặc theo hệ thống.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center justify-center p-6 border-[3px] transition-all
                  ${theme === 'light' 
                    ? 'border-manga-red bg-red-50 shadow-[4px_4px_0px_#e53e3e] translate-x-[-2px] translate-y-[-2px]' 
                    : 'border-black bg-white hover:bg-gray-50 shadow-[4px_4px_0px_rgba(0,0,0,1)]'}`}
              >
                <Sun className={`w-8 h-8 mb-3 ${theme === 'light' ? 'text-manga-red' : 'text-black'}`} />
                <span className={`font-bold uppercase ${theme === 'light' ? 'text-manga-red' : 'text-black'}`}>Sáng</span>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center justify-center p-6 border-[3px] transition-all
                  ${theme === 'dark' 
                    ? 'border-manga-red bg-zinc-800 shadow-[4px_4px_0px_#e53e3e] translate-x-[-2px] translate-y-[-2px]' 
                    : 'border-black bg-white hover:bg-gray-50 shadow-[4px_4px_0px_rgba(0,0,0,1)]'}`}
              >
                <Moon className={`w-8 h-8 mb-3 ${theme === 'dark' ? 'text-manga-red' : 'text-black'}`} />
                <span className={`font-bold uppercase ${theme === 'dark' ? 'text-manga-red' : 'text-black'}`}>Tối</span>
              </button>

              <button
                onClick={() => setTheme('system')}
                className={`flex flex-col items-center justify-center p-6 border-[3px] transition-all
                  ${theme === 'system' 
                    ? 'border-manga-red bg-red-50 shadow-[4px_4px_0px_#e53e3e] translate-x-[-2px] translate-y-[-2px]' 
                    : 'border-black bg-white hover:bg-gray-50 shadow-[4px_4px_0px_rgba(0,0,0,1)]'}`}
              >
                <Monitor className={`w-8 h-8 mb-3 ${theme === 'system' ? 'text-manga-red' : 'text-black'}`} />
                <span className={`font-bold uppercase ${theme === 'system' ? 'text-manga-red' : 'text-black'}`}>Hệ thống</span>
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
