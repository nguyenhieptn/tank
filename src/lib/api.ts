import { UnifiedArticle, AdmissionsInquiry, WPCategory, CategoryTreeItem } from "@/types/wordpress";

const base = import.meta.env.BASE_URL || "";
const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
const API_BASE = import.meta.env.VITE_API_URL || cleanBase;

export interface FetchPostsResult {
  posts: UnifiedArticle[];
  total: number;
  totalPages: number;
  isLive: boolean;
}

export interface AdmissionConfigData {
  school_code: string;
  school_name: string;
  major_code: string;
  major_name: string;
  target_year: number;
  north_score: number;
  south_score: number;
  target_count: string;
  criteria: string;
  countdown_date: string;
  download_form_url: string;
}

// Fallback items (empty array to avoid bundling heavy 2.8MB news.json into client bundle)
export const localArticles: UnifiedArticle[] = [];

/**
 * Helper to perform authenticated requests using JWT Bearer token
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem("tank_admin_token");
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem("tank_admin_token");
    localStorage.removeItem("tank_admin_user");
    if (
      typeof window !== "undefined" &&
      window.location.pathname.includes("/admin") &&
      !window.location.pathname.includes("/admin/login")
    ) {
      window.location.href = `${cleanBase}/admin/login`;
    }
  }
  return res;
}

export async function fetchPosts(params: {
  page?: number;
  per_page?: number;
  category?: string;
  category_id?: number;
  search?: string;
  tab?: string;
  year?: number | string;
  post_type?: string;
  status_filter?: string;
} = {}): Promise<FetchPostsResult> {
  const { page = 1, per_page = 10, category, category_id, search, tab, year, post_type, status_filter = "published" } = params;

  try {
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("per_page", String(per_page));
    if (category) query.set("category", category);
    if (category_id) query.set("category_id", String(category_id));
    if (search) query.set("search", search);
    if (tab) query.set("tab", tab);
    if (year && year !== "all") query.set("year", String(year));
    if (post_type && post_type !== "all") query.set("post_type", post_type);
    if (status_filter) query.set("status_filter", status_filter);

    const res = await fetch(`${API_BASE}/api/posts?${query.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    return {
      posts: data.posts,
      total: data.total,
      totalPages: data.totalPages,
      isLive: true,
    };
  } catch (err) {
    console.warn("fetchPosts fallback:", err);
    return {
      posts: [],
      total: 0,
      totalPages: 1,
      isLive: false,
    };
  }
}

export async function fetchPostBySlug(slug: string): Promise<UnifiedArticle | null> {
  try {
    const res = await fetch(`${API_BASE}/api/posts/${encodeURIComponent(slug)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("fetchPostBySlug fallback:", err);
  }
  return null;
}

export async function fetchCategories(tree = false): Promise<WPCategory[]> {
  try {
    const res = await fetch(`${API_BASE}/api/categories${tree ? "?tree=true" : ""}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("fetchCategories fallback:", err);
  }
  return [];
}

export async function fetchCategoryTree(): Promise<CategoryTreeItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/categories?tree=true`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("fetchCategoryTree error:", err);
  }
  return [];
}

export async function adminCreateCategory(payload: {
  name: string;
  slug?: string;
  parent_id?: number | null;
  tab?: string;
  sort_order?: number;
  icon?: string;
  description?: string;
}) {
  const res = await authFetch(`${API_BASE}/api/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Tạo chuyên mục thất bại");
  }
  return await res.json();
}

export async function adminUpdateCategory(id: number, payload: Partial<{
  name: string;
  slug: string;
  parent_id: number | null;
  tab: string;
  sort_order: number;
  icon: string;
  description: string;
}>) {
  const res = await authFetch(`${API_BASE}/api/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Cập nhật chuyên mục thất bại");
  }
  return await res.json();
}

export async function adminDeleteCategory(id: number) {
  const res = await authFetch(`${API_BASE}/api/categories/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Xóa chuyên mục thất bại");
  }
  return await res.json();
}

export async function fetchAdmissions(): Promise<AdmissionConfigData> {
  try {
    const res = await fetch(`${API_BASE}/api/admissions`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("fetchAdmissions fallback:", err);
  }
  return {
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
  };
}

export interface DepartmentItem {
  id: string;
  name: string;
  content: string;
}

export interface DepartmentsData {
  phong: DepartmentItem[];
  khoa: DepartmentItem[];
  tieudoan: DepartmentItem[];
}

export async function fetchDepartments(): Promise<DepartmentsData> {
  try {
    const res = await fetch(`${API_BASE}/api/departments`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("fetchDepartments fallback:", err);
  }
  return { phong: [], khoa: [], tieudoan: [] };
}

export async function submitInquiry(payload: AdmissionsInquiry): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, message: data.message };
    }
    const err = await res.json();
    return { success: false, message: err.detail || "Không thể gửi câu hỏi" };
  } catch {
    return { success: false, message: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau." };
  }
}

// ----------------- ADMIN API -----------------

export async function adminLogin(username: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Đăng nhập thất bại");
  }
  return await res.json();
}

export async function adminCreatePost(postData: Partial<UnifiedArticle>) {
  const res = await authFetch(`${API_BASE}/api/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Tạo bài viết thất bại");
  }
  return await res.json();
}

export async function adminUpdatePost(postId: number, postData: Partial<UnifiedArticle>) {
  const res = await authFetch(`${API_BASE}/api/posts/${postId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Cập nhật thất bại");
  }
  return await res.json();
}

export async function adminDeletePost(postId: number) {
  const res = await authFetch(`${API_BASE}/api/posts/${postId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Xóa thất bại");
  }
  return await res.json();
}

export async function adminRestorePost(postId: number) {
  const res = await authFetch(`${API_BASE}/api/posts/${postId}/restore`, {
    method: "PUT",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Khôi phục bài viết thất bại");
  }
  return await res.json();
}

export async function adminPermanentDeletePost(postId: number) {
  const res = await authFetch(`${API_BASE}/api/posts/${postId}/permanent`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Xóa vĩnh viễn thất bại");
  }
  return await res.json();
}

export async function adminEmptyTrash() {
  const res = await authFetch(`${API_BASE}/api/posts/trash/empty`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Dọn thùng rác thất bại");
  }
  return await res.json();
}

export async function fetchPostStats(): Promise<{
  all: number;
  published: number;
  draft: number;
  trash: number;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/posts/stats/counts`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("fetchPostStats fallback:", err);
  }
  return { all: 0, published: 0, draft: 0, trash: 0 };
}

export async function adminUpdateAdmissions(data: Partial<AdmissionConfigData>) {
  const res = await authFetch(`${API_BASE}/api/admissions`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Cập nhật tuyển sinh thất bại");
  }
  return await res.json();
}

export async function adminListInquiries(status: string = "all") {
  const res = await authFetch(`${API_BASE}/api/inquiries?status=${status}`);
  if (!res.ok) throw new Error("Không lấy được danh sách câu hỏi");
  return await res.json();
}

export async function adminUpdateInquiry(id: number, status: string, notes: string = "") {
  const res = await authFetch(`${API_BASE}/api/inquiries/${id}?status=${status}&notes=${encodeURIComponent(notes)}`, {
    method: "PUT",
  });
  if (!res.ok) throw new Error("Cập nhật câu hỏi thất bại");
  return await res.json();
}

export async function adminRunSystemAction(action: string, params: Record<string, unknown> = {}) {
  const res = await authFetch(`${API_BASE}/api/system/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, params }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Thực hiện tác vụ hệ thống thất bại");
  }
  return await res.json();
}

export async function adminGetSystemLogs(limit: number = 50) {
  const res = await authFetch(`${API_BASE}/api/system/logs?limit=${limit}`);
  if (!res.ok) throw new Error("Không lấy được nhật ký vận hành hệ thống");
  return await res.json();
}

// Backward-compatible aliases
export const adminRunAgentAction = adminRunSystemAction;
export const adminGetAgentLogs = adminGetSystemLogs;

export async function adminUploadMedia(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await authFetch(`${API_BASE}/api/media/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Tải file thất bại");
  }
  return await res.json();
}

export async function adminChangePassword(payload: {
  old_password: string;
  new_password: string;
  confirm_password?: string;
}) {
  const res = await authFetch(`${API_BASE}/api/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Đổi mật khẩu không thành công.");
  }
  return data;
}

