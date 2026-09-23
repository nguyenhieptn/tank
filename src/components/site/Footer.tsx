import { Star, MapPin, Phone, Mail, Globe } from "lucide-react";
import logo from "@/assets/image.png";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground border-t-4 border-accent">
      <div className="container py-16">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-12 w-12 rounded-full bg-destructive flex items-center justify-center ring-2 ring-accent">
                <img
                  src={logo}
                  alt="Logo Trường Sĩ quan Tăng thiết giáp"
                  className="h-10 w-10 rounded-full object-cover"
                />
              </div>
              <div className="leading-tight">
                <div className="font-display text-accent tracking-wider">
                  TRƯỜNG SĨ QUAN
                </div>
                <div className="font-display text-xl tracking-widest">
                  TĂNG THIẾT GIÁP
                </div>
              </div>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-md mb-6">
              Cái nôi đào tạo cán bộ chỉ huy, kỹ thuật binh chủng Tăng thiết giáp
              của Quân đội Nhân dân Việt Nam. Đơn vị Anh hùng Lực lượng vũ trang
              Nhân dân.
            </p>
            <div className="font-display text-2xl text-accent">
              "ĐÃ RA QUÂN LÀ ĐÁNH THẮNG"
            </div>
          </div>

          <div>
            <div className="font-display text-lg text-accent uppercase tracking-wider mb-4 pb-2 border-b border-accent/30">
              Liên kết
            </div>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              {[
                { label: "Tuyển sinh Quân sự 2026", href: "#tuyen-sinh" },
                { label: "Tờ rơi Tuyển sinh", href: "/siquantank/to-roi-tuyen-sinh" },
                { label: "Tin tức & Hoạt động", href: "/siquantank/chuyen-muc" },
                { label: "Lịch sử truyền thống", href: "#lich-su" },
                { label: "Đăng ký tư vấn trực tuyến", href: "/siquantank/lien-he" },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="hover:text-accent transition-colors">{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-display text-lg text-accent uppercase tracking-wider mb-4 pb-2 border-b border-accent/30">
              Liên hệ
            </div>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <Star className="h-4 w-4 text-accent shrink-0" />
                <span>Trường Sĩ quan Tăng thiết giáp</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>Xã Kim Long - Huyện Tam Dương - Tỉnh Vĩnh Phúc</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent shrink-0" />
                <span>0211 353 9021</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-accent shrink-0" />
                <span>Facebook: SiQuanTangThietGiap</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent shrink-0" />
                <span>E-mail: tsqttg@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-primary-foreground/60">
          <div>© 2026 Trường Sĩ quan Tăng thiết giáp. Bảo lưu mọi quyền.</div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-accent">Điều khoản</a>
            <span>•</span>
            <a href="#" className="hover:text-accent">Bảo mật</a>
            <span>•</span>
            <a href="#" className="hover:text-accent">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
