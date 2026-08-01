import React, { useState, useEffect } from 'react'
import { Shield, BookOpen, AlertTriangle, UserCheck, XOctagon, UserX, Info, HelpCircle, ChevronDown, Check } from 'lucide-react'

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('section-1')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const sections = [
    { id: 'section-1', title: '1. Đối tượng áp dụng', icon: UserCheck },
    { id: 'section-2', title: '2. Điều kiện sử dụng', icon: Shield },
    { id: 'section-3', title: '3. Nội dung bị cấm', icon: XOctagon },
    { id: 'section-4', title: '4. Quyền và trách nhiệm', icon: BookOpen },
    { id: 'section-5', title: '5. Chấm dứt tài khoản', icon: UserX },
    { id: 'section-6', title: '6. Miễn trừ trách nhiệm', icon: Info },
  ]

  const faqs = [
    {
      q: 'Trẻ em dưới 13 tuổi có được sử dụng MangaFlow không?',
      a: 'Để đảm bảo an toàn nội dung, MangaFlow chỉ dành cho người dùng từ đủ 13 tuổi trở lên. Người dùng dưới 13 tuổi không được phép đăng ký tài khoản.'
    },
    {
      q: 'MangaFlow có quyền xóa truyện mà không báo trước không?',
      a: 'Có. Nếu tác phẩm vi phạm nghiêm trọng bản quyền hoặc các tiêu chuẩn cộng đồng (nội dung cấm, bạo lực, khiêu dâm), MangaFlow có quyền ẩn hoặc xóa vĩnh viễn nội dung đó ngay lập tức.'
    },
    {
      q: 'Tôi có thể chia sẻ tài khoản của mình cho người khác dùng chung không?',
      a: 'Không. Bạn phải bảo mật thông tin tài khoản của mình và chịu hoàn toàn trách nhiệm về mọi hoạt động diễn ra dưới tên tài khoản của bạn.'
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
      {/* 1. Hero Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="bg-[#E63946] text-white p-8 md:p-12 manga-border manga-shadow relative overflow-hidden rounded-lg">
          <div className="absolute right-0 top-0 opacity-10 translate-x-12 -translate-y-6">
            <Shield className="w-96 h-96" />
          </div>
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="uppercase tracking-widest font-bold bg-white text-manga-red px-3 py-1 text-xs rounded-full">
              Pháp lý & Cộng đồng
            </span>
            <h1 className="font-manga text-4xl md:text-6xl font-black uppercase tracking-tight">
              Điều Khoản Sử Dụng
            </h1>
            <p className="text-sm md:text-base font-semibold opacity-90 leading-relaxed">
              Chào mừng bạn đến với MangaFlow. Khi sử dụng nền tảng của chúng tôi, bạn đồng ý tuân thủ các điều khoản dưới đây nhằm xây dựng một cộng đồng sáng tạo manga an toàn, minh bạch và tôn trọng bản quyền.
            </p>
            <div className="text-xs font-bold bg-[#b51724] inline-block px-4 py-2 rounded-md">
              Có hiệu lực kể từ: 01/08/2026
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 2. Sticky Sidebar Outline */}
        <aside className="lg:col-span-1 hidden lg:block">
          <div className="sticky top-28 bg-white dark:bg-zinc-800 p-6 manga-border manga-shadow rounded-lg space-y-4">
            <h3 className="font-manga text-lg font-black uppercase text-manga-red tracking-wide border-b-2 border-manga-ink pb-2">
              Mục Lục Điều Khoản
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

        {/* 3. Main content */}
        <div className="lg:col-span-3 space-y-12">
          
          {/* Section 1 */}
          <section id="section-1" className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-6">
            <h2 className="font-manga text-2xl font-black uppercase border-b-2 border-manga-ink pb-2 flex items-center gap-3 text-manga-red">
              <UserCheck className="w-6 h-6" /> 1. Đối tượng áp dụng
            </h2>
            <p className="text-gray-600 dark:text-zinc-300 font-medium">
              Điều khoản này áp dụng cho toàn bộ các cá nhân và tổ chức tương tác hoặc hoạt động trên nền tảng MangaFlow, bao gồm:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Người đọc (Reader)', 'Tác giả (Mangaka)', 'Cộng tác viên / Trợ lý (Assistant)', 'Đối tác và Nhà xuất bản'].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-700 p-4 rounded-lg manga-border">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">✓</div>
                  <span className="font-bold text-sm">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2 */}
          <section id="section-2" className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-6">
            <h2 className="font-manga text-2xl font-black uppercase border-b-2 border-manga-ink pb-2 flex items-center gap-3 text-manga-red">
              <Shield className="w-6 h-6" /> 2. Điều kiện sử dụng
            </h2>
            <p className="text-gray-600 dark:text-zinc-300 font-medium">
              Để tham gia nền tảng, người dùng cam kết đáp ứng và duy trì đầy đủ các điều kiện sau:
            </p>
            <div className="space-y-3 font-semibold text-sm">
              {[
                'Từ đủ 13 tuổi trở lên (hoặc có sự đồng ý giám hộ hợp pháp của cha mẹ).',
                'Cung cấp thông tin đăng ký chính xác, đầy đủ và tự chịu trách nhiệm về tính xác thực.',
                'Không chia sẻ thông tin đăng nhập tài khoản cho bên thứ ba dưới mọi hình thức.',
                'Không gian lận, thao túng số liệu lượt xem, lượt thích hoặc bình luận trên hệ thống.'
              ].map((text, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-manga-red flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-zinc-200">{text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3 */}
          <section id="section-3" className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-6">
            <h2 className="font-manga text-2xl font-black uppercase border-b-2 border-manga-ink pb-2 flex items-center gap-3 text-manga-red">
              <XOctagon className="w-6 h-6" /> 3. Nội dung bị cấm
            </h2>
            <p className="text-gray-600 dark:text-zinc-300 font-medium">
              Bất kỳ hành vi đăng tải nội dung hoặc tương tác nào vi phạm các mục dưới đây đều bị xử lý nghiêm khắc:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Nội dung khiêu dâm', desc: 'Nghiêm cấm các hình ảnh, nét vẽ gợi dục, vi phạm đạo đức thuần phong mỹ tục.' },
                { title: 'Kích động bạo lực', desc: 'Không đăng nội dung thù ghét, khủng bố, hoặc khuyến khích làm hại bản thân.' },
                { title: 'Vi phạm pháp luật', desc: 'Không buôn bán chất cấm, vũ khí hoặc hướng dẫn các hành vi trái pháp luật.' },
                { title: 'Spam quảng cáo', desc: 'Không spam bình luận quảng cáo, lừa đảo, hoặc link chứa phần mềm độc hại.' },
                { title: 'Mạo danh người khác', desc: 'Không giả mạo thông tin của tác giả khác, biên tập viên hay đội ngũ MangaFlow.' },
                { title: 'Hack & Tấn công hệ thống', desc: 'Nghiêm cấm dò lỗi bảo mật, sử dụng bot cào dữ liệu hoặc tấn công DDoSs.' }
              ].map((card, idx) => (
                <div key={idx} className="bg-rose-50 dark:bg-rose-950/20 p-5 rounded-lg border-2 border-rose-300 dark:border-rose-900 space-y-2">
                  <h4 className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                    🚫 {card.title}
                  </h4>
                  <p className="text-xs font-semibold text-rose-600/90 dark:text-rose-300/80 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4 */}
          <section id="section-4" className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-6">
            <h2 className="font-manga text-2xl font-black uppercase border-b-2 border-manga-ink pb-2 flex items-center gap-3 text-manga-red">
              <BookOpen className="w-6 h-6" /> 4. Quyền và trách nhiệm
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-manga text-xl font-bold uppercase tracking-wider text-manga-ink dark:text-white border-l-4 border-emerald-500 pl-3">
                  Người dùng & Tác giả
                </h3>
                <ul className="space-y-2 text-sm font-semibold text-gray-600 dark:text-zinc-300">
                  <li className="flex items-center gap-2">🟢 Được đọc manga và bình luận lành mạnh.</li>
                  <li className="flex items-center gap-2">🟢 Được tự do đăng tải tác phẩm do chính mình sáng tác.</li>
                  <li className="flex items-center gap-2">🟢 Tự bảo vệ quyền sở hữu trí tuệ của tác phẩm.</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-manga text-xl font-bold uppercase tracking-wider text-manga-ink dark:text-white border-l-4 border-manga-red pl-3">
                  MangaFlow Platform
                </h3>
                <ul className="space-y-2 text-sm font-semibold text-gray-600 dark:text-zinc-300">
                  <li className="flex items-center gap-2">🔴 Có quyền kiểm duyệt nội dung trước khi xuất bản.</li>
                  <li className="flex items-center gap-2">🔴 Khóa vĩnh viễn tài khoản có dấu hiệu gian lận, hack.</li>
                  <li className="flex items-center gap-2">🔴 Xóa bỏ mọi nội dung vi phạm mà không cần báo trước.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="section-5" className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-6">
            <h2 className="font-manga text-2xl font-black uppercase border-b-2 border-manga-ink pb-2 flex items-center gap-3 text-manga-red">
              <UserX className="w-6 h-6" /> 5. Chấm dứt tài khoản
            </h2>
            <p className="text-gray-600 dark:text-zinc-300 font-medium">
              Chúng tôi có quyền tạm khóa hoặc chấm dứt vĩnh viễn quyền truy cập tài khoản của bạn nếu xảy ra các hành vi:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {['Vi phạm bản quyền', 'Spam liên tục', 'Gian lận số liệu', 'Tấn công hệ thống'].map((reason, idx) => (
                <div key={idx} className="bg-zinc-100 dark:bg-zinc-700 p-4 rounded-lg manga-border text-center">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-manga-red" />
                  <span className="font-bold text-xs">{reason}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 6 */}
          <section id="section-6" className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-6">
            <h2 className="font-manga text-2xl font-black uppercase border-b-2 border-manga-ink pb-2 flex items-center gap-3 text-manga-red">
              <Info className="w-6 h-6" /> 6. Miễn trừ trách nhiệm
            </h2>
            <p className="text-gray-600 dark:text-zinc-300 font-medium leading-relaxed">
              MangaFlow là nền tảng kết nối và hỗ trợ sáng tạo. Chúng tôi không chịu trách nhiệm pháp lý đối với:
            </p>
            <ul className="space-y-3 font-semibold text-sm">
              <li className="flex items-start gap-2">
                <span className="text-manga-red">⚠️</span>
                <span>Nội dung truyện hoặc bình luận do chính người dùng tự ý đăng tải lên nền tảng.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-manga-red">⚠️</span>
                <span>Các liên kết dẫn ra website của bên thứ ba bên ngoài hệ thống MangaFlow.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-manga-red">⚠️</span>
                <span>Sự cố mất dữ liệu tạm thời do lỗi đường truyền mạng hoặc sự kiện bất khả kháng.</span>
              </li>
            </ul>
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

          {/* CTA Section */}
          <div className="bg-manga-ink text-white p-8 rounded-lg manga-border manga-shadow text-center space-y-4">
            <h3 className="font-manga text-2xl font-bold uppercase tracking-wider">
              Bạn Cần Hỗ Trợ Pháp Lý Hoặc Báo Cáo Vi Phạm?
            </h3>
            <p className="text-zinc-400 text-sm font-semibold max-w-lg mx-auto">
              Nếu bạn nhận thấy bất kỳ hành vi nào vi phạm điều khoản của MangaFlow, hãy liên hệ ngay với ban quản trị để được hỗ trợ giải quyết sớm nhất.
            </p>
            <div className="pt-2">
              <button className="bg-manga-red hover:bg-red-600 text-white font-bold uppercase py-3 px-8 tracking-widest manga-border hover:translate-y-1 transition-all">
                Gửi Hỗ Trợ Ngay
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
