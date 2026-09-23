import os
import sys
import json
import hashlib
import re
import uuid
from typing import List, Optional
from datetime import datetime, timedelta, timezone

# Starlette 1.6.0 compatibility patch for FastAPI
import starlette.routing
from fastapi import FastAPI

_orig_router_init = starlette.routing.Router.__init__
def _patched_router_init(self, *args, **kwargs):
    kwargs.pop('on_startup', None)
    kwargs.pop('on_shutdown', None)
    return _orig_router_init(self, *args, **kwargs)
starlette.routing.Router.__init__ = _patched_router_init

_orig_app_init = FastAPI.__init__
def _patched_app_init(self, *args, **kwargs):
    self.max_body_size = None
    _orig_app_init(self, *args, **kwargs)
    self.max_body_size = None
FastAPI.__init__ = _patched_app_init

import jwt
from fastapi import Depends, HTTPException, Query, UploadFile, File, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

# Add project root to sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(BASE_DIR))

from backend.database import engine, Base, get_db, DB_PATH
from backend.models import Post, Category, Department, AdmissionConfig, Inquiry, AdminUser, SystemLog, AgentLog
from backend.schemas import (
    PostCreate, PostUpdate, PostOut, PostListResponse,
    CategoryCreate, CategoryUpdate, CategoryTreeOut, CategoryChildOut,
    AdmissionConfigOut, AdmissionConfigUpdate,
    InquiryCreate, InquiryOut,
    LoginRequest, LoginResponse, SystemActionRequest, AgentActionRequest
)
from backend.system_ops import (
    slugify, strip_html, backup_db, check_health, log_action
)

# Ensure tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Trường Sĩ quan Tăng thiết giáp - Cổng Thông Tin & Tuyển Sinh API",
    description="Backend API độc lập thay thế WordPress cho Trường Sĩ quan Tăng thiết giáp.",
    version="2.1.0"
)

# CORS Middleware
CORS_ORIGINS = [
    "http://localhost:8082",
    "http://127.0.0.1:8082",
    "http://localhost:8086",
    "http://127.0.0.1:8086",
    "https://demo.expsolution.io",
    "http://demo.expsolution.io",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|.*\.expsolution\.io)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- UPLOADS & STATIC FILES -----------------
import urllib.parse
from starlette.routing import get_route_path

class CombinedStaticFiles(StaticFiles):
    def __init__(self, directories, **kwargs):
        self.custom_dirs = [os.path.abspath(d) for d in directories if os.path.exists(d)]
        primary = self.custom_dirs[0] if self.custom_dirs else "."
        super().__init__(directory=primary, check_dir=False, **kwargs)
        self.all_directories = self.custom_dirs

    def get_path(self, scope) -> str:
        route_path = urllib.parse.unquote(get_route_path(scope))
        return os.path.normpath(os.path.join(*route_path.split("/")))

LOCAL_UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(LOCAL_UPLOADS_DIR, exist_ok=True)

UPLOAD_DIRS = [
    LOCAL_UPLOADS_DIR,
    "/app/uploads",
    "/home/ubuntu/nevir/siquantank/legacy_uploads",
    os.path.join(os.path.dirname(BASE_DIR), "legacy_uploads"),
]
app.mount("/uploads", CombinedStaticFiles(UPLOAD_DIRS), name="uploads")

ALLOWED_UPLOAD_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".webp", ".gif", ".ico",
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".zip", ".rar"
}

# ----------------- SECURITY & JWT AUTH -----------------
JWT_SECRET = os.getenv("JWT_SECRET_KEY", "siquantank-secret-2026-tgh-defense-cms-key-secure")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

security = HTTPBearer(auto_error=False)

PASSWORD_SALT = os.getenv("PASSWORD_SALT", "siquantank_salt_defense_2026_qnd")

def hash_pw(pw: str, salt: str = PASSWORD_SALT) -> str:
    return hashlib.sha256((salt + pw).encode('utf-8')).hexdigest()

def verify_password(plain_pw: str, hashed_pw: str) -> bool:
    # 1. Salted hash check
    if hashed_pw == hash_pw(plain_pw):
        return True
    # 2. Legacy raw SHA-256 fallback check
    if hashed_pw == hashlib.sha256(plain_pw.encode('utf-8')).hexdigest():
        return True
    return False

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def get_current_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> AdminUser:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Yêu cầu xác thực đăng nhập quản trị viên (Missing Authorization Token).",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token không chứa thông tin định danh hợp lệ.",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mã xác thực token không hợp lệ.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(AdminUser).filter(AdminUser.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tài khoản quản trị viên không tồn tại hoặc đã bị khóa.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# ----------------- UTILITIES -----------------
def sanitize_content(html_str: str | None) -> str:
    if not html_str:
        return ""
    # Strip Gutenberg block comments
    cleaned = re.sub(r'<!--\s*/?wp:[^>]*-->', '', html_str)
    # Strip legacy WordPress shortcodes
    cleaned = re.sub(r'\[caption[^\]]*\]', '', cleaned)
    cleaned = re.sub(r'\[/caption\]', '', cleaned)
    # Replace external WordPress uploads with local proxy uploads
    cleaned = re.sub(r'https?://siquantangthietgiap\.vn/wp-content/uploads/', '/siquantank/uploads/', cleaned)
    # Replace root uploads /uploads/ with /siquantank/uploads/ if not already prefixed
    cleaned = re.sub(r'(href|src|data)=([\"\'])/uploads/', r'\1=\2/siquantank/uploads/', cleaned)
    return cleaned.strip()

def sanitize_image_url(url: str | None) -> str | None:
    if not url:
        return None
    url = re.sub(r'https?://siquantangthietgiap\.vn/wp-content/uploads/', '/siquantank/uploads/', url)
    if url.startswith("/uploads/"):
        return f"/siquantank{url}"
    return url

def to_post_out(post: Post) -> PostOut:
    parent_id = None
    parent_name = None
    parent_slug = None
    if post.category_obj:
        if post.category_obj.parent:
            parent_id = post.category_obj.parent.id
            parent_name = post.category_obj.parent.name
            parent_slug = post.category_obj.parent.slug
        elif post.category_obj.parent_id is None:
            parent_id = post.category_obj.id
            parent_name = post.category_obj.name
            parent_slug = post.category_obj.slug

    return PostOut(
        id=post.id,
        title=post.title,
        slug=post.slug,
        date=post.date_str or (post.raw_date.strftime("%d/%m/%Y") if post.raw_date else ""),
        rawDate=post.raw_date.strftime("%Y-%m-%d %H:%M:%S") if post.raw_date else None,
        categoryId=post.category_id,
        category=post.category,
        categories=post.categories_list,
        parentCategoryId=parent_id,
        parentCategoryName=parent_name,
        parentCategorySlug=parent_slug,
        tab=post.tab,
        targetYear=post.target_year,
        postType=post.post_type or "article",
        excerpt=post.excerpt,
        content=sanitize_content(post.content),
        cleanContent=post.clean_content,
        image=sanitize_image_url(post.image),
        status=post.status,
        views=post.views or 0,
    )

# ----------------- AUTH -----------------
@app.post("/api/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.username == payload.username).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Tên đăng nhập hoặc mật khẩu không chính xác.")

    # Auto-upgrade legacy hash to salted hash
    salted = hash_pw(payload.password)
    if user.hashed_password != salted:
        user.hashed_password = salted
        db.commit()

    # Generate standard signed JWT token
    token = create_access_token({
        "sub": user.username,
        "role": user.role,
        "id": user.id
    })
    log_action("admin_login", f"Quản trị viên '{user.username}' đăng nhập thành công.")
    return LoginResponse(token=token, username=user.username, role=user.role)

@app.get("/api/auth/me")
def get_current_user_profile(admin: AdminUser = Depends(get_current_admin)):
    return {
        "id": admin.id,
        "username": admin.username,
        "role": admin.role
    }

CATEGORY_SLUG_ALIASES = {
    "tin-tuc": "all",
    "tuyen-sinh": "tuyen-sinh-quan-su",
    "nha-truong": "hoat-dong-nha-truong",
    "quan-doi": "quan-su-quoc-phong",
    "hoc-vien": "dao-tao-hoc-vien",
}

# ----------------- POSTS -----------------
@app.get("/api/posts", response_model=PostListResponse)
def list_posts(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    category: Optional[str] = None,
    category_id: Optional[int] = None,
    tab: Optional[str] = None,
    year: Optional[int] = None,
    post_type: Optional[str] = None,
    search: Optional[str] = None,
    status_filter: Optional[str] = "published",
    db: Session = Depends(get_db)
):
    if category and category.lower() in CATEGORY_SLUG_ALIASES:
        aliased = CATEGORY_SLUG_ALIASES[category.lower()]
        category = None if aliased == "all" else aliased

    query = db.query(Post)

    if status_filter == "trash":
        query = query.filter(Post.status == "trash")
    elif status_filter and status_filter != "all":
        query = query.filter(Post.status == status_filter)
    else:
        query = query.filter(Post.status != "trash")

    if tab:
        query = query.filter(Post.tab == tab)

    if category_id:
        target_cat = db.query(Category).filter(Category.id == category_id).first()
        if target_cat and target_cat.children:
            child_ids = [c.id for c in target_cat.children] + [target_cat.id]
            query = query.filter(Post.category_id.in_(child_ids))
        else:
            query = query.filter(Post.category_id == category_id)
    elif category:
        target_cat = db.query(Category).filter(
            or_(Category.slug == category, Category.name == category)
        ).first()
        if target_cat:
            if target_cat.children:
                child_ids = [c.id for c in target_cat.children] + [target_cat.id]
                query = query.filter(
                    or_(
                        Post.category_id.in_(child_ids),
                        Post.category == category,
                        Post.categories_json.like(f"%{category}%")
                    )
                )
            else:
                query = query.filter(
                    or_(
                        Post.category_id == target_cat.id,
                        Post.category == category,
                        Post.categories_json.like(f"%{category}%")
                    )
                )
        else:
            query = query.filter(
                or_(
                    Post.category == category,
                    Post.categories_json.like(f"%{category}%")
                )
            )

    if year:
        query = query.filter(
            or_(
                Post.target_year == year,
                Post.date_str.like(f"%{year}%")
            )
        )

    if post_type:
        query = query.filter(Post.post_type == post_type)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Post.title.like(s),
                Post.clean_content.like(s),
                Post.excerpt.like(s)
            )
        )

    total = query.count()
    total_pages = max(1, (total + per_page - 1) // per_page)

    posts = query.order_by(desc(Post.raw_date), desc(Post.id)).offset((page - 1) * per_page).limit(per_page).all()

    return PostListResponse(
        posts=[to_post_out(p) for p in posts],
        total=total,
        totalPages=total_pages,
        page=page,
        perPage=per_page
    )

@app.get("/api/posts/stats/counts")
def get_posts_counts(db: Session = Depends(get_db)):
    all_count = db.query(Post).filter(Post.status != "trash").count()
    published_count = db.query(Post).filter(Post.status == "published").count()
    draft_count = db.query(Post).filter(Post.status == "draft").count()
    trash_count = db.query(Post).filter(Post.status == "trash").count()
    return {
        "all": all_count,
        "published": published_count,
        "draft": draft_count,
        "trash": trash_count
    }

@app.delete("/api/posts/trash/empty")
def empty_trash(admin: AdminUser = Depends(get_current_admin), db: Session = Depends(get_db)):
    trashed = db.query(Post).filter(Post.status == "trash").all()
    count = len(trashed)
    cat_ids = set()
    for p in trashed:
        if p.category_id:
            cat_ids.add(p.category_id)
        db.delete(p)
    db.commit()

    for cid in cat_ids:
        cnt = db.query(Post).filter(Post.category_id == cid, Post.status != "trash").count()
        db.query(Category).filter(Category.id == cid).update({"count": cnt})
    db.commit()

    log_action("empty_trash", f"Quản trị viên '{admin.username}' đã dọn sạch thùng rác ({count} bài viết)", "warning")
    return {"success": True, "count": count, "message": f"Đã dọn sạch {count} bài viết trong thùng rác."}

@app.get("/api/posts/{slug_or_id}", response_model=PostOut)
def get_post(slug_or_id: str, db: Session = Depends(get_db)):
    post = None
    if slug_or_id.isdigit():
        post = db.query(Post).filter(Post.id == int(slug_or_id)).first()
    if not post:
        post = db.query(Post).filter(Post.slug == slug_or_id).first()
    if not post and "-" in slug_or_id:
        parts = slug_or_id.rsplit("-", 1)
        if parts[-1].isdigit():
            post = db.query(Post).filter(Post.id == int(parts[-1])).first()

    if not post:
        raise HTTPException(status_code=404, detail="Bài viết không tồn tại.")

    # Increment view count
    if post.status == "published":
        post.views = (post.views or 0) + 1
        db.commit()
    return to_post_out(post)

@app.post("/api/posts", response_model=PostOut)
def create_post(payload: PostCreate, admin: AdminUser = Depends(get_current_admin), db: Session = Depends(get_db)):
    title = payload.title.strip()
    slug = payload.slug.strip() if payload.slug else slugify(title)

    if db.query(Post).filter(Post.slug == slug).first():
        slug = f"{slug}-{int(datetime.now().timestamp())}"

    clean = strip_html(payload.content or "")
    excerpt = payload.excerpt or (clean[:200] + "..." if len(clean) > 200 else clean)
    date_now = datetime.now()

    category_id = payload.category_id
    cat_name = payload.category or "Tin tức"
    tab = payload.tab or "school"
    if category_id:
        c_obj = db.query(Category).filter(Category.id == category_id).first()
        if c_obj:
            cat_name = c_obj.name
            tab = c_obj.tab or tab

    cats = payload.categories or [cat_name]
    target_year = payload.target_year or date_now.year
    post_type = payload.post_type or "article"

    new_post = Post(
        title=title,
        slug=slug,
        date_str=date_now.strftime("%d/%m/%Y"),
        raw_date=date_now,
        category_id=category_id,
        category=cat_name,
        categories_json=json.dumps(cats, ensure_ascii=False),
        tab=tab,
        target_year=target_year,
        post_type=post_type,
        excerpt=excerpt,
        content=payload.content or "",
        clean_content=clean,
        image=payload.image,
        status=payload.status or "published",
        views=0
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    if category_id:
        cnt = db.query(Post).filter(Post.category_id == category_id, Post.status != "trash").count()
        db.query(Category).filter(Category.id == category_id).update({"count": cnt})
        db.commit()

    log_action("create_post", f"'{admin.username}' tạo bài viết: '{title}' (ID: {new_post.id})")
    return to_post_out(new_post)

@app.put("/api/posts/{post_id}", response_model=PostOut)
def update_post(post_id: int, payload: PostUpdate, admin: AdminUser = Depends(get_current_admin), db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Bài viết không tồn tại.")

    old_cat_id = post.category_id
    if payload.title is not None:
        post.title = payload.title
    if payload.slug is not None:
        post.slug = payload.slug
    if payload.category_id is not None:
        post.category_id = payload.category_id
        c_obj = db.query(Category).filter(Category.id == payload.category_id).first()
        if c_obj:
            post.category = c_obj.name
            post.tab = c_obj.tab or post.tab
    elif payload.category is not None:
        post.category = payload.category
    if payload.categories is not None:
        post.categories_json = json.dumps(payload.categories, ensure_ascii=False)
    if payload.tab is not None:
        post.tab = payload.tab
    if payload.target_year is not None:
        post.target_year = payload.target_year
    if payload.post_type is not None:
        post.post_type = payload.post_type
    if payload.content is not None:
        post.content = payload.content
        post.clean_content = strip_html(payload.content)
    if payload.excerpt is not None:
        post.excerpt = payload.excerpt
    if payload.image is not None:
        post.image = payload.image
    if payload.status is not None:
        post.status = payload.status

    db.commit()
    db.refresh(post)

    if old_cat_id and old_cat_id != post.category_id:
        cnt_old = db.query(Post).filter(Post.category_id == old_cat_id, Post.status != "trash").count()
        db.query(Category).filter(Category.id == old_cat_id).update({"count": cnt_old})
    if post.category_id:
        cnt_new = db.query(Post).filter(Post.category_id == post.category_id, Post.status != "trash").count()
        db.query(Category).filter(Category.id == post.category_id).update({"count": cnt_new})
    db.commit()

    log_action("update_post", f"'{admin.username}' cập nhật bài viết: '{post.title}' (ID: {post.id})")
    return to_post_out(post)

@app.put("/api/posts/{post_id}/restore")
def restore_post(post_id: int, admin: AdminUser = Depends(get_current_admin), db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Bài viết không tồn tại.")

    title = post.title
    post.status = "published"
    db.commit()

    if post.category_id:
        cnt = db.query(Post).filter(Post.category_id == post.category_id, Post.status != "trash").count()
        db.query(Category).filter(Category.id == post.category_id).update({"count": cnt})
        db.commit()

    log_action("restore_post", f"'{admin.username}' khôi phục bài viết: '{title}' (ID: {post_id})", "info")
    return {"success": True, "message": f"Đã khôi phục bài viết '{title}' thành công."}

@app.delete("/api/posts/{post_id}/permanent")
def permanent_delete_post(post_id: int, admin: AdminUser = Depends(get_current_admin), db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Bài viết không tồn tại.")

    title = post.title
    cat_id = post.category_id
    db.delete(post)
    db.commit()

    if cat_id:
        cnt = db.query(Post).filter(Post.category_id == cat_id, Post.status != "trash").count()
        db.query(Category).filter(Category.id == cat_id).update({"count": cnt})
        db.commit()

    log_action("permanent_delete_post", f"'{admin.username}' đã xóa vĩnh viễn bài viết: '{title}' (ID: {post_id})", "warning")
    return {"success": True, "message": f"Đã xóa vĩnh viễn bài viết '{title}'."}

@app.delete("/api/posts/{post_id}")
def delete_post(post_id: int, admin: AdminUser = Depends(get_current_admin), db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Bài viết không tồn tại.")

    title = post.title
    post.status = "trash"
    db.commit()

    if post.category_id:
        cnt = db.query(Post).filter(Post.category_id == post.category_id, Post.status != "trash").count()
        db.query(Category).filter(Category.id == post.category_id).update({"count": cnt})
        db.commit()

    log_action("trash_post", f"'{admin.username}' chuyển bài viết vào thùng rác: '{title}' (ID: {post_id})", "warning")
    return {"success": True, "message": f"Đã chuyển bài viết '{title}' vào thùng rác."}

# ----------------- ADMISSIONS -----------------
@app.get("/api/admissions", response_model=AdmissionConfigOut)
def get_admissions(db: Session = Depends(get_db)):
    cfg = db.query(AdmissionConfig).filter(AdmissionConfig.id == 1).first()
    if not cfg:
        cfg = AdmissionConfig(id=1)
        db.add(cfg)
        db.commit()
        db.refresh(cfg)
    return cfg

@app.put("/api/admissions", response_model=AdmissionConfigOut)
def update_admissions(payload: AdmissionConfigUpdate, admin: AdminUser = Depends(get_current_admin), db: Session = Depends(get_db)):
    cfg = db.query(AdmissionConfig).filter(AdmissionConfig.id == 1).first()
    if not cfg:
        cfg = AdmissionConfig(id=1)
        db.add(cfg)

    for k, v in payload.dict(exclude_unset=True).items():
        setattr(cfg, k, v)

    db.commit()
    db.refresh(cfg)
    log_action("update_admissions", f"'{admin.username}' cập nhật cấu hình tuyển sinh năm {cfg.target_year}")
    return cfg

# ----------------- DEPARTMENTS -----------------
@app.get("/api/departments")
def get_departments(db: Session = Depends(get_db)):
    depts = db.query(Department).order_by(Department.sort_order).all()
    res = {"phong": [], "khoa": [], "tieudoan": []}
    for d in depts:
        item = {
            "id": str(d.id),
            "name": d.name,
            "content": d.content
        }
        if d.dept_type in res:
            res[d.dept_type].append(item)
    return res

# ----------------- INQUIRIES -----------------
@app.get("/api/inquiries", response_model=List[InquiryOut])
def list_inquiries(status: Optional[str] = None, admin: AdminUser = Depends(get_current_admin), db: Session = Depends(get_db)):
    query = db.query(Inquiry)
    if status and status != "all":
        query = query.filter(Inquiry.status == status)
    return query.order_by(desc(Inquiry.created_at)).all()

@app.post("/api/inquiries")
def create_inquiry(payload: InquiryCreate, db: Session = Depends(get_db)):
    fullname = payload.fullname.strip()
    phone = payload.phone.strip()

    if not fullname or not phone:
        raise HTTPException(status_code=400, detail="Vui lòng cung cấp họ tên và số điện thoại liên hệ.")

    # Validate phone format (Vietnamese phone standard: 10 digits starting with 0 or +84)
    clean_phone = re.sub(r'[\s.-]', '', phone)
    if not re.match(r'^(0|\+84)[3|5|7|8|9][0-9]{8}$', clean_phone):
        if not re.match(r'^(0|\+84)[0-9]{9,10}$', clean_phone):
            raise HTTPException(status_code=400, detail="Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại liên hệ gồm 10 chữ số.")

    # Rate limiting: max 3 inquiries from same phone in the last 15 minutes
    fifteen_mins_ago = datetime.now() - timedelta(minutes=15)
    recent_count = db.query(Inquiry).filter(
        Inquiry.phone == phone,
        Inquiry.created_at >= fifteen_mins_ago
    ).count()
    if recent_count >= 3:
        raise HTTPException(
            status_code=429,
            detail="Bạn đã gửi yêu cầu tư vấn gần đây. Ban Tuyển sinh Nhà trường đã ghi nhận và sẽ liên hệ sớm nhất."
        )

    inq = Inquiry(
        fullname=fullname,
        phone=phone,
        province=payload.province.strip() if payload.province else "",
        message=payload.message.strip() if payload.message else "",
        status="new"
    )
    db.add(inq)
    db.commit()
    db.refresh(inq)
    log_action("inquiry_received", f"Nhận câu hỏi tư vấn từ: {inq.fullname} ({inq.phone})")
    return {"success": True, "message": "Gửi thông tin tư vấn thành công! Ban Tuyển sinh Nhà trường sẽ liên hệ sớm nhất."}

@app.put("/api/inquiries/{inquiry_id}")
def update_inquiry_status(inquiry_id: int, status: str = Query(...), notes: Optional[str] = "", admin: AdminUser = Depends(get_current_admin), db: Session = Depends(get_db)):
    inq = db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
    if not inq:
        raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi.")
    inq.status = status
    if notes:
        inq.notes = notes
    db.commit()
    return {"success": True, "message": "Cập nhật trạng thái thành công."}

# ----------------- CATEGORIES -----------------
@app.get("/api/categories")
def list_categories(tree: bool = Query(False), db: Session = Depends(get_db)):
    if tree:
        root_cats = db.query(Category).filter(Category.parent_id == None).order_by(Category.sort_order).all()
        tree_result = []
        for r in root_cats:
            child_list = []
            r_total_count = 0
            for child in r.children:
                c_cnt = db.query(Post).filter(
                    Post.status == "published",
                    Post.category_id == child.id
                ).count()
                child.count = c_cnt
                r_total_count += c_cnt
                child_list.append({
                    "id": child.id,
                    "name": child.name,
                    "slug": child.slug,
                    "parent_id": child.parent_id,
                    "tab": child.tab or r.tab or "school",
                    "sort_order": child.sort_order or 0,
                    "icon": child.icon or "Folder",
                    "description": child.description or "",
                    "count": c_cnt
                })

            direct_root_cnt = db.query(Post).filter(
                Post.status == "published",
                Post.category_id == r.id
            ).count()
            r_total_count += direct_root_cnt

            tree_result.append({
                "id": r.id,
                "name": r.name,
                "slug": r.slug,
                "parent_id": None,
                "tab": r.tab or "school",
                "sort_order": r.sort_order or 0,
                "icon": r.icon or "Folder",
                "description": r.description or "",
                "count": r_total_count,
                "children": sorted(child_list, key=lambda x: x["sort_order"])
            })
        return tree_result

    cats = db.query(Category).order_by(Category.sort_order).all()
    result = []
    for c in cats:
        if c.parent_id is None:
            cnt = db.query(Post).filter(
                Post.status == "published",
                or_(
                    Post.category_id == c.id,
                    Post.category_id.in_([child.id for child in c.children])
                )
            ).count()
        else:
            cnt = db.query(Post).filter(
                Post.status == "published",
                Post.category_id == c.id
            ).count()

        result.append({
            "id": c.id,
            "name": c.name,
            "slug": c.slug,
            "parent_id": c.parent_id,
            "parent_name": c.parent.name if c.parent else None,
            "tab": c.tab or (c.parent.tab if c.parent else "school"),
            "sort_order": c.sort_order or 0,
            "icon": c.icon or "Folder",
            "description": c.description or "",
            "count": cnt
        })
    return result

@app.post("/api/categories")
def create_category(payload: CategoryCreate, admin: AdminUser = Depends(get_current_admin), db: Session = Depends(get_db)):
    name = payload.name.strip()
    slug = payload.slug.strip() if payload.slug else slugify(name)

    if db.query(Category).filter(Category.slug == slug).first():
        slug = f"{slug}-{int(datetime.now().timestamp())}"

    parent_id = payload.parent_id
    tab = payload.tab or "school"
    if parent_id:
        parent = db.query(Category).filter(Category.id == parent_id).first()
        if not parent:
            raise HTTPException(status_code=400, detail="Danh mục cha không tồn tại.")
        tab = parent.tab or tab

    new_cat = Category(
        name=name,
        slug=slug,
        parent_id=parent_id,
        tab=tab,
        sort_order=payload.sort_order or 0,
        icon=payload.icon or "Folder",
        description=payload.description or "",
        count=0
    )
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    log_action("create_category", f"'{admin.username}' tạo chuyên mục mới: '{name}' (ID: {new_cat.id})")
    return new_cat

@app.put("/api/categories/{cat_id}")
def update_category(cat_id: int, payload: CategoryUpdate, admin: AdminUser = Depends(get_current_admin), db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Chuyên mục không tồn tại.")

    if payload.name is not None:
        cat.name = payload.name.strip()
    if payload.slug is not None:
        cat.slug = payload.slug.strip()
    if payload.parent_id is not None:
        if payload.parent_id == cat_id:
            raise HTTPException(status_code=400, detail="Danh mục không thể là cha của chính nó.")
        cat.parent_id = payload.parent_id
    if payload.tab is not None:
        cat.tab = payload.tab
    if payload.sort_order is not None:
        cat.sort_order = payload.sort_order
    if payload.icon is not None:
        cat.icon = payload.icon
    if payload.description is not None:
        cat.description = payload.description

    db.commit()
    db.refresh(cat)
    log_action("update_category", f"'{admin.username}' cập nhật chuyên mục: '{cat.name}' (ID: {cat.id})")
    return cat

@app.delete("/api/categories/{cat_id}")
def delete_category(cat_id: int, admin: AdminUser = Depends(get_current_admin), db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Chuyên mục không tồn tại.")

    child_count = db.query(Category).filter(Category.parent_id == cat_id).count()
    if child_count > 0:
        raise HTTPException(status_code=400, detail=f"Không thể xóa chuyên mục cha khi đang chứa {child_count} chuyên mục con. Vui lòng chuyển hoặc xóa các chuyên mục con trước.")

    post_count = db.query(Post).filter(Post.category_id == cat_id).count()
    if post_count > 0:
        fallback_cat = db.query(Category).filter(Category.slug == "hoat-dong-nha-truong").first()
        fallback_id = fallback_cat.id if fallback_cat else None
        db.query(Post).filter(Post.category_id == cat_id).update({"category_id": fallback_id, "category": "Hoạt động Nhà trường"})

    name = cat.name
    db.delete(cat)
    db.commit()
    log_action("delete_category", f"'{admin.username}' xóa chuyên mục: '{name}' (ID: {cat_id})", "warning")
    return {"success": True, "message": f"Đã xóa chuyên mục '{name}' thành công."}

# ----------------- SYSTEM OPERATIONS & MONITORING -----------------
@app.post("/api/system/action")
def run_system_action(req: SystemActionRequest, admin: AdminUser = Depends(get_current_admin), db: Session = Depends(get_db)):
    action = req.action
    if action == "check-health":
        return check_health()
    elif action == "backup-db":
        return backup_db()
    else:
        raise HTTPException(status_code=400, detail=f"Hành động hệ thống không hợp lệ: {action}")

@app.get("/api/system/logs")
def get_system_logs(limit: int = 50, admin: AdminUser = Depends(get_current_admin), db: Session = Depends(get_db)):
    logs = db.query(SystemLog).order_by(desc(SystemLog.created_at)).limit(limit).all()
    return [
        {
            "id": l.id,
            "action": l.action,
            "details": l.details,
            "status": l.status,
            "created_at": l.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
        for l in logs
    ]

# Backwards-compatibility aliases for legacy agent routes
@app.post("/api/agent/action")
def run_agent_action_compat(req: AgentActionRequest, admin: AdminUser = Depends(get_current_admin), db: Session = Depends(get_db)):
    return run_system_action(req, admin, db)

@app.get("/api/agent/logs")
def get_agent_logs_compat(limit: int = 50, admin: AdminUser = Depends(get_current_admin), db: Session = Depends(get_db)):
    return get_system_logs(limit, admin, db)

MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB

# ----------------- SECURE MEDIA UPLOAD -----------------
@app.post("/api/media/upload")
async def upload_media(file: UploadFile = File(...), admin: AdminUser = Depends(get_current_admin)):
    orig_name = file.filename or "upload"
    ext = os.path.splitext(orig_name)[1].lower()
    if ext not in ALLOWED_UPLOAD_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Định dạng tệp '{ext}' không được phép tải lên. Các định dạng hỗ trợ: {', '.join(sorted(ALLOWED_UPLOAD_EXTENSIONS))}"
        )

    # Sanitize and create safe unique filename
    safe_base = re.sub(r'[^a-zA-Z0-9_-]', '_', os.path.splitext(orig_name)[0])[:30]
    filename = f"{int(datetime.now().timestamp())}_{uuid.uuid4().hex[:8]}_{safe_base}{ext}"
    filepath = os.path.join(LOCAL_UPLOADS_DIR, filename)

    try:
        content = await file.read()
        if len(content) > MAX_UPLOAD_SIZE_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"Kích thước tệp vượt quá giới hạn tối đa cho phép (25MB). Dung lượng tệp: {round(len(content)/(1024*1024), 2)}MB"
            )
        with open(filepath, "wb") as f:
            f.write(content)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Không thể ghi tệp lên đĩa máy chủ: {str(e)}")

    log_action("upload_media", f"'{admin.username}' tải lên tệp: {filename} ({round(len(content)/1024, 1)} KB)")

    return {
        "success": True,
        "url": f"/uploads/{filename}",
        "filename": filename
    }
