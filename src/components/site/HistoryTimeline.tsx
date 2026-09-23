import { useState, useEffect } from "react";
import history1965 from "@/assets/tank.webp";
import { Award, Flag, Shield, Target, Trophy, Building2, BookOpen, Layers } from "lucide-react";
import { fetchDepartments, DepartmentsData } from "@/lib/api";

const milestones = [
  {
    year: "05/10/1959",
    title: "Thành lập Trung đoàn xe tăng 202",
    icon: Flag,
    desc: "Bộ Quốc phòng ban hành Quyết định 499/NĐ, thành lập Trung đoàn xe tăng 202 - trung đoàn xe tăng đầu tiên của Quân đội Nhân dân Việt Nam; trong biên chế có Đại đội 15 làm nhiệm vụ huấn luyện tập trung về xe tăng.",
  },
  {
    year: "22/06/1965",
    title: "Thành lập Bộ Tư lệnh Thiết giáp & Tiểu đoàn 10",
    icon: Shield,
    desc: "Bộ trưởng Bộ Quốc phòng ra Quyết định 101/QĐ-QP thành lập Bộ Tư lệnh Thiết giáp; Tiểu đoàn huấn luyện 10 trực thuộc Bộ Tư lệnh. Ngày 22/6/1965 trở thành mốc truyền thống của Nhà trường.",
  },
  {
    year: "07/01/1972",
    title: "Thành lập Đoàn 10 (Mật danh T600)",
    icon: Trophy,
    desc: "Bộ Quốc phòng ra quyết định thành lập Đoàn 10 mang mật danh T600, thực hiện nhiệm vụ đào tạo, bổ túc cán bộ chỉ huy, kỹ thuật và hỗ trợ đào tạo lực lượng tăng thiết giáp cho bạn Lào.",
  },
  {
    year: "10/04/1973",
    title: "Thành lập Trường Sĩ quan Thiết giáp",
    icon: Target,
    desc: "Bộ Quốc phòng ban hành Quyết định 56/QĐ-QP thành lập Trường Sĩ quan Thiết giáp thuộc Bộ Tư lệnh Thiết giáp, giao nhiệm vụ đào tạo cán bộ xe tăng, thiết giáp và biên soạn tài liệu chuyên ngành.",
  },
  {
    year: "23/10/1980",
    title: "Đổi tên thành Trường SQ Chỉ huy – Kỹ thuật Tăng",
    icon: Award,
    desc: "Bộ Quốc phòng quyết định đổi tên Trường Sĩ quan Thiết giáp thành Trường Sĩ quan Chỉ huy - Kỹ thuật Tăng, đánh dấu bước trưởng thành mới về tổ chức và mục tiêu đào tạo.",
  },
  {
    year: "01/04/1997",
    title: "Mang tên Trường Sĩ quan Tăng thiết giáp",
    icon: Flag,
    desc: "Bộ Quốc phòng quyết định đổi tên thành Trường Sĩ quan Tăng thiết giáp; từ khóa 20 (1997 - 1998), Nhà trường chính thức đào tạo sĩ quan cấp phân đội bậc đại học theo Quyết định 180/QĐ-TTg.",
  },
  {
    year: "30/11/2003",
    title: "Kiện toàn tổ chức biên chế chuẩn hóa",
    icon: Shield,
    desc: "Binh chủng Tăng thiết giáp ban hành Quyết định 930/QL-2003 về tổ chức biên chế: 5 Phòng chức năng, 9 Khoa giáo viên và 5 Tiểu đoàn quản lý học viên.",
  },
  {
    year: "30/05/2009",
    title: "Đón nhận danh hiệu Anh hùng LLVT Nhân dân",
    icon: Trophy,
    desc: "Trường Sĩ quan Tăng thiết giáp được Chủ tịch nước phong tặng danh hiệu Anh hùng Lực lượng vũ trang Nhân dân thời kỳ đổi mới theo Quyết định 790/QĐ-CTN.",
  },
];

const honors = [
  {
    title: "Anh hùng LLVT Nhân dân",
    badge: "2009",
    desc: "Chủ tịch nước phong tặng danh hiệu Anh hùng Lực lượng vũ trang Nhân dân thời kỳ đổi mới theo Quyết định 790/QĐ-CTN.",
  },
  {
    title: "Huân chương Độc lập hạng Nhất",
    badge: "Lào (1977)",
    desc: "Huân chương cao quý nhất của nước CHDCND Lào trao tặng vì thành tích đào tạo cán bộ Tăng thiết giáp cho quân đội bạn.",
  },
  {
    title: "Huân chương Hữu nghị Thập Ba Đân",
    badge: "Campuchia",
    desc: "Huân chương cao quý của Vương quốc Campuchia trao tặng vì thành tích bồi dưỡng, đào tạo Sĩ quan Tăng thiết giáp.",
  },
  {
    title: "01 Huân chương Quân công hạng Nhì",
    badge: "1983",
    desc: "Phần thưởng cao quý ghi nhận thành tích xuất sắc trong xây dựng Quân đội, củng cố quốc phòng và bảo vệ Tổ quốc.",
  },
  {
    title: "02 Huân chương Chiến công hạng Nhất",
    badge: "1983 & 1998",
    desc: "Chiến công xuất sắc trong chiến đấu phục vụ chiến đấu và công tác giáo dục - đào tạo cán bộ chỉ huy binh chủng.",
  },
  {
    title: "06 Cờ Thi đua của Thủ tướng Chính phủ",
    badge: "2004 — 2011",
    desc: "Đơn vị dẫn đầu phong trào thi đua quyết thắng các năm 2004, 2005, 2006, 2007, 2008 và 2011.",
  },
  {
    title: "02 Cờ thưởng luân lưu của Chủ tịch nước",
    badge: "Chủ tịch nước",
    desc: "Phần thưởng luân lưu của Chủ tịch nước Cộng hòa xã hội chủ nghĩa Việt Nam trao tặng đơn vị tiêu biểu xuất sắc.",
  },
  {
    title: "Huân chương Chiến công hạng Nhì & Ba",
    badge: "1995 & 1981",
    desc: "Gồm 01 Huân chương Chiến công hạng Nhì (năm 1995) và 01 Huân chương Chiến công hạng Ba (năm 1981).",
  },
];

export const HistoryTimeline = () => {
  const [activeDeptTab, setActiveDeptTab] = useState<"phong" | "khoa" | "tieudoan">("khoa");
  const [departmentsData, setDepartmentsData] = useState<DepartmentsData>({
    phong: [],
    khoa: [],
    tieudoan: [],
  });

  useEffect(() => {
    fetchDepartments().then((data) => {
      if (data && (data.phong.length || data.khoa.length || data.tieudoan.length)) {
        setDepartmentsData(data);
      }
    });
  }, []);

  return (
    <section id="lich-su" className="bg-primary text-primary-foreground py-24 relative overflow-hidden">
      <div className="absolute inset-0 pattern-tactical opacity-30" />

      <div className="container relative">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-accent" />
            <span className="text-accent font-bold uppercase tracking-[0.3em] text-sm">
              Lịch sử & Truyền thống
            </span>
            <div className="h-px w-12 bg-accent" />
          </div>
          <h2 className="font-display text-5xl md:text-7xl text-primary-foreground leading-none">
            60 NĂM <span className="text-accent">ANH HÙNG</span>
          </h2>
          <p className="mt-4 text-primary-foreground/75 max-w-2xl mx-auto text-sm md:text-base">
            "Đoàn kết, tự lực, sáng tạo, chủ động vượt khó, dạy tốt, chính quy, mẫu mực — đã ra quân là đánh thắng"
          </p>
        </div>

        {/* Vertical timeline */}
        <div className="relative max-w-5xl mx-auto mb-24">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-accent/30 -translate-x-1/2" />

          {milestones.map((m, i) => {
            const left = i % 2 === 0;
            return (
              <div
                key={m.year}
                className={`relative mb-12 flex items-center gap-6 ${
                  left ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Year node */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10">
                  <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center shadow-gold ring-4 ring-primary">
                    <m.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>

                {/* Card */}
                <div
                  className={`ml-16 md:ml-0 md:w-[calc(50%-3rem)] ${
                    left ? "md:mr-auto md:text-right" : "md:ml-auto"
                  }`}
                >
                  <div className="bg-primary/40 backdrop-blur-sm border border-accent/20 p-6 hover:border-accent transition-all">
                    <div className="font-display text-3xl md:text-4xl text-accent mb-2">
                      {m.year}
                    </div>
                    <h3 className="font-display text-xl md:text-2xl text-primary-foreground mb-2 uppercase">
                      {m.title}
                    </h3>
                    <p className="text-primary-foreground/75 text-xs md:text-sm leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                </div>

                {/* Image side for first milestone */}
                {i === 0 && (
                  <div className="hidden md:block w-[calc(50%-3rem)] ml-auto">
                    <img
                      src={history1965}
                      alt="Tổ lái xe tăng năm 1965"
                      loading="lazy"
                      width={800}
                      height={600}
                      className="w-full aspect-[4/3] object-cover sepia-[0.4] grayscale-[0.3] border-2 border-accent/30"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Real Organization Structure from Database */}
        <div id="co-cau" className="mt-20 pt-16 border-t border-accent/20">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Building2 className="h-5 w-5 text-accent" />
              <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs md:text-sm">
                Cơ cấu Tổ chức Nhà trường
              </span>
            </div>
            <h3 className="font-display text-4xl md:text-5xl text-primary-foreground uppercase">
              5 PHÒNG — 9 KHOA — 5 TIỂU ĐOÀN
            </h3>
            <p className="mt-2 text-primary-foreground/70 text-xs md:text-sm">
              Trích xuất từ cơ sở dữ liệu tổ chức biên chế chính quy Trường Sĩ quan Tăng thiết giáp
            </p>
          </div>

          {/* Sub-tabs */}
          <div className="flex justify-center gap-2 mb-8">
            {[
              { id: "khoa" as const, label: "9 Khoa Giảng viên", icon: BookOpen, count: departmentsData.khoa?.length || 9 },
              { id: "phong" as const, label: "5 Phòng Chức năng", icon: Building2, count: departmentsData.phong?.length || 5 },
              { id: "tieudoan" as const, label: "5 Tiểu đoàn Quản lý", icon: Layers, count: departmentsData.tieudoan?.length || 5 },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveDeptTab(t.id)}
                className={`px-5 py-2.5 text-xs md:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${
                  activeDeptTab === t.id
                    ? "bg-accent text-primary border-accent shadow-gold"
                    : "bg-primary/50 text-primary-foreground/80 border-accent/20 hover:border-accent"
                }`}
              >
                <t.icon className="h-4 w-4" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Department items grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {(departmentsData[activeDeptTab] || []).map((dept) => (
              <div
                key={dept.id}
                className="bg-primary/40 border border-accent/20 hover:border-accent p-5 transition-all group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-accent" />
                  <span className="text-[11px] font-bold text-accent uppercase tracking-wider">
                    {activeDeptTab === "khoa" ? "Khoa Đào tạo" : activeDeptTab === "phong" ? "Phòng Chức năng" : "Đơn vị Quản lý"}
                  </span>
                </div>
                <h4 className="font-display text-xl text-primary-foreground uppercase group-hover:text-accent transition-colors">
                  {dept.name}
                </h4>
                {dept.content && dept.content !== dept.name && (
                  <p className="text-xs text-primary-foreground/70 mt-2 line-clamp-3 leading-relaxed">
                    {dept.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Authentic Honors and Awards from Post ID 2 */}
        <div id="danh-hieu" className="mt-20 pt-16 border-t border-accent/20">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Trophy className="h-5 w-5 text-accent" />
              <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs md:text-sm">
                Vinh quang & Phần thưởng cao quý
              </span>
            </div>
            <h3 className="font-display text-4xl md:text-5xl text-primary-foreground uppercase">
              DANH HIỆU & PHẦN THƯỞNG CAO QUÝ
            </h3>
            <p className="mt-2 text-primary-foreground/70 text-xs md:text-sm max-w-2xl mx-auto">
              Trích lục các danh hiệu, huân chương cao quý của Đảng, Nhà nước, Quân đội và Quốc tế trao tặng Nhà trường
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {honors.map((h, i) => (
              <div
                key={i}
                className="bg-primary/40 border border-accent/20 hover:border-accent p-5 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="h-7 w-7 rounded bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
                      <Award className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent/20 text-accent uppercase tracking-wider">
                      {h.badge}
                    </span>
                  </div>
                  <h4 className="font-display text-lg text-primary-foreground uppercase mb-2 group-hover:text-accent transition-colors leading-snug">
                    {h.title}
                  </h4>
                  <p className="text-xs text-primary-foreground/70 leading-relaxed">
                    {h.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
