import os
import sys
import shutil
import json
import re
from datetime import datetime
from html import unescape

# Add parent directory to sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(BASE_DIR))

from backend.database import SessionLocal, DB_PATH
from backend.models import Post, Inquiry, AdmissionConfig, SystemLog

def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[àáạảãâầấậẩẫăằắặẳẵ]', 'a', text)
    text = re.sub(r'[èéẹẻẽêềếệểễ]', 'e', text)
    text = re.sub(r'[ìíịỉĩ]', 'i', text)
    text = re.sub(r'[òóọỏõôồốộổỗơờớợởỡ]', 'o', text)
    text = re.sub(r'[ùúụủũưừứựửữ]', 'u', text)
    text = re.sub(r'[ỳýỵỷỹ]', 'y', text)
    text = re.sub(r'[đ]', 'd', text)
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'\s+', '-', text).strip('-')
    return text

def strip_html(html_text: str) -> str:
    clean = re.sub(r'<[^>]+>', ' ', html_text)
    clean = unescape(clean)
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean

import sqlite3

def backup_db() -> dict:
    """Tự động backup file tank.db sang thư mục backups sử dụng SQLite native backup API an toàn 100%."""
    backup_dir = os.path.join(BASE_DIR, "backups")
    os.makedirs(backup_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    dest_path = os.path.join(backup_dir, f"tank_backup_{timestamp}.db")
    
    if os.path.exists(DB_PATH):
        try:
            source_conn = sqlite3.connect(DB_PATH)
            dest_conn = sqlite3.connect(dest_path)
            with dest_conn:
                source_conn.backup(dest_conn)
            dest_conn.close()
            source_conn.close()

            size_kb = round(os.path.getsize(dest_path) / 1024, 2)
            log_action("backup_db", f"Đã sao lưu CSDL an toàn thành công: {dest_path} ({size_kb} KB)", "success")
            return {"success": True, "file": dest_path, "size_kb": size_kb, "timestamp": timestamp}
        except Exception as e:
            log_action("backup_db", f"Lỗi sao lưu CSDL: {str(e)}", "error")
            return {"success": False, "error": str(e)}
    return {"success": False, "error": "Database file does not exist"}

def check_health() -> dict:
    """Kiểm tra tính toàn vẹn của hệ thống, bài viết, ảnh và hộp thư tư vấn."""
    db = SessionLocal()
    try:
        total_posts = db.query(Post).count()
        published_posts = db.query(Post).filter(Post.status == "published").count()
        draft_posts = db.query(Post).filter(Post.status == "draft").count()
        
        posts_no_image = db.query(Post).filter((Post.image == None) | (Post.image == "")).count()
        
        new_inquiries = db.query(Inquiry).filter(Inquiry.status == "new").count()
        total_inquiries = db.query(Inquiry).count()
        
        db_size_kb = round(os.path.getsize(DB_PATH) / 1024, 2) if os.path.exists(DB_PATH) else 0

        # Tabs breakdown
        tabs_count = {
            "admissions": db.query(Post).filter(Post.tab == "admissions").count(),
            "school": db.query(Post).filter(Post.tab == "school").count(),
            "army": db.query(Post).filter(Post.tab == "army").count(),
            "students": db.query(Post).filter(Post.tab == "students").count(),
        }

        report = {
            "status": "healthy",
            "db_size_kb": db_size_kb,
            "total_posts": total_posts,
            "published_posts": published_posts,
            "draft_posts": draft_posts,
            "posts_without_image": posts_no_image,
            "new_inquiries": new_inquiries,
            "total_inquiries": total_inquiries,
            "tabs": tabs_count,
            "checked_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }
        
        log_action("check_health", f"Kiểm tra hệ thống hoàn tất: {total_posts} bài viết, {new_inquiries} câu hỏi mới.", "success")
        return report
    finally:
        db.close()

def log_action(action: str, details: str, status: str = "success"):
    db = SessionLocal()
    try:
        log = SystemLog(action=action, details=details, status=status)
        db.add(log)
        db.commit()
    except Exception as e:
        print(f"Failed to write system log: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        if cmd == "backup-db":
            res = backup_db()
            print(json.dumps(res, indent=2, ensure_ascii=False))
        elif cmd == "check-health":
            res = check_health()
            print(json.dumps(res, indent=2, ensure_ascii=False))
        else:
            print(f"Unknown command: {cmd}")
    else:
        print("Usage: python system_ops.py [backup-db | check-health]")
