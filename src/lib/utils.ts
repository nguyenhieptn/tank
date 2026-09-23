import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAssetUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  const base = import.meta.env.BASE_URL || "/";
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  const baseNoTrailingSlash = cleanBase.slice(0, -1); // e.g. "/siquantank"

  // If path already starts with base path, don't prepend it again
  if (baseNoTrailingSlash && (path === baseNoTrailingSlash || path.startsWith(`${baseNoTrailingSlash}/`))) {
    return path;
  }

  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${cleanBase}${cleanPath}`;
}

