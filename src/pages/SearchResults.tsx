import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { fetchPosts } from "@/lib/api";
import { UnifiedArticle } from "@/types/wordpress";
import { Search, Calendar, ArrowRight, FileText, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [keyword, setKeyword] = useState(query);
  const [results, setResults] = useState<UnifiedArticle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setKeyword(query);
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    fetchPosts({ search: query, per_page: 30 }).then((res) => {
      setResults(res.posts);
      setLoading(false);
    });
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      setSearchParams({ q: keyword.trim() });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-10">
        <div className="container max-w-4xl mx-auto px-4">
          <nav className="flex items-center space-x-2 text-xs md:text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">Tìm kiếm</span>
          </nav>

          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl text-primary font-bold mb-4">
              Tìm kiếm thông tin
            </h1>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Nhập tiêu đề, chỉ tiêu, năm tuyển sinh, chuyên ngành..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pl-9 h-11"
                />
              </div>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-6">
                Tìm kiếm
              </Button>
            </form>
          </div>

          {query && (
            <div className="text-sm text-muted-foreground mb-6">
              Tìm thấy <strong className="text-foreground">{results.length}</strong> kết quả cho từ khóa:{" "}
              <span className="text-primary font-semibold">"{query}"</span>
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="border border-border rounded-lg p-5 animate-pulse space-y-2">
                  <div className="h-5 w-3/4 bg-muted rounded"></div>
                  <div className="h-4 w-1/4 bg-muted rounded"></div>
                  <div className="h-10 w-full bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : results.length === 0 && query ? (
            <div className="text-center py-16 bg-muted/20 border border-dashed border-border rounded-xl">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-40" />
              <h2 className="font-display text-xl text-primary font-bold">Không có kết quả phù hợp</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Vui lòng thử lại với các từ khóa phổ biến như "tuyển sinh", "điểm sàn", "tiêu chuẩn", "hồ sơ".
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((item) => (
                <article
                  key={item.id}
                  className="p-5 bg-card border border-border rounded-lg hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                      {item.category}
                    </span>
                    <span>•</span>
                    <Calendar className="w-3 h-3" />
                    <span>{item.date}</span>
                  </div>

                  <Link to={`/bai-viet/${item.slug}`}>
                    <h2 className="text-base md:text-lg font-bold text-foreground hover:text-primary transition-colors mb-2">
                      {item.title}
                    </h2>
                  </Link>

                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-3">
                    {item.excerpt}
                  </p>

                  <Link
                    to={`/bai-viet/${item.slug}`}
                    className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
                  >
                    Xem toàn văn nội dung <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};
