import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import cadetsFallback from "@/assets/tank1.webp";
import heroFallback from "@/assets/hero-tanks.jpg";
import { Calendar, ArrowRight, Eye, ExternalLink } from "lucide-react";
import { getAssetUrl } from "@/lib/utils";
import { fetchPosts } from "@/lib/api";
import { UnifiedArticle } from "@/types/wordpress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DocumentDownloads } from "@/components/site/DocumentDownloads";

const tabs = [
  { id: "admissions", label: "Tuyển sinh 2026", categorySlug: "tuyen-sinh" },
  { id: "school", label: "Hoạt động Nhà trường", categorySlug: "nha-truong" },
  { id: "army", label: "Tin Quân đội", categorySlug: "quan-doi" },
  { id: "students", label: "Góc học viên", categorySlug: "hoc-vien" },
];

export const NewsHub = () => {
  const [active, setActive] = useState("admissions");
  const [selectedArticle, setSelectedArticle] = useState<UnifiedArticle | null>(null);
  const [articles, setArticles] = useState<UnifiedArticle[]>([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    fetchPosts({ per_page: 50 }).then((res) => {
      if (res.posts.length > 0) {
        setArticles(res.posts);
        setIsLive(res.isLive);
      }
    });
  }, []);

  const items = articles.filter((item) => item.tab === active);
  const heroItem = items[0] || null;
  const sideItems = items.slice(1, 4);

  const getFallbackImage = (idx: number) => {
    return idx % 2 === 0 ? cadetsFallback : heroFallback;
  };

  const activeTabConfig = tabs.find((t) => t.id === active) || tabs[0];

  return (
    <section id="tin-tuc" className="py-24 bg-background">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-destructive" />
              <span className="text-destructive font-bold uppercase tracking-[0.3em] text-sm flex items-center gap-2">
                Cập nhật chính thức từ Nhà trường
                {isLive && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-600/10 text-green-700 border border-green-600/20">
                    Trực tiếp CMS
                  </span>
                )}
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-primary leading-none">
              TIN TỨC & SỰ KIỆN
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-1 bg-secondary p-1 rounded-sm border border-border">
            {tabs.map((tab) => {
              const count = articles.filter((i) => i.tab === tab.id).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className={`px-3 md:px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                    active === tab.id
                      ? "bg-primary text-accent shadow-card-soft"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-semibold">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hero story + 3 cards */}
        {heroItem && (
          <div className="grid lg:grid-cols-2 gap-8 mb-10">
            {/* Main story */}
            <article
              onClick={() => setSelectedArticle(heroItem)}
              className="group relative overflow-hidden bg-primary rounded-sm shadow-command cursor-pointer"
            >
              <div className="aspect-[16/11] overflow-hidden">
                <img
                  src={getAssetUrl(heroItem.image) || heroItem.image || getFallbackImage(0)}
                  alt={heroItem.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = heroFallback;
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/75 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-destructive text-destructive-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider">
                    {heroItem.category || "TIN MỚI NHẤT"}
                  </span>
                  <span className="text-accent text-xs uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {heroItem.date}
                  </span>
                </div>
                <h3 className="font-display text-xl md:text-2xl lg:text-3xl text-primary-foreground leading-tight mb-3 group-hover:text-accent transition-colors">
                  {heroItem.title}
                </h3>
                <p className="text-primary-foreground/80 mb-4 line-clamp-2 text-xs md:text-sm">
                  {heroItem.excerpt}
                </p>
                <div className="inline-flex items-center gap-2 text-accent font-bold uppercase tracking-wider text-xs md:text-sm">
                  Đọc toàn văn <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </article>

            {/* Side stories */}
            <div className="grid gap-4">
              {sideItems.map((n, i) => (
                <article
                  key={n.id}
                  onClick={() => setSelectedArticle(n)}
                  className="group bg-card border border-border hover:border-accent transition-all p-4 md:p-5 flex gap-4 cursor-pointer hover:shadow-card-soft"
                >
                  <div className="shrink-0 w-24 h-24 overflow-hidden rounded-sm border border-border bg-muted">
                    <img
                      src={getAssetUrl(n.image) || n.image || getFallbackImage(i + 1)}
                      alt={n.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = heroFallback;
                      }}
                    />
                  </div>
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        <span className="text-destructive font-semibold uppercase">
                          {n.category}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {n.date}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm md:text-base text-primary group-hover:text-destructive transition-colors line-clamp-2 leading-snug">
                        {n.title}
                      </h4>
                    </div>
                    <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1 group-hover:text-primary transition-colors mt-2">
                      Xem chi tiết <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* View all button */}
        <div className="text-center pt-4">
          <Link to={`/chuyen-muc/${activeTabConfig.categorySlug}`}>
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-accent font-bold uppercase tracking-wider text-xs md:text-sm px-6 py-5 gap-2"
            >
              Xem tất cả tin bài mục "{activeTabConfig.label}"
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Article Detail Dialog Modal */}
      <Dialog
        open={Boolean(selectedArticle)}
        onOpenChange={(open) => !open && setSelectedArticle(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-accent/40 p-6 md:p-8">
          {selectedArticle && (
            <div>
              <DialogHeader className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-destructive text-destructive-foreground px-2.5 py-0.5 text-xs font-bold uppercase">
                    {selectedArticle.category}
                  </span>
                  <span className="text-muted-foreground text-xs flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {selectedArticle.date}
                  </span>
                </div>
                <DialogTitle className="font-display text-2xl md:text-3xl text-primary leading-tight text-left">
                  {selectedArticle.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground text-left">
                  Đăng tải chính thức trên Cổng thông tin Trường Sĩ quan Tăng thiết giáp
                </DialogDescription>
              </DialogHeader>

              {selectedArticle.image && (
                <div className="my-4 rounded-sm overflow-hidden border border-border">
                  <img
                    src={getAssetUrl(selectedArticle.image) || selectedArticle.image}
                    alt={selectedArticle.title}
                    className="w-full max-h-80 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = heroFallback;
                    }}
                  />
                </div>
              )}

              {selectedArticle.content ? (
                <div
                  className="prose prose-slate max-w-none prose-headings:font-display prose-headings:text-primary prose-a:text-destructive prose-img:rounded-sm leading-relaxed text-sm md:text-base text-foreground/90 my-4"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                />
              ) : (
                <div className="text-sm md:text-base text-foreground/90 whitespace-pre-line leading-relaxed my-4">
                  {selectedArticle.cleanContent || selectedArticle.excerpt}
                </div>
              )}

              {/* Prominent Admissions Documents & Official Attachments */}
              <DocumentDownloads
                content={selectedArticle.content}
                postTitle={selectedArticle.title}
                tab={selectedArticle.tab}
                category={selectedArticle.category}
              />

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <Link
                  to={`/bai-viet/${selectedArticle.slug}`}
                  onClick={() => setSelectedArticle(null)}
                >
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 text-primary">
                    <ExternalLink className="w-3.5 h-3.5" /> Mở trang riêng & Chia sẻ
                  </Button>
                </Link>
                <Button
                  onClick={() => setSelectedArticle(null)}
                  className="bg-primary text-accent hover:bg-primary/90 text-xs px-4"
                >
                  Đóng cửa sổ
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
