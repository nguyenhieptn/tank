"""
Tương thích ngược: agent_ops.py chuyển hướng toàn bộ sang system_ops.py.
"""
from backend.system_ops import (
    slugify, strip_html, backup_db, check_health, log_action
)

# Wrapper cho backwards-compatibility
def auto_draft_article(*args, **kwargs):
    return {"success": False, "error": "Tính năng tạo bài tự động AI đã bị loại bỏ khỏi hệ thống."}

if __name__ == "__main__":
    import sys
    from backend.system_ops import main as sys_main
    print("Thông báo: agent_ops.py đã được thay thế bằng system_ops.py.")
    if len(sys.argv) > 1:
        import subprocess
        cmd = [sys.executable, "-m", "backend.system_ops"] + sys.argv[1:]
        subprocess.run(cmd)
