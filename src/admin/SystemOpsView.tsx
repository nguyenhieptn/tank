import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminRunSystemAction, adminGetSystemLogs } from "@/lib/api";
import {
  Activity,
  HardDrive,
  ShieldCheck,
  Clock,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  FileText,
  Inbox,
  Database,
  Server,
  Layers,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface HealthData {
  status: string;
  db_size_kb: number;
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  posts_without_image: number;
  new_inquiries: number;
  total_inquiries: number;
  tabs?: {
    admissions: number;
    school: number;
    army: number;
    students: number;
  };
  checked_at: string;
}

interface SystemLogItem {
  id: number;
  action: string;
  details: string;
  status: string;
  created_at: string;
}

export const SystemOpsView = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [logs, setLogs] = useState<SystemLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [lastBackupInfo, setLastBackupInfo] = useState<{ file?: string; size_kb?: number; timestamp?: string } | null>(null);

  const loadData = async (isManualCheck = false) => {
    if (isManualCheck) setChecking(true);
    else setLoading(true);

    try {
      const [h, l] = await Promise.all([
        adminRunSystemAction("check-health"),
        adminGetSystemLogs(50)
      ]);
      setHealth(h);
      setLogs(l);
      if (isManualCheck) {
        toast.success("Đã kiểm tra sức khỏe hệ thống thành công!");
      }
    } catch (err) {
      toast.error("Không tải được dữ liệu vận hành hệ thống");
    } finally {
      setLoading(false);
      setChecking(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      toast.info("Đang tiến hành sao lưu cơ sở dữ liệu SQLite...");
      const res = await adminRunSystemAction("backup-db");
      if (res.success) {
        setLastBackupInfo({
          file: res.file,
          size_kb: res.size_kb,
          timestamp: res.timestamp
        });
        toast.success(`Đã sao lưu CSDL thành công (${res.size_kb} KB)!`);
        loadData();
      } else {
        toast.error("Sao lưu thất bại: " + (res.error || "Không rõ nguyên nhân"));
      }
    } catch (err) {
      toast.error("Không thể kết nối đến tác vụ sao lưu");
    } finally {
      setBackingUp(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-primary/10 text-primary rounded-md">
              <Activity className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase tracking-widest text-primary font-bold">
              System Health & Database Maintenance
            </span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-primary">
            Giám Sát Hệ Thống & Bảo Trì Dữ Liệu
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Kiểm tra sức khỏe CSDL, tính toàn vẹn dữ liệu, sao lưu định kỳ và ghi nhật ký kiểm toán hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={loading || checking}
            className="text-xs h-9 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
            {checking ? "Đang quét..." : "Kiểm tra ngay"}
          </Button>
          <Button
            size="sm"
            onClick={handleBackup}
            disabled={backingUp}
            className="bg-primary text-accent hover:bg-primary/90 text-xs h-9 gap-1.5 shadow-sm font-semibold"
          >
            <HardDrive className={`w-3.5 h-3.5 ${backingUp ? "animate-pulse" : ""}`} />
            {backingUp ? "Đang sao lưu..." : "Sao lưu CSDL ngay"}
          </Button>
        </div>
      </div>

      {/* Main Health Metrics Grid */}
      {health && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: System Health */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Trạng Thái Hệ Thống</span>
              <ShieldCheck className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-700 mt-2 flex items-center gap-1.5">
              Hoạt động tốt <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Quét lúc: {health.checked_at}
            </div>
          </div>

          {/* Card 2: Database Storage */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Dung Lượng CSDL SQLite</span>
              <Database className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary mt-2">
              {(health.db_size_kb / 1024).toFixed(2)} MB
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              File vật lý: <code className="font-mono text-foreground font-semibold">tank.db</code>
            </div>
          </div>

          {/* Card 3: Posts Overview */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Tổng Số Bài Viết</span>
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground mt-2 flex items-baseline gap-2">
              {health.total_posts}
              <span className="text-xs font-normal text-muted-foreground">
                ({health.published_posts} đã xuất bản)
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              {health.draft_posts > 0 ? (
                <span className="text-amber-600 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {health.draft_posts} bài nháp chờ duyệt
                </span>
              ) : (
                <span className="text-green-600 font-medium">100% bài đã xuất bản</span>
              )}
            </div>
          </div>

          {/* Card 4: Admissions Inquiries */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Hộp Thư Tuyển Sinh</span>
              <Inbox className="w-4 h-4 text-accent" />
            </div>
            <div className="text-2xl font-bold text-accent mt-2 flex items-baseline gap-2">
              {health.new_inquiries}
              <span className="text-xs font-normal text-muted-foreground">
                mới / {health.total_inquiries} tổng
              </span>
            </div>
            <div className="text-[11px] mt-1">
              <Link
                to="/admin/inquiries"
                className="text-primary hover:underline font-semibold inline-flex items-center gap-0.5"
              >
                Xem chi tiết hộp thư <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Breakdown by Tabs & Detailed Status */}
      {health && health.tabs && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category distribution */}
          <div className="lg:col-span-2 bg-card border border-border p-5 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <h2 className="font-display text-sm font-bold text-primary uppercase">
                  Phân Bổ Dữ Liệu Bài Viết Theo Chuyên Mục
                </h2>
              </div>
              <Link to="/admin/posts" className="text-xs text-primary hover:underline flex items-center gap-1">
                Quản lý bài viết <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-muted/40 p-3.5 rounded-lg border border-border/50">
                <div className="text-[11px] text-muted-foreground uppercase font-semibold">Thông Tin Tuyển Sinh</div>
                <div className="text-xl font-bold text-primary mt-1">{health.tabs.admissions}</div>
                <div className="text-[10px] text-muted-foreground">bài viết tab Tuyển sinh</div>
              </div>

              <div className="bg-muted/40 p-3.5 rounded-lg border border-border/50">
                <div className="text-[11px] text-muted-foreground uppercase font-semibold">Hoạt Động Nhà Trường</div>
                <div className="text-xl font-bold text-primary mt-1">{health.tabs.school}</div>
                <div className="text-[10px] text-muted-foreground">tin tức, sự kiện</div>
              </div>

              <div className="bg-muted/40 p-3.5 rounded-lg border border-border/50">
                <div className="text-[11px] text-muted-foreground uppercase font-semibold">Truyền Thống Binh Chủng</div>
                <div className="text-xl font-bold text-primary mt-1">{health.tabs.army}</div>
                <div className="text-[10px] text-muted-foreground">lịch sử Tăng thiết giáp</div>
              </div>

              <div className="bg-muted/40 p-3.5 rounded-lg border border-border/50">
                <div className="text-[11px] text-muted-foreground uppercase font-semibold">Đời Sống Học Viên</div>
                <div className="text-xl font-bold text-primary mt-1">{health.tabs.students}</div>
                <div className="text-[10px] text-muted-foreground">học tập, rèn luyện</div>
              </div>
            </div>

            <div className="pt-2 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-border/50">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>CSDL SQLite cục bộ được tối ưu, không có liên kết hỏng.</span>
              </div>
              <div className="text-[11px]">
                {health.posts_without_image > 0 ? (
                  <span className="text-amber-600">Có {health.posts_without_image} bài sử dụng ảnh mặc định</span>
                ) : (
                  <span className="text-green-600">Tất cả bài viết đều có ảnh đại diện</span>
                )}
              </div>
            </div>
          </div>

          {/* Backup status box */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Server className="w-4 h-4 text-primary" />
                <h2 className="font-display text-sm font-bold text-primary uppercase">
                  Trạng Thái Bản Sao Lưu (Backup)
                </h2>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Phương thức:</span>
                  <span className="font-semibold text-foreground">Atomic SQLite Snapshot</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Thư mục lưu trữ:</span>
                  <span className="font-mono text-foreground text-[11px]">backend/backups/</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Dung lượng snapshot:</span>
                  <span className="font-semibold text-foreground">
                    {lastBackupInfo ? `${lastBackupInfo.size_kb} KB` : `${health.db_size_kb} KB`}
                  </span>
                </div>
                {lastBackupInfo?.timestamp && (
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Sao lưu mới nhất:</span>
                    <span className="font-semibold text-green-700">{lastBackupInfo.timestamp}</span>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleBackup}
              disabled={backingUp}
              variant="outline"
              size="sm"
              className="w-full text-xs gap-2 border-primary/30 text-primary hover:bg-primary/5 font-semibold"
            >
              <HardDrive className="w-3.5 h-3.5" />
              {backingUp ? "Đang tiến hành sao lưu..." : "Kích hoạt sao lưu ngay"}
            </Button>
          </div>
        </div>
      )}

      {/* Action Control Panel */}
      <div className="bg-card border border-border p-5 rounded-xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h2 className="font-display text-sm font-bold text-primary uppercase flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" /> Bảng Tác Vụ Điều Hành Vận Hành
          </h2>
          <span className="text-xs text-muted-foreground">Thực thi trực tiếp bằng nút bấm</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-border/60 bg-muted/20 p-4 rounded-xl flex flex-col justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-foreground">Kiểm Tra Toàn Bộ Hệ Thống</div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Quét cấu trúc bảng CSDL, tính toàn vẹn dữ liệu bài viết, ảnh và hộp thư tư vấn.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(true)}
              disabled={checking || loading}
              className="w-full text-xs gap-1.5 h-8 font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
              {checking ? "Đang quét dữ liệu..." : "Chạy kiểm tra"}
            </Button>
          </div>

          <div className="border border-border/60 bg-muted/20 p-4 rounded-xl flex flex-col justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-foreground">Tạo Bản Sao Lưu CSDL Cục Bộ</div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Tự động tạo bản sao lưu snapshot vật lý file CSDL SQLite có gắn mốc thời gian an toàn.
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleBackup}
              disabled={backingUp}
              className="w-full text-xs gap-1.5 h-8 font-semibold bg-primary text-accent hover:bg-primary/90"
            >
              <HardDrive className={`w-3.5 h-3.5 ${backingUp ? "animate-pulse" : ""}`} />
              {backingUp ? "Đang sao lưu..." : "Sao lưu ngay"}
            </Button>
          </div>

          <div className="border border-border/60 bg-muted/20 p-4 rounded-xl flex flex-col justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-foreground">Làm Mới Nhật Ký Vận Hành</div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Cập nhật danh sách các hoạt động và sự kiện kiểm toán hệ thống mới nhất.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(false)}
              disabled={loading}
              className="w-full text-xs gap-1.5 h-8 font-semibold"
            >
              <Clock className="w-3.5 h-3.5" /> Làm mới nhật ký
            </Button>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden space-y-3 p-6">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h2 className="font-display text-sm font-bold text-primary uppercase flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Nhật Ký Kiểm Toán Vận Hành Hệ Thống (Audit Logs)
          </h2>
          <span className="text-xs text-muted-foreground">
            Lưu lại mọi tác vụ nhạy cảm và bảo trì CSDL
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            Chưa có nhật ký hoạt động nào được ghi nhận.
          </div>
        ) : (
          <div className="divide-y divide-border max-h-96 overflow-y-auto pr-1">
            {logs.map((l) => (
              <div key={l.id} className="py-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-start sm:items-center gap-2.5">
                  <span
                    className={`font-mono font-semibold px-2 py-0.5 rounded text-[11px] shrink-0 ${
                      l.status === "success"
                        ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {l.action}
                  </span>
                  <span className="text-foreground">{l.details}</span>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0 font-mono">
                  {l.created_at}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const AgentOpsView = SystemOpsView;
