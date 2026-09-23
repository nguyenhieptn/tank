import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Quote,
  Minus,
  Table as TableIcon,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Code,
  Eye,
  Plus,
  Trash2,
  RemoveFormatting
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface RichTextEditorRef {
  insertHtml: (html: string) => void;
  insertImage: (url: string, alt?: string) => void;
  getHtml: () => string;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ value, onChange, placeholder = "Nhập nội dung bài viết...", minHeight = "420px" }, ref) => {
    const [isSourceMode, setIsSourceMode] = useState(false);
    const [rawHtml, setRawHtml] = useState(value);

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [2, 3, 4],
          },
        }),
        Underline,
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "text-primary underline font-medium hover:text-destructive transition-colors",
            target: "_blank",
            rel: "noopener noreferrer",
          },
        }),
        Image.configure({
          allowBase64: true,
          HTMLAttributes: {
            class: "rounded-lg max-w-full my-3 shadow-md mx-auto block",
          },
        }),
        Table.configure({
          resizable: true,
          HTMLAttributes: {
            class: "border-collapse table-auto w-full my-4 border border-border text-xs",
          },
        }),
        TableRow,
        TableHeader.configure({
          HTMLAttributes: {
            class: "border border-border bg-muted/60 p-2.5 font-bold text-left text-foreground",
          },
        }),
        TableCell.configure({
          HTMLAttributes: {
            class: "border border-border p-2.5 text-foreground",
          },
        }),
      ],
      content: value,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        setRawHtml(html);
        onChange(html);
      },
    });

    // Sync external value changes if not in sync
    useEffect(() => {
      if (editor && value !== editor.getHTML() && !editor.isFocused && !isSourceMode) {
        editor.commands.setContent(value, { emitUpdate: false });
        setRawHtml(value);
      }
    }, [value, editor, isSourceMode]);

    // Handle imperative methods
    useImperativeHandle(ref, () => ({
      insertHtml: (html: string) => {
        if (isSourceMode) {
          const updated = rawHtml + html;
          setRawHtml(updated);
          onChange(updated);
        } else if (editor) {
          editor.commands.insertContent(html);
        }
      },
      insertImage: (url: string, alt: string = "Ảnh bài viết") => {
        if (isSourceMode) {
          const imgTag = `<img src="${url}" alt="${alt}" class="rounded-lg max-w-full my-3 shadow-md mx-auto block" />`;
          const updated = rawHtml + "\n" + imgTag;
          setRawHtml(updated);
          onChange(updated);
        } else if (editor) {
          editor.chain().focus().setImage({ src: url, alt }).run();
        }
      },
      getHtml: () => {
        return isSourceMode ? rawHtml : (editor ? editor.getHTML() : value);
      },
    }));

    const handleSwitchMode = () => {
      if (isSourceMode) {
        // Switching back from Source to WYSIWYG
        if (editor) {
          editor.commands.setContent(rawHtml, { emitUpdate: false });
        }
        onChange(rawHtml);
        setIsSourceMode(false);
      } else {
        // Switching from WYSIWYG to Source
        if (editor) {
          setRawHtml(editor.getHTML());
        }
        setIsSourceMode(true);
      }
    };

    const handleRawHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setRawHtml(val);
      onChange(val);
    };

    const setLink = () => {
      if (!editor) return;
      const previousUrl = editor.getAttributes("link").href;
      const url = window.prompt("Nhập đường dẫn liên kết (URL):", previousUrl);

      if (url === null) return;
      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }

      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    };

    const insertImageUrl = () => {
      if (!editor) return;
      const url = window.prompt("Nhập URL hình ảnh:");
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    };

    const insertTable = () => {
      if (!editor) return;
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    if (!editor) {
      return (
        <div className="border border-border rounded-lg p-6 text-center text-xs text-muted-foreground animate-pulse">
          Đang khởi tạo trình soạn thảo trực quan...
        </div>
      );
    }

    const isInTable = editor.isActive("table");

    return (
      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm flex flex-col">
        {/* Toolbar Header */}
        <div className="bg-muted/40 border-b border-border p-2 flex flex-wrap items-center justify-between gap-1 select-none">
          <div className="flex flex-wrap items-center gap-1">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-background border border-border rounded-md p-0.5 mr-1.5 shadow-2xs">
              <button
                type="button"
                onClick={() => isSourceMode && handleSwitchMode()}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded flex items-center gap-1 transition-colors ${
                  !isSourceMode
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Chế độ soạn thảo trực quan"
              >
                <Eye className="w-3.5 h-3.5" /> Trực quan
              </button>
              <button
                type="button"
                onClick={() => !isSourceMode && handleSwitchMode()}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded flex items-center gap-1 transition-colors ${
                  isSourceMode
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Chế độ mã nguồn HTML"
              >
                <Code className="w-3.5 h-3.5" /> HTML
              </button>
            </div>

            {!isSourceMode && (
              <>
                {/* Text Formatting */}
                <div className="flex items-center gap-0.5 border-r border-border/70 pr-1.5 mr-1">
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1.5 rounded hover:bg-muted text-xs transition-colors ${
                      editor.isActive("bold") ? "bg-primary/20 text-primary font-bold" : "text-foreground"
                    }`}
                    title="In đậm (Ctrl+B)"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1.5 rounded hover:bg-muted text-xs transition-colors ${
                      editor.isActive("italic") ? "bg-primary/20 text-primary" : "text-foreground"
                    }`}
                    title="In nghiêng (Ctrl+I)"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-1.5 rounded hover:bg-muted text-xs transition-colors ${
                      editor.isActive("underline") ? "bg-primary/20 text-primary" : "text-foreground"
                    }`}
                    title="Gạch chân (Ctrl+U)"
                  >
                    <UnderlineIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-1.5 rounded hover:bg-muted text-xs transition-colors ${
                      editor.isActive("strike") ? "bg-primary/20 text-primary" : "text-foreground"
                    }`}
                    title="Gạch ngang chữ"
                  >
                    <Strikethrough className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                    className="p-1.5 rounded hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors"
                    title="Xóa định dạng"
                  >
                    <RemoveFormatting className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Headings */}
                <div className="flex items-center gap-0.5 border-r border-border/70 pr-1.5 mr-1">
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-1.5 rounded hover:bg-muted text-xs transition-colors ${
                      editor.isActive("heading", { level: 2 }) ? "bg-primary/20 text-primary font-bold" : "text-foreground"
                    }`}
                    title="Tiêu đề H2"
                  >
                    <Heading2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`p-1.5 rounded hover:bg-muted text-xs transition-colors ${
                      editor.isActive("heading", { level: 3 }) ? "bg-primary/20 text-primary font-bold" : "text-foreground"
                    }`}
                    title="Tiêu đề H3"
                  >
                    <Heading3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                    className={`p-1.5 rounded hover:bg-muted text-xs transition-colors ${
                      editor.isActive("heading", { level: 4 }) ? "bg-primary/20 text-primary font-bold" : "text-foreground"
                    }`}
                    title="Tiêu đề H4"
                  >
                    <Heading4 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Alignment */}
                <div className="flex items-center gap-0.5 border-r border-border/70 pr-1.5 mr-1">
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    className={`p-1.5 rounded hover:bg-muted text-xs transition-colors ${
                      editor.isActive({ textAlign: "left" }) ? "bg-primary/20 text-primary" : "text-foreground"
                    }`}
                    title="Căn trái"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    className={`p-1.5 rounded hover:bg-muted text-xs transition-colors ${
                      editor.isActive({ textAlign: "center" }) ? "bg-primary/20 text-primary" : "text-foreground"
                    }`}
                    title="Căn giữa"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    className={`p-1.5 rounded hover:bg-muted text-xs transition-colors ${
                      editor.isActive({ textAlign: "right" }) ? "bg-primary/20 text-primary" : "text-foreground"
                    }`}
                    title="Căn phải"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                    className={`p-1.5 rounded hover:bg-muted text-xs transition-colors ${
                      editor.isActive({ textAlign: "justify" }) ? "bg-primary/20 text-primary" : "text-foreground"
                    }`}
                    title="Căn đều hai bên"
                  >
                    <AlignJustify className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Lists & Quotes */}
                <div className="flex items-center gap-0.5 border-r border-border/70 pr-1.5 mr-1">
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1.5 rounded hover:bg-muted text-xs transition-colors ${
                      editor.isActive("bulletList") ? "bg-primary/20 text-primary" : "text-foreground"
                    }`}
                    title="Danh sách gạch đầu dòng"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-1.5 rounded hover:bg-muted text-xs transition-colors ${
                      editor.isActive("orderedList") ? "bg-primary/20 text-primary" : "text-foreground"
                    }`}
                    title="Danh sách số thứ tự"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`p-1.5 rounded hover:bg-muted text-xs transition-colors ${
                      editor.isActive("blockquote") ? "bg-primary/20 text-primary" : "text-foreground"
                    }`}
                    title="Đoạn trích dẫn"
                  >
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    className="p-1.5 rounded hover:bg-muted text-xs text-foreground transition-colors"
                    title="Đường kẻ ngang phân cách"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Links, Media & Table */}
                <div className="flex items-center gap-0.5 border-r border-border/70 pr-1.5 mr-1">
                  <button
                    type="button"
                    onClick={setLink}
                    className={`p-1.5 rounded hover:bg-muted text-xs transition-colors ${
                      editor.isActive("link") ? "bg-primary/20 text-primary" : "text-foreground"
                    }`}
                    title="Chèn / sửa liên kết"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                  </button>
                  {editor.isActive("link") && (
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().unsetLink().run()}
                      className="p-1.5 rounded hover:bg-muted text-xs text-destructive transition-colors"
                      title="Gỡ liên kết"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={insertImageUrl}
                    className="p-1.5 rounded hover:bg-muted text-xs text-foreground transition-colors"
                    title="Chèn ảnh qua URL"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={insertTable}
                    className={`p-1.5 rounded hover:bg-muted text-xs transition-colors ${
                      isInTable ? "bg-primary/20 text-primary" : "text-foreground"
                    }`}
                    title="Chèn bảng biểu (3x3)"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Table Context Controls (Visible when cursor inside table) */}
                {isInTable && (
                  <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded text-[11px] font-medium text-primary">
                    <span className="font-bold">Bảng:</span>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().addRowAfter().run()}
                      className="hover:underline font-semibold"
                      title="Thêm hàng dưới"
                    >
                      +Hàng
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().addColumnAfter().run()}
                      className="hover:underline font-semibold"
                      title="Thêm cột phải"
                    >
                      +Cột
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().deleteRow().run()}
                      className="hover:text-destructive font-semibold"
                      title="Xóa hàng hiện tại"
                    >
                      -Hàng
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().deleteColumn().run()}
                      className="hover:text-destructive font-semibold"
                      title="Xóa cột hiện tại"
                    >
                      -Cột
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={() => editor.chain().focus().deleteTable().run()}
                      className="hover:text-destructive font-bold text-destructive"
                      title="Xóa toàn bộ bảng"
                    >
                      Xóa bảng
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* History Undo / Redo */}
          {!isSourceMode && (
            <div className="flex items-center gap-0.5 ml-auto">
              <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="p-1.5 rounded hover:bg-muted text-xs text-foreground disabled:opacity-40 transition-colors"
                title="Hoàn tác (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="p-1.5 rounded hover:bg-muted text-xs text-foreground disabled:opacity-40 transition-colors"
                title="Làm lại (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Editor Area */}
        <div className="relative flex-1 bg-background">
          {isSourceMode ? (
            <textarea
              value={rawHtml}
              onChange={handleRawHtmlChange}
              placeholder="Nhập mã nguồn HTML..."
              style={{ minHeight }}
              className="w-full p-4 font-mono text-xs leading-relaxed outline-none resize-y border-none bg-background text-foreground"
            />
          ) : (
            <div
              className="prose prose-sm max-w-none p-4 text-foreground text-xs leading-relaxed tiptap-editor-body"
              style={{ minHeight }}
            >
              <EditorContent editor={editor} />
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-muted/30 border-t border-border px-3 py-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>
            {isSourceMode
              ? "Đang ở chế độ sửa mã HTML trực tiếp"
              : "Trình soạn thảo trực quan WYSIWYG — Tự động căn chỉnh chuẩn Cổng thông tin SQTTG"}
          </span>
          <span className="font-mono">
            {isSourceMode ? `${rawHtml.length} ký tự` : `${editor.getText().length} ký tự / ${editor.getText().trim().split(/\s+/).filter(Boolean).length} từ`}
          </span>
        </div>
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";
