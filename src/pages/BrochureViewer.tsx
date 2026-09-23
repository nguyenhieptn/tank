import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ChevronRight, Download, BookOpen, ChevronLeft, ArrowRight, Shield, Award, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import brochureImg1 from "@/assets/hero-tanks.jpg";
import brochureImg2 from "@/assets/tank1.webp";
import { fetchAdmissions, AdmissionConfigData } from "@/lib/api";
import { getAssetUrl } from "@/lib/utils";

export const BrochureViewer = () => {
  const [activePage, setActivePage] = useState(0);
  const [admConfig, setAdmConfig] = useState<AdmissionConfigData | null>(null);

  useEffect(() => {
    fetchAdmissions().then((data) => {
      if (data) setAdmConfig(data);
    });
  }, []);

  const brochurePages = [
    {
      page: 1,
      title: `Trang Bìa: Cẩm Nang Tuyển Sinh Quân Sự ${admConfig?.target_year || 2026}`,
      subtitle: `${admConfig?.school_name || "Trường Sĩ quan Tăng thiết giáp"} — Đã ra quân là đánh thắng`,
      image: brochureImg1,
      highlights: [
        `Mã trường: ${admConfig?.school_code || "TGH"} | Mã ngành: ${admConfig?.major_code || "7860206"}`,
        `Đào tạo Sĩ quan ${admConfig?.major_name || "Chỉ huy — Tham mưu Tăng thiết giáp"} trình độ Đại học`,
        "Thời gian đào tạo: 04 năm chính quy tập trung",
      ],
    },
    {
      page: 2,
      title: "Trang 2: Tiêu Chuẩn Tuyển Chọn & Đào Tạo",
      subtitle: "Chính trị — Đạo đức — Sức khỏe — Độ tuổi",
      image: brochureImg2,
      highlights: [
        "Độ tuổi: Thanh niên ngoài Quân đội từ 17 - 21 tuổi; Quân nhân tại ngũ hoặc xuất ngũ từ 18 - 23 tuổi",
        "Sức khỏe: Đạt Điểm 1 và Điểm 2 theo tiêu chuẩn Bộ Quốc phòng",
        "Chiều cao từ 1,65m trở lên, cân nặng từ 50kg trở lên (không tuyển tật khúc xạ mắt)",
      ],
    },
    {
      page: 3,
      title: "Trang 3: Quyền Lợi & Chế Độ Học Viên",
      subtitle: "Được đài thọ toàn bộ kinh phí học tập và sinh hoạt",
      image: brochureImg1,
      highlights: [
        "Miễn 100% học phí, tiền ăn, quân trang, nơi ăn ở và bảo hiểm y tế",
        "Được hưởng phụ cấp sinh hoạt phí hàng tháng theo cấp bậc quân hàm",
        "Thân nhân (bố, mẹ đẻ, vợ/chồng) được cấp thẻ BHYT quân đội miễn phí",
        "Tốt nghiệp được phong quân hàm Sĩ quan và phân công công tác trong Quân đội",
      ],
    },
  ];

  const current = brochurePages[activePage];

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
            <span className="text-foreground font-medium">Tờ rơi & Cẩm nang tuyển sinh</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-destructive" />
                <span className="text-xs uppercase tracking-widest text-destructive font-bold">
                  Ấn phẩm thông tin chính thức
                </span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl text-primary font-bold">
                Tờ Rơi Tuyển Sinh Quân Sự 2026
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Lật xem trực tuyến cẩm nang tư vấn định hướng nghề nghiệp và chỉ tiêu tuyển sinh Nhà trường.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a href={getAssetUrl(admConfig?.download_form_url || "/documents/mau-dang-ky-xet-tuyen.doc")} download>
                <Button variant="outline" size="sm" className="text-xs gap-1.5 h-9">
                  <Download className="w-3.5 h-3.5" /> Tải phiếu đăng ký
                </Button>
              </a>
              <Link to="/lien-he">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9">
                  Đăng ký tư vấn
                </Button>
              </Link>
            </div>
          </div>

          {/* Interactive Viewer */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg mb-8">
            <div className="grid grid-cols-1 md:grid-cols-12">
              {/* Image Preview */}
              <div className="md:col-span-7 bg-black/90 p-4 md:p-8 flex items-center justify-center relative min-h-[380px]">
                <img
                  src={current.image}
                  alt={current.title}
                  className="max-h-[420px] w-auto object-contain rounded-lg shadow-2xl border border-white/10"
                />
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded">
                  Trang {current.page} / {brochurePages.length}
                </div>
              </div>

              {/* Page Information */}
              <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-between bg-muted/20">
                <div>
                  <div className="inline-block px-2.5 py-1 rounded text-[11px] font-bold uppercase bg-destructive/10 text-destructive mb-3">
                    Nội dung trang {current.page}
                  </div>
                  <h2 className="font-display text-xl font-bold text-primary leading-snug mb-2">
                    {current.title}
                  </h2>
                  <p className="text-xs text-muted-foreground mb-6">
                    {current.subtitle}
                  </p>

                  <div className="space-y-3">
                    {current.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-foreground/90">
                        <CheckCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flip Navigation */}
                <div className="pt-8 mt-6 border-t border-border flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activePage === 0}
                    onClick={() => setActivePage((prev) => Math.max(0, prev - 1))}
                    className="text-xs h-9 gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Trang trước
                  </Button>

                  <div className="flex gap-1.5">
                    {brochurePages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePage(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          activePage === idx ? "w-6 bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                        }`}
                      />
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activePage === brochurePages.length - 1}
                    onClick={() => setActivePage((prev) => Math.min(brochurePages.length - 1, prev + 1))}
                    className="text-xs h-9 gap-1"
                  >
                    Trang sau <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-card border border-border rounded-xl">
              <Shield className="w-6 h-6 text-destructive mb-3" />
              <h3 className="font-bold text-sm text-primary mb-1">Truyền thống vẻ vang</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Đơn vị Anh hùng Lực lượng vũ trang nhân dân, cái nôi đào tạo hàng vạn cán bộ chỉ huy binh chủng thiết giáp.
              </p>
            </div>
            <div className="p-5 bg-card border border-border rounded-xl">
              <Award className="w-6 h-6 text-destructive mb-3" />
              <h3 className="font-bold text-sm text-primary mb-1">Môi trường rèn luyện</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hệ thống giảng đường, bãi tập lái xe tăng ngầm nước, thao trường bắn hiện đại bậc nhất quân đội.
              </p>
            </div>
            <div className="p-5 bg-card border border-border rounded-xl">
              <BookOpen className="w-6 h-6 text-destructive mb-3" />
              <h3 className="font-bold text-sm text-primary mb-1">Cơ hội phát triển</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sau khi tốt nghiệp, 100% học viên được bố trí đảm nhiệm chức vụ Chỉ huy phân đội Tăng thiết giáp trên toàn quân.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
