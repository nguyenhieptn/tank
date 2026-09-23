import React from "react";
import { Download, FileText, ExternalLink, FileSpreadsheet, ShieldAlert, CheckCircle2 } from "lucide-react";
import { getAssetUrl } from "@/lib/utils";

export interface ExtractedDocument {
  name: string;
  url: string;
  type: "PDF" | "DOC" | "DOCX" | "EXCEL" | "DRIVE" | "DOCUMENT";
  isOfficial?: boolean;
}

interface DocumentDownloadsProps {
  content?: string;
  postTitle?: string;
  tab?: string;
  category?: string;
  className?: string;
}

export function extractArticleDocuments(
  content?: string,
  postTitle: string = "",
  tab?: string,
  category: string = ""
): ExtractedDocument[] {
  const docs: ExtractedDocument[] = [];
  const seenUrls = new Set<string>();

  if (content) {
    // Regex to find all <a> tags with href
    const aTagRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
    let match;
    while ((match = aTagRegex.exec(content)) !== null) {
      const href = match[1].trim();
      const rawText = match[2];
      const cleanText = rawText.replace(/<[^>]+>/g, "").trim();
      const lowerHref = href.toLowerCase();

      const isDoc =
        lowerHref.includes(".pdf") ||
        lowerHref.includes(".doc") ||
        lowerHref.includes(".docx") ||
        lowerHref.includes(".xls") ||
        lowerHref.includes(".xlsx") ||
        lowerHref.includes("drive.google.com") ||
        lowerHref.includes("docs.google.com");

      if (isDoc && !seenUrls.has(href)) {
        seenUrls.add(href);

        let type: ExtractedDocument["type"] = "DOCUMENT";
        if (lowerHref.includes(".pdf")) type = "PDF";
        else if (lowerHref.includes(".docx")) type = "DOCX";
        else if (lowerHref.includes(".doc")) type = "DOC";
        else if (lowerHref.includes(".xls") || lowerHref.includes(".xlsx")) type = "EXCEL";
        else if (lowerHref.includes("drive.google.com") || lowerHref.includes("docs.google.com"))
          type = "DRIVE";

        // Build human-friendly label
        let name = cleanText;
        if (
          !name ||
          name.toLowerCase() === "tải xuống" ||
          name.toLowerCase().includes("xem chi tiết") ||
          name.toLowerCase().includes("chi tiết tại đây") ||
          name.toLowerCase().includes("xem tại đây") ||
          name.toLowerCase().includes("tại đây") ||
          name === "Link" ||
          name === "Download"
        ) {
          if (type === "PDF") {
            name = `${postTitle || "Tài liệu tuyển sinh"} (Tệp PDF chính thức)`;
          } else if (type === "DOC" || type === "DOCX") {
            name = `${postTitle || "Biểu mẫu xét tuyển"} (Văn bản Word)`;
          } else {
            name = `${postTitle || "Văn bản thông báo"} (Văn bản trực tuyến)`;
          }
        }

        docs.push({
          name,
          url: getAssetUrl(href) || href,
          type,
        });
      }
    }
  }

  // Always provide official 2026 registration form for admissions posts
  const isAdmissions =
    tab === "admissions" ||
    category.toLowerCase().includes("tuyển sinh") ||
    postTitle.toLowerCase().includes("tuyển sinh") ||
    postTitle.toLowerCase().includes("xét tuyển");

  const officialFormUrl = getAssetUrl("/documents/mau-dang-ky-xet-tuyen.doc") || "/siquantank/documents/mau-dang-ky-xet-tuyen.doc";
  if (isAdmissions && !seenUrls.has(officialFormUrl)) {
    docs.push({
      name: "Phiếu đăng ký xét tuyển Đại học Quân sự năm 2026 (Mẫu chính thức Bộ Quốc phòng)",
      url: officialFormUrl,
      type: "DOC",
      isOfficial: true,
    });
  }

  return docs;
}

export const DocumentDownloads: React.FC<DocumentDownloadsProps> = ({
  content,
  postTitle = "",
  tab,
  category = "",
  className = "",
}) => {
  const documents = extractArticleDocuments(content, postTitle, tab, category);

  if (documents.length === 0) return null;

  return (
    <div
      className={`my-8 p-5 md:p-6 bg-gradient-to-br from-primary/5 via-muted/30 to-primary/10 rounded-lg border-2 border-primary/25 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0 shadow-xs">
            <Download className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-display text-base md:text-lg font-bold text-primary uppercase tracking-tight">
              Tài liệu & Biểu mẫu Tuyển sinh Đính kèm
            </h3>
            <p className="text-xs text-muted-foreground">
              Nhấp vào nút bên dưới để tải trực tiếp văn bản chính thức về thiết bị
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-destructive/10 text-destructive text-xs font-bold rounded-full border border-destructive/20 shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {documents.length} văn bản
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {documents.map((doc, idx) => {
          const isDrive = doc.type === "DRIVE";
          const isWord = doc.type === "DOC" || doc.type === "DOCX";
          const isPdf = doc.type === "PDF";
          const isExcel = doc.type === "EXCEL";

          return (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-background border border-border/80 rounded-md hover:border-primary/50 hover:shadow-md transition-all gap-4 group"
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div
                  className={`p-2.5 rounded-md shrink-0 mt-0.5 ${
                    isPdf
                      ? "bg-red-500/10 text-red-600 border border-red-500/20"
                      : isWord
                      ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                      : isExcel
                      ? "bg-green-500/10 text-green-600 border border-green-500/20"
                      : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                  }`}
                >
                  {isExcel ? (
                    <FileSpreadsheet className="w-5 h-5" />
                  ) : isDrive ? (
                    <ExternalLink className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide ${
                        isPdf
                          ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                          : isWord
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          : isExcel
                          ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {doc.type}
                    </span>
                    {doc.isOfficial && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        Văn bản chuẩn BQP
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-snug break-words">
                    {doc.name}
                  </h4>
                </div>
              </div>

              <div className="sm:shrink-0 flex items-center justify-end">
                <a
                  href={doc.url}
                  target={isDrive ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  download={!isDrive}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs uppercase tracking-wider rounded shadow-sm hover:shadow transition-all active:scale-[0.98]"
                >
                  {isDrive ? (
                    <>
                      <ExternalLink className="w-4 h-4 text-accent" />
                      <span>Xem / Tải tài liệu</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-accent" />
                      <span>Tải xuống văn bản</span>
                    </>
                  )}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
