import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Target,
  ListChecks,
  TrendingUp,
  Download,
  FileText,
  Search,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Award,
} from "lucide-react";
import { getAssetUrl } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DocumentDownloads } from "@/components/site/DocumentDownloads";
import { fetchAdmissions, fetchPosts, AdmissionConfigData } from "@/lib/api";
import { UnifiedArticle } from "@/types/wordpress";

const useCountdown = (targetDateStr: string) => {
  const [tl, setTl] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const target = new Date(targetDateStr);
    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      setTl({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [targetDateStr]);
  return tl;
};

export const AdmissionsDashboard = () => {
  const [admConfig, setAdmConfig] = useState<AdmissionConfigData>({
    school_code: "TGH",
    school_name: "Trường Sĩ quan Tăng thiết giáp",
    major_code: "7860206",
    major_name: "Chỉ huy - Tham mưu Tăng thiết giáp",
    target_year: 2026,
    north_score: 18.0,
    south_score: 17.0,
    target_count: "150 chỉ tiêu",
    criteria: "A00 (Toán, Lý, Hóa), A01 (Toán, Lý, Anh)",
    countdown_date: "2026-09-01T00:00:00",
    download_form_url: "/siquantank/documents/mau-dang-ky-xet-tuyen.doc",
  });
  const [admissionPosts, setAdmissionPosts] = useState<UnifiedArticle[]>([]);

  useEffect(() => {
    fetchAdmissions().then((data) => {
      if (data) setAdmConfig(data);
    });
    fetchPosts({ per_page: 5, tab: "admissions" }).then((res) => {
      if (res.posts && res.posts.length > 0) {
        setAdmissionPosts(res.posts);
      }
    });
  }, []);

  const t = useCountdown(admConfig.countdown_date || "2026-10-31T23:59:59");
  const [selectedPost, setSelectedPost] = useState<UnifiedArticle | null>(null);

  const realCards = [
    {
      icon: Target,
      badge: `MÃ TRƯỜNG: ${admConfig.school_code}`,
      title: `Mã ngành: ${admConfig.major_code}`,
      value: "ĐẠI HỌC",
      desc: `Ngành đào tạo: Sĩ quan ${admConfig.major_name} cấp phân đội bậc Đại học.`,
    },
    {
      icon: TrendingUp,
      badge: `ĐIỂM NHẬN HỒ SƠ ${admConfig.target_year}`,
      title: `Tổ hợp: ${admConfig.criteria}`,
      value: `${admConfig.north_score.toFixed(2)} / ${admConfig.south_score.toFixed(2)}`,
      desc: `Miền Bắc: ${admConfig.north_score.toFixed(2)} điểm — Miền Nam: ${admConfig.south_score.toFixed(2)} điểm.`,
    },
    {
      icon: ListChecks,
      badge: "QUY TRÌNH CHUẨN",
      title: "05 Bước xét tuyển",
      value: "05 BƯỚC",
      desc: "Sơ tuyển cấp huyện → Thi THPT → Đăng ký NV1 (TGH) → Xét tuyển toàn quân → Nhập học.",
    },
  ];

  return (
    <section id="tuyen-sinh" className="relative py-24 bg-background pattern-camo">
      <div className="container">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-destructive" />
              <span className="text-destructive font-bold uppercase tracking-[0.3em] text-sm">
                Tuyển sinh Quân sự chính quy
              </span>
            </div>
            <h2 className="font-display text-5xl md:text-6xl text-primary leading-none">
              TUYỂN SINH {admConfig.target_year}
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl text-base">
              Học tập, rèn luyện trong môi trường quân ngũ chính quy, hiện đại. Trở thành sĩ quan Tăng thiết giáp tinh nhuệ của Quân đội Nhân dân Việt Nam.
            </p>
          </div>

          {/* Countdown */}
          <div className="bg-primary p-5 rounded-sm border-l-4 border-accent shadow-command">
            <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider mb-3">
              <Calendar className="h-4 w-4" />
              Thời gian tới kỳ xét tuyển đợt mới
            </div>
            <div className="grid grid-cols-4 gap-3 text-primary-foreground">
              {[
                { v: t.d, l: "Ngày" },
                { v: t.h, l: "Giờ" },
                { v: t.m, l: "Phút" },
                { v: t.s, l: "Giây" },
              ].map((u, i) => (
                <div key={i} className="text-center">
                  <div className="font-display text-3xl text-accent tabular-nums">
                    {String(u.v).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-primary-foreground/60">
                    {u.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3 main cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {realCards.map((c, i) => (
            <div
              key={i}
              className="group relative bg-card border border-border hover:border-accent transition-all duration-300 p-8 shadow-card-soft hover:shadow-command hover:-translate-y-1"
            >
              <div className="absolute top-0 left-0 w-12 h-1 bg-accent" />
              <div className="absolute top-0 right-0 text-[100px] font-display text-primary/5 leading-none select-none">
                0{i + 1}
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center justify-center h-12 w-12 bg-primary text-accent rounded-sm group-hover:bg-accent group-hover:text-primary transition-colors">
                    <c.icon className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-bold text-destructive uppercase tracking-wider bg-destructive/10 px-2.5 py-1 rounded-sm">
                    {c.badge}
                  </span>
                </div>

                <div className="font-display text-3xl md:text-4xl text-primary mb-1">
                  {c.value}
                </div>
                <h3 className="font-display text-lg text-primary uppercase tracking-wide mb-2">
                  {c.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {c.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Real Announcements List & Application Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          {/* Latest official admission notices from DB */}
          <div className="lg:col-span-2 bg-card border border-border p-6 md:p-8 rounded-sm shadow-card-soft">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-destructive" />
                <h3 className="font-display text-2xl text-primary uppercase">
                  Thông báo Tuyển sinh Mới nhất
                </h3>
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Dữ liệu lưu trữ chính thức
              </span>
            </div>

            <div className="space-y-4">
              {admissionPosts.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  Đang tải thông báo tuyển sinh mới nhất...
                </div>
              ) : (
                admissionPosts.slice(0, 5).map((post: UnifiedArticle) => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="group p-4 bg-secondary/50 hover:bg-secondary border border-transparent hover:border-accent rounded-sm cursor-pointer transition-all flex items-start justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-destructive text-destructive-foreground">
                          {post.date}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {post.category}
                        </span>
                      </div>
                      <h4 className="font-display text-base md:text-lg text-primary uppercase leading-snug group-hover:text-destructive transition-colors">
                        {post.title}
                      </h4>
                    </div>
                    <ArrowRight className="h-5 w-5 text-accent shrink-0 mt-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Downloads & Official Documents */}
          <div className="space-y-6">
            <div className="bg-primary text-primary-foreground p-6 rounded-sm shadow-command">
              <div className="flex items-center gap-2 text-accent mb-4">
                <Download className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-[0.25em]">
                  Biểu mẫu chính thức
                </span>
              </div>
              <h4 className="font-display text-xl text-primary-foreground mb-3 uppercase">
                Phiếu Đăng ký Xét tuyển
              </h4>
              <p className="text-xs text-primary-foreground/80 mb-5 leading-relaxed">
                Tải về mẫu đơn đăng ký xét tuyển đại học quân sự chính quy của Trường Sĩ quan Tăng thiết giáp.
              </p>
              <a
                href={getAssetUrl(admConfig.download_form_url) || "#"}
                download="mau-dang-ky-xet-tuyen.doc"
                className="inline-flex w-full items-center justify-center gap-2 bg-gold-gradient text-primary font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-sm shadow-gold hover:scale-[1.02] transition-transform"
              >
                <Download className="h-4 w-4" /> Tải về mẫu đăng ký (.DOC)
              </a>
            </div>

            {/* General conditions */}
            <div className="bg-card border border-border p-6 rounded-sm">
              <div className="flex items-center gap-2 text-destructive mb-3">
                <Award className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Tiêu chuẩn Tuyển sinh chung
                </span>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span><strong>Độ tuổi:</strong> 17 – 21 tuổi (quân nhân xuất ngũ đến 23 tuổi).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span><strong>Thể lực:</strong> Nam cao ≥ 1m65, cân nặng ≥ 50kg.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span><strong>Chính trị:</strong> Đủ tiêu chuẩn chính trị theo quy định của Bộ Quốc phòng.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span><strong>Tổ hợp xét tuyển:</strong> A00 (Toán, Lý, Hóa), A01 (Toán, Lý, Anh), C01.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Dialog for Admissions Post */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6 md:p-8 bg-card border-border">
          {selectedPost && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-destructive text-destructive-foreground px-2.5 py-0.5 text-xs font-bold uppercase">
                  {selectedPost.date}
                </span>
                <span className="text-muted-foreground text-xs">{selectedPost.category}</span>
              </div>

              <DialogHeader className="mb-4">
                <DialogTitle className="font-display text-2xl md:text-3xl text-primary leading-snug">
                  {selectedPost.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground uppercase pt-1">
                  Trường Sĩ quan Tăng thiết giáp — Ban Tuyển sinh Quân sự
                </DialogDescription>
              </DialogHeader>

              {selectedPost.content ? (
                <div
                  className="prose prose-slate max-w-none prose-headings:font-display prose-headings:text-primary prose-a:text-destructive prose-img:rounded-sm leading-relaxed text-sm md:text-base text-foreground/90 my-4"
                  dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                />
              ) : (
                <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed space-y-4 pt-2">
                  {(selectedPost.cleanContent || selectedPost.excerpt || "")
                    .split("\n\n")
                    .map((para: string, idx: number) => {
                      const trimmed = para.trim();
                      if (!trimmed) return null;
                      return (
                        <p key={idx} className="text-sm md:text-base leading-relaxed">
                          {trimmed}
                        </p>
                      );
                    })}
                </div>
              )}

              {/* Prominent Admissions Documents & Official Attachments */}
              <DocumentDownloads
                content={selectedPost.content}
                postTitle={selectedPost.title}
                tab={selectedPost.tab}
                category={selectedPost.category}
              />

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <Link
                  to={`/bai-viet/${selectedPost.slug}`}
                  onClick={() => setSelectedPost(null)}
                >
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 text-primary">
                    <ArrowRight className="w-3.5 h-3.5" /> Xem toàn văn & Chi tiết bài viết
                  </Button>
                </Link>
                <Button
                  onClick={() => setSelectedPost(null)}
                  className="bg-primary text-accent hover:bg-primary/90 text-xs px-4"
                >
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
