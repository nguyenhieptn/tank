# Quick Setup: Triển Khai Production Server (Môi Trường Không Có Mạng)

> **Cổng Thông Tin Điện Tử & Tuyển Sinh Trường Sĩ Quan Tăng Thiết Giáp**  
> Bản hướng dẫn chạy bằng tay từng bước (Step-by-Step) chuẩn Production đơn giản nhất, tối ưu cho môi trường máy chủ nội bộ / **không có kết nối mạng Internet (Offline / Air-gapped)**.

---

## Bảng Thông Tin Dịch Vụ & Cổng Truy Cập (Ports)

| Phân hệ / Dịch vụ | Địa chỉ nội bộ / Mặc định | Ghi chú |
| :--- | :--- | :--- |
| **Cổng Thông Tin Công Khai** | `http://<IP-Server>:8082/siquantank/` | Port container frontend: `8082` |
| **Hệ Thống Quản Trị (Admin CMS)** | `http://<IP-Server>:8082/siquantank/admin/login` | Quản lý bài viết, điểm sàn, duyệt hồ sơ |
| **Tài khoản Quản trị Mặc định** | **Username:** `admin` \| **Password:** `Tank@2026` | Xác thực JWT Token bảo mật cao |
| **Backend REST API & Docs** | `http://127.0.0.1:8086/docs` | Port nội bộ backend: `8086` (chỉ mở cục bộ) |

---

## Chuẩn Bị File Mang Lên Server Offline (Thực Hiện Ở Máy Có Mạng)

> [!IMPORTANT]
> Vì máy chủ triển khai **không có Internet**, không thể chạy `npm install`, `pip install` hoặc `docker pull` từ Docker Hub trực tiếp trên server.  
> Hãy chuẩn bị các file sau từ máy có mạng rồi sao chép (USB / ổ cứng / SCP qua mạng LAN) lên server:

1. **Thư mục mã nguồn:** Đã có sẵn thư mục `dist/` (build sẵn bằng `npm run build`) và cơ sở dữ liệu `backend/tank.db`.
2. **File dữ liệu media:** `siquantank_uploads.zip` (chứa toàn bộ hình ảnh bài viết ~260MB).
3. **File Docker Images đóng gói offline:** `siquantank_images.tar.gz` (chứa sẵn image `siquantank-backend:latest` và `siquantank-frontend:latest`).
   *Lệnh tạo file này tại máy có mạng (nếu cần xuất lại):*
   ```bash
   docker save siquantank-backend:latest siquantank-frontend:latest | gzip > siquantank_images.tar.gz
   ```

---

## BƯỚC 1: Cài Đặt Code Lên Server Bằng Git & Đưa Dữ Liệu Upload Vào

Thực hiện trực tiếp trên Server:

### 1.1. Lấy mã nguồn dự án vào server
Nếu server kết nối được với Git server nội bộ (GitLab / Gitea LAN / GitHub qua proxy):
```bash
# Di chuyển tới thư mục cài đặt mong muốn (ví dụ /home/ubuntu)
cd /home/ubuntu

# Clone mã nguồn
git clone https://github.com/nguyenhieptn/tank.git siquantank
cd siquantank
```

*(Trường hợp chép bằng file nén tarball mã nguồn lên server:)*
```bash
cd /home/ubuntu
tar -xzvf siquantank_full.tar.gz
cd siquantank
```

### 1.2. Đưa dữ liệu upload (Media) vào hệ thống
File `siquantank_uploads.zip` chứa dữ liệu hình ảnh kế thừa. Giải nén vào thư mục `legacy_uploads/`:

```bash
# Đảm bảo đang đứng trong thư mục siquantank
cd /home/ubuntu/siquantank

# 1. Tạo thư mục legacy_uploads
mkdir -p legacy_uploads

# 2. Giải nén dữ liệu uploads vào legacy_uploads
unzip -q /home/ubuntu/nevir/siquantank_uploads.zip -d legacy_uploads/

# 3. Tạo các thư mục lưu trữ media mới và sao lưu cơ sở dữ liệu cho Backend
mkdir -p backend/uploads backend/backups

# 4. Phân quyền truy cập đọc/ghi cho container
chmod -R 755 legacy_uploads backend/uploads backend/backups
chmod 664 backend/tank.db
```

### 1.3. Kiểm tra tính toàn vẹn dữ liệu
Chạy lệnh kiểm tra các thành phần cốt lõi:
```bash
# Kiểm tra CSDL SQLite (~3.0 MB)
ls -lh backend/tank.db

# Kiểm tra kho ảnh uploads đã có các thư mục năm (2015 -> 2026)
ls -la legacy_uploads/ | head -n 12

# Kiểm tra thư mục dist đã có bản build Frontend hoàn chỉnh
ls -la dist/
```

---

## BƯỚC 2: Triển Khai Docker & Khởi Chạy Production

Vì máy chủ không có mạng để build tải thư viện từ bên ngoài, ta nạp trực tiếp Docker Images đã đóng gói sẵn:

### 2.1. Nạp Docker Images vào Server
```bash
# Nạp 2 image backend và frontend vào Docker daemon
docker load -i /home/ubuntu/nevir/siquantank_images.tar.gz

# Kiểm tra lại xem 2 image đã sẵn sàng chưa:
docker images | grep -E "siquantank-backend|siquantank-frontend"
```
*Kết quả hiển thị `siquantank-backend:latest` và `siquantank-frontend:latest` là thành công.*

> [!NOTE]
> Nếu server đã có sẵn base images (`python:3.11-slim` và `nginx:alpine`) hoặc có mirror nội bộ, bạn cũng có thể build trực tiếp bằng lệnh: `docker compose build`.

### 2.2. Khởi chạy toàn bộ cụm Container
```bash
# Đứng tại thư mục chứa docker-compose.yml
cd /home/ubuntu/siquantank

# Khởi chạy cụm dịch vụ ngầm (Production Mode)
docker compose up -d
```

### 2.3. Kiểm tra trạng thái hoạt động & sức khỏe hệ thống
```bash
# 1. Xem trạng thái 2 container (phải có trạng thái Up và backend healthy)
docker ps --filter "name=tank-"

# 2. Kiểm tra log khởi động của Backend
docker logs --tail 30 tank-backend

# 3. Kiểm tra log của Frontend Nginx
docker logs --tail 30 tank-frontend

# 4. Chạy lệnh kiểm tra sức khỏe hệ thống và CSDL:
docker exec -it tank-backend python -m backend.system_ops check-health
```
*Hệ thống báo `Database: OK`, tổng số bài viết hiển thị đầy đủ là đã khởi chạy thành công.*

---

## BƯỚC 3: Cấu Hình Nginx Host Server & Tên Miền (Domain)

Cấu hình Nginx trên máy chủ Host (máy chủ vật lý / OS) làm Reverse Proxy chuyển tiếp yêu cầu từ cổng 80/443 vào cụm container `8082`.

### 3.1. Tạo file cấu hình Nginx
Mở file cấu hình mới:
```bash
sudo nano /etc/nginx/sites-available/siquantank.conf
```

Chọn một trong 2 cấu hình dưới đây tùy theo nhu cầu tên miền của đơn vị:

#### Lựa chọn A: Tên miền riêng chạy trực tiếp ở gốc trang chủ `/` (Ví dụ: `tuyensinh.siquantank.edu.vn`)
```nginx
server {
    listen 80;
    server_name tuyensinh.siquantank.edu.vn; # Thay bằng tên miền của bạn

    client_max_body_size 50M;

    # Tối ưu nén Gzip
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

#### Lựa chọn B: Chạy theo tiền tố `/siquantank` (Dùng chung tên miền với các dịch vụ khác trên server)
Thêm khối sau vào bên trong `server { ... }` hiện có trên Nginx của bạn:
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

### 3.2. Kích hoạt và kiểm tra Nginx Host
```bash
# 1. Kích hoạt site nếu tạo file mới ở sites-available
sudo ln -sf /etc/nginx/sites-available/siquantank.conf /etc/nginx/sites-enabled/

# 2. Kiểm tra cú pháp cấu hình Nginx (bắt buộc phải test successful)
sudo nginx -t

# 3. Nạp lại cấu hình Nginx
sudo systemctl reload nginx
```

---

## BƯỚC 4: Truy Cập Website & Kiểm Tra Vận Hành

### 4.1. Địa chỉ truy cập
- **Cổng Thông Tin Công Khai:**
  - Nếu dùng Domain riêng (Lựa chọn A): `http://<your-domain>/siquantank/`
  - Nếu dùng tiền tố (Lựa chọn B): `http://<your-domain>/siquantank/`
  - Nếu truy cập qua IP Server: `http://<IP-Server>:8082/siquantank/`
- **Hệ Thống Quản Trị Tuyển Sinh & Nội Dung (Admin CMS):**
  - Địa chỉ: `http://<your-domain>/siquantank/admin/login`
  - Tài khoản mặc định: `admin`
  - Mật khẩu: `Tank@2026`

### 4.2. Danh sách kiểm tra nghiệm thu nhanh
1. **Trang chủ:** Banner chuyển động mượt mà, thông báo tuyển sinh, danh mục tin tức và điểm sàn hiển thị chuẩn xác.
2. **Hình ảnh media:** Mở một bài viết bất kỳ, kiểm tra ảnh đại diện và ảnh trong bài load sắc nét từ `legacy_uploads/`.
3. **Đăng nhập quản trị:** Đăng nhập thành công với tài khoản `admin` / `Tank@2026`, giao diện CMS hiển thị thông số thống kê.
4. **Đăng bài & Upload file mới:** Tạo thử 1 bài viết hoặc đăng thông báo mới kèm ảnh để kiểm chứng phân quyền thư mục `backend/uploads/`.

### 4.3. Các lệnh bảo trì & quản trị nhanh thường dùng
```bash
# Khởi động lại cụm dịch vụ:
docker compose restart

# Dừng cụm dịch vụ:
docker compose down

# Sao lưu cơ sở dữ liệu SQLite tức thời (1-Click Safe Backup):
docker exec -it tank-backend python -m backend.system_ops backup-db

# Xem log trực tiếp khi cần theo dõi:
docker logs -f tank-backend
```

---

## Tài Liệu Kỹ Thuật Đính Kèm
Để tìm hiểu sâu hơn về kiến trúc vi dịch vụ và giải pháp an toàn thông tin:
1. [Tài Liệu Kiến Trúc Hệ Thống (Architecture)](docs/KIEN_TRUC_HE_THONG_ARCHITECTURE.md)
2. [Cẩm Nang Cài Đặt & Vận Hành Chi Tiết](docs/SYSTEM_SETUP.md)
3. [Quy Chuẩn Thiết Kế Giao Diện UI/UX](docs/DESIGN.md)
