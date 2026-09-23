import { useState } from "react";
import campusAerial from "@/assets/campus/campus-aerial.jpg";
import monument665 from "@/assets/campus/monument-665.jpg";
import campusGate from "@/assets/campus/campus-gate.jpg";
import headquarters from "@/assets/campus/headquarters.jpg";
import trainingField from "@/assets/campus/training-field.jpg";
import tankAdvance from "@/assets/campus/tank-advance.jpg";
import { MapPin, Maximize2, Shield, Eye, CheckCircle2, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface CampusItem {
  id: string;
  title: string;
  tag: string;
  location: string;
  desc: string;
  image: string;
  highlight?: string;
}

const campusItems: CampusItem[] = [
  {
    id: "aerial",
    title: "Toàn cảnh Khuôn viên & Trung tâm Mô phỏng",
    tag: "Toàn cảnh từ trên cao",
    location: "Khu trung tâm Nhà trường, Kim Long, Tam Dương",
    desc: "Khuôn viên trường khang trang với Trung tâm huấn luyện mô phỏng hiện đại bậc nhất, quảng trường duyệt đội ngũ, tượng đài xe tăng 665 và hệ thống giảng đường, cây xanh chính quy mẫu mực.",
    image: campusAerial,
    highlight: "Trung tâm Huấn luyện Mô phỏng Hiện đại",
  },
  {
    id: "monument",
    title: "Tượng đài Xe tăng 665 Lịch sử",
    tag: "Biểu tượng truyền thống",
    location: "Khuôn viên trung tâm",
    desc: "Bệ đá hoa cương khắc nổi khẩu hiệu truyền thống bất hủ: 'ĐÃ RA QUÂN LÀ ĐÁNH THẮNG !'. Biểu tượng giáo dục truyền thống anh hùng cho mọi thế hệ cán bộ, giảng viên, học viên sĩ quan Tăng thiết giáp.",
    image: monument665,
    highlight: "Khẩu hiệu: Đã ra quân là đánh thắng",
  },
  {
    id: "headquarters",
    title: "Nhà Sở Chỉ huy & Quảng trường Nhà trường",
    tag: "Chỉ huy & Điều hành",
    location: "Khu chỉ huy Nhà trường",
    desc: "Khu nhà Sở Chỉ huy trang nghiêm nhìn ra quảng trường hoa và cột cờ Tổ quốc. Nơi diễn ra các sự kiện lễ lớn, chào cờ đầu tuần và phong trào thi đua dạy tốt, học tốt.",
    image: headquarters,
    highlight: "Doanh trại sáng — xanh — sạch — đẹp",
  },
  {
    id: "gate",
    title: "Cổng chính Doanh trại Trường Sĩ quan TTG",
    tag: "Cổng chính Doanh trại",
    location: "Mặt đường Kim Long, Tam Dương, Vĩnh Phúc",
    desc: "Cổng chính trang trọng mang dòng chữ 'Doanh trại Quân đội Nhân dân Việt Nam', bảng khẩu hiệu chào mừng các mốc truyền thống của Binh chủng và Nhà trường.",
    image: campusGate,
    highlight: "Chính quy — Mẫu mực — Kỷ luật",
  },
  {
    id: "training",
    title: "Thao trường Huấn luyện Kíp xe Chiến đấu",
    tag: "Thao trường thực địa",
    location: "Bãi tập chuyên ngành Tăng thiết giáp",
    desc: "Cán bộ, giảng viên chỉ huy quán triệt nhiệm vụ và huấn luyện kíp xe tăng chiến đấu thực tiễn trên thao trường, rèn luyện kỹ năng làm chủ vũ khí trang bị kỹ thuật.",
    image: trainingField,
    highlight: "Học đi đôi với hành — Bám sát thực tế",
  },
  {
    id: "advance",
    title: "Chiến xa Tăng thiết giáp Hành tiến Tác chiến",
    tag: "Diễn tập thực binh",
    location: "Khu vực diễn tập thực địa",
    desc: "Hình ảnh xe tăng tung bụi vượt địa hình phức tạp, cờ Tổ quốc phấp phới hiên ngang trong các đợt diễn tập bắn đạn thật và kiểm tra trình độ chỉ huy tác chiến hiệp đồng.",
    image: tankAdvance,
    highlight: "Đột kích mạnh — Hỏa lực uy lực",
  },
];

export const CampusShowcase = () => {
  const [activeItem, setActiveItem] = useState<CampusItem>(campusItems[0]);
  const [modalItem, setModalItem] = useState<CampusItem | null>(null);

  return (
    <section className="bg-primary/95 text-primary-foreground py-16 border-b border-accent/20 relative overflow-hidden">
      {/* Tactical background pattern */}
      <div className="absolute inset-0 pattern-tactical opacity-20" />

      <div className="container relative z-10 px-4 mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-10 bg-accent" />
              <span className="text-accent font-bold uppercase tracking-[0.25em] text-xs md:text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Thực tế Doanh trại & Cơ sở Đào tạo
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-5xl text-primary-foreground uppercase tracking-tight">
              KHUÔN VIÊN TRƯỜNG & <span className="text-accent">THAO TRƯỜNG HUẤN LUYỆN</span>
            </h2>
            <div className="flex items-center gap-2 mt-2 text-primary-foreground/75 text-xs md:text-sm">
              <MapPin className="h-4 w-4 text-accent shrink-0" />
              <span>Kim Long — Huyện Tam Dương — Tỉnh Vĩnh Phúc | Cơ sở đào tạo cán bộ Sĩ quan Tăng thiết giáp toàn quân</span>
            </div>
          </div>

          {/* Quick status pills */}
          <div className="flex flex-wrap gap-2">
            {[
              "Doanh trại chính quy kiểu mẫu",
              "Trung tâm mô phỏng hiện đại",
              "Thao trường chuẩn hóa",
            ].map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold"
              >
                <CheckCircle2 className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Main Showcase Layout */}
        <div className="grid lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Active Visual (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-primary/60 border border-accent/30 p-2 md:p-3 relative group overflow-hidden">
            <div className="relative aspect-[16/10] md:aspect-[16/9] w-full overflow-hidden bg-black/40">
              <img
                src={activeItem.image}
                alt={activeItem.title}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

              {/* Tag on image */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 bg-accent text-primary text-xs font-black uppercase tracking-wider shadow-gold">
                  {activeItem.tag}
                </span>
                {activeItem.highlight && (
                  <span className="hidden sm:inline-block px-2.5 py-1 bg-black/70 backdrop-blur text-primary-foreground text-xs font-medium border border-white/20">
                    {activeItem.highlight}
                  </span>
                )}
              </div>

              {/* Zoom action button */}
              <button
                onClick={() => setModalItem(activeItem)}
                className="absolute top-4 right-4 h-9 w-9 rounded-full bg-black/60 hover:bg-accent hover:text-primary text-primary-foreground border border-white/30 flex items-center justify-center transition-all"
                title="Phóng to xem chi tiết"
              >
                <Maximize2 className="h-4 w-4" />
              </button>

              {/* Bottom caption overlay */}
              <div className="absolute bottom-0 inset-x-0 p-4 md:p-6">
                <h3 className="font-display text-xl md:text-2xl text-primary-foreground uppercase mb-1">
                  {activeItem.title}
                </h3>
                <p className="text-primary-foreground/85 text-xs md:text-sm line-clamp-2 leading-relaxed">
                  {activeItem.desc}
                </p>
              </div>
            </div>

            {/* Quick action bar */}
            <div className="pt-3 px-2 flex items-center justify-between text-xs text-primary-foreground/70">
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-accent" />
                Ảnh tư liệu thực tế từ cơ sở dữ liệu Nhà trường
              </span>
              <button
                onClick={() => setModalItem(activeItem)}
                className="text-accent hover:underline font-bold flex items-center gap-1 uppercase tracking-wider text-[11px]"
              >
                <span>Xem ảnh lớn</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Thumbnail list (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-2.5 justify-between">
            {campusItems.map((item) => {
              const isSelected = item.id === activeItem.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveItem(item)}
                  className={`flex items-center gap-3 p-2.5 transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-accent/20 border-accent shadow-gold"
                      : "bg-primary/40 border-accent/15 hover:border-accent/50 hover:bg-primary/70"
                  }`}
                >
                  <div className="relative w-24 h-16 shrink-0 overflow-hidden border border-accent/20 bg-black/30">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 ring-2 ring-accent ring-inset" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold text-accent uppercase tracking-wider truncate">
                        {item.tag}
                      </span>
                    </div>
                    <h4 className="font-display text-sm text-primary-foreground uppercase truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-primary-foreground/70 line-clamp-1 mt-0.5">
                      {item.location}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lightbox Dialog */}
      {modalItem && (
        <Dialog open={!!modalItem} onOpenChange={() => setModalItem(null)}>
          <DialogContent className="max-w-4xl bg-primary border-accent text-primary-foreground p-0 overflow-hidden">
            <div className="relative bg-black">
              <img
                src={modalItem.image}
                alt={modalItem.title}
                className="w-full max-h-[70vh] object-contain mx-auto"
              />
            </div>
            <div className="p-6">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 bg-accent text-primary text-xs font-black uppercase tracking-wider">
                    {modalItem.tag}
                  </span>
                  <span className="text-xs text-primary-foreground/60">
                    {modalItem.location}
                  </span>
                </div>
                <DialogTitle className="font-display text-2xl text-accent uppercase">
                  {modalItem.title}
                </DialogTitle>
                <DialogDescription className="text-primary-foreground/80 text-sm leading-relaxed mt-2">
                  {modalItem.desc}
                </DialogDescription>
              </DialogHeader>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
};
