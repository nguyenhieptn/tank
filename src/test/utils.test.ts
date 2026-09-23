import { describe, it, expect } from "vitest";
import { getAssetUrl, cn } from "@/lib/utils";

describe("getAssetUrl", () => {
  it("should return null for empty or null input", () => {
    expect(getAssetUrl(null)).toBeNull();
    expect(getAssetUrl(undefined)).toBeNull();
    expect(getAssetUrl("")).toBeNull();
  });

  it("should preserve absolute external URLs", () => {
    expect(getAssetUrl("https://mod.gov.vn/logo.png")).toBe("https://mod.gov.vn/logo.png");
    expect(getAssetUrl("http://example.com/file.pdf")).toBe("http://example.com/file.pdf");
    expect(getAssetUrl("data:image/png;base64,abc")).toBe("data:image/png;base64,abc");
  });

  it("should NOT duplicate prefix if path already has /siquantank", () => {
    const res1 = getAssetUrl("/siquantank/uploads/2026/01/image.jpg");
    expect(res1).toBe("/siquantank/uploads/2026/01/image.jpg");
    expect(res1).not.toContain("/siquantank/siquantank/");

    const res2 = getAssetUrl("/siquantank/documents/mau.doc");
    expect(res2).toBe("/siquantank/documents/mau.doc");
    expect(res2).not.toContain("/siquantank/siquantank/");
  });

  it("should prepend base when path starts with single /uploads/", () => {
    const res = getAssetUrl("/uploads/2026/01/image.jpg");
    expect(res).toBe("/siquantank/uploads/2026/01/image.jpg");
  });
});

describe("cn utility", () => {
  it("should merge tailwind classes properly", () => {
    const merged = cn("p-4 text-sm", "p-2", { "text-red-500": true, "hidden": false });
    expect(merged).toContain("p-2");
    expect(merged).toContain("text-red-500");
    expect(merged).not.toContain("p-4");
  });
});
