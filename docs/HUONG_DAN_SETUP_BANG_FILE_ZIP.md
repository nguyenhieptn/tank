# Hướng Dẫn Triển Khai Thủ Công Bằng Git (Private Repository)

> **Cổng Thông Tin Điện Tử & Tuyển Sinh Trường Sĩ Quan Tăng Thiết Giáp**  
> Bản hướng dẫn cài đặt từng bước (Step-by-Step) chuẩn Production dành riêng cho trường hợp triển khai từ Private Repository:  
> 🔗 **https://github.com/nguyenhieptn/tank.git** (hoặc `git@github.com:nguyenhieptn/tank.git`)

---

## 1. Điểm Nổi Bật Của Bản Đóng Gói Trên Git

Toàn bộ hệ thống đã được tích hợp trọn vẹn trong một kho mã nguồn duy nhất:
- ✅ **Đã bao gồm toàn bộ kho ảnh `legacy_uploads/`:** Tất cả hình ảnh bài viết và tài liệu từ 2015 đến 2026 đã được commit trực tiếp vào Git. **Không cần phải tải file zip hay giải nén ảnh thủ công!**
- ✅ **Cơ sở dữ liệu SQLite (`backend/tank.db`):** Đã nạp đầy đủ 153 bài viết, điểm sàn, danh mục chuyên mục và tài khoản quản trị.
- ✅ **Tính năng Đổi mật khẩu trên Web:** Đã tích hợp sẵn nút "Đổi mật khẩu" trực tiếp trên giao diện Admin CMS.
- ✅ **Cụm Docker Compose vi dịch vụ:** Đã tối ưu sẵn sàng cho môi trường Production.

---

## BƯỚC 1: Clone Mã Nguồn Từ Git Về Server

Do đây là Private Repository, bạn clone bằng SSH (nếu server đã add SSH Key vào tài khoản GitHub) hoặc qua HTTPS kèm Personal Access Token (PAT):

```bash
# 1. Di chuyển vào thư mục cài đặt mong muốn (ví dụ: /home/ubuntu)
cd /home/ubuntu

# 2. Clone mã nguồn dự án (đã bao gồm đầy đủ mã nguồn, CSDL và toàn bộ kho ảnh legacy_uploads)
# Cách A: Qua SSH (khuyên dùng):
git clone git@github.com:nguyenhieptn/tank.git siquantank

# Cách B: Qua HTTPS:
# git clone https://github.com/nguyenhieptn/tank.git siquantank

# 3. Di chuyển vào thư mục dự án vừa clone
cd siquantank
```

---

## BƯỚC 2: Phân Quyền Thư Mục Dữ Liệu & Runtime

Thiết lập quyền truy cập an toàn để container có thể đọc/ghi CSDL và tải lên các file media mới:

```bash
# Đảm bảo đang ở thư mục siquantank
cd /home/ubuntu/siquantank

# 1. Tạo thư mục chứa media mới và thư mục sao lưu cơ sở dữ liệu cho Backend
mkdir -p backend/uploads backend/backups

# 2. Phân quyền đọc/ghi an toàn
chmod -R 755 legacy_uploads backend/uploads backend/backups
chmod 664 backend/tank.db
```

---

## BƯỚC 3: Cài Đặt Dependencies & Build Frontend (Nếu Cần)

Nếu server của bạn có sẵn Node.js và muốn build lại bản tĩnh:
```bash
# Cài đặt thư viện và build bản tĩnh production
npm install
npm run build
```

---

## BƯỚC 4: Khởi Chạy Cụm Docker Production

Chạy toàn bộ cụm 2 container vi dịch vụ (`tank-backend` và `tank-frontend`) bằng Docker Compose:

### 4.1. Khởi chạy cụm container
```bash
# Build và khởi chạy ở chế độ chạy ngầm
docker compose up -d --build
```

### 4.2. Kiểm tra trạng thái hoạt động & sức khỏe hệ thống
```bash
# 1. Kiểm tra 2 container đang chạy ở trạng thái Up và Healthy
docker ps --filter "name=tank-"

# 2. Kiểm tra log khởi động Backend FastAPI
docker logs --tail 30 tank-backend

# 3. Kiểm tra log khởi động Frontend Nginx
docker logs --tail 30 tank-frontend

# 4. Chạy kiểm tra tính toàn vẹn CSDL và kết nối:
docker exec -it tank-backend python -m backend.system_ops check-health
```
*Hệ thống báo `status: healthy` và `Database: OK` với 153 bài viết là hoàn tất.*

---

## BƯỚC 5: Cấu Hình Nginx Host & Tên Miền (Domain)

Tạo file cấu hình trên Nginx của máy chủ Host làm Reverse Proxy chuyển tiếp cổng 80/443 vào cổng container `8082`.

### 5.1. Mở file cấu hình Nginx
```bash
sudo nano /etc/nginx/sites-available/siquantank.conf
```

Chọn một trong 2 cấu hình mẫu bên dưới:

#### Cách A: Dành cho Tên Miền Riêng (Ví dụ: `tuyensinh.siquantank.edu.vn`)
```nginx
server {
    listen 80;
    server_name tuyensinh.siquantank.edu.vn; # Thay bằng tên miền thực tế của bạn

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

#### Cách B: Chạy dưới tiền tố `/siquantank` (Dùng chung tên miền với dịch vụ khác trên server)
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

### 5.2. Kích hoạt và tải lại Nginx
```bash
# 1. Kích hoạt site mới (nếu tạo file trong sites-available)
sudo ln -sf /etc/nginx/sites-available/siquantank.conf /etc/nginx/sites-enabled/

# 2. Kiểm tra cú pháp Nginx
sudo nginx -t

# 3. Nạp lại cấu hình Nginx
sudo systemctl reload nginx
```

---

## BƯỚC 6: Truy Cập Website & Đổi Mật Khẩu Admin Trên Web

### 6.1. Địa chỉ truy cập
- **Cổng Thông Tin Công Khai:**
  - Nếu dùng Domain riêng (Cách A): `http://<your-domain>/siquantank/`
  - Nếu dùng tiền tố (Cách B): `http://<your-domain>/siquantank/`
  - Nếu truy cập qua IP Server: `http://<IP-Server>:8082/siquantank/`
- **Hệ Thống Quản Trị (Admin CMS):**
  - Địa chỉ: `http://<your-domain>/siquantank/admin/login`
  - **Tên đăng nhập mặc định:** `admin`
  - **Mật khẩu mặc định:** `Tank@2026`

### 6.2. Hướng dẫn đổi mật khẩu Admin trên giao diện Web:
1. Đăng nhập vào trang quản trị CMS với tài khoản `admin` / `Tank@2026`.
2. Tại thanh Sidebar bên trái (dưới tên cán bộ), click vào nút **"Đổi mật khẩu"**.
3. Nhập mật khẩu hiện tại (`Tank@2026`), nhập mật khẩu mới và xác nhận.
4. Bấm **"Cập nhật mật khẩu"**. Mật khẩu mới sẽ được cập nhật bảo mật ngay lập tức.

---

## BƯỚC 7: Cập Nhật Mã Nguồn Trong Tương Lai (Git Pull)

Khi có bản cập nhật mới trên GitHub, việc nâng cấp trên server chỉ mất vài giây:

```bash
# Di chuyển vào thư mục dự án
cd /home/ubuntu/siquantank

# Kéo bản cập nhật mới nhất về
git pull origin main

# Khởi động lại cụm dịch vụ
docker compose restart
```

---

## 8. Các Lệnh Vận Hành & Bảo Trì Nhanh Thường Dùng

```bash
# Khởi động lại cụm container:
docker compose restart

# Dừng cụm container:
docker compose down

# Sao lưu CSDL SQLite tức thời (1-Click Safe Backup):
docker exec -it tank-backend python -m backend.system_ops backup-db

# Xem log kiểm tra Backend:
docker logs -f tank-backend

# Xem log kiểm tra Frontend:
docker logs -f tank-frontend
```
