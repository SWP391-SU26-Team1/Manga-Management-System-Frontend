import React, { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { mangakaStore } from "@/data/mangakaMockData";

export default function CreateSeriesPage() {
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [status, setStatus] = useState("Draft");
  const [nextDeadline, setNextDeadline] = useState("");
  const [publishSchedule, setPublishSchedule] = useState("Weekly");
  const [editorNote, setEditorNote] = useState("");

  // Validation state
  const [errors, setErrors] = useState<{
    title?: string;
    tags?: string;
    description?: string;
  }>({});

  const validateForm = () => {
    const tempErrors: typeof errors = {};
    if (!title.trim()) {
      tempErrors.title = "Tên tác phẩm không được để trống";
    }
    if (!tags.trim()) {
      tempErrors.tags = "Vui lòng nhập ít nhất một thể loại";
    }
    if (!description.trim() || description.trim().length < 20) {
      tempErrors.description = "Mô tả cốt truyện phải tối thiểu 20 ký tự";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const tagsArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Call store action to add series
    mangakaStore.addSeries({
      title: title.trim(),
      description: description.trim(),
      tags: tagsArray,
      coverUrl: coverUrl.trim() || null,
      status: status as "Draft" | "In Production" | "Waiting Review" | "Published",
      nextDeadline: nextDeadline || "Chưa thiết lập",
    });

    alert("Tạo tác phẩm mới thành công!");
    navigate("/dashboard/mangaka/series");
  };

  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-manga-ink hover:text-manga-red transition-colors mb-4 focus:outline-none"
      >
        <ArrowLeft className="w-4 h-4" />
        QUAY LẠI DANH SÁCH
      </button>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="font-manga text-4xl md:text-5xl font-bold uppercase text-manga-ink leading-none">
          TẠO TÁC PHẨM MỚI
        </h1>
        <div className="h-1.5 w-24 bg-manga-red mt-3" />
      </div>

      {/* Form Container */}
      <div className="bg-white border-4 border-manga-ink p-6 md:p-8 manga-shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Warning Alert Box */}
          <div className="bg-red-50/50 border-2 border-manga-red p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-manga-red flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-manga text-sm font-bold uppercase tracking-wider text-manga-red">
                LƯU Ý XUẤT BẢN TÁC PHẨM
              </h4>
              <p className="text-xs font-bold text-red-900 leading-relaxed">
                Tác phẩm mới được tạo sẽ ở trạng thái Bản nháp. Khi gửi hồ sơ cho Editor phê duyệt, hệ thống sẽ tự động gửi thông báo cho Ban biên tập để xem xét cốt truyện và thiết kế nhân vật trước khi tiến hành vẽ.
              </p>
            </div>
          </div>

          {/* Title input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-manga-ink">
              TÊN TÁC PHẨM (SERIES TITLE) <span className="text-manga-red">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Ánh Sáng Nơi Chân Trời"
              className={`w-full px-4 py-2.5 border-2 border-manga-ink focus:outline-none focus:border-manga-red font-bold text-sm bg-transparent ${
                errors.title ? "border-manga-red" : ""
              }`}
            />
            {errors.title && (
              <p className="text-xs font-bold text-manga-red mt-1">{errors.title}</p>
            )}
          </div>

          {/* Tags input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-manga-ink">
              PHÂN LOẠI THỂ LOẠI (TAGS - NGĂN CÁCH BẰNG DẤU PHẨY) <span className="text-manga-red">*</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ví dụ: Action, Shonen, Fantasy, Comedy"
              className={`w-full px-4 py-2.5 border-2 border-manga-ink focus:outline-none focus:border-manga-red font-bold text-sm bg-transparent ${
                errors.tags ? "border-manga-red" : ""
              }`}
            />
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
              THÊM CÁC TAG CHÍNH XÁC ĐỂ THUẬN TIỆN CHO VIỆC PHÂN LOẠI THAM CHIẾU.
            </p>
            {errors.tags && (
              <p className="text-xs font-bold text-manga-red mt-1">{errors.tags}</p>
            )}
          </div>

          {/* Description input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-manga-ink">
              TÓM TẮT CỐT TRUYỆN (MÔ TẢ - TỐI THIỂU 20 KÝ TỰ) <span className="text-manga-red">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả tóm tắt nội dung chính, tuyến nhân vật chính, xung đột chính trong tác phẩm..."
              className={`w-full px-4 py-2.5 border-2 border-manga-ink focus:outline-none focus:border-manga-red font-bold text-sm bg-transparent resize-y ${
                errors.description ? "border-manga-red" : ""
              }`}
            />
            {errors.description && (
              <p className="text-xs font-bold text-manga-red mt-1">{errors.description}</p>
            )}
          </div>

          {/* Grid fields: Cover URL & Default Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-manga-ink">
                ẢNH BÌA MOCKUP (IMAGE URL)
              </label>
              <input
                type="text"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-4 py-2.5 border-2 border-manga-ink focus:outline-none focus:border-manga-red font-bold text-sm bg-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-manga-ink">
                TRẠNG THÁI BAN ĐẦU
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-manga-ink focus:outline-none focus:border-manga-red font-bold text-sm bg-white"
              >
                <option value="Draft">Bản nháp (Draft)</option>
                <option value="Waiting Review">Chờ duyệt (Waiting Review)</option>
                <option value="In Production">Đang vẽ (In Production)</option>
              </select>
            </div>
          </div>

          {/* Grid fields: Deadline & Publish Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-manga-ink">
                THỜI HẠN NỘP BẢN VẼ TIẾP THEO (DEADLINE)
              </label>
              <input
                type="date"
                value={nextDeadline}
                onChange={(e) => setNextDeadline(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-manga-ink focus:outline-none focus:border-manga-red font-bold text-sm bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-manga-ink">
                LỊCH PHÁT HÀNH DỰ KIẾN
              </label>
              <select
                value={publishSchedule}
                onChange={(e) => setPublishSchedule(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-manga-ink focus:outline-none focus:border-manga-red font-bold text-sm bg-white"
              >
                <option value="Weekly">Weekly (Hàng tuần)</option>
                <option value="Monthly">Monthly (Hàng tháng)</option>
                <option value="Special">Special (Đặc biệt)</option>
              </select>
            </div>
          </div>

          {/* Editor Note area */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-manga-ink">
              GHI CHÚ GỬI KÈM EDITOR & TRỢ LÝ
            </label>
            <textarea
              rows={3}
              value={editorNote}
              onChange={(e) => setEditorNote(e.target.value)}
              placeholder="Yêu cầu riêng về tiến độ, nét vẽ thô hoặc dải tone màu chủ đạo cho các trợ lý..."
              className="w-full px-4 py-2.5 border-2 border-manga-ink focus:outline-none focus:border-manga-red font-bold text-sm bg-transparent resize-y"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-1/2 py-3 px-6 border-2 border-manga-ink bg-white hover:bg-red-50/30 text-manga-ink font-bold font-manga text-lg uppercase tracking-wider transition-colors focus:outline-none"
            >
              HỦY BỎ
            </button>
            <button
              type="submit"
              className="w-full sm:w-1/2 py-3 px-6 border-2 border-manga-ink bg-manga-red hover:bg-red-600 text-white font-bold font-manga text-lg uppercase tracking-wider transition-colors manga-shadow-sm hover:translate-y-0.5 hover:shadow-none focus:outline-none"
            >
              LƯU & GỬI PHÊ DUYỆT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
