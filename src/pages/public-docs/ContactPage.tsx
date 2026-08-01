import React, { useState } from 'react'
import { Mail, HelpCircle, ChevronDown, Send, MessageSquare, MapPin, Clock, Upload, Handshake, Users, Sparkles, Code, Globe, Volume2, Download, BarChart2, Star, Quote, RefreshCw } from 'lucide-react'

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    org: '',
    message: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const faqs = [
    {
      q: 'Thời gian phản hồi thông tin hợp tác là bao lâu?',
      a: 'Sau khi nhận được đầy đủ đề án/thông tin liên hệ của bạn, đội ngũ phát triển MangaFlow sẽ xem xét và phản hồi chi tiết trong vòng 24 - 48 giờ làm việc.'
    },
    {
      q: 'MangaFlow có chính sách tài trợ cho các nhóm dịch hoặc họa sĩ độc lập không?',
      a: 'Có. Chúng tôi có ngân sách tài trợ dành riêng cho các dự án tiềm năng, nhóm dịch chất lượng cao và họa sĩ có kế hoạch phát hành tác phẩm định kỳ.'
    }
  ]

  const partners = [
    { title: 'Tác giả độc lập', icon: Users, desc: 'Mangaka muốn đưa tác phẩm lên nền tảng số hóa.' },
    { title: 'Nhà xuất bản', icon: Handshake, desc: 'Hợp tác phát hành bản in vật lý cho các đầu truyện hot.' },
    { title: 'Studio vẽ truyện', icon: Sparkles, desc: 'Tuyển trợ lý, cộng tác dự án vẽ gấp rút.' },
    { title: 'Nhóm dịch thuật', icon: Volume2, desc: 'Bản địa hóa manga nước ngoài sang tiếng Việt chính quy.' },
    { title: 'Trường học nghệ thuật', icon: Globe, desc: 'Tổ chức các buổi workshop sáng tác, kết nối sinh viên.' },
    { title: 'Doanh nghiệp thương mại', icon: Code, desc: 'Tài trợ quảng cáo, kết nối API hệ sinh thái.' }
  ]

  const formsOfPartnership = [
    { title: 'Đăng truyện độc quyền', tag: 'Content' },
    { title: 'Quảng bá & Truyền thông', tag: 'Marketing' },
    { title: 'Tài trợ & Đầu tư', tag: 'Finance' },
    { title: 'Sự kiện & Workshop', tag: 'Event' },
    { title: 'Tích hợp API hệ thống', tag: 'Tech' },
    { title: 'Chương trình Affiliate', tag: 'Partnership' }
  ]

  const testimonials = [
    {
      author: 'Mangaka Phong Trương',
      work: 'Tác giả bộ truyện "Lửa Đêm Đông"',
      quote: 'MangaFlow đã giúp tôi tối ưu hóa hoàn toàn quy trình bàn giao phân cảnh cho trợ lý. Doanh thu Premium từ nền tảng giúp tôi an tâm sống với nghề sáng tác.'
    },
    {
      author: 'Trưởng nhóm dịch ComicVibe',
      work: 'Hơn 50 bộ truyện chuyển ngữ',
      quote: 'Hệ thống quản lý bản thảo và phân chia tác vụ thông minh của MangaFlow giúp nhóm dịch của chúng tôi tăng 40% hiệu suất làm việc so với trước.'
    }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', org: '', message: '' })
      setFile(null)
    }, 3000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F9FB] dark:bg-zinc-900 text-manga-ink dark:text-zinc-100 transition-colors py-12 px-4 md:px-8">
      {/* Hero Landing Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="bg-[#E63946] text-white p-8 md:p-16 manga-border manga-shadow relative overflow-hidden rounded-lg text-center space-y-6">
          <div className="absolute right-0 top-0 opacity-10 translate-x-12 -translate-y-6">
            <Handshake className="w-96 h-96" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <span className="uppercase tracking-widest font-bold bg-white text-manga-red px-3 py-1 text-xs rounded-full">
              Kết Nối & Hợp Tác
            </span>
            <h1 className="font-manga text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">
              Liên Hệ Hợp Tác
            </h1>
            <p className="text-base md:text-lg font-semibold opacity-90 leading-relaxed max-w-xl mx-auto">
              Hợp tác cùng MangaFlow để xây dựng cộng đồng sáng tác manga lớn mạnh, đưa tác phẩm Việt Nam tiếp cận hàng triệu độc giả.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => {
                  document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="bg-manga-ink hover:bg-zinc-800 text-white font-bold uppercase py-4 px-8 tracking-widest manga-border manga-shadow hover:translate-y-1 hover:manga-shadow-sm transition-all"
              >
                Liên Hệ Ngay
              </button>
              {/* Media Kit Download Button */}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  alert('Tải xuống gói Media Kit (Logo vector, mã màu thương hiệu MangaFlow) thành công!')
                }}
                className="bg-white hover:bg-gray-100 text-manga-ink font-bold uppercase py-4 px-8 tracking-widest manga-border manga-shadow hover:translate-y-1 hover:manga-shadow-sm transition-all flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" /> Tải Media Kit
              </a>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold bg-[#b51724] inline-block px-4 py-2 rounded-md">
              <span>Cập nhật ngày: 01/08/2026</span>
              <span className="opacity-60">|</span>
              <span className="flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" /> Phiên bản 1.1</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Social Proof / Stats Strip */}
        <section className="bg-manga-ink text-white p-6 rounded-lg manga-border manga-shadow">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-zinc-700">
            <div className="pt-4 md:pt-0">
              <h3 className="font-manga text-3xl md:text-5xl font-black text-manga-red">100+</h3>
              <p className="text-xs uppercase tracking-wider font-bold text-zinc-400 mt-1">Tác giả hoạt động</p>
            </div>
            <div className="pt-4 md:pt-0">
              <h3 className="font-manga text-3xl md:text-5xl font-black text-manga-red">50,000+</h3>
              <p className="text-xs uppercase tracking-wider font-bold text-zinc-400 mt-1">Độc giả đăng ký</p>
            </div>
            <div className="pt-4 md:pt-0">
              <h3 className="font-manga text-3xl md:text-5xl font-black text-manga-red">500,000+</h3>
              <p className="text-xs uppercase tracking-wider font-bold text-zinc-400 mt-1">Lượt đọc hàng tháng</p>
            </div>
            <div className="pt-4 md:pt-0">
              <h3 className="font-manga text-3xl md:text-5xl font-black text-manga-red">5,000+</h3>
              <p className="text-xs uppercase tracking-wider font-bold text-zinc-400 mt-1">Chương truyện sáng tác</p>
            </div>
          </div>
        </section>

        {/* Section 1: Partners we work with */}
        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-manga text-3xl font-black uppercase text-manga-red">
              Chúng Tôi Hợp Tác Với ai?
            </h2>
            <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">
              MangaFlow luôn hoan nghênh và tìm kiếm đối tác đồng hành lâu dài trong hệ sinh thái truyện tranh.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {partners.map((p, idx) => {
              const Icon = p.icon
              return (
                <div key={idx} className="bg-white dark:bg-zinc-800 p-6 rounded-lg manga-border manga-shadow space-y-3">
                  <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/20 border border-manga-red rounded-lg flex items-center justify-center text-manga-red">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-manga-ink dark:text-white">{p.title}</h4>
                  <p className="text-xs font-semibold text-gray-500 dark:text-zinc-300 leading-relaxed">{p.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Section 2: Form of Partnership */}
        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-manga text-3xl font-black uppercase text-manga-red">
              Các Hình Thức Hợp Tác
            </h2>
            <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">
              Chọn cách thức tốt nhất để hai bên cùng gia tăng giá trị.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {formsOfPartnership.map((form, idx) => (
              <div key={idx} className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-lg manga-border text-center space-y-2 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-manga-red">{form.tag}</span>
                <h4 className="font-bold text-xs text-manga-ink dark:text-white leading-tight">{form.title}</h4>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials section */}
        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-manga text-3xl font-black uppercase text-manga-red">
              Đồng Hành Cùng Thành Công
            </h2>
            <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">
              Chia sẻ từ các họa sĩ và đối tác đã tin tưởng và đồng hành cùng sự phát triển của MangaFlow.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white dark:bg-zinc-800 p-6 rounded-lg manga-border manga-shadow relative space-y-4">
                <Quote className="w-12 h-12 text-zinc-200 dark:text-zinc-700 absolute right-4 top-4" />
                <p className="text-sm font-semibold italic text-gray-600 dark:text-zinc-300 leading-relaxed relative z-10">
                  "{t.quote}"
                </p>
                <div className="border-t border-gray-100 dark:border-zinc-700 pt-3">
                  <h4 className="font-bold text-sm text-manga-ink dark:text-white">{t.author}</h4>
                  <p className="text-xs font-semibold text-manga-red">{t.work}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Contact Form & Info */}
        <div id="contact-form" className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Form */}
          <div className="lg:col-span-3 bg-white dark:bg-zinc-800 p-6 md:p-8 rounded-lg manga-border manga-shadow space-y-6">
            <h3 className="font-manga text-2xl font-black uppercase text-manga-red border-b border-gray-200 dark:border-zinc-700 pb-3 flex items-center gap-2">
              <Send className="w-5 h-5" /> Đăng Ký Liên Hệ Hợp Tác
            </h3>
            
            {submitted ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-900 p-6 rounded-lg text-center space-y-3">
                <span className="text-3xl">🎉</span>
                <h4 className="font-bold text-emerald-800 dark:text-emerald-400">Gửi thông tin thành công!</h4>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                  Chúng tôi đã tiếp nhận hồ sơ liên hệ của bạn và sẽ phản hồi qua email sớm nhất có thể.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Tên của bạn / Đối tác</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 rounded-lg manga-border font-semibold text-sm bg-gray-50 dark:bg-zinc-700 focus:outline-none focus:bg-white"
                      placeholder="Ví dụ: Nguyễn Văn A"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Địa chỉ Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-3 rounded-lg manga-border font-semibold text-sm bg-gray-50 dark:bg-zinc-700 focus:outline-none focus:bg-white"
                      placeholder="email@doi-tac.com"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Tên Đơn vị / Cơ quan (Nếu có)</label>
                  <input
                    type="text"
                    value={formData.org}
                    onChange={(e) => setFormData({ ...formData, org: e.target.value })}
                    className="w-full p-3 rounded-lg manga-border font-semibold text-sm bg-gray-50 dark:bg-zinc-700 focus:outline-none focus:bg-white"
                    placeholder="Ví dụ: NXB Kim Đồng / Studio X"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Nội dung đề án hợp tác</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-3 rounded-lg manga-border font-semibold text-sm bg-gray-50 dark:bg-zinc-700 focus:outline-none focus:bg-white resize-none"
                    placeholder="Mô tả tóm tắt ý tưởng, hình thức hoặc đề nghị hợp tác..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Hồ sơ / Đề án gửi kèm</label>
                  <div className="manga-border border-dashed p-4 rounded-lg bg-gray-50 dark:bg-zinc-700 text-center hover:bg-gray-100 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 mx-auto text-manga-red mb-2" />
                    <span className="text-xs font-bold text-gray-500 block">
                      {file ? file.name : 'Tải lên tài liệu (.pdf, .docx, .zip) tối đa 10MB'}
                    </span>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-manga-red hover:bg-red-600 text-white font-bold uppercase py-3.5 tracking-widest manga-border manga-shadow hover:translate-y-1 hover:manga-shadow-sm transition-all"
                  >
                    Gửi Thông Tin Liên Hệ
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Info Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Contact Details */}
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg manga-border manga-shadow space-y-4">
              <h3 className="font-manga text-xl font-black uppercase text-manga-ink dark:text-white border-b-2 border-manga-ink pb-2">
                Thông Tin Liên Hệ Trực Tiếp
              </h3>
              <div className="space-y-3 font-semibold text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-manga-red" />
                  <span className="text-gray-700 dark:text-zinc-200">partner@mangaflow.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-manga-red" />
                  <span className="text-gray-700 dark:text-zinc-200">discord.gg/mangaflow-partner</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-manga-red" />
                  <span className="text-gray-700 dark:text-zinc-200">Khu Công Nghệ Cao, Quận 9, Thành Phố Hồ Chí Minh</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-manga-red" />
                  <span className="text-gray-700 dark:text-zinc-200">8:30 - 18:00 (Từ Thứ Hai đến Thứ Sáu)</span>
                </div>
              </div>
            </div>

            {/* Accordion FAQ */}
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg manga-border manga-shadow space-y-4">
              <h3 className="font-manga text-xl font-black uppercase text-manga-ink dark:text-white border-b-2 border-manga-ink pb-2">
                Giải Đáp Nhanh
              </h3>
              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="manga-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-700 font-bold text-left text-xs transition-colors hover:bg-gray-100"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                    </button>
                    {openFaq === idx && (
                      <div className="p-3 bg-white dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-700 text-xs font-semibold text-gray-500 dark:text-zinc-300 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* CTA Banner */}
        <div className="bg-manga-ink text-white p-8 rounded-lg manga-border manga-shadow text-center space-y-4">
          <h3 className="font-manga text-3xl font-black uppercase tracking-wider">
            Gia nhập cộng đồng MangaFlow ngay hôm nay.
          </h3>
          <p className="text-zinc-400 text-sm font-semibold max-w-lg mx-auto">
            Hơn 100 tác giả và nhóm dịch lớn nhỏ đã gia nhập. Hãy cùng đồng hành và đưa ngành manga phát triển mạnh mẽ.
          </p>
        </div>

      </div>
    </div>
  )
}
