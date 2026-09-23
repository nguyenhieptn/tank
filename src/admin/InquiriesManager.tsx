import { useState, useEffect, useCallback } from "react";
import { adminListInquiries, adminUpdateInquiry } from "@/lib/api";
import { InquiryItem } from "@/types/wordpress";
import {
  Inbox,
  CheckCircle,
  Clock,
  Search,
  Phone,
  MapPin,
  Calendar,
  Download,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const InquiriesManager = () => {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const list = await adminListInquiries(statusFilter);
      setInquiries(list);
    } catch (err) {
      toast.error("Không tải được danh sách câu hỏi");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  const handleToggleStatus = async (item: InquiryItem) => {
    const nextStatus = item.status === "new" ? "contacted" : "new";
    try {
      await adminUpdateInquiry(item.id, nextStatus);
      toast.success(
        nextStatus === "contacted"
          ? "Đã đánh dấu: Đã liên hệ tư vấn"
          : "Đã chuyển về: Chưa liên hệ"
      );
      loadInquiries();
    } catch (err) {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const handleExportCSV = () => {
    if (inquiries.length === 0) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }

    const headers = ["ID", "Họ và tên", "Số điện thoại", "Tỉnh/Thành", "Nội dung", "Trạng thái", "Thời gian"];
    const rows = inquiries.map((i) => [
      i.id,
      `"${i.fullname.replace(/"/g, '""')}"`,
      `"${i.phone}"`,
      `"${i.province || ""}"`,
      `"${(i.message || "").replace(/"/g, '""')}"`,
      i.status === "new" ? "Chưa liên hệ" : "Đã liên hệ",
      `"${new Date(i.created_at).toLocaleString("vi-VN")}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `danh_sach_thi_sinh_sqttg_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã xuất danh sách thí sinh ra file CSV!");
  };

  const filtered = inquiries.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.fullname.toLowerCase().includes(q) ||
      item.phone.includes(q) ||
      item.province?.toLowerCase().includes(q) ||
      item.message?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-primary">
            Hộp Thư Tiếp Nhận Tư Vấn Tuyển Sinh
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Tổng cộng <strong>{inquiries.length}</strong> yêu cầu tư vấn từ thí sinh và phụ huynh gửi về.
          </p>
        </div>

        <Button
          onClick={handleExportCSV}
          variant="outline"
          size="sm"
          className="text-xs h-9 gap-1.5 shadow-sm"
        >
          <Download className="w-4 h-4" /> Xuất danh sách Excel/CSV
        </Button>
      </div>

      {/* Filter bar */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm theo tên, SĐT, tỉnh thành..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 text-xs bg-background border border-input rounded-md"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="new">Chưa liên hệ (Cần gọi)</option>
            <option value="contacted">Đã gọi điện tư vấn</option>
          </select>
        </div>
      </div>

      {/* Inquiries Cards/Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse text-xs">
            Đang nạp danh sách câu hỏi...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground space-y-2">
            <Inbox className="w-10 h-10 mx-auto opacity-30 text-primary" />
            <div className="font-bold text-sm text-foreground">Không có câu hỏi tư vấn nào</div>
            <div className="text-xs">Các đăng ký gửi từ trang Liên hệ sẽ được lưu trữ và hiển thị tại đây.</div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((item) => (
              <div key={item.id} className="p-5 hover:bg-muted/10 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{item.fullname}</span>
                    <a
                      href={`tel:${item.phone}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded hover:bg-primary/20 transition-colors"
                    >
                      <Phone className="w-3 h-3" /> {item.phone}
                    </a>
                    {item.province && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="w-3 h-3" /> {item.province}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleString("vi-VN")}
                    </span>
                  </div>

                  <div className="text-xs text-foreground/90 bg-muted/30 p-2.5 rounded border border-border/50">
                    {item.message ? (
                      item.message
                    ) : (
                      <span className="italic text-muted-foreground">(Không để lại câu hỏi cụ thể, chỉ yêu cầu tư vấn gọi lại)</span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={item.status === "new" ? "default" : "outline"}
                    onClick={() => handleToggleStatus(item)}
                    className={`text-xs h-8 gap-1.5 ${
                      item.status === "new"
                        ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        : "text-green-700 border-green-600/30 hover:bg-green-50"
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {item.status === "new" ? "Đánh dấu đã gọi" : "Đã gọi điện tư vấn"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
