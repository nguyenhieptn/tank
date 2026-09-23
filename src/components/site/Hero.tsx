import heroTanks from "@/assets/hero-tanks.jpg";
import { Star } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-[88vh] overflow-hidden bg-primary">
      {/* Background image with parallax effect */}
      <div className="absolute inset-0">
        <img
          src={heroTanks}
          alt="Đoàn xe tăng Tăng thiết giáp trong đội hình duyệt binh"
          className="h-full w-full object-cover opacity-50"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent" />
      </div>

      {/* Tactical grid overlay */}
      <div className="absolute inset-0 pattern-tactical opacity-40" />

      {/* Side red stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive" />
      <div className="absolute left-1 top-0 bottom-0 w-px bg-accent" />

      <div className="container relative z-10 flex min-h-[88vh] flex-col justify-center py-20">
        <div className="max-w-4xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px w-12 bg-accent" />
            <span className="text-accent font-semibold uppercase tracking-[0.3em] text-sm">
              Est. 1965 — 60 năm xây dựng
            </span>
          </div>

          <h1 className="font-display text-primary-foreground text-6xl md:text-8xl lg:text-9xl leading-[0.9] mb-2">
            ĐÃ RA QUÂN
          </h1>
          <h1 className="font-display text-7xl md:text-9xl lg:text-[10rem] leading-[0.9] mb-8">
            <span className="text-stroke-gold">LÀ ĐÁNH</span>{" "}
            <span className="text-accent">THẮNG</span>
          </h1>

          <p className="max-w-3xl text-primary-foreground/90 text-base md:text-lg leading-relaxed mb-4 border-l-2 border-accent pl-6">
            Trường Sĩ quan Tăng thiết giáp — Đơn vị Anh hùng LLVT Nhân dân trực thuộc Binh chủng Tăng thiết giáp, Bộ Quốc phòng. Trung tâm đào tạo sĩ quan chỉ huy tham mưu, kỹ thuật cho toàn quân và làm nhiệm vụ quốc tế đào tạo, bồi dưỡng Sĩ quan Tăng thiết giáp cho nước bạn Lào và Campuchia.
          </p>
          <div className="flex items-center gap-2 pl-6 text-accent text-xs md:text-sm italic font-medium">
            <span>Phương châm: “Cơ bản, hệ thống, thống nhất, chuyên sâu” — “Học đi đôi với hành”</span>
          </div>
        </div>

        {/* Bottom stats strip - Authentic data from school profile */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-px bg-primary-foreground/10 border border-primary-foreground/10 max-w-5xl">
          {[
            { value: "60+", label: "Năm truyền thống anh hùng" },
            { value: "100%", label: "Giảng viên trình độ Đại học" },
            { value: "Gần 60%", label: "Trình độ Sau đại học" },
            { value: "★ AHLLVTND", label: "Anh hùng LLVT Nhân dân" },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-primary/60 backdrop-blur-sm p-6 hover:bg-primary/80 transition-colors group"
            >
              <div className="font-display text-3xl md:text-4xl text-accent mb-1 group-hover:scale-110 transition-transform origin-left">
                {stat.value}
              </div>
              <div className="text-primary-foreground/70 text-xs uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Corner star decoration */}
      <Star className="absolute top-32 right-16 h-32 w-32 text-accent/10 fill-accent/5 hidden xl:block" />
    </section>
  );
};
