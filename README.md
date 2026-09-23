# Cổng Thông Tin Điện Tử & Tuyển Sinh Trường Sĩ Quan Tăng Thiết Giáp

Phiên bản độc lập **2.1 (Production-Ready)** — Hiện đại hóa toàn diện, loại bỏ hoàn toàn WordPress, vận hành bằng cụm Docker Container vi dịch vụ: **FastAPI + React 18 Nginx + SQLite Zero-Maintenance Stack**.

---

## 1. Cổng Dịch Vụ & Tài Khoản Truy Cập

| Phân hệ / Dịch vụ | Địa chỉ truy cập | Ghi chú |
| :--- | :--- | :--- |
| **Cổng Thông Tin Công Khai** | `http://localhost:8082/siquantank/` | Tiền tố đường dẫn: `/siquantank/` |
| **Hệ Thống Quản Trị (Admin CMS)** | `http://localhost:8082/siquantank/admin/login` | Quản lý bài viết, điểm sàn, hộp thư thí sinh |
| **Tài khoản Quản trị Mặc định** | **Username:** `admin` \| **Password:** `Tank@2026` | Xác thực JWT Token bảo mật cao |
| **Backend API & Swagger Docs** | `http://localhost:8086/docs` | Tài liệu đặc tả API chuẩn OpenAPI/Swagger |

---

## 2. Hướng Dẫn Cài Đặt & Khởi Chạy Chuẩn (Setup Guide)

### 2.1. Yêu Cầu Tiên Quyết (Prerequisites)
- **Hệ điều hành:** Linux (Ubuntu 20.04/22.04 LTS hoặc mới hơn).
- **Docker Engine:** Phiên bản `>= 24.x` và **Docker Compose:** Phiên bản `>= v2.x`.
- **Node.js:** `>= 20.x` & `npm` (chỉ cần khi phát triển hoặc build lại gói tĩnh frontend).

---

### 2.2. Triển Khai Nhanh Bằng Docker Compose (Production - Khuyên dùng)

1. **(Tùy chọn) Rebuild mã nguồn Frontend:**
   ```bash
   cd /home/ubuntu/nevir/siquantank
   npm install && npm run build
   ```

2. **Khởi chạy Toàn Bộ Cụm Container:**
   ```bash
   docker compose up -d --build
   ```

3. **Kiểm tra Trạng Thái Hoạt Động & Nhật Ký (Logs):**
   ```bash
   # Kiểm tra tình trạng 2 container tank-backend và tank-frontend
   docker ps | grep -E "tank-backend|tank-frontend"

   # Xem logs container backend
   docker logs -f tank-backend

   # Xem logs container frontend
   docker logs -f tank-frontend
   ```

4. **Khởi Động Lại / Dừng Cụm Dịch Vụ:**
   ```bash
   docker compose restart           # Khởi động lại container
   docker compose down              # Dừng toàn bộ cụm dịch vụ
   ```

---

### 2.3. Chạy Môi Trường Phát Triển Cục Bộ (Local Development - Không Dùng Docker)

Phù hợp cho lập trình viên cần chỉnh sửa mã nguồn và xem kết quả ngay lập tức:

#### Bước 1: Khởi chạy Backend (FastAPI)
```bash
cd /home/ubuntu/nevir/siquantank/backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
*API cục bộ chạy tại `http://localhost:8000` (Swagger docs: `http://localhost:8000/docs`).*

#### Bước 2: Khởi chạy Frontend (React + Vite)
```bash
cd /home/ubuntu/nevir/siquantank
npm install
npm run dev
```
*Giao diện phát triển chạy tại `http://localhost:8082/siquantank/` với tính năng Hot Module Replacement (HMR).*

---

### 2.4. Cấu Hình Nginx Host Server (Reverse Proxy cho Tên Miền)

Khi đưa hệ thống lên máy chủ có tên miền công khai (ví dụ: `demo.expsolution.io`), cấu hình khối Nginx trên Host như sau:

```nginx
# Cấu hình chuyển hướng và proxy cho /siquantank
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
}
```

---

## 3. Vận Hành & Bảo Trì Hệ Thống (System Ops & Maintenance)

Hệ thống tích hợp sẵn module `system_ops.py` giúp quản trị viên thực hiện các thao tác vận hành nhanh qua dòng lệnh:

### 3.1. Kiểm Tra Sức Khỏe Hệ Thống (Health Check)
Kiểm tra tổng số bài viết, trạng thái CSDL, dung lượng file `tank.db` và câu hỏi tư vấn mới:
```bash
docker exec -it tank-backend python -m backend.system_ops check-health
```

### 3.2. Sao Lưu Cơ Sở Dữ Liệu Tức Thời (1-Click Backup)
Sử dụng SQLite Native Backup API an toàn 100%, không khóa dữ liệu đang ghi:
```bash
docker exec -it tank-backend python -m backend.system_ops backup-db
```
*Bản sao lưu được tạo tự động tại thư mục `backend/backups/tank_backup_YYYYMMDD_HHMMSS.db`.*

### 3.3. Khôi Phục Dữ Liệu Khẩn Cấp (Disaster Recovery)
Khi cần khôi phục cơ sở dữ liệu về một mốc thời gian sao lưu trước đó:
```bash
# 1. Dừng container backend
docker stop tank-backend

# 2. Khôi phục file database từ bản backup mong muốn
cp /home/ubuntu/nevir/siquantank/backend/backups/tank_backup_<TIMESTAMP>.db /home/ubuntu/nevir/siquantank/backend/tank.db

# 3. Khởi động lại container (hệ thống phục hồi ngay lập tức trong 3 giây)
docker start tank-backend
```

### 3.4. Đặt Lịch Tự Động Sao Lưu Hàng Ngày (Crontab)
Mở crontab trên host server (`crontab -e`) và thêm dòng lệnh tự động sao lưu vào lúc 02:00 sáng mỗi ngày:
```bash
0 2 * * * docker exec tank-backend python -m backend.system_ops backup-db >> /home/ubuntu/nevir/siquantank/backend/backups/cron.log 2>&1
```

---

## 4. Cấu Trúc Thư Mục Dự Án (Project Structure)

```text
/home/ubuntu/nevir/siquantank/
├── backend/
│   ├── main.py                 # FastAPI REST API Engine & Routing
│   ├── database.py             # Kết nối SQLite & SQLAlchemy Engine
│   ├── models.py & schemas.py  # Data models & Pydantic validation
│   ├── system_ops.py           # CLI công cụ sao lưu, kiểm tra sức khỏe hệ thống
│   ├── tank.db                 # File CSDL SQLite chính (153 bài viết, điểm sàn, v.v.)
│   ├── backups/                # Kho lưu trữ các bản sao lưu database tự động
│   ├── uploads/                # Tệp ảnh và văn bản tải lên qua CMS
│   ├── requirements.txt        # Thư viện Python phụ thuộc
│   └── Dockerfile              # Dockerfile backend (Python 3.11-slim)
├── docker/
│   └── nginx.conf              # Cấu hình Nginx reverse proxy nội bộ container frontend
├── docs/                       # Hệ thống tài liệu kỹ thuật & báo cáo chuyên sâu
├── legacy_uploads/             # Kho media kế thừa từ hệ thống WordPress cũ (~260MB)
├── src/                        # Mã nguồn giao diện người dùng React 18 + TypeScript + Tailwind
├── dist/                       # Bản build production của Frontend React
├── docker-compose.yml          # Kịch bản khởi chạy toàn bộ cụm container
├── Dockerfile                  # Dockerfile frontend (Nginx Alpine)
└── package.json                # Cấu hình dependencies Frontend
```

---

## 5. Hệ Thống Tài Liệu Kỹ Thuật Đính Kèm

Bộ tài liệu kỹ thuật chuyên sâu được lưu trữ đầy đủ trong thư mục [`docs/`](docs/):

1. **[Tài Liệu Kiến Trúc Hệ Thống (System Architecture)](docs/KIEN_TRUC_HE_THONG_ARCHITECTURE.md)**: Sơ đồ kiến trúc vi dịch vụ, luồng điều hướng Docker, mô hình ERD cơ sở dữ liệu.
2. **[Cẩm Nang Cài Đặt & Vận Hành Chi Tiết](docs/SYSTEM_SETUP.md)**: Chi tiết cấu hình mạng, bảng so sánh hiệu năng cũ/mới, quy trình nghiệp vụ chuyên sâu.
3. **[Quy Chuẩn Thiết Kế Giao Diện UI/UX](docs/DESIGN.md)**: Design tokens, bảng màu quân đội HSL, thành phần giao diện theo bản sắc Tăng thiết giáp.
4. **[Báo Cáo Tính Năng & Chi Tiết Quản Lý (DOCX)](docs/TINH_NANG_VA_CHI_TIET_QUAN_LY.docx)**: Báo cáo chi tiết các module tuyển sinh, quản trị và quy trình nghiệp vụ.
5. **[Báo Cáo An Toàn Thông Tin & Giải Pháp Bảo Mật (DOCX)](docs/SECURITY_EVIDENCE_REPORT.docx)**: Báo cáo khắc phục triệt để lỗ hổng WordPress, mã hóa JWT, an toàn hạ tầng.
6. **[Tóm Tắt Khắc Phục Bảo Mật (DOCX)](docs/BAO_CAO_TOM_TAT_KHAC_PHUC_BAO_MAT.docx)**: Tóm lược kết quả rà soát và đánh giá an toàn thông tin toàn diện.
