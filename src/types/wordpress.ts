export interface WPCategoryDetail {
  id: number;
  name: string;
  slug: string;
}

export interface WPPost {
  id: number;
  date: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  categories: number[];
  category_details?: WPCategoryDetail[];
  featured_media_url?: string | null;
}

export interface WPCategory {
  id: number;
  count: number;
  description: string;
  link?: string;
  name: string;
  slug: string;
  parent_id?: number | null;
  parent_name?: string | null;
  tab?: string;
  sort_order?: number;
  icon?: string;
}

export interface CategoryChildItem {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  tab: string;
  sort_order: number;
  icon: string;
  description?: string;
  count: number;
}

export interface CategoryTreeItem {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  tab: string;
  sort_order: number;
  icon: string;
  description?: string;
  count: number;
  children: CategoryChildItem[];
}

export interface UnifiedArticle {
  id: string | number;
  slug: string;
  title: string;
  date: string;
  rawDate: string;
  categoryId?: number | null;
  category: string;
  categories: string[];
  parentCategoryId?: number | null;
  parentCategoryName?: string | null;
  parentCategorySlug?: string | null;
  tab: "admissions" | "school" | "army" | "students";
  targetYear?: number | null;
  postType?: string;
  excerpt: string;
  content: string;
  cleanContent: string;
  image?: string | null;
  status?: string;
  views?: number;
}

export interface AdmissionsInquiry {
  fullname: string;
  phone: string;
  province?: string;
  message?: string;
}

export interface InquiryItem {
  id: number;
  fullname: string;
  phone: string;
  province?: string;
  message?: string;
  status: string;
  notes?: string;
  created_at: string;
}

export interface DashboardHealthStats {
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
