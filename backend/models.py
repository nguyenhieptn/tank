from datetime import datetime
import json
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship, backref
from backend.database import Base

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False, index=True)
    slug = Column(String(500), unique=True, index=True, nullable=False)
    date_str = Column(String(50), default="")
    raw_date = Column(DateTime, default=datetime.utcnow, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    category = Column(String(100), default="Tin tức", index=True)
    categories_json = Column(Text, default="[]")
    tab = Column(String(50), default="school", index=True)  # admissions, school, army, students
    target_year = Column(Integer, nullable=True, index=True)
    post_type = Column(String(30), default="article", index=True)  # article, announcement, document, video
    excerpt = Column(Text, default="")
    content = Column(Text, default="")
    clean_content = Column(Text, default="")
    image = Column(String(500), nullable=True)
    status = Column(String(20), default="published", index=True)  # published, draft
    views = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category_obj = relationship("Category", back_populates="posts")

    @property
    def categories_list(self):
        try:
            return json.loads(self.categories_json) if self.categories_json else []
        except:
            return []

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    parent_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    tab = Column(String(50), default="school")
    sort_order = Column(Integer, default=0)
    icon = Column(String(50), default="Folder")
    description = Column(Text, default="")
    count = Column(Integer, default=0)

    children = relationship("Category", backref=backref("parent", remote_side=[id]))
    posts = relationship("Post", back_populates="category_obj")

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    dept_type = Column(String(50), index=True, nullable=False)  # phong, khoa, tieudoan
    name = Column(String(200), nullable=False)
    content = Column(Text, default="")
    sort_order = Column(Integer, default=0)

class AdmissionConfig(Base):
    __tablename__ = "admission_config"

    id = Column(Integer, primary_key=True, default=1)
    school_code = Column(String(20), default="TGH")
    school_name = Column(String(200), default="Trường Sĩ quan Tăng thiết giáp")
    major_code = Column(String(50), default="7860206")
    major_name = Column(String(200), default="Chỉ huy - Tham mưu Tăng thiết giáp")
    target_year = Column(Integer, default=2026)
    north_score = Column(Float, default=18.0)
    south_score = Column(Float, default=17.0)
    target_count = Column(String(100), default="150 chỉ tiêu")
    criteria = Column(String(200), default="A00 (Toán, Lý, Hóa), A01 (Toán, Lý, Anh)")
    countdown_date = Column(String(50), default="2026-09-01T00:00:00")
    download_form_url = Column(String(500), default="/siquantank/documents/mau-dang-ky-xet-tuyen.doc")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Inquiry(Base):
    __tablename__ = "inquiries"

    id = Column(Integer, primary_key=True, index=True)
    fullname = Column(String(200), nullable=False)
    phone = Column(String(50), nullable=False)
    province = Column(String(100), default="")
    message = Column(Text, default="")
    status = Column(String(20), default="new", index=True)  # new, contacted
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class SystemLog(Base):
    __tablename__ = "system_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, default="")
    status = Column(String(20), default="success")  # success, warning, error
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

# Alias for backwards compatibility
AgentLog = SystemLog

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    role = Column(String(20), default="admin")
    created_at = Column(DateTime, default=datetime.utcnow)
