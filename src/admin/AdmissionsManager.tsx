import { useEffect, useState } from "react";
import { fetchAdmissions, adminUpdateAdmissions } from "@/lib/api";
import { GraduationCap, Save, Clock, FileText, CheckCircle2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const AdmissionsManager = () => {
  const [form, setForm] = useState({
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdmissions().then((data) => {
      if (data) {
        setForm(data);
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminUpdateAdmissions(form);
      toast.success("Đã cập nhật thông tin tuyển sinh thành công!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lưu thất bại";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Đang nạp cấu hình tuyển sinh...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-primary">
            Quản Lý Chỉ Tiêu & Điểm Tuyển Sinh
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Dữ liệu này được hiển thị trực tiếp tại Dashboard Tuyển sinh trên Trang chủ Cổng thông tin.
          </p>
        </div>

        <Button
          type="submit"
          form="adm-form"
          disabled={saving}
          className="bg-primary hover:bg-primary/90 text-accent text-xs h-9 gap-1.5 shadow-sm font-bold uppercase tracking-wider"
        >
          <Save className="w-4 h-4" /> {saving ? "Đang lưu..." : "Cập nhật thông tin"}
        </Button>
      </div>

      <form id="adm-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Core Indicators */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="font-display text-base font-bold text-primary uppercase border-b border-border pb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-destructive" /> Điểm Sàn & Chỉ Tiêu Đào Tạo Năm {form.target_year}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Năm tuyển sinh quân sự
              </label>
              <Input
                type="number"
                value={form.target_year}
                onChange={(e) => setForm({ ...form, target_year: parseInt(e.target.value, 10) || 2026 })}
                className="h-10 text-sm font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Điểm sàn xét tuyển Miền Bắc
              </label>
              <Input
                type="number"
                step="0.25"
                value={form.north_score}
                onChange={(e) => setForm({ ...form, north_score: parseFloat(e.target.value) || 0 })}
                className="h-10 text-sm font-bold text-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Điểm sàn xét tuyển Miền Nam
              </label>
              <Input
                type="number"
                step="0.25"
                value={form.south_score}
                onChange={(e) => setForm({ ...form, south_score: parseFloat(e.target.value) || 0 })}
                className="h-10 text-sm font-bold text-destructive"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Chỉ tiêu đào tạo dự kiến
              </label>
              <Input
                type="text"
                value={form.target_count}
                onChange={(e) => setForm({ ...form, target_count: e.target.value })}
                placeholder="Ví dụ: 150 chỉ tiêu"
                className="h-10 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Tổ hợp môn xét tuyển
              </label>
              <Input
                type="text"
                value={form.criteria}
                onChange={(e) => setForm({ ...form, criteria: e.target.value })}
                placeholder="A00 (Toán, Lý, Hóa), A01 (Toán, Lý, Anh)"
                className="h-10 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Identity & Countdown */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="font-display text-base font-bold text-primary uppercase border-b border-border pb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Mã Trường & Thời Gian Đếm Ngược
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Mã trường Quân sự (School Code)
              </label>
              <Input
                type="text"
                value={form.school_code}
                onChange={(e) => setForm({ ...form, school_code: e.target.value })}
                className="h-10 text-sm font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Mã ngành đào tạo Đại học
              </label>
              <Input
                type="text"
                value={form.major_code}
                onChange={(e) => setForm({ ...form, major_code: e.target.value })}
                className="h-10 text-sm font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Mốc thời gian kết thúc nhận hồ sơ (ISO Format)
              </label>
              <Input
                type="text"
                value={form.countdown_date}
                onChange={(e) => setForm({ ...form, countdown_date: e.target.value })}
                placeholder="2026-09-01T00:00:00"
                className="h-10 text-xs font-mono"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Đồng hồ đếm ngược trên trang chủ sẽ tính toán theo mốc thời gian này.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Đường dẫn tải phiếu xét tuyển (.doc / .pdf)
              </label>
              <Input
                type="text"
                value={form.download_form_url}
                onChange={(e) => setForm({ ...form, download_form_url: e.target.value })}
                className="h-10 text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
