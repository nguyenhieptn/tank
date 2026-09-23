from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class PostBase(BaseModel):
    title: str
    category_id: Optional[int] = None
    category: Optional[str] = "Tin tức"
    categories: Optional[List[str]] = []
    tab: Optional[str] = "school"
    target_year: Optional[int] = None
    post_type: Optional[str] = "article"
    excerpt: Optional[str] = ""
    content: Optional[str] = ""
    image: Optional[str] = None
    status: Optional[str] = "published"

class PostCreate(PostBase):
    slug: Optional[str] = None

class PostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    category_id: Optional[int] = None
    category: Optional[str] = None
    categories: Optional[List[str]] = None
    tab: Optional[str] = None
    target_year: Optional[int] = None
    post_type: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    image: Optional[str] = None
    status: Optional[str] = None

class PostOut(BaseModel):
    id: int
    title: str
    slug: str
    date: str
    rawDate: Optional[str] = None
    categoryId: Optional[int] = None
    category: str
    categories: List[str]
    parentCategoryId: Optional[int] = None
    parentCategoryName: Optional[str] = None
    parentCategorySlug: Optional[str] = None
    tab: str
    targetYear: Optional[int] = None
    postType: Optional[str] = "article"
    excerpt: str
    content: str
    cleanContent: Optional[str] = None
    image: Optional[str] = None
    status: str
    views: int

    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    name: str
    slug: Optional[str] = None
    parent_id: Optional[int] = None
    tab: Optional[str] = "school"
    sort_order: Optional[int] = 0
    icon: Optional[str] = "Folder"
    description: Optional[str] = ""

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    parent_id: Optional[int] = None
    tab: Optional[str] = None
    sort_order: Optional[int] = None
    icon: Optional[str] = None
    description: Optional[str] = None

class CategoryChildOut(BaseModel):
    id: int
    name: str
    slug: str
    parent_id: Optional[int] = None
    tab: str
    sort_order: int
    icon: str
    description: Optional[str] = ""
    count: int

    class Config:
        from_attributes = True

class CategoryTreeOut(BaseModel):
    id: int
    name: str
    slug: str
    parent_id: Optional[int] = None
    tab: str
    sort_order: int
    icon: str
    description: Optional[str] = ""
    count: int
    children: List[CategoryChildOut] = []

    class Config:
        from_attributes = True

class PostListResponse(BaseModel):
    posts: List[PostOut]
    total: int
    totalPages: int
    page: int
    perPage: int

class AdmissionConfigOut(BaseModel):
    school_code: str
    school_name: str
    major_code: str
    major_name: str
    target_year: int
    north_score: float
    south_score: float
    target_count: str
    criteria: str
    countdown_date: str
    download_form_url: str

class AdmissionConfigUpdate(BaseModel):
    school_code: Optional[str] = None
    school_name: Optional[str] = None
    major_code: Optional[str] = None
    major_name: Optional[str] = None
    target_year: Optional[int] = None
    north_score: Optional[float] = None
    south_score: Optional[float] = None
    target_count: Optional[str] = None
    criteria: Optional[str] = None
    countdown_date: Optional[str] = None
    download_form_url: Optional[str] = None

class InquiryCreate(BaseModel):
    fullname: str
    phone: str
    province: Optional[str] = ""
    message: Optional[str] = ""

class InquiryOut(BaseModel):
    id: int
    fullname: str
    phone: str
    province: str
    message: str
    status: str
    notes: Optional[str] = ""
    created_at: datetime

    class Config:
        from_attributes = True

class SystemActionRequest(BaseModel):
    action: str  # "check-health", "backup-db", "clean-content"
    params: Optional[dict] = {}

AgentActionRequest = SystemActionRequest

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    token: str
    username: str
    role: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
    confirm_password: Optional[str] = None

