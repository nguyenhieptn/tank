import os
import sys
import json
import hashlib
from datetime import datetime

# Setup paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(BASE_DIR))

from backend.database import engine, Base, SessionLocal
from backend.models import Post, Category, AdmissionConfig, Inquiry, AdminUser, AgentLog
from backend.agent_ops import slugify, strip_html

def hash_pw(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def run_import():
    print("Creating tables in tank.db...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Admin User
        admin = db.query(AdminUser).filter(AdminUser.username == "admin").first()
        if not admin:
            admin = AdminUser(
                username="admin",
                hashed_password=hash_pw("Tank@2026"),
                role="admin"
            )
            db.add(admin)
            print("Created default admin user: admin / Tank@2026")

        # 2. Admission Config
        adm_cfg = db.query(AdmissionConfig).filter(AdmissionConfig.id == 1).first()
        if not adm_cfg:
            adm_cfg = AdmissionConfig(
                id=1,
                school_code="TGH",
                school_name="Trường Sĩ quan Tăng thiết giáp",
                major_code="7860206",
                major_name="Chỉ huy - Tham mưu Tăng thiết giáp",
                target_year=2026,
                north_score=18.0,
                south_score=17.0,
                target_count="150 chỉ tiêu",
                criteria="A00 (Toán, Lý, Hóa), A01 (Toán, Lý, Anh)",
                countdown_date="2026-09-01T00:00:00",
                download_form_url="/siquantank/documents/mau-dang-ky-xet-tuyen.doc"
            )
            db.add(adm_cfg)
            print("Created initial AdmissionConfig for 2026.")

        # 3. Import Posts from news.json
        news_json_path = os.path.join(os.path.dirname(BASE_DIR), "src", "data", "news.json")
        if not os.path.exists(news_json_path):
            print(f"Warning: {news_json_path} not found!")
            return

        with open(news_json_path, "r", encoding="utf-8") as f:
            news_items = json.load(f)

        print(f"Loading {len(news_items)} articles into SQLite...")
        imported_count = 0
        categories_set = set()

        for item in news_items:
            post_id = int(item.get("id"))
            existing = db.query(Post).filter(Post.id == post_id).first()
            if existing:
                continue

            title = item.get("title", "Không có tiêu đề")
            slug = item.get("slug") or f"{slugify(title)}-{post_id}"
            category = item.get("category") or "Tin tức"
            cats = item.get("categories") or [category]
            categories_set.add(category)
            for c in cats:
                categories_set.add(c)

            content = item.get("content") or item.get("cleanContent") or ""
            clean_content = item.get("cleanContent") or strip_html(content)
            excerpt = item.get("excerpt") or (clean_content[:200] + "..." if len(clean_content) > 200 else clean_content)
            
            # Format image path
            img = item.get("image")
            if img and not img.startswith("http") and not img.startswith("/"):
                img = f"/{img}"

            raw_date_str = item.get("rawDate")
            raw_date = datetime.utcnow()
            if raw_date_str:
                try:
                    raw_date = datetime.strptime(raw_date_str, "%Y-%m-%d %H:%M:%S")
                except:
                    pass

            post = Post(
                id=post_id,
                title=title,
                slug=slug,
                date_str=item.get("date", raw_date.strftime("%d/%m/%Y")),
                raw_date=raw_date,
                category=category,
                categories_json=json.dumps(cats, ensure_ascii=False),
                tab=item.get("tab", "school"),
                excerpt=excerpt,
                content=content,
                clean_content=clean_content,
                image=img,
                status="published",
                views=0
            )
            db.add(post)
            imported_count += 1

        # 4. Create Categories
        slug_added = set()
        for cat_name in categories_set:
            if not cat_name:
                continue
            cat_slug = slugify(cat_name)
            if cat_slug in slug_added:
                continue
            if not db.query(Category).filter(Category.slug == cat_slug).first():
                db.add(Category(name=cat_name, slug=cat_slug))
                slug_added.add(cat_slug)

        db.commit()
        print(f"Successfully imported {imported_count} new posts into SQLite tank.db!")
        
        # Log to AgentLog
        log = AgentLog(
            action="import_wp_data",
            details=f"Chuyển đổi hoàn tất {imported_count} bài viết từ WordPress vào SQLite tank.db.",
            status="success"
        )
        db.add(log)
        db.commit()

    finally:
        db.close()

if __name__ == "__main__":
    run_import()
