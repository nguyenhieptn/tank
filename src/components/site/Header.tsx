import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, ChevronDown, Search, X, BookOpen, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/image.png";

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    setOpenMenu(null);
    setMobileMenuOpen(false);

    if (href.startsWith("#")) {
      e.preventDefault();
      if (location.pathname !== "/") {
        navigate(`/${href}`);
      } else {
        if (href === "#") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          const elem = document.querySelector(href);
          elem?.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      navigate(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const navItems = [
    { label: "Trang chủ", href: "#" },
    {
      label: "Giới thiệu",
      href: "#lich-su",
      items: [
        { label: "Lịch sử truyền thống", href: "#lich-su" },
        { label: "Cơ cấu tổ chức (Phòng/Khoa/TĐ)", href: "#co-cau" },
      ],
    },
    {
      label: "Tuyển sinh",
      href: "#tuyen-sinh",
      highlight: true,
      items: [
        { label: "Chỉ tiêu & Điểm sàn 2026", href: "#tuyen-sinh" },
        { label: "Tờ rơi Tuyển sinh Quân sự", href: "/to-roi-tuyen-sinh", isRoute: true },
        { label: "Tin tức Tuyển sinh qua các năm", href: "/chuyen-muc/tuyen-sinh-quan-su", isRoute: true },
        { label: "Đăng ký tư vấn trực tuyến", href: "/lien-he", isRoute: true },
      ],
    },
    {
      label: "Tin tức",
      href: "/chuyen-muc",
      isRoute: true,
      items: [
        { label: "Tất cả tin tức & sự kiện", href: "/chuyen-muc", isRoute: true },
        { label: "Hoạt động Nhà trường", href: "/chuyen-muc/hoat-dong-nha-truong", isRoute: true },
        { label: "Tin Quốc phòng — Toàn quân", href: "/chuyen-muc/quan-su-quoc-phong", isRoute: true },
        { label: "Góc học viên", href: "/chuyen-muc/dao-tao-hoc-vien", isRoute: true },
      ],
    },
    {
      label: "Liên hệ",
      href: "/lien-he",
      isRoute: true,
    },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "bg-primary/95 backdrop-blur-md shadow-command" : "bg-primary"
      }`}
    >
      {/* Top utility bar */}
      <div className="border-b border-primary-foreground/10 bg-primary/40">
        <div className="container flex h-9 items-center justify-between text-xs text-primary-foreground/80 px-4">
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline font-medium tracking-wide">
              BỘ QUỐC PHÒNG — BINH CHỦNG TĂNG THIẾT GIÁP
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-accent font-semibold">Cổng Thông tin Điện tử</span>
            <span className="text-primary-foreground/30">|</span>
            <Link to="/to-roi-tuyen-sinh" className="hover:text-accent transition-colors flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-accent" /> Tờ rơi TSQS
            </Link>
            <span className="text-primary-foreground/30 hidden sm:inline">|</span>
            <Link to="/lien-he" className="hover:text-accent transition-colors hidden sm:flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-accent" /> Tư vấn tuyển sinh
            </Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="container flex h-20 items-center justify-between gap-6 px-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative h-12 w-12 shrink-0 rounded-full bg-destructive flex items-center justify-center shadow-gold ring-2 ring-accent">
            <img
              src={logo}
              alt="Logo Trường Sĩ quan Tăng thiết giáp"
              className="h-10 w-10 rounded-full object-cover"
            />
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="font-display text-lg text-accent tracking-wider">
              TRƯỜNG SĨ QUAN
            </div>
            <div className="font-display text-xl text-primary-foreground tracking-widest">
              TĂNG THIẾT GIÁP
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => setOpenMenu(item.label)}
              onMouseLeave={() => setOpenMenu(null)}
            >
              {item.isRoute ? (
                <Link
                  to={item.href}
                  className={`flex items-center gap-1 px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
                    item.highlight ? "text-accent" : "text-primary-foreground/90 hover:text-accent"
                  }`}
                >
                  {item.label}
                  {item.items && <ChevronDown className="h-3 w-3" />}
                </Link>
              ) : (
                <a
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`flex items-center gap-1 px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
                    item.highlight ? "text-accent" : "text-primary-foreground/90 hover:text-accent"
                  }`}
                >
                  {item.label}
                  {item.items && <ChevronDown className="h-3 w-3" />}
                </a>
              )}

              {openMenu === item.label && item.items && (
                <div className="absolute left-0 top-full pt-2 min-w-[260px] animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="bg-card border-t-2 border-accent shadow-command rounded-sm overflow-hidden">
                    {item.items.map((sub) =>
                      sub.isRoute ? (
                        <Link
                          key={sub.label}
                          to={sub.href}
                          onClick={() => setOpenMenu(null)}
                          className="block px-4 py-3 text-sm text-foreground hover:bg-primary hover:text-accent border-b border-border last:border-b-0 transition-colors"
                        >
                          {sub.label}
                        </Link>
                      ) : (
                        <a
                          key={sub.label}
                          href={sub.href}
                          onClick={(e) => handleNavClick(e, sub.href)}
                          className="block px-4 py-3 text-sm text-foreground hover:bg-primary hover:text-accent border-b border-border last:border-b-0 transition-colors"
                        >
                          {sub.label}
                        </a>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right CTA & Search */}
        <div className="flex items-center gap-3">
          {/* Search Trigger */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 text-primary-foreground/80 hover:text-accent rounded-full transition-colors"
            title="Tìm kiếm"
          >
            <Search className="w-5 h-5" />
          </button>

          <Link to="/to-roi-tuyen-sinh" className="hidden sm:block">
            <Button
              size="sm"
              className="bg-gold-gradient text-primary font-bold uppercase tracking-wider shadow-gold hover:scale-105 transition-transform border-0 h-10 px-4 text-xs"
            >
              Tuyển sinh 2026
            </Button>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-primary-foreground p-1"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Expandable Search Bar */}
      {searchOpen && (
        <div className="border-t border-primary-foreground/10 bg-primary/95 px-4 py-3 animate-in fade-in slide-in-from-top-2">
          <div className="container max-w-2xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm bài viết, thông báo tuyển sinh, điểm sàn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="pl-9 h-10 bg-background text-foreground text-sm"
                />
              </div>
              <Button type="submit" className="bg-accent text-primary font-semibold text-xs px-5">
                Tìm
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSearchOpen(false)}
                className="text-primary-foreground hover:bg-primary/50 text-xs px-3"
              >
                Đóng
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-card border-b border-border px-4 py-6 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-2">
            {navItems.map((item) => (
              <div key={item.label} className="border-b border-border/50 pb-2">
                {item.isRoute ? (
                  <Link
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block font-bold text-sm text-foreground hover:text-primary py-1 uppercase"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="block font-bold text-sm text-foreground hover:text-primary py-1 uppercase"
                  >
                    {item.label}
                  </a>
                )}
                {item.items && (
                  <div className="pl-3 mt-1 space-y-1.5">
                    {item.items.map((sub) =>
                      sub.isRoute ? (
                        <Link
                          key={sub.label}
                          to={sub.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block text-xs text-muted-foreground hover:text-primary py-1"
                        >
                          • {sub.label}
                        </Link>
                      ) : (
                        <a
                          key={sub.label}
                          href={sub.href}
                          onClick={(e) => handleNavClick(e, sub.href)}
                          className="block text-xs text-muted-foreground hover:text-primary py-1"
                        >
                          • {sub.label}
                        </a>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link to="/to-roi-tuyen-sinh" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-gold-gradient text-primary font-bold uppercase text-xs h-10">
                Tờ Rơi Tuyển Sinh 2026
              </Button>
            </Link>
            <Link to="/lien-he" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full text-xs h-10">
                Liên hệ Ban Tuyển sinh
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
