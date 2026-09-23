import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  fetchPosts,
  fetchCategoryTree,
  adminDeletePost,
  adminRestorePost,
  adminPermanentDeletePost,
  adminEmptyTrash,
  fetchPostStats
} from "@/lib/api";
import { UnifiedArticle, CategoryTreeItem } from "@/types/wordpress";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  RotateCcw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  FolderTree,
  FileText,
  Video,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const PostsManager = () => {
  const [posts, setPosts] = useState<UnifiedArticle[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryTreeItem[]>([]);
  const [stats, setStats] = useState({ all: 0, published: 0, draft: 0, trash: 0 });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [parentFilter, setParentFilter] = useState("all");
  const [childFilter, setChildFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const data = await fetchPostStats();
      setStats(data);
    } catch (err) {
      console.warn("Failed to fetch post stats:", err);
    }
  };

  useEffect(() => {
    fetchCategoryTree().then(setCategoryTree);
    loadStats();
  }, []);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const activeCategoryId =
        childFilter !== "all"
          ? Number(childFilter)
          : parentFilter !== "all"
          ? Number(parentFilter)
          : undefined;

      const res = await fetchPosts({
        page,
        per_page: 15,
        search: search.trim() || undefined,
        category_id: activeCategoryId,
        year: yearFilter !== "all" ? yearFilter : undefined,
        status_filter: statusFilter === "all" ? "all" : statusFilter,
      });
      setPosts(res.posts);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      toast.error("Không tải được danh sách bài viết");
    } finally {
      setLoading(false);
    }
  }, [page, childFilter, parentFilter, search, yearFilter, statusFilter]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadPosts();
  };

  // Move to Trash (Soft Delete)
  const handleSoftDelete = async (post: UnifiedArticle) => {
    if (!window.confirm(`Chuyển bài viết vào thùng rác:\n"${post.title}"?`)) {
      return;
    }

    try {
      await adminDeletePost(Number(post.id));
      toast.success(`Đã chuyển bài viết "${post.title}" vào thùng rác!`);
      loadPosts();
      loadStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Chuyển vào thùng rác thất bại";
      toast.error(msg);
    }
  };

  // Restore from Trash
  const handleRestore = async (post: UnifiedArticle) => {
    try {
      await adminRestorePost(Number(post.id));
      toast.success(`Đã khôi phục bài viết "${post.title}" thành công!`);
      loadPosts();
      loadStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Khôi phục bài viết thất bại";
      toast.error(msg);
    }
  };

  // Delete Permanently
  const handlePermanentDelete = async (post: UnifiedArticle) => {
    if (
      !window.confirm(
        `CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN bài viết:\n"${post.title}"?\n\nThao tác này KHÔNG THỂ khôi phục lại!`
      )
    ) {
      return;
    }

    try {
      await adminPermanentDeletePost(Number(post.id));
      toast.success(`Đã xóa vĩnh viễn bài viết "${post.title}"!`);
      loadPosts();
      loadStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Xóa vĩnh viễn thất bại";
      toast.error(msg);
    }
  };

  // Empty Trash
  const handleEmptyTrash = async () => {
    if (
      !window.confirm(
        `CẢNH BÁO: Bạn có chắc chắn muốn XÓA SẠCH toàn bộ ${stats.trash} bài viết trong thùng rác?\n\nHành động này không thể hoàn tác!`
      )
    ) {
      return;
    }

    try {
      const res = await adminEmptyTrash();
      toast.success(res.message || "Đã dọn sạch thùng rác!");
      loadPosts();
      loadStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Dọn thùng rác thất bại";
      toast.error(msg);
    }
  };

  const isTrashView = statusFilter === "trash";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-primary">
            Quản Lý Bài Viết & Tin Tức
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Tổng cộng <strong>{stats.all}</strong> bài viết đang hoạt động trong hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/posts/new">
            <Button className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs h-9 gap-1.5 shadow-sm">
              <Plus className="w-4 h-4" /> Viết bài mới
            </Button>
          </Link>
        </div>
      </div>

      {/* WordPress-Style Status Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => {
              setStatusFilter("all");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              statusFilter === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <span>Tất cả</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                statusFilter === "all" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {stats.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusFilter("published");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              statusFilter === "published"
                ? "bg-green-700 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Đã xuất bản</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                statusFilter === "published" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {stats.published}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusFilter("draft");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              statusFilter === "draft"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Bản nháp</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                statusFilter === "draft" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {stats.draft}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusFilter("trash");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              statusFilter === "trash"
                ? "bg-destructive text-destructive-foreground shadow-sm"
                : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Thùng rác</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                statusFilter === "trash"
                  ? "bg-white/25 text-white"
                  : stats.trash > 0
                  ? "bg-destructive/15 text-destructive"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {stats.trash}
            </span>
          </button>
        </div>

        {isTrashView && stats.trash > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEmptyTrash}
            className="h-8 text-xs gap-1.5 shadow-sm font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" /> Dọn sạch thùng rác ({stats.trash})
          </Button>
        )}
      </div>

      {/* Trash View Info Alert */}
      {isTrashView && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3.5 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Các bài viết trong Thùng rác không hiển thị trên Cổng thông tin công khai. Bạn có thể bấm <strong>"Khôi phục"</strong> để đưa bài viết trở lại hoặc <strong>"Xóa vĩnh viễn"</strong>.
            </span>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm theo tiêu đề hoặc nội dung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </form>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {/* Parent Category Filter */}
          <select
            value={parentFilter}
            onChange={(e) => {
              setParentFilter(e.target.value);
              setChildFilter("all");
              setPage(1);
            }}
            className="h-9 px-3 text-xs bg-background border border-input rounded-md font-semibold text-primary"
          >
            <option value="all">Tất cả danh mục cha</option>
            {categoryTree.map((root) => (
              <option key={root.id} value={root.id}>
                📁 {root.name} ({root.count})
              </option>
            ))}
          </select>

          {/* Child Category Filter */}
          <select
            value={childFilter}
            onChange={(e) => {
              setChildFilter(e.target.value);
              setPage(1);
            }}
            disabled={parentFilter === "all"}
            className="h-9 px-3 text-xs bg-background border border-input rounded-md font-medium disabled:opacity-50"
          >
            <option value="all">Tất cả danh mục con</option>
            {categoryTree
              .find((r) => r.id === Number(parentFilter))
              ?.children?.map((child) => (
                <option key={child.id} value={child.id}>
                  ↳ {child.name} ({child.count})
                </option>
              ))}
          </select>

          {/* Year Filter */}
          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 px-2 text-xs bg-background border border-input rounded-md font-mono"
          >
            <option value="all">Tất cả năm</option>
            {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3.5">Tiêu đề bài viết</th>
                <th className="p-3.5">Phân cấp Chuyên mục (Tầng 1 & 2)</th>
                <th className="p-3.5">Năm & Ngày đăng</th>
                <th className="p-3.5 text-center">Trạng thái</th>
                <th className="p-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground animate-pulse">
                    Đang nạp danh sách bài viết...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    {isTrashView
                      ? "Thùng rác hiện đang trống."
                      : "Không tìm thấy bài viết nào phù hợp với bộ lọc."}
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5 max-w-md">
                      <div className="font-semibold text-foreground line-clamp-1 flex items-center gap-1.5">
                        {post.postType === "video" && <Video className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        {post.postType === "document" && <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                        {post.postType === "announcement" && <Bell className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                        <span>{post.title}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                        {post.excerpt}
                      </div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        {post.parentCategoryName && (
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            {post.parentCategoryName}
                          </span>
                        )}
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-medium text-xs inline-block w-max">
                          {post.category}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        {post.targetYear && (
                          <span className="text-[10px] bg-primary text-primary-foreground font-mono font-bold px-1.5 py-0.2 rounded">
                            {post.targetYear}
                          </span>
                        )}
                        <span>{post.date}</span>
                      </div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-center">
                      {post.status === "trash" ? (
                        <span className="bg-destructive/10 text-destructive border border-destructive/20 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                          <Trash2 className="w-2.5 h-2.5" /> Thùng rác
                        </span>
                      ) : post.status === "draft" ? (
                        <span className="bg-amber-500/10 text-amber-700 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                          <Clock className="w-2.5 h-2.5" /> Bản nháp
                        </span>
                      ) : (
                        <span className="bg-green-600/10 text-green-700 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                          <CheckCircle className="w-2.5 h-2.5" /> Xuất bản
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-right space-x-1">
                      {isTrashView ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestore(post)}
                            className="h-7 px-2 text-[11px] gap-1 border-primary/30 text-primary hover:bg-primary/10"
                            title="Khôi phục bài viết này"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Khôi phục
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePermanentDelete(post)}
                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                            title="Xóa vĩnh viễn"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <a
                            href={`/siquantank/bai-viet/${post.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Xem bài trên web"
                          >
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                          </a>
                          <Link to={`/admin/posts/edit/${post.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Chỉnh sửa">
                              <Edit2 className="w-3.5 h-3.5 text-primary" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSoftDelete(post)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            title="Chuyển vào thùng rác"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Trang <strong>{page}</strong> trên tổng số <strong>{totalPages}</strong> trang ({total} bài viết)
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="h-8 text-xs gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="h-8 text-xs gap-1"
              >
                Sau <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
