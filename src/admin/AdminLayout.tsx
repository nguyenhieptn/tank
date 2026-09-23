import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  GraduationCap,
  Inbox,
  Activity,
  LogOut,
  ExternalLink,
  Shield,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/image.png";

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const username = localStorage.getItem("tank_admin_user") || "admin";

  useEffect(() => {
    const token = localStorage.getItem("tank_admin_token");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("tank_admin_token");
    localStorage.removeItem("tank_admin_user");
    navigate("/admin/login");
  };

  const navItems = [
    { label: "Bảng Điều Khiển", href: "/admin", icon: LayoutDashboard },
    { label: "Quản Lý Bài Viết", href: "/admin/posts", icon: FileText },
    { label: "Quản Lý Chuyên Mục", href: "/admin/categories", icon: FolderTree },
    { label: "Chỉ Tiêu Tuyển Sinh", href: "/admin/admissions", icon: GraduationCap },
    { label: "Hộp Thư Thí Sinh", href: "/admin/inquiries", icon: Inbox },
    { label: "Giám Sát & Sao Lưu", href: "/admin/system", icon: Activity, badge: "Hệ thống" },
  ];

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 bg-primary text-primary-foreground flex-col justify-between shrink-0 shadow-xl border-r border-accent/20">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-primary-foreground/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center shadow-gold shrink-0">
              <img src={logo} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
            </div>
            <div className="overflow-hidden">
              <div className="font-display text-sm text-accent font-bold tracking-wider truncate">
                SĨ QUAN TĂNG THIẾT GIÁP
              </div>
              <div className="text-[11px] text-primary-foreground/70 uppercase">
                Hệ Quản Trị Hệ Thống
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || (item.href !== "/admin" && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-accent text-primary font-bold shadow-sm"
                      : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-accent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-destructive text-destructive-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-primary-foreground/10 space-y-3">
          <div className="flex items-center justify-between text-xs px-1 text-primary-foreground/70">
            <span>Cán bộ: <strong>{username}</strong></span>
            <span className="inline-block w-2 h-2 rounded-full bg-green-400" title="Trực tuyến" />
          </div>

          <a href="/siquantank/" target="_blank" rel="noreferrer" className="block">
            <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8 bg-transparent text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10">
              <ExternalLink className="w-3.5 h-3.5" /> Xem Cổng thông tin
            </Button>
          </a>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            className="w-full text-xs gap-1.5 h-8"
          >
            <LogOut className="w-3.5 h-3.5" /> Đăng xuất
          </Button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-primary text-primary-foreground p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
          <span className="font-display font-bold text-accent text-sm">SQTTG ADMIN</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-primary text-primary-foreground p-4 space-y-2 border-b border-accent/20">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded hover:bg-primary-foreground/10"
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-primary-foreground/10 flex gap-2">
            <a href="/siquantank/" target="_blank" rel="noreferrer" className="flex-1">
              <Button variant="outline" size="sm" className="w-full text-xs h-8 bg-transparent text-primary-foreground">
                Xem web
              </Button>
            </a>
            <Button variant="destructive" size="sm" onClick={handleLogout} className="flex-1 text-xs h-8">
              Đăng xuất
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};
