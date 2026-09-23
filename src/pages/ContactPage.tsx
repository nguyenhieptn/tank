import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { submitInquiry } from "@/lib/api";
import { MapPin, Phone, Mail, Clock, Send, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    province: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullname.trim() || !formData.phone.trim()) {
      toast.error("Vui lòng điền họ tên và số điện thoại liên hệ.");
      return;
    }

    setSubmitting(true);
    const res = await submitInquiry(formData);
    setSubmitting(false);

    if (res.success) {
      toast.success(res.message);
      setSubmitted(true);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-10">
        <div className="container max-w-5xl mx-auto px-4">
          <nav className="flex items-center space-x-2 text-xs md:text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">Liên hệ & Tư vấn tuyển sinh</span>
          </nav>

          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-4 w-1.5 bg-destructive rounded" />
              <span className="text-xs uppercase tracking-widest text-destructive font-bold">
                Kênh liên lạc chính thức
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-primary font-bold">
              Liên hệ & Tiếp nhận Thông tin Tuyển sinh
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
              Trường Sĩ quan Tăng thiết giáp luôn sẵn sàng giải đáp mọi thắc mắc của thí sinh, phụ huynh và chiến sĩ về các tiêu chuẩn sức khỏe, lý lịch chính trị, phương thức xét tuyển và thủ tục nhập học năm 2026.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Info Cards */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5">
                <h2 className="font-display text-lg text-primary font-bold border-b border-border pb-3">
                  Cổng Thông Tin Nhà Trường
                </h2>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                    <MapPin className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase font-semibold">Địa chỉ đóng quân:</div>
                    <div className="text-sm font-medium text-foreground mt-0.5">
                      Xã Kim Long, huyện Tam Dương, tỉnh Vĩnh Phúc
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                    <Phone className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase font-semibold">Hotline Ban Tuyển sinh:</div>
                    <div className="text-sm font-medium text-foreground mt-0.5">
                      0211.3865.234 - 0987.654.321
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                    <Mail className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase font-semibold">Hộp thư điện tử:</div>
                    <div className="text-sm font-medium text-foreground mt-0.5">
                      tuyensinh.sqttg@mod.gov.vn
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                    <Clock className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase font-semibold">Thời gian trực tư vấn:</div>
                    <div className="text-sm font-medium text-foreground mt-0.5">
                      Thứ Hai — Thứ Bảy (07:30 - 17:00)
                    </div>
                  </div>
                </div>
              </div>

              {/* Badges / Military Note */}
              <div className="p-5 bg-primary/5 border-l-4 border-destructive rounded-r-xl text-xs text-foreground/80 leading-relaxed">
                <strong className="text-destructive uppercase block mb-1">Lưu ý đối với thí sinh:</strong>
                Tất cả thí sinh đăng ký dự tuyển vào Trường Sĩ quan Tăng thiết giáp bắt buộc phải qua sơ tuyển tại Ban Tuyển sinh quân sự cấp huyện/quận nơi đăng ký thường trú.
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-7">
              <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
                    <h3 className="font-display text-2xl text-primary font-bold">
                      Gửi Thông Tin Thành Công!
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                      Cảm ơn bạn đã gửi câu hỏi. Ban Tuyển sinh Nhà trường đã tiếp nhận và sẽ liên hệ trực tiếp qua số điện thoại để hỗ trợ hướng dẫn chi tiết.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ fullname: "", phone: "", province: "", message: "" });
                      }}
                      className="mt-4 text-xs"
                    >
                      Gửi thêm câu hỏi khác
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <h2 className="font-display text-xl text-primary font-bold">
                        Đăng Ký Tư Vấn & Đặt Câu Hỏi
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        Điền thông tin bên dưới, cán bộ tư vấn tuyển sinh sẽ phản hồi nhanh chóng.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="text-xs font-semibold text-foreground block mb-1.5">
                          Họ và tên thí sinh / phụ huynh <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="text"
                          placeholder="Nguyễn Văn A"
                          value={formData.fullname}
                          onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                          required
                          className="h-10 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-foreground block mb-1.5">
                          Số điện thoại liên hệ <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="tel"
                          placeholder="098xxxxxxxx"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                          className="h-10 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1.5">
                        Tỉnh / Thành phố thường trú
                      </label>
                      <Input
                        type="text"
                        placeholder="Ví dụ: Vĩnh Phúc, Hà Nội, Nghệ An..."
                        value={formData.province}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        className="h-10 text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1.5">
                        Nội dung cần tư vấn (Tiêu chuẩn sức khỏe, điểm chuẩn, hồ sơ sơ tuyển...)
                      </label>
                      <Textarea
                        rows={4}
                        placeholder="Nhập nội dung câu hỏi của bạn tại đây..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="text-sm resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-sm font-semibold gap-2 shadow-sm"
                    >
                      {submitting ? (
                        "Đang gửi thông tin..."
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Gửi Thông Tin Đến Ban Tuyển Sinh
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
