# Hướng Dẫn Triển Khai Thủ Công Bằng File ZIP (Manual Zip Setup Guide)

> **Cổng Thông Tin Điện Tử & Tuyển Sinh Trường Sĩ Quan Tăng Thiết Giáp**  
> Bản hướng dẫn cài đặt từng bước (Step-by-Step) chuẩn Production dành riêng cho trường hợp sử dụng **Gói nén ZIP đóng gói sẵn (`siquantank_release.zip`)**, không sử dụng Git.

---

## 1. Thành Phần Trong Gói Nén ZIP

Gói nén đã tích hợp trọn vẹn toàn bộ hệ thống ở trạng thái sẵn sàng chạy Production:

| Thành phần | Đường dẫn trong gói | Mô tả |
| :--- | :--- | :--- |
| **Mã nguồn Backend** | `backend/` | FastAPI REST API, SQLAlchemy Engine, các script vận hành |
| **Cơ sở dữ liệu SQLite** | `backend/tank.db` | CSDL hoàn chỉnh 153 bài viết, điểm sàn, chuyên mục, tài khoản |
| **Kho ảnh & Media Uploads** | `legacy_uploads/` | Toàn bộ ảnh bài viết và tài liệu kế thừa (~260MB) |
| **Bản build Frontend Tĩnh** | `dist/` | React 18 + Vite + Tailwind đã build tối ưu cho Production |
| **Cấu hình Docker & Nginx** | `docker/`, `docker-compose.yml`, `Dockerfile` | Kịch bản chạy Docker 2 container vi dịch vụ |
| **Tài liệu hướng dẫn** | `docs/`, `README.md` | Bộ tài liệu kiến trúc, an toàn thông tin và cẩm nang vận hành |

---

## BƯỚC 1: Tải Và Giải Nén Gói ZIP Trên Server

### 1.1. Di chuyển file ZIP lên thư mục cài đặt
Giả sử bạn đã tải hoặc sao chép file `siquantank_release.zip` vào thư mục `/home/ubuntu`:

```bash
# Di chuyển đến thư mục cài đặt
cd /home/ubuntu

# Kiểm tra file nén đã có mặt
ls -lh siquantank_release.zip
```

### 1.2. Giải nén gói cài đặt
```bash
# Cài đặt unzip nếu server chưa có (Ubuntu/Debian)
# sudo apt-get update && sudo apt-get install -y unzip

# Giải nén gói release
unzip -q siquantank_release.zip

# Di chuyển vào thư mục dự án vừa giải nén
cd siquantank
```

### 1.3. Kiểm tra kiểm chứng cấu trúc sau khi giải nén
```bash
# Kiểm tra các thư mục và file quan trọng
ls -la

# Đảm bảo CSDL SQLite đã có (~3.0 MB)
ls -lh backend/tank.db

# Đảm bảo kho media uploads đã có đủ các năm (2015 -> 2026)
ls -la legacy_uploads/ | head -n 12

# Đảm bảo bản build dist Frontend đã có đầy đủ
ls -la dist/
```

---

## BƯỚC 2: Phân Quyền Thư Mục Dữ Liệu & Runtime

Thiết lập quyền truy cập an toàn để container có thể đọc/ghi CSDL và tải lên các file media mới:

```bash
# Đảm bảo đang đứng trong thư mục siquantank
cd /home/ubuntu/siquantank

# 1. Tạo các thư mục runtime cho uploads mới và bản sao lưu tự động
mkdir -p backend/uploads backend/backups

# 2. Phân quyền đọc/ghi dữ liệu
chmod -R 755 legacy_uploads backend/uploads backend/backups
chmod 664 backend/tank.db
```

---

## BƯỚC 3: Khởi Chạy Hệ Thống Bằng Docker Compose

Vì bản tĩnh Frontend (`dist/`) và CSDL (`tank.db`) đã được chuẩn bị sẵn đầy đủ trong gói ZIP, cụm container sẽ tự động build và chạy ngay lập tức.

### 3.1. Build và khởi chạy các container Production
```bash
# Đứng tại thư mục chứa docker-compose.yml
cd /home/ubuntu/siquantank

# Khởi chạy cụm container ở chế độ chạy ngầm (detached mode)
docker compose up -d --build
```

### 3.2. Kiểm tra trạng thái hoạt động & sức khỏe hệ thống
```bash
# 1. Kiểm tra 2 container đang chạy (tank-backend và tank-frontend)
docker ps --filter "name=tank-"

# 2. Xem logs khởi động của Backend (FastAPI / Uvicorn)
docker logs --tail 30 tank-backend

# 3. Xem logs của Frontend Nginx
docker logs --tail 30 tank-frontend

# 4. Chạy lệnh kiểm tra tính toàn vẹn CSDL và bài viết:
docker exec -it tank-backend python -m backend.system_ops check-health
```
*Khi kết quả trả về `status: healthy` và `Database: OK` là hệ thống đã sẵn sàng 100%.*

---

## BƯỚC 4: Cấu Hình Nginx Host & Tên Miền (Domain)

Cấu hình Nginx trên Server Host làm Reverse Proxy chuyển tiếp cổng 80/443 vào cổng container `8082`.

### 4.1. Mở file cấu hình Nginx
```bash
sudo nano /etc/nginx/sites-available/siquantank.conf
```

Chọn một trong 2 cấu hình mẫu dưới đây:

#### Cách A: Dành cho Tên Miền Riêng (Ví dụ: `tuyensinh.siquantank.edu.vn`)
```nginx
server {
    listen 80;
    server_name tuyensinh.siquantank.edu.vn; # Thay bằng tên miền thực tế

    client_max_body_size 50M;

    # Nén Gzip tăng tốc độ tải trang
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml image/svg+xml;

    location / {
        proxy_pass http://127.0.0.1:8082;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 90s;
    }
}
```

#### Cách B: Chạy dưới tiền tố `/siquantank` (Dùng chung tên miền với dịch vụ khác)
Thêm khối `location` này vào trong file cấu hình domain hiện có:
```nginx
location = /siquantank {
    return 301 /siquantank/;
}

location ^~ /siquantank/ {
    proxy_pass http://127.0.0.1:8082;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 90s;
}
```

### 4.2. Kích hoạt và tải lại Nginx
```bash
# 1. Kích hoạt cấu hình site mới
sudo ln -sf /etc/nginx/sites-available/siquantank.conf /etc/nginx/sites-enabled/

# 2. Kiểm tra cú pháp cấu hình Nginx
sudo nginx -t

# 3. Tải lại dịch vụ Nginx
sudo systemctl reload nginx
```

---

## BƯỚC 5: Truy Cập Website & Đổi Mật Khẩu Quản Trị

### 5.1. Địa chỉ truy cập
- **Cổng Thông Tin Công Khai:**
  - Nếu dùng Domain riêng (Cách A): `http://<your-domain>/siquantank/`
  - Nếu dùng tiền tố (Cách B): `http://<your-domain>/siquantank/`
  - Nếu truy cập qua IP Server: `http://<IP-Server>:8082/siquantank/`
- **Hệ Thống Quản Trị (Admin CMS):**
  - Địa chỉ: `http://<your-domain>/siquantank/admin/login`
  - **Tên đăng nhập mặc định:** `admin`
  - **Mật khẩu mặc định:** `Tank@2026`

### 5.2. Hướng dẫn đổi mật khẩu Admin trên giao diện Web:
1. Đăng nhập vào trang quản trị bằng tài khoản `admin` / `Tank@2026`.
2. Tại thanh điều hướng Sidebar bên trái (phía dưới thông tin tài khoản cán bộ), click vào nút **"Đổi mật khẩu"**.
3. Nhập mật khẩu hiện tại (`Tank@2026`), mật khẩu mới (tối thiểu 6 ký tự) và xác nhận mật khẩu mới.
4. Bấm **"Cập nhật mật khẩu"**. Hệ thống sẽ băm bảo mật SHA-256 kèm Salt và lưu ngay vào CSDL.

---

## 6. Các Lệnh Vận Hành & Bảo Trì Nhanh Thường Dùng

```bash
# Khởi động lại cụm dịch vụ:
docker compose restart

# Dừng cụm dịch vụ:
docker compose down

# Sao lưu CSDL SQLite tức thời (1-Click Safe Backup):
docker exec -it tank-backend python -m backend.system_ops backup-db

# Xem log kiểm tra Backend:
docker logs -f tank-backend

# Xem log kiểm tra Frontend:
docker logs -f tank-frontend
```
