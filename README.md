# Cổng Thông Tin Điện Tử Trường Sĩ Quan Tăng Thiết Giáp

Hệ thống Cổng thông tin điện tử Trường Sĩ quan Tăng thiết giáp (Binh chủng Tăng thiết giáp — Bộ Quốc phòng) phiên bản 2.1 độc lập, hiện đại, loại bỏ hoàn toàn WordPress, vận hành bằng **Docker Container (FastAPI Backend + React Nginx Frontend + SQLite Zero-Maintenance Stack)**.

---

## 1. Khởi động Nhanh bằng Docker Compose (1-Click)

```bash
cd /home/ubuntu/nevir/siquantank
docker compose up -d --build
```

### Các cổng dịch vụ:
- **Frontend Công khai & Admin View:** `http://localhost:8082/siquantank/`
- **Trang Quản trị Nội dung (Admin View):** `http://localhost:8082/siquantank/admin/login` (Tài khoản: `admin` / `Tank@2026`)
- **Backend API & Swagger Docs:** `http://localhost:8086/docs`

---

## 2. Hệ Thống Tài Liệu Kỹ Thuật Chuẩn Hóa

Bộ tài liệu kỹ thuật của dự án được chuẩn hóa thành 5 tài liệu chuyên sâu:

1. **[Tài Liệu Kiến Trúc Hệ Thống (System Architecture)](file:///home/ubuntu/nevir/siquantank/docs/KIEN_TRUC_HE_THONG_ARCHITECTURE.md)**: Sơ đồ kiến trúc tổng thể, luồng điều hướng vi dịch vụ Docker, mô hình thực thể CSDL (ERD), và ma trận phân tầng kỹ thuật.
2. **[Tài Liệu Tính Năng Hệ Thống & Chi Tiết Quản Lý](file:///home/ubuntu/nevir/siquantank/docs/TINH_NANG_VA_CHI_TIET_QUAN_LY.md)**: Mô tả chi tiết tính năng cổng công chúng (Tuyển sinh 2026, 153 bài viết, xem nhúng PDF, thư viện ảnh), phân hệ Quản trị Admin tích hợp AI Copilot và quy trình thao tác chuẩn (SOP).
3. **[Báo Cáo Minh Chứng An Toàn Thông Tin & Giải Pháp Bảo Mật](file:///home/ubuntu/nevir/siquantank/docs/SECURITY_EVIDENCE_REPORT.md)**: Minh chứng kỹ thuật bảo mật toàn diện cho kiến trúc mới FastAPI + React (loại bỏ lỗ hổng WordPress, cô lập mạng Docker, chống SQL Injection/XSS, xác thực JWT, bảo vệ tầng biên Cloudflare & HSTS).
4. **[Cẩm Nang Cài Đặt & Vận Hành Hệ Thống (System Manual)](file:///home/ubuntu/nevir/siquantank/docs/SYSTEM_MANUAL.md)**: Hướng dẫn triển khai Docker, quản lý vòng đời container, sao lưu/phục hồi CSDL, và cấu hình Nginx Reverse Proxy.
5. **[Tài Liệu Thiết Kế Giao Diện & UI/UX Design System](file:///home/ubuntu/nevir/siquantank/docs/DESIGN_DOCUMENT.md)**: Quy chuẩn thiết kế giao diện mang đậm bản sắc Quân đội nhân dân Việt Nam, Design Tokens, bảng màu HSL và các thành phần giao diện.
