import React, { useState, useEffect } from 'react'
import { Rocket, FileText, Users, CheckCircle2, Award, Sparkles, Cpu, BookOpen, ArrowUpRight, BarChart2, ShieldCheck, Star, MessageSquare, Plus, RefreshCw, Layers, Check } from 'lucide-react'

export default function PublishingWorkflowPage() {
  const [activeStep, setActiveStep] = useState(0)

  const stats = [
    { value: '1,248', label: 'Series Hoạt Động', icon: BookOpen },
    { value: '356', label: 'Mangaka Đăng Ký', icon: Users },
    { value: '42', label: 'Biên Tập Viên (Editor)', icon: ShieldCheck },
    { value: '18,539', label: 'Chapters Đã Xuất Bản', icon: Rocket }
  ]

  const pipeline = [
    { title: 'Idea', desc: 'Ý tưởng cốt truyện thô sơ, tạo dựng tạo hình nhân vật sơ bộ.' },
    { title: 'Proposal', desc: 'Đăng ký đề án, tóm tắt truyện, thể loại và lập kế hoạch số lượng chương.' },
    { title: 'Editorial Review', desc: 'Hội đồng biên tập đánh giá, góp ý và chấm điểm thông qua.' },
    { title: 'Production', desc: 'Hợp tác trợ lý vẽ nét, đổ nền, lên màu và hoàn thiện bản nháp chương.' },
    { title: 'Quality Review', desc: 'Biên tập viên Tantou duyệt bản vẽ chi tiết, kiểm định chính tả và bố cục.' },
    { title: 'Publishing', desc: 'Hệ thống tự động đẩy chương truyện mới lên trang chủ và ứng dụng di động.' },
    { title: 'Feedback', desc: 'Nhận bình luận, số lượt thích và đánh giá sao từ độc giả.' },
    { title: 'Growth', desc: 'Theo dõi chỉ số tăng trưởng độc giả để tối ưu hóa và tăng doanh thu.' }
  ]

  const steps = [
    {
      title: 'Bước 1: Gửi Đề Xuất Series (Mangaka)',
      badge: 'Pending Proposal',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      desc: 'Tác giả khởi tạo dự án trên hệ thống làm việc. Cung cấp đầy đủ thông tin: Tên tác phẩm, Tóm tắt nội dung, Thể loại chính/phụ, Thiết kế bìa tiêu chuẩn và Đề án phát hành dự kiến.',
      details: 'Sau khi lưu nháp, tác giả có thể sửa đổi và bấm "Gửi Đề Xuất" để gửi tới Ban Biên Tập.'
    },
    {
      title: 'Bước 2: Ban Biên Tập Chấm Điểm (Editorial Board)',
      badge: 'Approved ➔ In Progress',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      desc: 'Hội đồng Ban Biên Tập tiến hành xem xét tính khả thi thương mại và chất lượng nội dung. Bộ truyện phải nhận đủ số phiếu thuận tối thiểu và điểm trung bình đạt chuẩn mới được cấp phép hoạt động.',
      details: 'Khi đạt chuẩn, hệ thống tự động đổi trạng thái sang "In Progress" và chỉ định Biên tập viên Tantou đồng hành.'
    },
    {
      title: 'Bước 3: Giai Đoạn Sáng Tác (Mangaka & Trợ lý)',
      badge: 'Active Work',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      desc: 'Tác giả thiết lập lịch trình đăng tải chương mới, tải lên kịch bản bản thảo chữ. Sử dụng Assign Task Studio để chia nhỏ trang vẽ và phân phối công việc cho đội ngũ Trợ lý trực thuộc studio.',
      details: 'Các trợ lý phối hợp vẽ khung nền, tô màu và đổ nét thô giúp rút ngắn 50% thời gian sáng tác.'
    },
    {
      title: 'Bước 4: Nộp Bản Thảo & Kiểm Duyệt (Tantou Editor)',
      badge: 'Under Review',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      desc: 'Khi chương truyện hoàn thành, tác giả bấm "Nộp Bản Thảo". Biên Tập Viên phụ trách (Tantou) sẽ trực tiếp kiểm tra từng khung hình và trang vẽ trên Page Viewer.',
      details: 'Tantou có quyền: Phê Duyệt (Approve), Yêu Cầu Chỉnh Sửa (Request Revision kèm ghi chú khoanh vùng lỗi trên trang vẽ), hoặc Từ Chối (Reject).'
    },
    {
      title: 'Bước 5: Xuất Bản Công Khai (System)',
      badge: 'Published',
      badgeColor: 'bg-pink-100 text-pink-800 border-pink-300',
      desc: 'Chương truyện sau khi được phê duyệt sẽ lập tức tự động xuất bản lên website và app của MangaFlow theo thời gian hẹn giờ trước, sẵn sàng tiếp cận hàng triệu độc giả.',
      details: 'Hệ thống tự động kích hoạt tính năng thông báo chương mới cho độc giả đang theo dõi bộ truyện.'
    }
  ]

  const roles = [
    {
      title: '🎨 Mangaka & Studio',
      color: 'bg-amber-50 dark:bg-amber-950/20 border-amber-300',
      desc: 'Đề xuất ý tưởng độc đáo, thiết lập sơ đồ kịch bản, quản lý tuyển dụng và phân công việc cho các trợ lý, trực tiếp sáng tác và tự chịu trách nhiệm về tiến độ ra chương mới.'
    },
    {
      title: '🛡️ Ban Biên Tập (Board)',
      color: 'bg-blue-50 dark:bg-blue-950/20 border-blue-300',
      desc: 'Đánh giá tiềm năng khai thác thương mại, định hướng cấu trúc nội dung phù hợp với thị hiếu thị trường, biểu quyết phê duyệt hoặc từ chối cấp phép cho các dự án truyện mới.'
    },
    {
      title: '🖋️ Tantou Editor',
      color: 'bg-rose-50 dark:bg-rose-950/20 border-rose-300',
      desc: 'Theo sát, định hướng chuyên môn cho Mangaka, đánh giá và để lại feedback chỉnh sửa chi tiết trên từng trang vẽ bản thảo, đảm bảo chất lượng hình ảnh và nội dung tốt nhất trước khi xuất bản.'
    }
  ]

  const featuredAuthor = {
    name: 'Họa sĩ Phong Trương',
    series: 'Lửa Đêm Đông',
    views: '2.4M lượt xem',
    followers: '85K người theo dõi',
    revenueShare: 'Top 1 Doanh thu Creator Tháng 7',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    cover: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    quote: 'Quy trình xét duyệt minh bạch và các góp ý chi tiết từ Tantou Editor trên MangaFlow đã giúp bộ truyện của tôi nâng tầm chất lượng nghệ thuật vượt bậc.'
  }

  return (
    <div className="min-h-screen bg-[#F9F9FB] dark:bg-zinc-900 text-manga-ink dark:text-zinc-100 transition-colors py-12 px-4 md:px-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="bg-[#E63946] text-white p-8 md:p-16 manga-border manga-shadow relative overflow-hidden rounded-lg">
          <div className="absolute right-0 top-0 opacity-10 translate-x-12 -translate-y-6">
            <Rocket className="w-96 h-96" />
          </div>
          <div className="relative z-10 max-w-3xl space-y-6">
            <span className="uppercase tracking-widest font-bold bg-white text-manga-red px-3 py-1 text-xs rounded-full">
              Publishing Workflow
            </span>
            <h1 className="font-manga text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">
              Hành Trình Xuất Bản Tại MangaFlow
            </h1>
            <p className="text-base md:text-lg font-semibold opacity-90 leading-relaxed max-w-xl">
              Biến ý tưởng thô sơ của bạn thành kiệt tác. Tìm hiểu cách MangaFlow đồng hành cùng các Mangaka từ bản thảo phác thảo đầu tiên cho đến khi tiếp cận hàng triệu độc giả.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="bg-manga-ink hover:bg-zinc-800 text-white font-bold uppercase py-4 px-8 tracking-widest manga-border manga-shadow hover:translate-y-1 hover:manga-shadow-sm transition-all"
              >
                Khám Phá Lộ Trình 🚀
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold bg-[#b51724] inline-block px-4 py-2 rounded-md">
              <span>Cập nhật ngày: 01/08/2026</span>
              <span className="opacity-60">|</span>
              <span className="flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" /> Phiên bản 1.1</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Progress Statistics */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="bg-white dark:bg-zinc-800 p-6 rounded-lg manga-border manga-shadow flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/20 border border-manga-red rounded-lg flex items-center justify-center text-manga-red flex-shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-manga text-2xl md:text-3xl font-black text-manga-ink dark:text-white leading-tight">
                    {stat.value}
                  </h3>
                  <p className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </section>

        {/* Publishing Pipeline Layout */}
        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-manga text-3xl font-black uppercase text-manga-red">
              Đường Ống Xuất Bản (Pipeline)
            </h2>
            <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">
              Tổng quan 8 chặng phát triển của một tác phẩm từ ý tưởng sơ khởi đến khi tăng trưởng vượt trội.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pipeline.map((pipe, idx) => (
              <div key={idx} className="bg-white dark:bg-zinc-800 p-5 rounded-lg manga-border flex flex-col justify-between space-y-2 hover:-translate-y-1 transition-transform">
                <span className="w-6 h-6 rounded-full bg-manga-ink text-white font-bold text-[10px] flex items-center justify-center border border-manga-red">
                  0{idx + 1}
                </span>
                <div>
                  <h4 className="font-bold text-sm text-manga-ink dark:text-white uppercase tracking-tight">{pipe.title}</h4>
                  <p className="text-[11px] font-semibold text-gray-500 dark:text-zinc-300 mt-1 leading-relaxed">{pipe.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline Stepper */}
        <section id="timeline" className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-manga text-3xl font-black uppercase text-manga-red">
              Các Bước Xuất Bản Chi Tiết
            </h2>
            <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">
              Các bước làm việc thực tế của tác giả và Ban biên tập trực tiếp trên hệ thống MangaFlow.
            </p>
          </div>

          <div className="relative border-l-4 border-manga-ink dark:border-zinc-700 pl-6 md:pl-12 space-y-12 max-w-4xl mx-auto">
            {steps.map((step, idx) => (
              <div key={idx} className="relative">
                {/* Connector Node */}
                <div className="absolute -left-12 md:-left-18 top-1.5 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border-4 border-manga-ink dark:border-zinc-300 flex items-center justify-center font-bold text-xs">
                  {idx + 1}
                </div>
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg manga-border manga-shadow space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-manga text-lg md:text-xl font-black text-manga-ink dark:text-white uppercase tracking-tight">
                      {step.title}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border-2 ${step.badgeColor}`}>
                      {step.badge}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-zinc-300 leading-relaxed">
                    {step.desc}
                  </p>
                  <p className="text-xs font-semibold text-gray-400 dark:text-zinc-400 border-t border-gray-100 dark:border-zinc-700 pt-2 italic">
                    💡 Hướng dẫn hệ thống: {step.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Workflow Diagram & Flowchart */}
        <section className="bg-white dark:bg-zinc-800 p-6 md:p-8 rounded-lg manga-border manga-shadow space-y-6">
          <h3 className="font-manga text-2xl font-black uppercase text-manga-red text-center">
            Sơ Đồ Luồng Tác Vụ (Workflow Diagram)
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-xs font-bold flex-wrap">
            {[
              { role: 'Mangaka', action: 'Khởi tạo Dự án' },
              { role: 'Ban Biên Tập', action: 'Duyệt Đề xuất' },
              { role: 'Studio Tác Giả', action: 'Phối hợp Trợ lý' },
              { role: 'Tantou Editor', action: 'Duyệt Chương' },
              { role: 'Hệ thống', action: 'Xuất bản công khai' },
              { role: 'Độc giả', action: 'Đọc & Tương tác' }
            ].map((node, idx, arr) => (
              <React.Fragment key={idx}>
                <div className="bg-zinc-100 dark:bg-zinc-700 p-4 rounded-lg manga-border border-2 text-center w-40 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-manga-red">{node.role}</span>
                  <p className="text-manga-ink dark:text-white text-xs">{node.action}</p>
                </div>
                {idx < arr.length - 1 && (
                  <span className="text-2xl text-manga-ink dark:text-zinc-400 rotate-90 md:rotate-0">➔</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* Roles Grid */}
        <section className="space-y-6">
          <h3 className="font-manga text-2xl font-black uppercase text-manga-red text-center">
            Vai Trò Trách Nhiệm Phân Định
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role, idx) => (
              <div key={idx} className={`p-6 rounded-lg border-2 manga-shadow ${role.color} space-y-3`}>
                <h4 className="font-manga text-lg font-black uppercase text-manga-ink dark:text-white">
                  {role.title}
                </h4>
                <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300 leading-relaxed">
                  {role.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* KPI Metrics & Quality Standards */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* KPI Card */}
          <div className="bg-white dark:bg-zinc-800 p-6 md:p-8 rounded-lg manga-border manga-shadow space-y-6">
            <h3 className="font-manga text-xl font-black uppercase border-b-2 border-manga-ink pb-2 text-manga-red flex items-center gap-2">
              <BarChart2 className="w-5 h-5" /> Chỉ Số Cam Kết Vận Hành (KPI)
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Thời gian xét duyệt trung bình (Review Time)', value: '2 - 5 Ngày làm việc' },
                { label: 'Tỷ lệ phát hành đúng hạn (Publish Rate)', value: '96% tổng số Series' },
                { label: 'Tỷ lệ chỉnh sửa thành công (Revision Success)', value: '91% sau 1 lần phản hồi' }
              ].map((kpi, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-zinc-700 p-4 rounded-lg manga-border">
                  <span className="text-xs font-bold text-gray-600 dark:text-zinc-300">{kpi.label}</span>
                  <span className="text-sm font-black text-manga-red">{kpi.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quality Standards */}
          <div className="bg-white dark:bg-zinc-800 p-6 md:p-8 rounded-lg manga-border manga-shadow space-y-6">
            <h3 className="font-manga text-xl font-black uppercase border-b-2 border-manga-ink pb-2 text-manga-red flex items-center gap-2">
              <Layers className="w-5 h-5" /> Tiêu chuẩn đánh giá chất lượng (Quality Standards)
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Nghệ thuật & Nét vẽ (Artwork)', score: 95 },
                { name: 'Nội dung & Kịch bản (Story)', score: 90 },
                { name: 'Tính nhất quán giữa các chương (Consistency)', score: 85 },
                { name: 'Font chữ & Sắp xếp thoại (Typography)', score: 88 }
              ].map((std, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>{std.name}</span>
                    <span>{std.score}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-zinc-700 h-3 rounded-full overflow-hidden border border-manga-ink">
                    <div className="bg-manga-red h-full" style={{ width: `${std.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Publishing Eligibility Checks */}
        <section className="bg-white dark:bg-zinc-800 p-6 md:p-8 rounded-lg manga-border manga-shadow space-y-6">
          <h3 className="font-manga text-2xl font-black uppercase text-manga-red text-center">
            Điều Kiện Chương Truyện Được Phê Duyệt Xuất Bản
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              'Cover tiêu chuẩn, ảnh bìa hiển thị sắc nét.',
              'Số trang của chương tối thiểu từ 15 trang (đối với Manga truyền thống) hoặc chiều dài ảnh chuẩn (đối với Webtoon).',
              'Đầy đủ thông tin chương (Chương số, Tên chương, Kịch bản chữ đính kèm).',
              'Bản vẽ hoàn thiện nét vẽ chính thức, không chứa các nét phác thảo thô bị lỗi.',
              'Được biên tập viên Tantou duyệt thông qua không còn yêu cầu revision.',
              'Nội dung và hình vẽ cam kết 100% không vi phạm luật bản quyền và thuần phong mỹ tục.'
            ].map((cond, idx) => (
              <div key={idx} className="bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-900 p-4 rounded-lg flex items-start gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{cond}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Community Actions */}
        <section className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg manga-border text-center space-y-4">
          <h4 className="font-manga text-xl font-black uppercase text-manga-ink dark:text-white">
            Sau Khi Chương Được Xuất Bản
          </h4>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              { label: 'Tương tác Like/Thích', icon: Star },
              { label: 'Bình luận chương truyện', icon: MessageSquare },
              { label: 'Hệ thống Đánh giá Sao', icon: Award },
              { label: 'Góp mặt trên BXH Tuần', icon: BarChart2 }
            ].map((action, idx) => {
              const Icon = action.icon
              return (
                <div key={idx} className="flex items-center gap-2 bg-white dark:bg-zinc-700 py-2.5 px-5 rounded-full border border-manga-ink font-bold text-xs">
                  <Icon className="w-4 h-4 text-manga-red" />
                  <span>{action.label}</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Steam-Like Featured Author Success Story */}
        <section className="bg-white dark:bg-zinc-800 p-6 md:p-8 rounded-lg manga-border manga-shadow space-y-6">
          <h3 className="font-manga text-2xl font-black uppercase text-manga-red text-center">
            Gương Mặt Tác Giả Nổi Bật (Featured Creator)
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 border-2 border-manga-ink p-4 md:p-6 rounded-lg bg-gray-50 dark:bg-zinc-700 relative overflow-hidden">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <img src={featuredAuthor.avatar} alt="avatar" className="w-16 h-16 rounded-full border-2 border-manga-ink" />
                <div>
                  <h4 className="font-bold text-base text-manga-ink dark:text-white">{featuredAuthor.name}</h4>
                  <p className="text-xs text-manga-red font-bold">{featuredAuthor.series}</p>
                </div>
              </div>
              <blockquote className="text-xs font-semibold text-gray-500 dark:text-zinc-300 italic bg-white dark:bg-zinc-800 p-4 rounded-lg border-l-4 border-manga-red">
                "{featuredAuthor.quote}"
              </blockquote>
            </div>
            
            <div className="lg:col-span-2 flex flex-col justify-center space-y-2 font-bold text-xs">
              <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-gray-200 dark:border-zinc-600 flex justify-between">
                <span className="text-gray-500">Lượt xem truyện:</span>
                <span className="text-manga-ink dark:text-white">{featuredAuthor.views}</span>
              </div>
              <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-gray-200 dark:border-zinc-600 flex justify-between">
                <span className="text-gray-500">Người theo dõi:</span>
                <span className="text-manga-ink dark:text-white">{featuredAuthor.followers}</span>
              </div>
              <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-gray-200 dark:border-zinc-600 flex justify-between">
                <span className="text-gray-500">Danh hiệu:</span>
                <span className="text-emerald-600 font-black">{featuredAuthor.revenueShare}</span>
              </div>
            </div>

            <div className="lg:col-span-1 flex items-center justify-center">
              <img src={featuredAuthor.cover} alt="cover" className="w-full h-32 lg:h-full object-cover rounded-lg border-2 border-manga-ink" />
            </div>
          </div>
        </section>

        {/* CTA Area */}
        <section className="bg-manga-ink text-white p-8 md:p-12 rounded-lg manga-border manga-shadow text-center space-y-6">
          <h3 className="font-manga text-3xl md:text-4xl font-black uppercase tracking-wider">
            Sẵn sàng mang tác phẩm của bạn lên sóng?
          </h3>
          <p className="text-zinc-400 text-sm font-semibold max-w-xl mx-auto leading-relaxed">
            MangaFlow cung cấp toàn bộ công cụ quản lý chương, điều phối trợ lý, và tương tác trực tiếp với Ban biên tập. Đăng ký Mangaka và khởi tạo dự án đầu tiên của bạn ngay hôm nay.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button className="bg-manga-red hover:bg-red-600 text-white font-bold uppercase py-4 px-8 tracking-widest manga-border manga-shadow hover:translate-y-1 hover:manga-shadow-sm transition-all text-sm">
              Khởi Tạo Bộ Truyện Mới
            </button>
            <button className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase py-4 px-8 tracking-widest border border-zinc-600 hover:translate-y-1 transition-all text-sm">
              Xem Dashboard Mangaka Demo
            </button>
          </div>
        </section>

      </div>
    </div>
  )
}
