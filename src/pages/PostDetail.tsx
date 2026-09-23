import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { fetchPostBySlug, fetchPosts } from "@/lib/api";
import { UnifiedArticle } from "@/types/wordpress";
import { Calendar, Tag, ArrowLeft, Printer, Share2, Copy, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getAssetUrl } from "@/lib/utils";
import { DocumentDownloads } from "@/components/site/DocumentDownloads";
import cadetsFallback from "@/assets/tank1.webp";
import heroFallback from "@/assets/hero-tanks.jpg";

export const PostDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<UnifiedArticle | null>(null);
  const [related, setRelated] = useState<UnifiedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!slug) return;

    setLoading(true);
    fetchPostBySlug(slug).then((data) => {
      setArticle(data);
      setLoading(false);

      if (data) {
        // Fetch related posts
        fetchPosts({ per_page: 4, tab: data.tab }).then((res) => {
          setRelated(res.posts.filter((p) => p.id !== data.id).slice(0, 3));
        });
      }
    });
  }, [slug]);

  useEffect(() => {
    if (!article?.content) return;
    const handleError = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName === "IMG" && target.closest("article.prose")) {
        const img = target as HTMLImageElement;
        if (!img.dataset.hasFallback) {
          img.dataset.hasFallback = "true";
          img.src = "/siquantank/placeholder.svg";
          img.style.maxWidth = "280px";
          img.style.opacity = "0.7";
          img.style.margin = "1rem auto";
          img.style.display = "block";
          img.alt = "Ảnh tư liệu";
        }
      }
    };
    window.addEventListener("error", handleError, true);

    const timer = setTimeout(() => {
      const container = document.querySelector("article.prose");
      if (container) {
        const imgs = container.querySelectorAll("img");
        imgs.forEach((img) => {
          if (img.complete && img.naturalWidth === 0 && !img.dataset.hasFallback) {
            img.dataset.hasFallback = "true";
            img.src = "/siquantank/placeholder.svg";
            img.style.maxWidth = "280px";
            img.style.opacity = "0.7";
            img.style.margin = "1rem auto";
            img.style.display = "block";
            img.alt = "Ảnh tư liệu";
          }
        });
      }
    }, 200);

    return () => {
      window.removeEventListener("error", handleError, true);
      clearTimeout(timer);
    };
  }, [article?.content]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Đã sao chép liên kết bài viết vào clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container py-16">
          <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
            <div className="h-6 w-48 bg-muted rounded"></div>
            <div className="h-10 w-full bg-muted rounded"></div>
            <div className="h-4 w-64 bg-muted rounded"></div>
            <div className="h-96 w-full bg-muted rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container py-20 text-center">
          <h1 className="font-display text-4xl text-primary mb-4">Không tìm thấy bài viết</h1>
          <p className="text-muted-foreground mb-8">
            Bài viết bạn tìm kiếm không tồn tại hoặc đã được chuyển sang vị trí khác.
          </p>
          <Link to="/">
            <Button variant="default" className="bg-primary text-primary-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> Về trang chủ
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-10">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-xs md:text-sm text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap py-1">
            <Link to="/" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            {article.parentCategoryName && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link
                  to={`/chuyen-muc/${encodeURIComponent(article.parentCategorySlug || article.parentCategoryName)}`}
                  className="hover:text-primary transition-colors font-medium text-foreground/80"
                >
                  {article.parentCategoryName}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/chuyen-muc/${encodeURIComponent(article.category)}`} className="hover:text-primary transition-colors">
              {article.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium truncate max-w-[200px] md:max-w-xs">
              {article.title}
            </span>
          </nav>

          {/* Article Header */}
          <header className="mb-8 pb-6 border-b border-border">
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              {article.parentCategoryName && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-primary text-primary-foreground">
                  {article.parentCategoryName}
                </span>
              )}
              <span className="inline-flex items-center px-3 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <Tag className="w-3 h-3 mr-1.5" />
                {article.category}
              </span>
              {article.targetYear && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-muted text-foreground border border-border">
                  Năm {article.targetYear}
                </span>
              )}
              <span className="inline-flex items-center text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                {article.date}
              </span>
              <span className="text-xs text-muted-foreground">
                Nguồn: <strong>Trường Sĩ quan Tăng thiết giáp</strong>
              </span>
            </div>

            <h1 className="font-display text-2xl md:text-4xl text-primary leading-tight font-bold mb-6">
              {article.title}
            </h1>

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-4 py-3 px-4 bg-muted/40 rounded-lg border border-border/60">
              <div className="text-xs text-muted-foreground">
                Chia sẻ tin bài với đồng đội, học viên
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="h-8 text-xs gap-1.5 bg-background"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Đã chép" : "Sao chép link"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="h-8 text-xs gap-1.5 bg-background hidden sm:flex"
                >
                  <Printer className="w-3.5 h-3.5" />
                  In bài
                </Button>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {article.image && (
            <div className="mb-8 rounded-lg overflow-hidden border border-border shadow-sm bg-muted">
              <img
                src={getAssetUrl(article.image) || article.image}
                alt={article.title}
                className="w-full max-h-[480px] object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = heroFallback;
                }}
              />
            </div>
          )}

          {/* Article Excerpt Highlight */}
          {article.excerpt && (
            <div className="p-4 mb-8 bg-primary/5 border-l-4 border-primary rounded-r-lg text-foreground font-medium italic text-sm md:text-base">
              {article.excerpt}
            </div>
          )}

          {/* Article HTML Content */}
          <article
            className="prose prose-slate max-w-none prose-headings:font-display prose-headings:text-primary prose-a:text-destructive prose-img:rounded-md prose-img:shadow-sm leading-relaxed text-foreground"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Prominent Admissions Documents & Official Attachments */}
          <DocumentDownloads
            content={article.content}
            postTitle={article.title}
            tab={article.tab}
            category={article.category}
          />

          {/* Article Footer & Tags */}
          <div className="mt-12 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Chuyên mục:</span>
              {article.categories.map((c, i) => (
                <Link
                  key={i}
                  to={`/chuyen-muc/${encodeURIComponent(c)}`}
                  className="text-xs bg-muted hover:bg-muted/80 text-foreground px-2.5 py-1 rounded transition-colors"
                >
                  {c}
                </Link>
              ))}
            </div>

            <Link to="/chuyen-muc/tin-tuc">
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Xem thêm các tin bài khác
              </Button>
            </Link>
          </div>

          {/* Related Articles */}
          {related.length > 0 && (
            <section className="mt-16 pt-8 border-t-2 border-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-6 w-1.5 bg-destructive rounded" />
                <h2 className="font-display text-2xl text-primary uppercase font-bold">
                  Tin bài liên quan
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((item, index) => (
                  <Link
                    key={item.id}
                    to={`/bai-viet/${item.slug}`}
                    className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-all flex flex-col"
                  >
                    <div className="aspect-[16/10] bg-muted overflow-hidden relative">
                      <img
                        src={getAssetUrl(item.image) || item.image || (index % 2 === 0 ? cadetsFallback : heroFallback)}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = heroFallback;
                        }}
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                        <Calendar className="w-3 h-3" />
                        {item.date}
                      </div>
                      <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};
