import React, { useState, useEffect } from 'react'
import { ShieldAlert, Award, FileText, UserCheck, EyeOff, Trash2, HelpCircle, ChevronDown, CheckCircle2, ArrowRight, RefreshCw, Cpu, Undo, Users } from 'lucide-react'

export default function CopyrightPage() {
  const [activeSection, setActiveSection] = useState('section-1')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const sections = [
    { id: 'section-1', title: '1. Quyền của tác giả', icon: Award },
    { id: 'section-2', title: '2. Cam kết của MangaFlow', icon: CheckCircle2 },
    { id: 'section-3', title: '3. Quy trình báo cáo vi phạm', icon: FileText },
    { id: 'section-4', title: '4. Hình thức xử lý', icon: ShieldAlert },
    { id: 'section-5', title: '5. Chính sách Fanart & Doujinshi', icon: Users },
    { id: 'section-6', title: '6. Tuyên bố về AI Content', icon: Cpu },
  ]

  const steps = [
    { num: '01', title: 'Phát hiện vi phạm', desc: 'Tác giả phát hiện tác phẩm của mình bị sao chép hoặc đăng tải trái phép.' },
    { num: '02', title: 'Gửi báo cáo', desc: 'Cung cấp bằng chứng sở hữu và liên kết vi phạm thông qua biểu mẫu hỗ trợ.' },
    { num: '03', title: 'Xác minh thông tin', desc: 'Đội ngũ kiểm duyệt kiểm tra tính xác thực của bằng chứng trong 24h.' },
    { num: '04', title: 'Tạm ẩn tác phẩm', desc: 'Tác phẩm bị báo cáo sẽ tạm thời ẩn đi để tránh phát sinh tranh chấp.' },
    { num: '05', title: 'Kết luận hoặc Khiếu nại ngược', desc: 'Người bị báo cáo gửi Khiếu nại ngược kèm file sketch/PSD chứng minh nguồn gốc.' },
    { num: '06', title: 'Khôi phục hoặc Xóa', desc: 'Gỡ bỏ vĩnh viễn nội dung vi phạm hoặc khôi phục lại truyện nếu khiếu nại thành công.' }
  ]

  const faqs = [
    {
      q: 'Tác giả có giữ bản quyền sau khi đăng truyện lên MangaFlow không?',
      a: 'Hoàn toàn CÓ. Tác giả giữ 100% quyền sở hữu trí tuệ đối với tác phẩm của mình. MangaFlow chỉ đóng vai trò phân phối hiển thị.'
    },
    {
      q: 'Tôi có thể gỡ/xóa truyện của mình khỏi nền tảng bất cứ lúc nào không?',
      a: 'Có. Tác giả có toàn quyền gỡ bỏ hoặc ẩn tác phẩm của mình bất kỳ lúc nào trực tiếp từ Phòng Làm Việc Mangaka.'
    },
    {
      q: 'MangaFlow có hỗ trợ giải quyết tranh chấp pháp lý ngoài đời không?',
      a: 'Chúng tôi hỗ trợ cung cấp lịch sử log đăng tải và xác thực tài khoản để tác giả làm bằng chứng bảo vệ quyền lợi trước pháp luật.'
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
            <Award className="w-96 h-96" />
          </div>
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="uppercase tracking-widest font-bold bg-white text-manga-red px-3 py-1 text-xs rounded-full">
              Sở Hữu Trí Tuệ
            </span>
            <h1 className="font-manga text-4xl md:text-6xl font-black uppercase tracking-tight">
              Bản Quyền Tác Phẩm
            </h1>
            <p className="text-sm md:text-base font-semibold opacity-90 leading-relaxed">
              Chúng tôi tôn trọng tuyệt đối quyền sở hữu trí tuệ của mọi tác giả. Hãy cùng MangaFlow xây dựng sân chơi văn minh, an toàn và công bằng cho cộng đồng sáng tác.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold bg-[#b51724] inline-block px-4 py-2 rounded-md">
              <span>Có hiệu lực kể từ: 01/08/2026</span>
              <span className="opacity-60">|</span>
              <span className="flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" /> Phiên bản 1.1</span>
            </div>
            <p className="text-[11px] font-bold opacity-75 italic">
              * Chúng tôi có quyền cập nhật chính sách này. Những thay đổi quan trọng sẽ được thông báo qua email hoặc banner trên trang chủ 30 ngày trước khi chính thức có hiệu lực.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sticky Sidebar Outline */}
        <aside className="lg:col-span-1 hidden lg:block">
          <div className="sticky top-28 bg-white dark:bg-zinc-800 p-6 manga-border manga-shadow rounded-lg space-y-4">
            <h3 className="font-manga text-lg font-black uppercase text-manga-red tracking-wide border-b-2 border-manga-ink pb-2">
              Bản Quyền Tác Giả
            </h3>
            <nav className="space-y-1">
              {sections.map((sec) => {
                const Icon = sec.icon || Users
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
              <Award className="w-6 h-6" /> 1. Quyền của tác giả
            </h2>
            <p className="text-gray-600 dark:text-zinc-300 font-medium">
              Khi đăng tải tác phẩm lên MangaFlow, các quyền lợi cốt lõi dưới đây của tác giả luôn được bảo vệ tối đa:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: '✍️', title: 'Giữ nguyên quyền sở hữu', desc: 'Tác giả giữ toàn bộ bản quyền tác phẩm gốc của mình.' },
                { icon: '📚', title: 'Quyền tự do xuất bản', desc: 'Có thể mang truyện đi xuất bản giấy hoặc đăng tải ở nền tảng khác.' },
                { icon: '💰', title: 'Doanh thu & Kiếm tiền', desc: 'Được tham gia các chương trình chia sẻ doanh thu quảng cáo/donate.' },
                { icon: '🛡️', title: 'Hỗ trợ bảo vệ bản quyền', desc: 'Được hỗ trợ gỡ bỏ tác phẩm lậu, re-upload không xin phép.' }
              ].map((card, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-zinc-700 p-5 rounded-lg manga-border flex gap-4">
                  <span className="text-3xl">{card.icon}</span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-manga-ink dark:text-white">{card.title}</h4>
                    <p className="text-xs font-semibold text-gray-500 dark:text-zinc-300">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2 */}
          <section id="section-2" className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-6">
            <h2 className="font-manga text-2xl font-black uppercase border-b-2 border-manga-ink pb-2 flex items-center gap-3 text-manga-red">
              <CheckCircle2 className="w-6 h-6" /> 2. Cam kết của MangaFlow
            </h2>
            <p className="text-gray-600 dark:text-zinc-300 font-medium">
              Để tác giả an tâm sáng tác, MangaFlow cam kết tuyệt đối tuân thủ 4 nguyên tắc vàng:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold">
              {[
                'Không bán hay thương mại hóa tác phẩm gốc khi chưa có thỏa thuận.',
                'Không can thiệp, chỉnh sửa nội dung hoặc nét vẽ của tác giả.',
                'Không tự ý chuyển nhượng quyền khai thác tác phẩm cho bên thứ ba.',
                'Không sử dụng hình ảnh tác phẩm ngoài mục đích quảng bá cho nền tảng.'
              ].map((text, idx) => (
                <div key={idx} className="bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-900 p-4 rounded-lg flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">✓</div>
                  <span className="text-emerald-800 dark:text-emerald-400">{text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3 */}
          <section id="section-3" className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-6">
            <h2 className="font-manga text-2xl font-black uppercase border-b-2 border-manga-ink pb-2 flex items-center gap-3 text-manga-red">
              <FileText className="w-6 h-6" /> 3. Quy trình báo cáo & Khiếu nại ngược
            </h2>
            <p className="text-gray-600 dark:text-zinc-300 font-medium">
              Quy trình tiếp nhận xử lý tranh chấp bản quyền và cơ chế khiếu nại ngược dành cho tác giả:
            </p>
            
            {/* Horizontal Timeline */}
            <div className="relative pl-6 border-l-4 border-manga-red space-y-8">
              {steps.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-11 top-0 w-8 h-8 rounded-full bg-manga-ink text-white border-2 border-manga-red flex items-center justify-center font-bold text-xs">
                    {step.num}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-manga-ink dark:text-white flex items-center gap-2">
                      {step.title}
                    </h4>
                    <p className="text-xs font-semibold text-gray-500 dark:text-zinc-300 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Counter Notice Information Box */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-900 p-5 rounded-lg space-y-2 mt-6">
              <h4 className="font-bold text-sm text-amber-800 dark:text-amber-400 flex items-center gap-2">
                <Undo className="w-4 h-4" /> Cơ chế Khiếu nại ngược (Counter-Notice) cho tác giả bị báo cáo oan
              </h4>
              <p className="text-xs text-amber-700 dark:text-zinc-300 leading-relaxed font-semibold">
                Nếu tác phẩm của bạn bị tạm ẩn do báo cáo đạo nhái không chính xác, bạn có quyền gửi <strong>Đơn khiếu nại ngược</strong> kèm theo các bằng chứng xác thực (bao gồm: file phác thảo sketch thô, file phân cảnh PSD/Clip Studio, tệp tin chứa dữ liệu ngày tạo gốc). MangaFlow sẽ tiến hành đối chất công khai giữa hai bên trước khi đưa ra quyết định khôi phục lại truyện.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section id="section-4" className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-6">
            <h2 className="font-manga text-2xl font-black uppercase border-b-2 border-manga-ink pb-2 flex items-center gap-3 text-manga-red">
              <ShieldAlert className="w-6 h-6" /> 4. Các hình thức xử lý vi phạm
            </h2>
            <p className="text-gray-600 dark:text-zinc-300 font-medium">
              Tùy theo tính chất nghiêm trọng của hành vi vi phạm, MangaFlow áp dụng các mức xử lý kỷ luật sau:
            </p>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-zinc-700">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-manga-ink text-white">
                    <th className="p-4 font-bold">Mức Độ</th>
                    <th className="p-4 font-bold">Biện Pháp Xử Lý</th>
                    <th className="p-4 font-bold">Thời Hạn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-700 font-semibold text-gray-700 dark:text-zinc-300">
                  <tr className="hover:bg-gray-50 dark:hover:bg-zinc-700">
                    <td className="p-4 text-amber-600 dark:text-amber-400">⚠️ Mức 1</td>
                    <td className="p-4">Cảnh cáo bằng văn bản qua thông báo hệ thống / email</td>
                    <td className="p-4">Tức thì</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-zinc-700">
                    <td className="p-4 text-orange-600 dark:text-orange-400">🚫 Mức 2</td>
                    <td className="p-4">Tạm ẩn hoặc khóa tạm thời tác phẩm bị tranh chấp bản quyền</td>
                    <td className="p-4">3 - 7 ngày chờ xác minh</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-zinc-700">
                    <td className="p-4 text-red-600 dark:text-red-400">🔥 Mức 3</td>
                    <td className="p-4">Khóa tài khoản đăng truyện vi phạm (không được đăng tải truyện mới)</td>
                    <td className="p-4">30 ngày</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-zinc-700">
                    <td className="p-4 text-red-700 dark:text-red-500">❌ Mức 4</td>
                    <td className="p-4">Xóa vĩnh viễn tài khoản và mọi dữ liệu liên quan khỏi hệ thống</td>
                    <td className="p-4">Vĩnh viễn</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5 */}
          <section id="section-5" className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-6">
            <h2 className="font-manga text-2xl font-black uppercase border-b-2 border-manga-ink pb-2 flex items-center gap-3 text-manga-red">
              <Users className="w-6 h-6" /> 5. Chính sách đối với tác phẩm phái sinh (Fanart / Doujinshi)
            </h2>
            <p className="text-gray-600 dark:text-zinc-300 font-medium leading-relaxed">
              MangaFlow khuyến khích tinh thần sáng tạo phong phú, tuy nhiên có ranh giới rõ ràng về bản quyền phái sinh:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded-lg border-2 border-emerald-300 dark:border-emerald-900 space-y-3 font-semibold text-xs leading-relaxed">
                <h4 className="font-bold text-emerald-800 dark:text-emerald-400">🟢 Được phép đăng tải (Tôn vinh tác phẩm gốc)</h4>
                <p className="text-gray-600 dark:text-zinc-300">
                  - Các nét vẽ Fanart cá nhân phi thương mại.
                  <br />
                  - Truyện chế vui, Doujinshi đăng tải miễn phí cho cộng đồng, không khóa chương trả phí.
                  <br />
                  - Có gắn tag/ghi nhận tác giả và liên kết đến bộ truyện gốc.
                </p>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/20 p-5 rounded-lg border-2 border-rose-300 dark:border-rose-900 space-y-3 font-semibold text-xs leading-relaxed">
                <h4 className="font-bold text-rose-700 dark:text-rose-400">❌ Nghiêm cấm (Vi phạm bản quyền trục lợi)</h4>
                <p className="text-gray-600 dark:text-zinc-300">
                  - Khóa chương Premium thu tiền đối với truyện phái sinh sử dụng tài sản trí tuệ của tác giả khác khi chưa xin phép.
                  <br />
                  - Kinh doanh thương mại các ấn phẩm phái sinh lạm dụng bản quyền.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section id="section-6" className="bg-white dark:bg-zinc-800 p-6 md:p-8 manga-border manga-shadow rounded-lg space-y-6">
            <h2 className="font-manga text-2xl font-black uppercase border-b-2 border-manga-ink pb-2 flex items-center gap-3 text-manga-red">
              <Cpu className="w-6 h-6" /> 6. Tuyên bố về tác phẩm do trí tuệ nhân tạo tạo ra (AI-Generated Content)
            </h2>
            <p className="text-gray-600 dark:text-zinc-300 font-medium leading-relaxed">
              MangaFlow tôn trọng tính nguyên bản của nghệ thuật thủ công, đồng thời quy chuẩn hóa nội dung AI:
            </p>
            <div className="bg-[#111115] text-white p-5 rounded-lg manga-border space-y-3 font-semibold text-xs leading-relaxed">
              <p>
                🤖 <strong>Quy định gắn thẻ bắt buộc:</strong> Các bộ truyện sử dụng ảnh vẽ hoàn toàn bằng AI (Midjourney, Stable Diffusion, NovelAI...) hoặc có sự hỗ trợ đáng kể từ AI bắt buộc phải bật tag phân loại <code>AI-Generated</code> hoặc <code>AI-Assisted</code> khi đăng tải truyện.
              </p>
              <p>
                ⚠️ <strong>Bản quyền tranh chấp AI:</strong> MangaFlow không hỗ trợ giải quyết bản quyền cho các tác phẩm AI tự động không chứng minh được tính sáng tạo của con người. Tác giả tự chịu mọi rủi ro pháp lý nếu tác phẩm AI xâm phạm dữ liệu tranh của họa sĩ khác.
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

          {/* CTA Section */}
          <div className="bg-manga-ink text-white p-8 rounded-lg manga-border manga-shadow text-center space-y-4">
            <h3 className="font-manga text-2xl font-bold uppercase tracking-wider">
              Phát Hiện Vi Phạm Bản Quyền?
            </h3>
            <p className="text-zinc-400 text-sm font-semibold max-w-lg mx-auto">
              MangaFlow cam kết xử lý nhanh chóng trong vòng 24 giờ kể từ khi nhận đủ tài liệu chứng minh. Hãy bảo vệ sản phẩm chất xám của bạn ngay hôm nay.
            </p>
            <div className="pt-2">
              <button className="bg-manga-red hover:bg-red-600 text-white font-bold uppercase py-3 px-8 tracking-widest manga-border hover:translate-y-1 transition-all">
                Gửi Báo Cáo Ngay
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
