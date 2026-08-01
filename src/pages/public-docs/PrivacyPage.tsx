import React, { useState, useEffect } from 'react'
import { ShieldAlert, Key, User, Database, Settings, HelpCircle, ChevronDown, CheckSquare, EyeOff, ShieldCheck, RefreshCw, Heart, Info } from 'lucide-react'

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState('section-1')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const sections = [
    { id: 'section-1', title: '1. Dữ liệu thu thập', icon: User },
    { id: 'section-2', title: '2. Mục đích sử dụng', icon: Database },
    { id: 'section-3', title: '3. Chia sẻ dữ liệu & Bên thứ 3', icon: EyeOff },
    { id: 'section-4', title: '4. Quyền của người dùng & Lưu trữ', icon: CheckSquare },
    { id: 'section-5', title: '5. Cơ chế bảo mật', icon: Key },
    { id: 'section-6', title: '6. Bảo vệ trẻ em (COPPA)', icon: Heart },
  ]

  const faqs = [
    {
      q: 'Làm thế nào để tôi có thể xóa vĩnh viễn tài khoản và dữ liệu?',
      a: 'Bạn có thể gửi yêu cầu xóa tài khoản trực tiếp trong trang Cá nhân -> Cài đặt bảo mật. Sau khi xác nhận, toàn bộ thông tin cá nhân của bạn sẽ bị gỡ bỏ vĩnh viễn sau 30 ngày.'
    },
    {
      q: 'MangaFlow có sử dụng Cookie để theo dõi tôi ngoài đời không?',
      a: 'Hoàn toàn không. Chúng tôi chỉ sử dụng Cookie kỹ thuật để duy trì phiên đăng nhập và ghi nhớ các cài đặt đọc truyện của riêng bạn trên trình duyệt.'
    }
  ]

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200
      for (const section of sections) {
        const el = document.getElementById(section.id)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 120,
        behavior: 'smooth'
      })
      setActiveSection(id)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F9FB] dark:bg-zinc-900 text-manga-ink dark:text-zinc-100 transition-colors py-12 px-4 md:px-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="bg-[#E63946] text-white p-8 md:p-12 manga-border manga-shadow relative overflow-hidden rounded-lg">
          <div className="absolute right-0 top-0 opacity-10 translate-x-12 -translate-y-6">
            <ShieldCheck className="w-96 h-96" />
          </div>
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="uppercase tracking-widest font-bold bg-white text-manga-red px-3 py-1 text-xs rounded-full">
              Quyền Riêng Tư
            </span>
            <h1 className="font-manga text-4xl md:text-6xl font-black uppercase tracking-tight">
              Chính Sách Bảo Mật
            </h1>
            <p className="text-sm md:text-base font-semibold opacity-90 leading-relaxed">
              Chúng tôi cam kết bảo mật tuyệt đối thông tin cá nhân và dữ liệu hoạt động sáng tác của người dùng trên toàn bộ hệ thống MangaFlow.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold bg-[#b51724] inline-block px-4 py-2 rounded-md">
              <span>Có hiệu lực kể từ: 01/08/2026</span>
              <span className="opacity-60">|</span>
              <span className="flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" /> Phiên bản 1.1</span>
            </div>
            <p className="text-[11px] font-bold opacity-75 italic">
              * Chúng tôi có quyền cập nhật chính sách bảo mật này. Những thay đổi quan trọng sẽ được thông báo qua email hoặc banner trên trang chủ 30 ngày trước khi chính thức có hiệu lực.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sticky Sidebar Outline */}
        <aside className="lg:col-span-1 hidden lg:block">
          <div className="sticky top-28 bg-white dark:bg-zinc-800 p-6 manga-border manga-shadow rounded-lg space-y-4">
            <h3 className="font-manga text-lg font-black uppercase text-manga-red tracking-wide border-b-2 border-manga-ink pb-2">
              Quyền Riêng Tư
            </h3>
            <nav className="space-y-1">
              {sections.map((sec) => {
                const Icon = sec.icon
                return (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm font-bold rounded-md transition-all ${
                      activeSection === sec.id
                        ? 'bg-manga-red text-white'
                        : 'hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{sec.title}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-12">
          
          {/* Section 1 */}
          <section id="section-1" className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-6">
            <h2 className="font-manga text-2xl font-black uppercase border-b-2 border-manga-ink pb-2 flex items-center gap-3 text-manga-red">
              <User className="w-6 h-6" /> 1. Dữ liệu thu thập
            </h2>
            <p className="text-gray-600 dark:text-zinc-300 font-medium">
              Để cung cấp trải nghiệm tốt nhất, MangaFlow tiến hành thu thập các nhóm dữ liệu sau:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Thông tin cá nhân', desc: 'Họ tên, Email, Ảnh đại diện (Avatar) dùng để nhận diện tài khoản.' },
                { title: 'Dữ liệu sử dụng', desc: 'Lịch sử đọc truyện, lịch sử tìm kiếm nhằm đồng bộ tiến độ cá nhân.' },
                { title: 'Cookie & Thiết bị', desc: 'Địa chỉ IP, loại trình duyệt, phiên đăng nhập hoạt động.' }
              ].map((card, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-zinc-700 p-5 rounded-lg manga-border space-y-2">
                  <span className="text-2xl">⚡</span>
                  <h4 className="font-bold text-sm text-manga-ink dark:text-white">{card.title}</h4>
                  <p className="text-xs font-semibold text-gray-500 dark:text-zinc-300 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2 */}
          <section id="section-2" className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-6">
            <h2 className="font-manga text-2xl font-black uppercase border-b-2 border-manga-ink pb-2 flex items-center gap-3 text-manga-red">
              <Database className="w-6 h-6" /> 2. Mục đích sử dụng thông tin
            </h2>
            <p className="text-gray-600 dark:text-zinc-300 font-medium">
              Mọi dữ liệu thu thập được sử dụng hợp pháp cho các mục đích cụ thể dưới đây:
            </p>
            
            <div className="relative pl-6 border-l-4 border-manga-red space-y-6">
              {[
                { title: 'Đăng nhập & Xác thực', desc: 'Đảm bảo quyền truy cập an toàn cho tài khoản cá nhân, tác giả, trợ lý.' },
                { title: 'Đồng bộ dữ liệu đa thiết bị', desc: 'Lưu tiến độ chương đang đọc dở giúp việc chuyển đổi thiết bị mượt mà.' },
                { title: 'Đề xuất truyện thông minh', desc: 'Phân tích thói quen đọc để gợi ý thể loại manga phù hợp với bạn.' },
                { title: 'Thông báo tức thì', desc: 'Gửi cảnh báo tiến độ bản thảo, task của trợ lý hoặc thông báo chương mới ra.' }
              ].map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-10 top-0.5 w-6 h-6 rounded-full bg-manga-ink text-white border border-manga-red flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <h4 className="font-bold text-sm text-manga-ink dark:text-white">{item.title}</h4>
                  <p className="text-xs font-semibold text-gray-500 dark:text-zinc-300 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3 */}
          <section id="section-3" className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-6">
            <h2 className="font-manga text-2xl font-black uppercase border-b-2 border-manga-ink pb-2 flex items-center gap-3 text-manga-red">
              <EyeOff className="w-6 h-6" /> 3. Cam kết chia sẻ dữ liệu & Dịch vụ Bên thứ ba
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-300 dark:border-rose-900 p-6 rounded-lg space-y-4">
                <h3 className="font-manga text-lg font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  MangaFlow cam kết KHÔNG
                </h3>
                <ul className="space-y-2 text-sm font-bold text-rose-600 dark:text-rose-300">
                  <li>❌ Bán dữ liệu người dùng dưới mọi hình thức.</li>
                  <li>❌ Cho thuê hoặc trao đổi dữ liệu cá nhân cho bên thứ ba.</li>
                  <li>❌ Tiết lộ trái phép thông tin liên lạc, tài khoản ngân hàng.</li>
                </ul>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-900 p-6 rounded-lg space-y-4">
                <h3 className="font-manga text-lg font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Chỉ chia sẻ khi
                </h3>
                <ul className="space-y-2 text-sm font-bold text-emerald-600 dark:text-emerald-300">
                  <li>✓ Có yêu cầu pháp lý bằng văn bản từ cơ quan chính phủ.</li>
                  <li>✓ Có sự đồng ý rõ ràng và chủ động từ phía người dùng.</li>
                  <li>✓ Bảo vệ lợi ích an toàn tối thượng của chính bạn.</li>
                </ul>
              </div>
            </div>

            {/* Third Party Services Box */}
            <div className="bg-zinc-900 text-white p-5 rounded-lg manga-border space-y-3 font-semibold text-xs leading-relaxed mt-4">
              <h4 className="font-manga text-sm text-manga-red uppercase tracking-wider">
                🔌 Dịch vụ của Bên thứ ba (Third-party Services)
              </h4>
              <p className="text-zinc-400">
                Chúng tôi có hợp tác với các nhà cung cấp dịch vụ bên ngoài để vận hành hệ thống. Các bên này chỉ được phép truy cập dữ liệu đã ẩn danh hóa hoặc xử lý bảo mật cho các tác vụ cụ thể:
              </p>
              <ul className="space-y-2 text-zinc-300 list-disc pl-4">
                <li><strong>Google Analytics:</strong> Sử dụng cookie ẩn danh để phân tích lưu lượng truy cập và thói quen trải nghiệm trên website.</li>
                <li><strong>VNPay / Stripe:</strong> Cổng thanh toán bên thứ ba xử lý trực tiếp các giao dịch nạp ví Coin đảm bảo an toàn tuyệt đối.</li>
                <li><strong>Firebase Cloud Messaging:</strong> Gửi thông báo đẩy (Push notification) về tiến độ công việc và cập nhật chương mới.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section id="section-4" className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-6">
            <h2 className="font-manga text-2xl font-black uppercase border-b-2 border-manga-ink pb-2 flex items-center gap-3 text-manga-red">
              <CheckSquare className="w-6 h-6" /> 4. Quyền của người dùng & Lưu trữ dữ liệu
            </h2>
            <p className="text-gray-600 dark:text-zinc-300 font-medium">
              Bạn có toàn quyền kiểm soát và định đoạt dữ liệu cá nhân của mình trên MangaFlow:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Tải xuống dữ liệu', desc: 'Có quyền trích xuất toàn bộ dữ liệu lịch sử hoạt động sáng tác.' },
                { title: 'Yêu cầu xóa tài khoản', desc: 'Xóa vĩnh viễn tài khoản và gỡ bỏ toàn bộ thông tin cá nhân.' },
                { title: 'Chỉnh sửa thông tin', desc: 'Chỉnh sửa họ tên, mật khẩu, cập nhật avatar bất cứ khi nào.' },
                { title: 'Thu hồi quyền đồng ý', desc: 'Từ chối các cookie phân tích tùy chọn trên trình duyệt.' }
              ].map((right, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-zinc-700 p-4 rounded-lg manga-border flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-manga-red text-white flex items-center justify-center font-bold text-xs flex-shrink-0">✓</div>
                  <div>
                    <h4 className="font-bold text-sm text-manga-ink dark:text-white">{right.title}</h4>
                    <p className="text-xs font-semibold text-gray-500 dark:text-zinc-300 mt-1">{right.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Data Retention Content Box */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-900 p-5 rounded-lg space-y-2 mt-4 font-semibold text-xs leading-relaxed">
              <h4 className="font-bold text-sm text-amber-800 dark:text-amber-400 flex items-center gap-2">
                ⏳ Thời gian lưu trữ dữ liệu (Data Retention Lifecycle)
              </h4>
              <p className="text-amber-700 dark:text-zinc-300">
                Khi người dùng chọn lệnh <strong>"Xóa tài khoản"</strong>, tài khoản của bạn sẽ được chuyển sang trạng thái chờ xóa. Toàn bộ dữ liệu được lưu giữ an toàn trên máy chủ thêm <strong>30 ngày</strong> đề phòng trường hợp bạn thay đổi ý định và muốn khôi phục lại tài khoản. Hết thời hạn 30 ngày này, hệ thống sẽ thực hiện xóa vĩnh viễn hoặc ẩn danh hóa hoàn toàn dữ liệu cá nhân của bạn không thể khôi phục.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section id="section-5" className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-6">
            <h2 className="font-manga text-2xl font-black uppercase border-b-2 border-manga-ink pb-2 flex items-center gap-3 text-manga-red">
              <Key className="w-6 h-6" /> 5. Cơ chế bảo mật kỹ thuật
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { title: 'Mã hóa SSL/TLS', text: 'Bảo mật luồng truyền dữ liệu.' },
                { title: 'Bảo mật HTTPS', text: 'Chống tấn công xen giữa.' },
                { title: 'Xác thực JWT', text: 'Mã hóa phiên đăng nhập.' },
                { title: 'Mã hóa AES-256', text: 'Mã hóa cơ sở dữ liệu lưu trữ.' },
                { title: 'Backup định kỳ', text: 'Khôi phục dữ liệu tức thì.' }
              ].map((tech, idx) => (
                <div key={idx} className="bg-zinc-100 dark:bg-zinc-700 p-4 rounded-lg manga-border text-center space-y-2 flex flex-col justify-between">
                  <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500" />
                  <div>
                    <h4 className="font-bold text-xs text-manga-ink dark:text-white leading-tight">{tech.title}</h4>
                    <p className="text-[10px] font-semibold text-gray-500 dark:text-zinc-300 mt-1">{tech.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 6 */}
          <section id="section-6" className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-6">
            <h2 className="font-manga text-2xl font-black uppercase border-b-2 border-manga-ink pb-2 flex items-center gap-3 text-manga-red">
              <Info className="w-6 h-6" /> 6. Bảo vệ Trẻ em (COPPA & GDPR-K Compliance)
            </h2>
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-900 p-5 rounded-lg space-y-3 font-semibold text-xs leading-relaxed">
              <h4 className="font-bold text-emerald-800 dark:text-emerald-400">🛡️ Cam kết bảo vệ trẻ vị thành niên</h4>
              <p className="text-gray-600 dark:text-zinc-300">
                MangaFlow cam kết tuân thủ các quy tắc bảo vệ trẻ em trên không gian mạng quốc tế. Chúng tôi <strong>không cố tình thu thập dữ liệu cá nhân của trẻ em dưới 13 tuổi</strong> mà không có sự đồng ý của phụ huynh. Nếu chúng tôi phát hiện bất kỳ tài khoản nào được tạo bởi người dùng dưới 13 tuổi khai gian tuổi đăng ký, chúng tôi sẽ lập tức khóa tài khoản và tiến hành gỡ bỏ toàn bộ dữ liệu liên quan khỏi máy chủ lưu trữ ngay lập tức.
              </p>
            </div>
          </section>

          {/* FAQ Accordion Section */}
          <section className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-6">
            <h2 className="font-manga text-2xl font-black uppercase border-b-2 border-manga-ink pb-2 flex items-center gap-3 text-manga-red">
              <HelpCircle className="w-6 h-6" /> Câu Hỏi Thường Gặp (FAQ)
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="manga-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-700 font-bold text-left transition-colors hover:bg-gray-100"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="p-4 bg-white dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-700 text-sm font-semibold text-gray-600 dark:text-zinc-300 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
