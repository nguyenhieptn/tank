import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  fetchPostBySlug,
  fetchCategoryTree,
  adminCreatePost,
  adminUpdatePost,
  adminUploadMedia
} from "@/lib/api";
import { CategoryTreeItem } from "@/types/wordpress";
import { RichTextEditor, RichTextEditorRef } from "@/components/admin/RichTextEditor";
import {
  Save,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  Eye,
  FileText,
  Paperclip,
  Download,
  Copy,
  Trash2,
  ExternalLink,
  FileSpreadsheet,
  FileArchive,
  FileCheck,
  Plus,
  FolderTree
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface AttachedDocument {
  name: string;
  url: string;
  size?: string;
  uploadedAt: string;
}

export const PostEditor = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const editorRef = useRef<RichTextEditorRef>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [attachedDocs, setAttachedDocs] = useState<AttachedDocument[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryTreeItem[]>([]);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    parent_category_id: "" as string | number,
    category_id: "" as string | number,
    category: "Thông báo & Hướng dẫn hồ sơ",
    tab: "admissions",
    target_year: 2026,
    post_type: "article",
    excerpt: "",
    content: "",
    image: "",
    status: "published",
  });

  useEffect(() => {
    setLoading(true);
    fetchCategoryTree().then((tree) => {
      setCategoryTree(tree);

      if (isEdit && id) {
        fetchPostBySlug(id).then((post) => {
          if (post) {
            let parentId: number | string = post.parentCategoryId || "";
            if (!parentId && post.categoryId) {
              const found = tree.find((r) => r.children?.some((c) => c.id === post.categoryId));
              if (found) parentId = found.id;
            }
            if (!parentId && tree.length > 0) {
              parentId = tree[0].id;
            }

            setForm({
              title: post.title,
              slug: post.slug,
              parent_category_id: parentId,
              category_id: post.categoryId !== null && post.categoryId !== undefined ? post.categoryId : "",
              category: post.category || "Thông báo & Hướng dẫn hồ sơ",
              tab: post.tab || "admissions",
              target_year: post.targetYear || 2026,
              post_type: post.postType || "article",
              excerpt: post.excerpt || "",
              content: post.content || "",
              image: post.image || "",
              status: post.status || "published",
            });
          } else {
            toast.error("Không tìm thấy bài viết");
            navigate("/admin/posts");
          }
          setLoading(false);
        });
      } else {
        // Default values for new post
        if (tree.length > 0) {
          setForm((prev) => ({
            ...prev,
            parent_category_id: tree[0].id,
            category_id: tree[0].children?.[0]?.id || "",
            category: tree[0].children?.[0]?.name || tree[0].name,
            tab: tree[0].tab || "admissions",
          }));
        }
        setLoading(false);
      }
    });
  }, [id, isEdit, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài viết.");
      return;
    }

    setSaving(true);
    try {
      const contentToSave = editorRef.current ? editorRef.current.getHtml() : form.content;
      const payload = {
        ...form,
        content: contentToSave,
        category_id: form.category_id !== "" ? Number(form.category_id) : null,
        target_year: Number(form.target_year) || 2026,
      };

      if (isEdit && id) {
        await adminUpdatePost(Number(id), payload);
        toast.success("Cập nhật bài viết thành công!");
      } else {
        await adminCreatePost(payload);
        toast.success("Tạo bài viết mới thành công!");
      }
      navigate("/admin/posts");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lưu bài viết thất bại";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      toast.info("Đang tải ảnh lên server...");
      const res = await adminUploadMedia(file);
      if (res.success) {
        setForm((prev) => ({ ...prev, image: res.url }));
        toast.success("Tải ảnh đại diện thành công!");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Tải ảnh thất bại";
      toast.error(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      toast.info(`Đang tải lên tài liệu "${file.name}"...`);
      const res = await adminUploadMedia(file);
      if (res.success) {
        const sizeStr = file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
          : `${Math.round(file.size / 1024)} KB`;

        const newDoc: AttachedDocument = {
          name: file.name,
          url: res.url,
          size: sizeStr,
          uploadedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        };

        setAttachedDocs((prev) => [newDoc, ...prev]);

        // Auto insert download link into content
        const docHtml = `\n<p class="attachment-item" style="margin: 12px 0;"><a href="${res.url}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; color: #1e3a8a; text-decoration: none; font-weight: 600; font-size: 14px;">📎 Tải về tài liệu: ${file.name} (${sizeStr}) 📥</a></p>\n`;
        setForm((prev) => ({
          ...prev,
          content: prev.content ? `${prev.content}${docHtml}` : docHtml.trim(),
        }));

        toast.success(`Đã tải lên và chèn tài liệu "${file.name}" vào bài viết!`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Tải lên tài liệu thất bại";
      toast.error(msg);
    } finally {
      setUploadingDoc(false);
      // Reset input
      e.target.value = "";
    }
  };

  const insertDocIntoContent = (doc: AttachedDocument) => {
    const docHtml = `<p class="attachment-item" style="margin: 12px 0;"><a href="${doc.url}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; color: #1e3a8a; text-decoration: none; font-weight: 600; font-size: 14px;">📎 Tải về tài liệu: ${doc.name} (${doc.size || ""}) 📥</a></p>`;
    if (editorRef.current) {
      editorRef.current.insertHtml(docHtml);
    } else {
      setForm((prev) => ({
        ...prev,
        content: prev.content ? `${prev.content}${docHtml}` : docHtml,
      }));
    }
    toast.success(`Đã chèn tài liệu "${doc.name}" vào bài viết!`);
  };

  const copyDocUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Đã sao chép đường link tải tài liệu!");
  };

  const removeDoc = (index: number) => {
    setAttachedDocs((prev) => prev.filter((_, i) => i !== index));
    toast.info("Đã gỡ tài liệu khỏi danh sách tải lên");
  };

  const handleAutoSummarize = () => {
    const currentContent = editorRef.current ? editorRef.current.getHtml() : form.content;
    if (!currentContent) {
      toast.error("Vui lòng nhập nội dung trước khi trích xuất tóm tắt.");
      return;
    }
    const clean = currentContent.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const summary = clean.slice(0, 220) + "...";
    setForm((prev) => ({ ...prev, excerpt: summary, content: currentContent }));
    toast.success("Đã trích xuất đoạn tóm tắt từ nội dung!");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center animate-pulse text-muted-foreground">
        Đang nạp dữ liệu bài viết...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/posts">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-xl md:text-2xl font-bold text-primary">
              {isEdit ? "Chỉnh Sửa Bài Viết" : "Soạn Thảo Bài Viết Mới"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEdit ? `ID bài viết: #${id}` : "Đăng tải lên Cổng thông tin Nhà trường"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            form="post-form"
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-accent text-xs h-9 gap-1.5 shadow-sm font-bold uppercase tracking-wider"
          >
            <Save className="w-4 h-4" /> {saving ? "Đang lưu..." : "Lưu Bài Viết"}
          </Button>
        </div>
      </div>

      {/* Form */}
      <form id="post-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Tiêu đề bài viết <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                placeholder="Nhập tiêu đề trang trọng..."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="h-11 font-medium text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Trích yếu ngắn gọn (Excerpt)
                </label>
                <button
                  type="button"
                  onClick={handleAutoSummarize}
                  className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
                >
                  <FileText className="w-3 h-3 text-accent" /> Trích xuất từ nội dung
                </button>
              </div>
              <Textarea
                rows={2}
                placeholder="Tóm tắt ngắn 1-2 câu hiển thị ngoài trang chủ..."
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className="text-xs resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Toàn văn nội dung bài viết (Trình soạn thảo trực quan WYSIWYG)
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Bôi đậm, tiêu đề H2/H3, căn lề, bảng biểu, liên kết và đính kèm
                </span>
              </div>
              <RichTextEditor
                ref={editorRef}
                value={form.content}
                onChange={(content) => setForm((prev) => ({ ...prev, content }))}
                placeholder="Nhập hoặc dán nội dung bài viết trực quan tại đây..."
                minHeight="420px"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Settings Column */}
        <div className="lg:col-span-4 space-y-4">
          {/* Publishing Box */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="font-display text-sm font-bold text-primary uppercase border-b border-border pb-2">
              Xuất Bản & Phân Loại
            </h3>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Trạng thái bài viết
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-background border border-input rounded-md"
              >
                <option value="published">Đã xuất bản (Công khai)</option>
                <option value="draft">Bản nháp (Chưa hiện ngoài web)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5 flex items-center justify-between">
                <span>1. Danh mục Cha (Tầng 1)</span>
                <span className="text-[10px] text-primary font-mono font-bold">Tab: {form.tab}</span>
              </label>
              <select
                value={form.parent_category_id}
                onChange={(e) => {
                  const pId = Number(e.target.value);
                  const found = categoryTree.find((r) => r.id === pId);
                  const firstChild = found?.children?.[0];
                  setForm((prev) => ({
                    ...prev,
                    parent_category_id: pId,
                    category_id: firstChild ? firstChild.id : "",
                    category: firstChild ? firstChild.name : (found ? found.name : prev.category),
                    tab: found?.tab || prev.tab,
                  }));
                }}
                className="w-full h-9 px-3 text-xs bg-background border border-input rounded-md font-semibold text-primary"
              >
                {categoryTree.map((root) => (
                  <option key={root.id} value={root.id}>
                    📁 {root.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                2. Danh mục Con (Tầng 2)
              </label>
              <select
                value={form.category_id}
                onChange={(e) => {
                  const cId = Number(e.target.value);
                  const currentParent = categoryTree.find((r) => r.id === Number(form.parent_category_id));
                  const foundChild = currentParent?.children?.find((c) => c.id === cId);
                  setForm((prev) => ({
                    ...prev,
                    category_id: cId,
                    category: foundChild ? foundChild.name : prev.category,
                  }));
                }}
                className="w-full h-9 px-3 text-xs bg-background border border-input rounded-md font-medium"
              >
                {categoryTree
                  .find((r) => r.id === Number(form.parent_category_id))
                  ?.children?.map((child) => (
                    <option key={child.id} value={child.id}>
                      ↳ {child.name}
                    </option>
                  )) || <option value="">(Không có danh mục con)</option>}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Năm sự kiện / TS
                </label>
                <select
                  value={form.target_year}
                  onChange={(e) => setForm({ ...form, target_year: Number(e.target.value) })}
                  className="w-full h-9 px-2 text-xs bg-background border border-input rounded-md font-mono"
                >
                  {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map((y) => (
                    <option key={y} value={y}>
                      Năm {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Loại tin bài
                </label>
                <select
                  value={form.post_type}
                  onChange={(e) => setForm({ ...form, post_type: e.target.value })}
                  className="w-full h-9 px-2 text-xs bg-background border border-input rounded-md"
                >
                  <option value="article">Tin bài</option>
                  <option value="announcement">Thông báo</option>
                  <option value="document">Văn bản</option>
                  <option value="video">Video</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Đường dẫn tĩnh (Slug)
              </label>
              <Input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="Tự sinh nếu bỏ trống"
                className="h-9 text-xs text-muted-foreground font-mono"
              />
            </div>
          </div>

          {/* Document Upload Box */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm space-y-3">
            <h3 className="font-display text-sm font-bold text-primary uppercase border-b border-border pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-primary" />
                Tài Liệu & Văn Bản Đính Kèm
              </span>
              {attachedDocs.length > 0 && (
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">
                  {attachedDocs.length} tệp
                </span>
              )}
            </h3>

            <p className="text-[11px] text-muted-foreground">
              Hỗ trợ tải lên file văn bản thông báo, đề án, biểu mẫu (PDF, Word, Excel, Zip...).
            </p>

            {/* Document Upload Button */}
            <div>
              <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-primary/30 hover:border-primary bg-primary/5 rounded-lg cursor-pointer transition-colors text-xs text-primary font-semibold">
                <Upload className={`w-4 h-4 ${uploadingDoc ? "animate-bounce" : ""}`} />
                <span>{uploadingDoc ? "Đang tải tệp lên..." : "Tải lên tài liệu đính kèm"}</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt"
                  onChange={handleDocUpload}
                  disabled={uploadingDoc}
                  className="hidden"
                />
              </label>
            </div>

            {/* Uploaded Documents List */}
            {attachedDocs.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="text-[11px] font-semibold text-foreground">
                  Tài liệu đã tải lên trong phiên:
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {attachedDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-muted/40 border border-border/80 rounded-lg text-xs space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="font-medium text-foreground truncate max-w-[190px]" title={doc.name}>
                          📄 {doc.name}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDoc(idx)}
                          className="text-muted-foreground hover:text-destructive shrink-0"
                          title="Gỡ khỏi danh sách"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[10px] text-muted-foreground flex items-center justify-between">
                        <span>{doc.size}</span>
                        <span>{doc.uploadedAt}</span>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1 border-t border-border/40">
                        <button
                          type="button"
                          onClick={() => insertDocIntoContent(doc)}
                          className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Chèn vào bài
                        </button>
                        <span className="text-muted-foreground">|</span>
                        <button
                          type="button"
                          onClick={() => copyDocUrl(doc.url)}
                          className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> Copy link
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Featured Image Box */}
          <div className="bg-card border border-border p-5 rounded-xl shadow-sm space-y-3">
            <h3 className="font-display text-sm font-bold text-primary uppercase border-b border-border pb-2 flex items-center justify-between">
              <span>Ảnh Đại Diện</span>
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
            </h3>

            {form.image && (
              <div className="space-y-2">
                <div className="rounded-lg overflow-hidden border border-border aspect-[16/10] bg-muted relative">
                  <img
                    src={form.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (editorRef.current) {
                      editorRef.current.insertImage(form.image, form.title);
                      toast.success("Đã chèn ảnh vào bài viết!");
                    }
                  }}
                  className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Chèn ảnh này vào nội dung bài
                </button>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Đường dẫn ảnh (URL)
              </label>
              <Input
                type="text"
                placeholder="/uploads/..."
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Hoặc tải ảnh từ máy tính
              </label>
              <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border hover:border-primary rounded-lg cursor-pointer transition-colors text-xs text-muted-foreground">
                <Upload className={`w-4 h-4 ${uploadingImage ? "animate-spin" : ""}`} />
                <span>{uploadingImage ? "Đang tải ảnh..." : "Chọn ảnh tải lên..."}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
