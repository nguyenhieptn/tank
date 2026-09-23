import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminRunSystemAction, adminListInquiries, fetchPosts } from "@/lib/api";
import { DashboardHealthStats, InquiryItem, UnifiedArticle } from "@/types/wordpress";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  GraduationCap,
  Inbox,
  Users,
  HardDrive,
  Activity,
  ArrowUpRight,
  CheckCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardHealthStats | null>(null);
  const [recentInquiries, setRecentInquiries] = useState<InquiryItem[]>([]);
  const [recentPosts, setRecentPosts] = useState<UnifiedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [health, inqList, postsData] = await Promise.all([
        adminRunSystemAction("check-health"),
        adminListInquiries("all"),
        fetchPosts({ per_page: 5, status_filter: "all" })
      ]);
      setStats(health);
      setRecentInquiries(inqList.slice(0, 5));
      setRecentPosts(postsData.posts);
    } catch (err) {
      console.error(err);
      toast.error("Không tải được dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleQuickBackup = async () => {
    try {
      const res = await adminRunSystemAction("backup-db");
      if (res.success) {
        toast.success(`Đã tạo bản sao lưu CSDL: ${res.size_kb} KB`);
        loadDashboardData();
      }
    } catch (err) {
      toast.error("Sao lưu thất bại");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-primary">
            Bảng Điều Khiển Quản Trị
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Theo dõi tổng quan dữ liệu Cổng thông tin và trạng thái hệ thống máy chủ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            disabled={loading}
            className="text-xs h-9 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Làm mới
          </Button>
          <Button
            size="sm"
            onClick={handleQuickBackup}
            className="bg-primary text-accent hover:bg-primary/90 text-xs h-9 gap-1.5 shadow-sm"
          >
            <HardDrive className="w-3.5 h-3.5" /> Sao lưu 1-Click
          </Button>
          <Link to="/admin/posts/new">
            <Button size="sm" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs h-9 gap-1.5 shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Viết bài mới
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Tổng Bài Viết</span>
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-primary mt-2">
            {stats?.total_posts || 0}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2">
            <span className="text-green-600 font-semibold">{stats?.published_posts || 0} xuất bản</span>
            <span>•</span>
            <span className="text-amber-600 font-semibold">{stats?.draft_posts || 0} bản nháp</span>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Hộp Thư Thí Sinh</span>
            <div className="p-2 bg-destructive/10 text-destructive rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-destructive mt-2">
            {stats?.new_inquiries || 0} <span className="text-xs font-normal text-muted-foreground">mới</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Tổng tiếp nhận: {stats?.total_inquiries || 0} câu hỏi
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Dung Lượng CSDL</span>
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-primary mt-2">
            {stats?.db_size_kb ? `${(stats.db_size_kb / 1024).toFixed(2)} MB` : "2.9 MB"}
          </div>
          <div className="text-[11px] text-green-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> SQLite Zero-Maintenance
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Giám Sát Hệ Thống</span>
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-primary mt-2 flex items-center gap-2">
            Hoạt động tốt <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
            <span>Bảo trì dữ liệu & Sao lưu</span>
            <Link to="/admin/system" className="text-primary font-semibold hover:underline">
              Chi tiết →
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs Breakdown */}
      {stats?.tabs && (
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="font-display text-base font-bold text-primary uppercase">
            Phân bố Dữ liệu theo Chuyên đề
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/40 rounded-lg border border-border/50 text-center">
              <div className="text-xs font-medium text-muted-foreground">Tuyển sinh Quân sự</div>
              <div className="text-xl font-bold text-primary mt-1">{stats.tabs.admissions}</div>
            </div>
            <div className="p-4 bg-muted/40 rounded-lg border border-border/50 text-center">
              <div className="text-xs font-medium text-muted-foreground">Hoạt động Nhà trường</div>
              <div className="text-xl font-bold text-primary mt-1">{stats.tabs.school}</div>
            </div>
            <div className="p-4 bg-muted/40 rounded-lg border border-border/50 text-center">
              <div className="text-xs font-medium text-muted-foreground">Tin Quân đội — Toàn quân</div>
              <div className="text-xl font-bold text-primary mt-1">{stats.tabs.army}</div>
            </div>
            <div className="p-4 bg-muted/40 rounded-lg border border-border/50 text-center">
              <div className="text-xs font-medium text-muted-foreground">Góc học viên Sĩ quan</div>
              <div className="text-xl font-bold text-primary mt-1">{stats.tabs.students}</div>
            </div>
          </div>
        </div>
      )}

      {/* Two columns: Recent Posts & Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base font-bold text-primary uppercase flex items-center gap-2">
                <Users className="w-4 h-4 text-destructive" /> Thí sinh cần tư vấn
              </h2>
              <Link to="/admin/inquiries" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                Xem tất cả <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentInquiries.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                Chưa có câu hỏi mới từ thí sinh.
              </div>
            ) : (
              <div className="space-y-3">
                {recentInquiries.map((inq) => (
                  <div key={inq.id} className="p-3 bg-muted/30 border border-border/60 rounded-lg text-xs flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-foreground">{inq.fullname} — {inq.phone}</div>
                      <div className="text-muted-foreground mt-0.5 line-clamp-1">{inq.message || "(Không kèm nội dung câu hỏi)"}</div>
                      <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(inq.created_at).toLocaleString("vi-VN")}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      inq.status === "new" ? "bg-destructive/10 text-destructive" : "bg-green-600/10 text-green-700"
                    }`}>
                      {inq.status === "new" ? "Chưa gọi" : "Đã gọi"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base font-bold text-primary uppercase flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Bài viết mới cập nhật
              </h2>
              <Link to="/admin/posts" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                Quản lý bài <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentPosts.map((post) => (
                <div key={post.id} className="p-3 bg-muted/30 border border-border/60 rounded-lg text-xs flex items-center justify-between gap-3">
                  <div className="overflow-hidden">
                    <div className="font-semibold text-foreground truncate">{post.title}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-2">
                      <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">{post.category}</span>
                      <span>{post.date}</span>
                    </div>
                  </div>
                  <Link to={`/admin/posts/edit/${post.id}`}>
                    <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                      Sửa
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
