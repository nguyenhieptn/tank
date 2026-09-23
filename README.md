# Quick Setup: Triển Khai Thủ Công (Production)

> **Cổng Thông Tin Điện Tử & Tuyển Sinh Trường Sĩ Quan Tăng Thiết Giáp**  
> Quy trình cài đặt và triển khai thủ công từng bước (Step-by-Step) chuẩn Production.

---

## Thông Tin Dịch Vụ & Cổng Truy Cập (Ports)

| Phân hệ / Dịch vụ | Địa chỉ truy cập / Port | Ghi chú |
| :--- | :--- | :--- |
| **Cổng Thông Tin Công Khai** | `http://<Domain-hoặc-IP>:8082/siquantank/` | Port container frontend: `8082` |
| **Hệ Thống Quản Trị (Admin CMS)** | `http://<Domain-hoặc-IP>:8082/siquantank/admin/login` | Quản trị bài viết, điểm sàn, hộp thư thí sinh |
| **Tài khoản Quản trị Mặc định** | **Username:** `admin` \| **Password:** `Tank@2026` | Xác thực JWT Token |
| **Backend REST API** | `http://127.0.0.1:8086/docs` | Port nội bộ backend: `8086` |

---

## BƯỚC 1: Cài Đặt Code Bằng Git & Đưa Dữ Liệu Upload Vào

### 1.1. Clone mã nguồn dự án
Toàn bộ mã nguồn, cơ sở dữ liệu SQLite và kho ảnh `legacy_uploads/` đã được tích hợp sẵn trong repository:

```bash
# Di chuyển đến thư mục muốn cài đặt (ví dụ: /home/ubuntu)
cd /home/ubuntu

# Clone mã nguồn từ Git (qua SSH hoặc HTTPS)
git clone git@github.com:nguyenhieptn/tank.git siquantank
# Hoặc: git clone https://github.com/nguyenhieptn/tank.git siquantank

# Di chuyển vào thư mục dự án
cd siquantank
```

### 1.2. Phân quyền thư mục dữ liệu & CSDL
Kho ảnh `legacy_uploads/` đã có sẵn khi clone. Chỉ cần tạo các thư mục runtime cho uploads mới và thiết lập quyền đọc/ghi:

```bash
# Đảm bảo đang ở thư mục siquantank
cd /home/ubuntu/siquantank

# 1. Tạo thư mục lưu trữ media mới và sao lưu cơ sở dữ liệu cho Backend
mkdir -p backend/uploads backend/backups

# 2. Phân quyền đọc/ghi cho thư mục dữ liệu và CSDL
chmod -R 755 legacy_uploads backend/uploads backend/backups
chmod 664 backend/tank.db
```

### 1.3. Kiểm tra dữ liệu
```bash
# Kiểm tra file CSDL SQLite (~3.0 MB)
ls -lh backend/tank.db

# Kiểm tra thư mục upload đã có dữ liệu các năm (2015 -> 2026)
ls -la legacy_uploads/ | head -n 12
```

---

## BƯỚC 2: Deploy Docker & Build Đầy Đủ

### 2.1. Cài đặt dependencies và build bản tĩnh Frontend (Production)
```bash
# Đứng tại thư mục gốc dự án
cd /home/ubuntu/siquantank

# Cài đặt thư viện frontend
npm install

# Build bản tĩnh production (sinh ra thư mục dist/)
npm run build
```

### 2.2. Build và khởi chạy các Docker Container
```bash
# Build lại images và khởi chạy toàn bộ cụm container ở chế độ chạy ngầm
docker compose up -d --build
```

### 2.3. Kiểm tra trạng thái hoạt động & sức khỏe hệ thống
```bash
# 1. Kiểm tra 2 container tank-backend và tank-frontend đang chạy (trạng thái Up / healthy)
docker ps --filter "name=tank-"

# 2. Kiểm tra log container Backend
docker logs --tail 30 tank-backend

# 3. Kiểm tra log container Frontend
docker logs --tail 30 tank-frontend

# 4. Chạy kiểm tra kết nối CSDL và sức khỏe hệ thống
docker exec -it tank-backend python -m backend.system_ops check-health
```

---

## BƯỚC 3: Cấu Hình Nginx & Domain

Tạo cấu hình Nginx để làm Reverse Proxy chuyển tiếp yêu cầu từ cổng 80/443 vào ứng dụng (cổng `8082`).

### 3.1. Tạo file cấu hình Nginx
```bash
sudo nano /etc/nginx/sites-available/siquantank.conf
```

Dán nội dung cấu hình (chọn một trong 2 cách bên dưới tùy theo nhu cầu tên miền):

#### Cách 1: Sử dụng Tên Miền Riêng (Ví dụ: `tuyensinh.siquantank.edu.vn`)
```nginx
server {
    listen 80;
    server_name tuyensinh.siquantank.edu.vn; # Thay bằng tên miền của bạn

    client_max_body_size 50M;

    # Nén Gzip
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

#### Cách 2: Chạy Dưới Đường Dẫn Tiền Tố `/siquantank` (Dùng chung tên miền với web khác)
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

### 3.2. Kích hoạt cấu hình và tải lại Nginx
```bash
# Kích hoạt site
sudo ln -sf /etc/nginx/sites-available/siquantank.conf /etc/nginx/sites-enabled/

# Kiểm tra cú pháp cấu hình Nginx
sudo nginx -t

# Tải lại dịch vụ Nginx
sudo systemctl reload nginx
```

---

## BƯỚC 4: Truy Cập Website & Kiểm Tra Vận Hành

### 4.1. Địa chỉ truy cập
- **Cổng Thông Tin Công Khai:**
  - Nếu cấu hình Domain riêng (Cách 1): `http://<your-domain>/siquantank/`
  - Nếu cấu hình tiền tố (Cách 2): `http://<your-domain>/siquantank/`
  - Nếu truy cập trực tiếp qua IP: `http://<IP>:8082/siquantank/`
- **Hệ Thống Quản Trị (Admin CMS):**
  - Địa chỉ: `http://<your-domain>/siquantank/admin/login`
  - Tài khoản mặc định: `admin`
  - Mật khẩu: `Tank@2026`

### 4.2. Kiểm tra các chức năng chính
1. **Trang chủ:** Banner hoạt động mượt mà, thông báo tuyển sinh, danh mục tin tức và điểm sàn hiển thị chuẩn xác.
2. **Hình ảnh media:** Mở một bài viết bất kỳ, kiểm tra ảnh đại diện và ảnh trong bài hiển thị đầy đủ từ `legacy_uploads/`.
3. **Đăng nhập quản trị:** Đăng nhập thành công vào trang quản trị với tài khoản `admin` / `Tank@2026`.
4. **Đăng bài mới:** Tạo thử một bài viết hoặc tải lên một hình ảnh mới để xác nhận quyền ghi thư mục `backend/uploads/`.

### 4.3. Các lệnh vận hành thường dùng
```bash
# Khởi động lại cụm container:
docker compose restart

# Dừng cụm container:
docker compose down

# Sao lưu cơ sở dữ liệu SQLite tức thời:
docker exec -it tank-backend python -m backend.system_ops backup-db

# Xem log container:
docker logs -f tank-backend
docker logs -f tank-frontend
```

---

## Tài Liệu Tham Khảo Kỹ Thuật
1. [Hướng Dẫn Triển Khai Thủ Công Bằng Git (Public Repo)](docs/HUONG_DAN_SETUP_BANG_FILE_ZIP.md)
2. [Tài Liệu Kiến Trúc Hệ Thống (Architecture)](docs/KIEN_TRUC_HE_THONG_ARCHITECTURE.md)
3. [Cẩm Nang Cài Đặt & Vận Hành Chi Tiết](docs/SYSTEM_SETUP.md)
4. [Quy Chuẩn Thiết Kế Giao Diện UI/UX](docs/DESIGN.md)
