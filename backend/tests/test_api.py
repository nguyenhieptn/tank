import os
import sys
import unittest
from starlette.testclient import TestClient

# Ensure project root is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
sys.path.insert(0, PROJECT_ROOT)

from backend.main import app, hash_pw

class SiquanTankAPITestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        # Obtain admin JWT token
        resp = cls.client.post("/api/auth/login", json={
            "username": "admin",
            "password": "Tank@2026"
        })
        if resp.status_code == 200:
            cls.token = resp.json()["token"]
            cls.auth_headers = {"Authorization": f"Bearer {cls.token}"}
        else:
            cls.token = None
            cls.auth_headers = {}

    def test_admissions_endpoint(self):
        """Kiểm tra API thông tin tuyển sinh 2026"""
        res = self.client.get("/api/admissions")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["school_code"], "TGH")
        self.assertIn("target_year", data)
        self.assertGreaterEqual(data["target_year"], 2026)

    def test_categories_tree(self):
        """Kiểm tra cây danh mục phân cấp"""
        res = self.client.get("/api/categories?tree=true")
        self.assertEqual(res.status_code, 200)
        tree = res.json()
        self.assertIsInstance(tree, list)
        self.assertGreater(len(tree), 0)
        # Check that tree elements contain children
        root = tree[0]
        self.assertIn("name", root)
        self.assertIn("slug", root)
        self.assertIn("children", root)

    def test_departments_structure(self):
        """Kiểm tra cơ cấu tổ chức Phòng - Khoa - Tiểu đoàn"""
        res = self.client.get("/api/departments")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("phong", data)
        self.assertIn("khoa", data)
        self.assertIn("tieudoan", data)
        self.assertGreater(len(data["phong"]), 0)
        self.assertGreater(len(data["khoa"]), 0)
        self.assertGreater(len(data["tieudoan"]), 0)

    def test_posts_listing_and_pagination(self):
        """Kiểm tra danh sách bài viết & phân trang"""
        res = self.client.get("/api/posts?per_page=5&page=1")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("posts", data)
        self.assertIn("total", data)
        self.assertGreater(data["total"], 0)
        self.assertLessEqual(len(data["posts"]), 5)

    def test_category_slug_aliases(self):
        """Kiểm tra cơ chế alias cho slug trên menu header"""
        # Alias 'tin-tuc' should map to all posts
        res_all = self.client.get("/api/posts?category=tin-tuc&per_page=5")
        self.assertEqual(res_all.status_code, 200)
        self.assertGreater(res_all.json()["total"], 0)

        # Alias 'tuyen-sinh' should map to 'tuyen-sinh-quan-su'
        res_adm = self.client.get("/api/posts?category=tuyen-sinh&per_page=5")
        self.assertEqual(res_adm.status_code, 200)
        self.assertGreater(res_adm.json()["total"], 0)

        # Alias 'nha-truong' should map to 'hoat-dong-nha-truong'
        res_sch = self.client.get("/api/posts?category=nha-truong&per_page=5")
        self.assertEqual(res_sch.status_code, 200)
        self.assertGreater(res_sch.json()["total"], 0)

    def test_post_detail_by_slug_or_id(self):
        """Kiểm tra đọc chi tiết bài viết"""
        list_res = self.client.get("/api/posts?per_page=1")
        post = list_res.json()["posts"][0]
        slug = post["slug"]

        res = self.client.get(f"/api/posts/{slug}")
        self.assertEqual(res.status_code, 200)
        detail = res.json()
        self.assertEqual(detail["id"], post["id"])
        self.assertEqual(detail["title"], post["title"])

    def test_inquiry_submission_validation(self):
        """Kiểm tra xác thực số điện thoại và gửi câu hỏi tư vấn"""
        # Empty phone should fail
        res_fail = self.client.post("/api/inquiries", json={
            "fullname": "Thí sinh Test",
            "phone": "abc-invalid",
            "province": "Hà Nội",
            "message": "Cần tư vấn hồ sơ"
        })
        self.assertEqual(res_fail.status_code, 400)

        # Valid phone should succeed
        res_ok = self.client.post("/api/inquiries", json={
            "fullname": "Nguyễn Văn Thử Nghiệm",
            "phone": "0987654321",
            "province": "Vĩnh Phúc",
            "message": "Xin hỏi về điểm chuẩn năm 2026"
        })
        self.assertEqual(res_ok.status_code, 200)
        self.assertTrue(res_ok.json().get("success"))

    def test_auth_security(self):
        """Kiểm tra an toàn xác thực và phân quyền Admin"""
        # Bad login credentials
        bad_login = self.client.post("/api/auth/login", json={
            "username": "admin",
            "password": "WrongPassword999!"
        })
        self.assertEqual(bad_login.status_code, 401)

        # Access protected endpoint without token
        no_auth = self.client.get("/api/system/logs")
        self.assertEqual(no_auth.status_code, 401)

        # Access protected endpoint with valid token
        self.assertIsNotNone(self.token, "Admin login must succeed")
        with_auth = self.client.get("/api/system/logs", headers=self.auth_headers)
        self.assertEqual(with_auth.status_code, 200)

    def test_system_health_and_atomic_backup(self):
        """Kiểm tra giám sát hệ thống và sao lưu CSDL nguyên tử"""
        self.assertIsNotNone(self.token)

        # Check Health
        health_res = self.client.post(
            "/api/system/action",
            json={"action": "check-health"},
            headers=self.auth_headers
        )
        self.assertEqual(health_res.status_code, 200)
        health_data = health_res.json()
        self.assertEqual(health_data.get("status"), "healthy")
        self.assertGreater(health_data.get("total_posts", 0), 0)

        # Check Backup DB
        backup_res = self.client.post(
            "/api/system/action",
            json={"action": "backup-db"},
            headers=self.auth_headers
        )
        self.assertEqual(backup_res.status_code, 200)
        backup_data = backup_res.json()
        self.assertTrue(backup_data.get("success"))
        self.assertTrue(os.path.exists(backup_data.get("file", "")))

if __name__ == "__main__":
    unittest.main()
