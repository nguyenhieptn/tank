import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchCategoryTree,
  fetchCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory
} from "@/lib/api";
import { CategoryTreeItem, CategoryChildItem, WPCategory } from "@/types/wordpress";
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  FolderPlus,
  Tag,
  Layers,
  GraduationCap,
  Building2,
  Shield,
  Users,
  FileText,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const CategoriesManager = () => {
  const [tree, setTree] = useState<CategoryTreeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    parent_id: "" as string | number,
    tab: "admissions",
    sort_order: 1,
    icon: "Folder",
    description: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchCategoryTree();
      setTree(data);
    } catch (err) {
      toast.error("Không thể tải cây chuyên mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = (parentId: number | null = null, tabDefault: string = "school") => {
    setEditingId(null);
    setForm({
      name: "",
      slug: "",
      parent_id: parentId !== null ? parentId : "",
      tab: tabDefault,
      sort_order: 1,
      icon: "Folder",
      description: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (cat: CategoryTreeItem | CategoryChildItem, defaultTab: string) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      parent_id: cat.parent_id !== null && cat.parent_id !== undefined ? cat.parent_id : "",
      tab: cat.tab || defaultTab,
      sort_order: cat.sort_order || 1,
      icon: cat.icon || "Folder",
      description: cat.description || "",
    });
    setModalOpen(true);
  };

  const handleSlugify = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm((prev) => ({
      ...prev,
      name: val,
      slug: !editingId ? handleSlugify(val) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên chuyên mục");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || handleSlugify(form.name),
        parent_id: form.parent_id !== "" ? Number(form.parent_id) : null,
        tab: form.tab,
        sort_order: Number(form.sort_order) || 0,
        icon: form.icon,
        description: form.description.trim(),
      };

      if (editingId) {
        await adminUpdateCategory(editingId, payload);
        toast.success("Cập nhật chuyên mục thành công!");
      } else {
        await adminCreateCategory(payload);
        toast.success("Tạo chuyên mục mới thành công!");
      }

      setModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Thao tác thất bại";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa chuyên mục:\n"${name}"?\n(Lưu ý: Nếu có bài viết thuộc chuyên mục này, hệ thống sẽ tự động gán bài viết về chuyên mục mặc định).`)) {
      return;
    }

    try {
      await adminDeleteCategory(id);
      toast.success(`Đã xóa chuyên mục "${name}"`);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Xóa chuyên mục thất bại";
      toast.error(msg);
    }
  };

  const getRootIcon = (iconName: string) => {
    switch (iconName) {
      case "GraduationCap": return <GraduationCap className="w-5 h-5 text-amber-500" />;
      case "Building2": return <Building2 className="w-5 h-5 text-blue-600" />;
      case "Shield": return <Shield className="w-5 h-5 text-red-600" />;
      case "Users": return <Users className="w-5 h-5 text-emerald-600" />;
      case "FileText": return <FileText className="w-5 h-5 text-indigo-600" />;
      default: return <FolderTree className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-primary flex items-center gap-2.5">
            <FolderTree className="w-7 h-7 text-destructive" /> Quản Lý Chuyên Mục 2 Tầng
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Cấu trúc phân cấp Danh mục Cha (Tầng 1) và Danh mục Con (Tầng 2) cho toàn bộ Cổng thông tin Nhà trường.
          </p>
        </div>

        <Button
          onClick={() => openCreateModal(null, "school")}
          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs h-9 gap-1.5 shadow-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Thêm Danh Mục Cha Mới
        </Button>
      </div>

      {/* Main Tree View */}
      {loading ? (
        <div className="p-12 text-center text-muted-foreground animate-pulse text-xs">
          Đang tải cấu trúc cây chuyên mục...
        </div>
      ) : (
        <div className="space-y-5">
          {tree.map((root, rootIdx) => (
            <div
              key={root.id}
              className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-all hover:border-primary/40"
            >
              {/* Root Category Header */}
              <div className="p-4 bg-muted/30 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center shadow-xs">
                    {getRootIcon(root.icon)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base font-bold text-foreground">
                        {rootIdx + 1}. {root.name}
                      </span>
                      <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full border border-primary/20">
                        {root.count} bài viết
                      </span>
                      <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded">
                        Tab: {root.tab}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {root.description || `Slug: ${root.slug}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openCreateModal(root.id, root.tab)}
                    className="h-8 text-xs gap-1 text-primary hover:text-primary font-semibold border-primary/30 hover:bg-primary/5"
                  >
                    <FolderPlus className="w-3.5 h-3.5" /> Thêm danh mục con
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditModal(root, root.tab)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    title="Chỉnh sửa danh mục cha"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(root.id, root.name)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    title="Xóa danh mục cha"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Child Categories List */}
              <div className="p-4 bg-background">
                {root.children && root.children.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {root.children.map((child, cIdx) => (
                      <div
                        key={child.id}
                        className="p-3 bg-muted/20 hover:bg-muted/40 border border-border/80 rounded-lg flex items-center justify-between gap-2 group transition-colors"
                      >
                        <div className="flex items-start gap-2.5 overflow-hidden">
                          <span className="text-xs text-muted-foreground font-mono mt-0.5">
                            {cIdx + 1}.
                          </span>
                          <div className="overflow-hidden">
                            <div className="font-semibold text-xs text-foreground truncate" title={child.name}>
                              {child.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5">
                              <span className="font-medium text-primary font-mono">{child.count} bài</span>
                              <span>•</span>
                              <span className="truncate font-mono">{child.slug}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => openEditModal(child, root.tab)}
                            className="p-1 hover:text-primary transition-colors"
                            title="Sửa chuyên mục con"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(child.id, child.name)}
                            className="p-1 hover:text-destructive transition-colors"
                            title="Xóa chuyên mục con"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-border rounded-lg text-xs text-muted-foreground">
                    Chưa có danh mục con nào. Bấm <strong>"Thêm danh mục con"</strong> ở góc trên để tạo phân cấp.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add/Edit Category */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
              <h3 className="font-display font-bold text-sm text-primary flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-destructive" />
                {editingId ? "Chỉnh Sửa Chuyên Mục" : "Thêm Chuyên Mục Mới"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Tên chuyên mục <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Ví dụ: Chỉ tiêu & Điểm chuẩn, Huấn luyện SSCĐ..."
                  value={form.name}
                  onChange={handleNameChange}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Đường dẫn tĩnh (Slug)
                  </label>
                  <Input
                    type="text"
                    placeholder="chi-tieu-diem-chuan"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Danh mục Cha (Cấp bậc)
                  </label>
                  <select
                    value={form.parent_id}
                    onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-background border border-input rounded-md font-medium"
                  >
                    <option value="">[Không có - Là Danh mục Cha]</option>
                    {tree.map((r) => (
                      <option key={r.id} value={r.id} disabled={editingId === r.id}>
                        ↳ Thuộc: {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Chuyên đề hiển thị (Tab)
                  </label>
                  <select
                    value={form.tab}
                    onChange={(e) => setForm({ ...form, tab: e.target.value })}
                    className="w-full h-9 px-3 text-xs bg-background border border-input rounded-md"
                  >
                    <option value="admissions">Tuyển sinh Quân sự</option>
                    <option value="school">Hoạt động Nhà trường</option>
                    <option value="army">Quân sự — Quốc phòng</option>
                    <option value="students">Đào tạo & Học viên</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Thứ tự sắp xếp (Sort Order)
                  </label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Mô tả chuyên mục
                </label>
                <Textarea
                  rows={2}
                  placeholder="Mô tả tóm tắt ý nghĩa của chuyên mục này..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                  className="text-xs h-8"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving}
                  className="text-xs h-8 bg-primary hover:bg-primary/90 text-accent font-bold"
                >
                  {saving ? "Đang lưu..." : editingId ? "Cập Nhật" : "Tạo Chuyên Mục"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
