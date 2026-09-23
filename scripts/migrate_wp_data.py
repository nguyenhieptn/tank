import gzip
import os
import re
import shutil
import json
from html import unescape

sql_path = '/backups/siquantank_20260916/db/db_siquantangthietgiap_20260916.sql.gz'
uploads_src = '/backups/siquantank_20260916/code/wp-content/uploads'
tank_public = '/home/ubuntu/nevir/siquantank/public'
tank_data = '/home/ubuntu/nevir/siquantank/src/data'

from test_parse import parse_sql_values

posts = []
terms = []
taxonomies = []
term_relationships = []
postmeta = []

print("Reading SQL dump...")
with gzip.open(sql_path, 'rt', encoding='utf-8', errors='ignore') as f:
    for line in f:
        if line.startswith('INSERT INTO `wp_posts`'):
            val_part = line[line.find('VALUES')+6:].rstrip(';\n')
            posts.extend(parse_sql_values(val_part))
        elif line.startswith('INSERT INTO `wp_terms`'):
            val_part = line[line.find('VALUES')+6:].rstrip(';\n')
            terms.extend(parse_sql_values(val_part))
        elif line.startswith('INSERT INTO `wp_term_taxonomy`'):
            val_part = line[line.find('VALUES')+6:].rstrip(';\n')
            taxonomies.extend(parse_sql_values(val_part))
        elif line.startswith('INSERT INTO `wp_term_relationships`'):
            val_part = line[line.find('VALUES')+6:].rstrip(';\n')
            term_relationships.extend(parse_sql_values(val_part))
        elif line.startswith('INSERT INTO `wp_postmeta`'):
            val_part = line[line.find('VALUES')+6:].rstrip(';\n')
            postmeta.extend(parse_sql_values(val_part))

term_map = {t[0]: t[1] for t in terms}
tax_map = {tx[0]: (tx[1], tx[2]) for tx in taxonomies}

post_cats = {}
for r in term_relationships:
    obj_id = r[0]
    tt_id = r[1]
    if tt_id in tax_map:
        t_id, tax = tax_map[tt_id]
        cat_name = term_map.get(t_id, '')
        post_cats.setdefault(obj_id, []).append((tax, cat_name))

meta_thumb = {}
attached_files = {}
for m in postmeta:
    pid = m[1]
    k = m[2]
    v = m[3]
    if k == '_thumbnail_id':
        meta_thumb[pid] = v
    elif k == '_wp_attached_file':
        attached_files[pid] = v

attachment_map = {}
attachment_parent_map = {} # post_parent -> list of attachment post ids
for p in posts:
    if p[20] == 'attachment':
        attachment_map[p[0]] = p[18]
        parent = p[17]
        if parent and parent != '0':
            attachment_parent_map.setdefault(parent, []).append(p[0])

IMAGE_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.webp', '.gif')

def is_image_file(path_or_url):
    if not path_or_url:
        return False
    lower = path_or_url.lower().split('?')[0]
    return any(lower.endswith(ext) for ext in IMAGE_EXTENSIONS)

def clean_text(html_text):
    if not html_text:
        return ""
    clean = re.sub(r'<[^>]+>', ' ', html_text)
    clean = unescape(clean)
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean

def format_date(dt_str):
    if not dt_str or len(dt_str) < 10:
        return ""
    parts = dt_str[:10].split('-')
    if len(parts) == 3:
        return f"{parts[2]}/{parts[1]}/{parts[0]}"
    return dt_str[:10]

def copy_and_get_rel_url(img_candidate):
    if not img_candidate or not is_image_file(img_candidate):
        return None
    # Strip url domain if any
    idx = img_candidate.find('/uploads/')
    if idx != -1:
        img_rel = img_candidate[idx+9:].split('?')[0]
    else:
        img_rel = img_candidate.split('?')[0]
    
    src_full = os.path.join(uploads_src, img_rel)
    if os.path.exists(src_full):
        dest_full = os.path.join(tank_public, 'uploads', img_rel)
        os.makedirs(os.path.dirname(dest_full), exist_ok=True)
        shutil.copy2(src_full, dest_full)
        return f"/uploads/{img_rel}"
    
    # Try searching by basename
    fname = os.path.basename(img_rel)
    for root, dirs, files in os.walk(uploads_src):
        if fname in files:
            found_path = os.path.join(root, fname)
            rel = os.path.relpath(found_path, uploads_src)
            dest_full = os.path.join(tank_public, 'uploads', rel)
            os.makedirs(os.path.dirname(dest_full), exist_ok=True)
            shutil.copy2(found_path, dest_full)
            return f"/uploads/{rel}"
    return None

def resolve_post_image(post_id, content):
    # 1. From _thumbnail_id
    thumb_id = meta_thumb.get(post_id)
    if thumb_id:
        if thumb_id in attached_files and is_image_file(attached_files[thumb_id]):
            url = copy_and_get_rel_url(attached_files[thumb_id])
            if url: return url
        if thumb_id in attachment_map and is_image_file(attachment_map[thumb_id]):
            url = copy_and_get_rel_url(attachment_map[thumb_id])
            if url: return url
            
    # 2. From child attachments
    if post_id in attachment_parent_map:
        for att_id in attachment_parent_map[post_id]:
            if att_id in attached_files and is_image_file(attached_files[att_id]):
                url = copy_and_get_rel_url(attached_files[att_id])
                if url: return url
            if att_id in attachment_map and is_image_file(attachment_map[att_id]):
                url = copy_and_get_rel_url(attachment_map[att_id])
                if url: return url

    # 3. From post_content <img>
    if content:
        matches = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', content, re.IGNORECASE)
        for m in matches:
            if is_image_file(m):
                url = copy_and_get_rel_url(m)
                if url: return url
                
    return None

published = [p for p in posts if p[7] == 'publish' and p[20] == 'post']
published.sort(key=lambda x: x[2], reverse=True)

articles = []
for p in published:
    pid = p[0]
    title = unescape(p[5]).strip()
    date_formatted = format_date(p[2])
    raw_content = p[4]
    raw_excerpt = p[6]
    
    clean_c = clean_text(raw_content)
    excerpt = clean_text(raw_excerpt) if raw_excerpt else clean_c[:220] + ('...' if len(clean_c) > 220 else '')
    
    cats = [c[1] for c in post_cats.get(pid, []) if c[0] == 'category']
    img_url = resolve_post_image(pid, raw_content)
    
    cat_str = " ".join(cats).lower()
    title_lower = title.lower()
    
    if any(k in cat_str for k in ['học viên', 'gương sáng', 'đoàn thanh niên']) or any(k in title_lower for k in ['học viên', 'chiến sĩ', 'thanh niên', 'sĩ quan trẻ']):
        tab = 'students'
    elif any(k in cat_str for k in ['quân đội', 'trong nước', 'thế giới', 'quốc tế', 'vũ khí']) or any(k in title_lower for k in ['quân đội', 'vũ khí', 'quốc phòng', 'chiến hạm', 'tên lửa', 'nga', 'xe tăng t-']):
        tab = 'army'
    elif 'tuyển sinh' in cat_str or 'tuyển sinh' in title_lower or 'xét tuyển' in title_lower or 'trúng tuyển' in title_lower:
        tab = 'admissions'
    else:
        tab = 'school'
        
    articles.append({
        'id': pid,
        'title': title,
        'date': date_formatted,
        'rawDate': p[2],
        'category': cats[0] if cats else 'Nhà trường',
        'categories': cats,
        'tab': tab,
        'excerpt': excerpt,
        'content': raw_content,
        'cleanContent': clean_c,
        'image': img_url
    })

print(f"Total articles processed: {len(articles)}")
with_img = sum(1 for a in articles if a['image'])
print(f"Articles with real image: {with_img}")

for tab in ['school', 'admissions', 'army', 'students']:
    tab_items = [a for a in articles if a['tab'] == tab]
    tab_with_img = sum(1 for a in tab_items if a['image'])
    print(f"Tab '{tab}': total {len(tab_items)}, with real image: {tab_with_img}")

# Write to news.json
with open(os.path.join(tank_data, 'news.json'), 'w', encoding='utf-8') as f:
    json.dump(articles, f, ensure_ascii=False, indent=2)

# Write to admissions.json
admissions_posts = [a for a in articles if a['tab'] == 'admissions']
admissions_data = {
    'schoolCode': 'TGH',
    'schoolName': 'Trường Sĩ quan Tăng thiết giáp',
    'majorCode': '7860206',
    'majorName': 'Chỉ huy - Tham mưu Tăng thiết giáp',
    'targetYear': 2026,
    'posts': admissions_posts[:15],
    'downloadFormUrl': '/documents/mau-dang-ky-xet-tuyen.doc',
    'summary': {
        'criteria': 'Tổ hợp xét tuyển A00 (Toán, Lý, Hóa) và A01 (Toán, Lý, Tiếng Anh)',
        'targetCount': 'Đào tạo sĩ quan chỉ huy & kỹ thuật Tăng thiết giáp cấp phân đội bậc Đại học',
        'admissionSteps': [
            {'step': 1, 'title': 'Sơ tuyển cấp huyện', 'desc': 'Sơ tuyển sức khỏe, chính trị tại Ban Tuyển sinh Quân sự quận/huyện nơi đăng ký thường trú.'},
            {'step': 2, 'title': 'Đăng ký thi THPT', 'desc': 'Tham dự kỳ thi tốt nghiệp THPT theo tổ hợp môn A00 hoặc A01.'},
            {'step': 3, 'title': 'Đăng ký nguyện vọng 1', 'desc': 'Đăng ký nguyện vọng 1 vào Trường Sĩ quan Tăng thiết giáp (Mã trường: TGH, Mã ngành: 7860206).'},
            {'step': 4, 'title': 'Xét tuyển & Công bố', 'desc': 'Hội đồng TSQS Bộ Quốc phòng và Nhà trường công bố điểm chuẩn theo khu vực miền Bắc / miền Nam.'},
            {'step': 5, 'title': 'Nhập học chính thức', 'desc': 'Nhận giấy báo trúng tuyển, chuẩn bị đầy đủ hồ sơ theo hướng dẫn và tập trung nhập học.'}
        ]
    }
}

with open(os.path.join(tank_data, 'admissions.json'), 'w', encoding='utf-8') as f:
    json.dump(admissions_data, f, ensure_ascii=False, indent=2)

print("Saved news.json and admissions.json successfully!")
