import sqlite3
import os
import shutil
import re
from datetime import datetime

DB_PATH = "/home/ubuntu/nevir/siquantank/backend/tank.db"
BACKUP_PATH = f"/home/ubuntu/nevir/siquantank/backend/backups/tank_backup_before_cat_v2_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"

print(f"=== BẮT ĐẦU NÂNG CẤP CƠ SỞ DỮ LIỆU CATEGORY 2 TẦNG ===")

# 1. Sao lưu an toàn CSDL
os.makedirs(os.path.dirname(BACKUP_PATH), exist_ok=True)
shutil.copy2(DB_PATH, BACKUP_PATH)
print(f"1. Đã sao lưu an toàn CSDL sang: {BACKUP_PATH}")

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# 2. Bổ sung các cột mới nếu chưa tồn tại
def add_column_if_not_exists(table, column, col_type):
    c.execute(f"PRAGMA table_info({table})")
    cols = [row[1] for row in c.fetchall()]
    if column not in cols:
        print(f"-> Thêm cột '{column}' ({col_type}) vào bảng '{table}'")
        c.execute(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}")
    else:
        print(f"-> Cột '{column}' trong '{table}' đã tồn tại.")

add_column_if_not_exists("categories", "parent_id", "INTEGER REFERENCES categories(id) ON DELETE SET NULL")
add_column_if_not_exists("categories", "tab", "VARCHAR(50) DEFAULT 'school'")
add_column_if_not_exists("categories", "sort_order", "INTEGER DEFAULT 0")
add_column_if_not_exists("categories", "icon", "VARCHAR(50) DEFAULT 'Folder'")

add_column_if_not_exists("posts", "category_id", "INTEGER REFERENCES categories(id) ON DELETE SET NULL")
add_column_if_not_exists("posts", "target_year", "INTEGER")
add_column_if_not_exists("posts", "post_type", "VARCHAR(30) DEFAULT 'article'")

conn.commit()
print("2. Đã hoàn tất cấu trúc bảng CSDL.")

# 3. Định nghĩa Cây Danh Mục Chuẩn 2 Tầng
# (Danh mục Cha: parent_id = None, Danh mục Con: parent_id = id của Cha)
ROOT_CATEGORIES = [
    {
        "name": "Tuyển sinh Quân sự",
        "slug": "tuyen-sinh-quan-su",
        "tab": "admissions",
        "icon": "GraduationCap",
        "sort_order": 1,
        "description": "Thông tin chỉ tiêu, điểm chuẩn, hướng dẫn hồ sơ và kết quả xét tuyển Trường Sĩ quan Tăng thiết giáp",
        "children": [
            {"name": "Thông báo & Hướng dẫn hồ sơ", "slug": "thong-bao-huong-dan-ho-so", "sort_order": 1, "description": "Thông báo tuyển sinh, hướng dẫn làm hồ sơ, thời gian khám sơ tuyển"},
            {"name": "Chỉ tiêu & Điểm chuẩn", "slug": "chi-tieu-diem-chuan", "sort_order": 2, "description": "Chỉ tiêu tuyển sinh các miền, điểm sàn và điểm trúng tuyển hàng năm"},
            {"name": "Kết quả xét tuyển & Trúng tuyển", "slug": "ket-qua-xet-tuyen", "sort_order": 3, "description": "Danh sách thí sinh trúng tuyển và thủ tục nhập học"},
        ]
    },
    {
        "name": "Hoạt động Nhà trường",
        "slug": "hoat-dong-nha-truong",
        "tab": "school",
        "icon": "Building2",
        "sort_order": 2,
        "description": "Các sự kiện, hoạt động lãnh đạo chỉ huy, huấn luyện và phong trào của Trường Sĩ quan Tăng thiết giáp",
        "children": [
            {"name": "Công tác Đảng - Công tác chính trị", "slug": "cong-tac-dang-chinh-tri", "sort_order": 1, "description": "Hoạt động công tác Đảng, công tác chính trị, giáo dục truyền thống"},
            {"name": "Huấn luyện SSCĐ & Diễn tập", "slug": "huan-luyen-sscd-dien-tap", "sort_order": 2, "description": "Huấn luyện thực binh, bắn đạn thật, làm chủ trang bị kỹ thuật xe tăng"},
            {"name": "Thi đua Quyết thắng", "slug": "thi-dua-quyet-thang", "sort_order": 3, "description": "Phong trào thi đua quyết thắng, gương người tốt việc tốt, điển hình tiên tiến"},
        ]
    },
    {
        "name": "Quân sự — Quốc phòng",
        "slug": "quan-su-quoc-phong",
        "tab": "army",
        "icon": "Shield",
        "sort_order": 3,
        "description": "Tin tức quân sự quốc phòng toàn quân, Binh chủng Tăng thiết giáp và thế giới",
        "children": [
            {"name": "Tin Binh chủng & Toàn quân", "slug": "tin-binh-chung-toan-quan", "sort_order": 1, "description": "Tin tức hoạt động Binh chủng Tăng thiết giáp và toàn quân"},
            {"name": "Vũ khí & Trang bị Tăng - Thiết giáp", "slug": "vu-khi-trang-bi-tang-thiet-giap", "sort_order": 2, "description": "Nghiên cứu, cải tiến vũ khí khí tài, xe chiến đấu hiện đại"},
            {"name": "Tình hình An ninh - Quốc tế", "slug": "tinh-hinh-an-ninh-quoc-te", "sort_order": 3, "description": "Tình hình thời sự quân sự, quốc phòng thế giới"},
        ]
    },
    {
        "name": "Đào tạo & Học viên",
        "slug": "dao-tao-hoc-vien",
        "tab": "students",
        "icon": "Users",
        "sort_order": 4,
        "description": "Công tác đào tạo sĩ quan chỉ huy tham mưu, đời sống học viên và giảng dạy",
        "children": [
            {"name": "Khoa giáo viên & Giảng dạy", "slug": "khoa-giao-vien-giang-day", "sort_order": 1, "description": "Hoạt động giảng dạy, phương pháp sư phạm quân sự của các khoa giáo viên"},
            {"name": "Góc học viên Sĩ quan", "slug": "goc-hoc-vien-si-quan", "sort_order": 2, "description": "Tâm tư, kỷ niệm, bài viết và góc nhìn của học viên sĩ quan trên giảng đường và bãi tập"},
            {"name": "Văn hóa - Thể thao thao trường", "slug": "van-hoa-the-thao-thao-truong", "sort_order": 3, "description": "Hoạt động văn hóa văn nghệ, thể dục thể thao rèn luyện thể lực bộ đội"},
        ]
    },
    {
        "name": "Văn bản & Biểu mẫu",
        "slug": "van-ban-bieu-mau",
        "tab": "admissions",
        "icon": "FileText",
        "sort_order": 5,
        "description": "Hệ thống văn bản tuyển sinh, quy chế đào tạo, phiếu đăng ký và đề án chính thức",
        "children": [
            {"name": "Biểu mẫu xét tuyển quân sự", "slug": "bieu-mau-xet-tuyen-quan-su", "sort_order": 1, "description": "Phiếu đăng ký xét tuyển, hồ sơ sơ tuyển, mẫu phiếu nguyện vọng"},
            {"name": "Quy chế & Văn bản quy phạm", "slug": "quy-che-van-ban-quy-pham", "sort_order": 2, "description": "Thông tư, quyết định của Ban Tuyển sinh quân sự Bộ Quốc phòng"},
        ]
    }
]

cat_id_map = {} # slug -> id

for root in ROOT_CATEGORIES:
    c.execute("SELECT id FROM categories WHERE slug = ?", (root["slug"],))
    row = c.fetchone()
    if row:
        root_id = row[0]
        c.execute("""
            UPDATE categories 
            SET name = ?, tab = ?, icon = ?, sort_order = ?, description = ?, parent_id = NULL
            WHERE id = ?
        """, (root["name"], root["tab"], root["icon"], root["sort_order"], root["description"], root_id))
    else:
        c.execute("""
            INSERT INTO categories (name, slug, tab, icon, sort_order, description, parent_id, count)
            VALUES (?, ?, ?, ?, ?, ?, NULL, 0)
        """, (root["name"], root["slug"], root["tab"], root["icon"], root["sort_order"], root["description"]))
        root_id = c.lastrowid
    
    cat_id_map[root["slug"]] = root_id
    print(f"-> Danh mục Cha: [{root['name']}] (ID: {root_id})")

    for child in root["children"]:
        c.execute("SELECT id FROM categories WHERE slug = ?", (child["slug"],))
        child_row = c.fetchone()
        if child_row:
            child_id = child_row[0]
            c.execute("""
                UPDATE categories 
                SET name = ?, tab = ?, icon = ?, sort_order = ?, description = ?, parent_id = ?
                WHERE id = ?
            """, (child["name"], root["tab"], root["icon"], child["sort_order"], child["description"], root_id, child_id))
        else:
            c.execute("""
                INSERT INTO categories (name, slug, tab, icon, sort_order, description, parent_id, count)
                VALUES (?, ?, ?, ?, ?, ?, ?, 0)
            """, (child["name"], child["slug"], root["tab"], root["icon"], child["sort_order"], child["description"], root_id))
            child_id = c.lastrowid
        
        cat_id_map[child["slug"]] = child_id
        print(f"    └── Con: [{child['name']}] (ID: {child_id}, Parent: {root_id})")

conn.commit()

# 4. Ánh xạ thông minh cho 153 bài viết hiện có
c.execute("SELECT id, title, category, tab, date_str, raw_date, content FROM posts")
posts = c.fetchall()
print(f"\n4. Đang phân loại lại {len(posts)} bài viết...")

def extract_year(title, cat_name, date_str, raw_date):
    text = f"{title} {cat_name}"
    m = re.search(r'\b(201[5-9]|202[0-9])\b', text)
    if m:
        return int(m.group(1))
    if date_str:
        m2 = re.search(r'\b(201[5-9]|202[0-9])\b', date_str)
        if m2:
            return int(m2.group(1))
    if raw_date:
        try:
            return int(str(raw_date)[:4])
        except:
            pass
    return 2026

def determine_new_category(title, old_cat, old_tab, content):
    lower_title = title.lower()
    lower_cat = (old_cat or "").lower()
    lower_content = (content or "").lower()

    # 1. Biểu mẫu / Mẫu văn bản
    if "mẫu văn bản" in lower_cat or "phiếu đăng ký" in lower_cat or "mẫu đăng ký" in lower_title or "phiếu đăng ký" in lower_title:
        return cat_id_map["bieu-mau-xet-tuyen-quan-su"], "Biểu mẫu xét tuyển quân sự", "admissions", "document"

    # 2. Tuyển sinh
    if old_tab == "admissions" or "tuyển sinh" in lower_cat or "xét tuyển" in lower_cat or "tuyển sinh" in lower_title:
        if "kết quả" in lower_title or "kết quả" in lower_cat or "trúng tuyển" in lower_title or "danh sách" in lower_title:
            return cat_id_map["ket-qua-xet-tuyen"], "Kết quả xét tuyển & Trúng tuyển", "admissions", "article"
        elif "chỉ tiêu" in lower_title or "chỉ tiêu" in lower_cat or "điểm chuẩn" in lower_title or "điểm sàn" in lower_title:
            return cat_id_map["chi-tieu-diem-chuan"], "Chỉ tiêu & Điểm chuẩn", "admissions", "article"
        else:
            p_type = "document" if (".pdf" in lower_content or ".doc" in lower_content) else "announcement"
            return cat_id_map["thong-bao-huong-dan-ho-so"], "Thông báo & Hướng dẫn hồ sơ", "admissions", p_type

    # 3. Quân sự - Quốc phòng
    if old_tab == "army" or "tin quân đội" in lower_cat or "tin trong nước" in lower_cat or "tin thế giới" in lower_cat or "quân sự" in lower_cat:
        if "vũ khí" in lower_title or "xe tăng" in lower_title or "t-90" in lower_title or "t-54" in lower_title or "thiết giáp" in lower_title:
            return cat_id_map["vu-khi-trang-bi-tang-thiet-giap"], "Vũ khí & Trang bị Tăng - Thiết giáp", "army", "article"
        elif "thế giới" in lower_cat or "nga" in lower_title or "quốc tế" in lower_title or "châu á" in lower_title:
            return cat_id_map["tinh-hinh-an-ninh-quoc-te"], "Tình hình An ninh - Quốc tế", "army", "article"
        else:
            return cat_id_map["tin-binh-chung-toan-quan"], "Tin Binh chủng & Toàn quân", "army", "article"

    # 4. Đào tạo & Học viên
    if old_tab == "students" or "học viên" in lower_cat or "audio" in lower_cat or "video" in lower_cat or "học viên" in lower_title:
        p_type = "video" if ("video" in lower_cat or "<iframe" in lower_content or "youtube" in lower_content) else "article"
        if "học viên" in lower_title or "học viên" in lower_cat or "chiến sĩ" in lower_title or "sĩ quan trẻ" in lower_title:
            return cat_id_map["goc-hoc-vien-si-quan"], "Góc học viên Sĩ quan", "students", p_type
        elif "thể thao" in lower_title or "văn hóa" in lower_title or "bãi tập" in lower_title:
            return cat_id_map["van-hoa-the-thao-thao-truong"], "Văn hóa - Thể thao thao trường", "students", p_type
        else:
            return cat_id_map["khoa-giao-vien-giang-day"], "Khoa giáo viên & Giảng dạy", "students", p_type

    # 5. Hoạt động Nhà trường (school / default)
    if "thi đua" in lower_title or "quyết thắng" in lower_title or "huân chương" in lower_title or "khen thưởng" in lower_title:
        return cat_id_map["thi-dua-quyet-thang"], "Thi đua Quyết thắng", "school", "article"
    elif "huấn luyện" in lower_title or "diễn tập" in lower_title or "sẵn sàng chiến đấu" in lower_title or "bắn đạn thật" in lower_title:
        return cat_id_map["huan-luyen-sscd-dien-tap"], "Huấn luyện SSCĐ & Diễn tập", "school", "article"
    else:
        return cat_id_map["cong-tac-dang-chinh-tri"], "Công tác Đảng - Công tác chính trị", "school", "article"

updated_count = 0
for post_id, title, old_cat, old_tab, date_str, raw_date, content in posts:
    year = extract_year(title, old_cat, date_str, raw_date)
    new_cat_id, new_cat_name, new_tab, post_type = determine_new_category(title, old_cat, old_tab, content)

    c.execute("""
        UPDATE posts
        SET category_id = ?,
            category = ?,
            tab = ?,
            target_year = ?,
            post_type = ?
        WHERE id = ?
    """, (new_cat_id, new_cat_name, new_tab, year, post_type, post_id))
    updated_count += 1

conn.commit()
print(f"-> Đã chuyển đổi và chuẩn hóa thành công {updated_count} bài viết.")

# 5. Xóa các danh mục cũ không còn thuộc cây chuẩn (các danh mục rác cũ)
c.execute("SELECT id, name FROM categories WHERE id NOT IN ({})".format(','.join(str(i) for i in cat_id_map.values())))
old_unwanted = c.fetchall()
if old_unwanted:
    print(f"\n5. Dọn dẹp {len(old_unwanted)} danh mục rác cũ phân mảnh:")
    for oid, oname in old_unwanted:
        print(f"   - Đã gỡ bỏ category rác: [{oname}] (ID: {oid})")
    c.execute("DELETE FROM categories WHERE id NOT IN ({})".format(','.join(str(i) for i in cat_id_map.values())))
    conn.commit()

# 6. Cập nhật lại số lượng bài viết (count) chính xác cho từng danh mục
print("\n6. Cập nhật số lượng bài viết (count) cho từng danh mục:")
for slug, cat_id in cat_id_map.items():
    c.execute("SELECT parent_id FROM categories WHERE id = ?", (cat_id,))
    row = c.fetchone()
    if row and row[0] is None:
        c.execute("""
            SELECT count(*) FROM posts 
            WHERE category_id = ? OR category_id IN (SELECT id FROM categories WHERE parent_id = ?)
        """, (cat_id, cat_id))
    else:
        c.execute("SELECT count(*) FROM posts WHERE category_id = ?", (cat_id,))
    
    cnt = c.fetchone()[0]
    c.execute("UPDATE categories SET count = ? WHERE id = ?", (cnt, cat_id))
    print(f"   * [{slug}]: {cnt} bài")

conn.commit()
conn.close()

print("\n=== HOÀN TẤT NÂNG CẤP VÀ CHUYỂN ĐỔI CƠ SỞ DỮ LIỆU THÀNH CÔNG 100% ===")
