import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { fetchPosts, fetchCategoryTree } from "@/lib/api";
import { UnifiedArticle, CategoryTreeItem, CategoryChildItem } from "@/types/wordpress";
import { Calendar, Tag, ChevronRight, Search, ChevronLeft, ArrowRight, SlidersHorizontal, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAssetUrl } from "@/lib/utils";
import cadetsFallback from "@/assets/tank1.webp";
import heroFallback from "@/assets/hero-tanks.jpg";

export const CategoryArchive = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const searchKeyword = searchParams.get("q") || "";

  const [posts, setPosts] = useState<UnifiedArticle[]>([]);
  const [tree, setTree] = useState<CategoryTreeItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchKeyword);
  const [selectedYear, setSelectedYear] = useState<string>("all");

  useEffect(() => {
    fetchCategoryTree().then(setTree);
  }, []);

  // Determine active category hierarchy
  const decodedSlug = slug ? decodeURIComponent(slug) : "";
  const activeRoot = tree.find((r) => r.slug === slug || r.name.toLowerCase() === decodedSlug.toLowerCase());
  
  let activeParentOfChild: CategoryTreeItem | undefined = undefined;
  let activeChild: CategoryChildItem | undefined = undefined;

  if (!activeRoot && slug) {
    for (const r of tree) {
      const found = r.children?.find((c) => c.slug === slug || c.name.toLowerCase() === decodedSlug.toLowerCase());
      if (found) {
        activeParentOfChild = r;
        activeChild = found;
        break;
      }
    }
  }

  const currentRoot = activeRoot || activeParentOfChild;
  const currentCategoryTitle = activeChild
    ? activeChild.name
    : activeRoot
    ? activeRoot.name
    : slug
    ? decodedSlug
    : "Tất cả tin tức & hoạt động";

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    fetchPosts({
      page: currentPage,
      per_page: 9,
      search: searchKeyword || undefined,
      category: slug || undefined,
      year: selectedYear !== "all" ? selectedYear : undefined,
    }).then((res) => {
      setPosts(res.posts);
      setTotalPages(res.totalPages);
      setTotalCount(res.total);
      setLoading(false);
    });
  }, [slug, currentPage, searchKeyword, selectedYear]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ page: "1", q: searchInput });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: String(newPage), ...(searchKeyword ? { q: searchKeyword } : {}) });
  };

  const years = ["all", "2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-10">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-xs md:text-sm text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap py-1">
            <Link to="/" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/chuyen-muc" className="hover:text-primary transition-colors">
              Chuyên mục
            </Link>
            {activeParentOfChild && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link
                  to={`/chuyen-muc/${activeParentOfChild.slug}`}
                  className="hover:text-primary transition-colors font-medium text-foreground/80"
                >
                  {activeParentOfChild.name}
                </Link>
              </>
            )}
            {slug && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-foreground font-medium">{currentCategoryTitle}</span>
              </>
            )}
          </nav>

          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1.5 bg-destructive rounded" />
                <span className="text-xs uppercase tracking-widest text-destructive font-bold">
                  {currentRoot ? `Chuyên đề: ${currentRoot.name}` : "Kho lưu trữ dữ liệu chính thức"}
                </span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl lg:text-4xl text-primary font-bold">
                {currentCategoryTitle}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Hiển thị {posts.length} trên tổng số <strong>{totalCount}</strong> bài viết chính thức
              </p>
            </div>

            {/* In-category Search & Year Filter */}
            <div className="flex flex-wrap items-center gap-2.5">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-60">
                <Input
                  type="text"
                  placeholder="Lọc tin theo từ khóa..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pr-8 h-9 text-xs"
                />
                <button type="submit" className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-primary">
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Year Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setSearchParams({ page: "1", ...(searchKeyword ? { q: searchKeyword } : {}) });
                  }}
                  className="h-9 px-2.5 py-1 text-xs bg-background border border-input rounded-md focus:ring-1 focus:ring-primary font-medium"
                >
                  <option value="all">Tất cả các năm</option>
                  {years.filter((y) => y !== "all").map((y) => (
                    <option key={y} value={y}>
                      Năm {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Root Categories Horizontal Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4">
            <Link
              to="/chuyen-muc"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                !slug
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-background hover:bg-muted/80 text-foreground border-border"
              }`}
            >
              Tất cả tin bài
            </Link>
            {tree.map((root) => {
              const isRootActive = currentRoot?.id === root.id;
              return (
                <Link
                  key={root.id}
                  to={`/chuyen-muc/${root.slug}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                    isRootActive
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-background hover:bg-muted/80 text-foreground border-border"
                  }`}
                >
                  {root.name} ({root.count})
                </Link>
              );
            })}
          </div>

          {/* Subcategories Chips Bar (if inside a Root) */}
          {currentRoot && currentRoot.children && currentRoot.children.length > 0 && (
            <div className="p-3 bg-muted/30 border border-border/80 rounded-xl mb-8 flex items-center gap-2 overflow-x-auto">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1 shrink-0">
                Phân nhánh:
              </span>
              <Link
                to={`/chuyen-muc/${currentRoot.slug}`}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  slug === currentRoot.slug
                    ? "bg-destructive text-destructive-foreground font-bold shadow-xs"
                    : "bg-background hover:bg-muted text-foreground border border-border/70"
                }`}
              >
                Tất cả {currentRoot.name} ({currentRoot.count})
              </Link>
              {currentRoot.children.map((child) => (
                <Link
                  key={child.id}
                  to={`/chuyen-muc/${child.slug}`}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    slug === child.slug
                      ? "bg-destructive text-destructive-foreground font-bold shadow-xs"
                      : "bg-background hover:bg-muted text-foreground border border-border/70"
                  }`}
                >
                  {child.name} ({child.count})
                </Link>
              ))}
            </div>
          )}

          {/* Posts Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="border border-border rounded-lg p-4 space-y-4 animate-pulse">
                  <div className="h-44 bg-muted rounded"></div>
                  <div className="h-4 w-24 bg-muted rounded"></div>
                  <div className="h-6 w-full bg-muted rounded"></div>
                  <div className="h-12 w-full bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 border border-dashed border-border rounded-xl">
              <Search className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-50" />
              <h3 className="font-display text-xl text-primary font-bold">Không tìm thấy bài viết phù hợp</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Thử đổi từ khóa tìm kiếm hoặc chọn xem tất cả các năm để hiển thị đầy đủ kết quả.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchInput("");
                  setSelectedYear("all");
                  setSearchParams({ page: "1" });
                }}
                className="mt-4 text-xs"
              >
                Đặt lại bộ lọc
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((item, index) => (
                <article
                  key={item.id}
                  className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all flex flex-col"
                >
                  <Link to={`/bai-viet/${item.slug}`} className="aspect-[16/10] bg-muted overflow-hidden relative block">
                    <img
                      src={getAssetUrl(item.image) || item.image || (index % 2 === 0 ? cadetsFallback : heroFallback)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = heroFallback;
                      }}
                    />
                    <span className="absolute top-2.5 left-2.5 bg-primary/90 text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded shadow-sm">
                      {item.category}
                    </span>
                  </Link>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{item.date}</span>
                      </div>
                      <Link to={`/bai-viet/${item.slug}`}>
                        <h2 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2">
                          {item.title}
                        </h2>
                      </Link>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                        {item.excerpt}
                      </p>
                    </div>

                    <Link
                      to={`/bai-viet/${item.slug}`}
                      className="inline-flex items-center text-xs font-semibold text-primary hover:text-destructive transition-colors mt-auto pt-3 border-t border-border/60"
                    >
                      Đọc toàn văn <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="text-xs h-9"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Trang trước
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 7 && currentPage > 4) {
                    pageNum = currentPage - 3 + i;
                    if (pageNum > totalPages) return null;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 text-xs rounded-md font-semibold transition-colors ${
                        currentPage === pageNum
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80 text-foreground"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="text-xs h-9"
              >
                Trang sau <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};
