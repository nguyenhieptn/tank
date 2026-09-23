import React, { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Eager load Homepage for instant First Contentful Paint
import Index from "./pages/Index.tsx";

// Lazy load secondary public pages
const PostDetail = lazy(() => import("./pages/PostDetail.tsx").then(m => ({ default: m.PostDetail })));
const CategoryArchive = lazy(() => import("./pages/CategoryArchive.tsx").then(m => ({ default: m.CategoryArchive })));
const SearchResults = lazy(() => import("./pages/SearchResults.tsx").then(m => ({ default: m.SearchResults })));
const ContactPage = lazy(() => import("./pages/ContactPage.tsx").then(m => ({ default: m.ContactPage })));
const BrochureViewer = lazy(() => import("./pages/BrochureViewer.tsx").then(m => ({ default: m.BrochureViewer })));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

// Lazy load all Admin Views to keep public visitor bundle ultra-light
const AdminLogin = lazy(() => import("./admin/AdminLogin.tsx").then(m => ({ default: m.AdminLogin })));
const AdminLayout = lazy(() => import("./admin/AdminLayout.tsx").then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard.tsx").then(m => ({ default: m.AdminDashboard })));
const PostsManager = lazy(() => import("./admin/PostsManager.tsx").then(m => ({ default: m.PostsManager })));
const PostEditor = lazy(() => import("./admin/PostEditor.tsx").then(m => ({ default: m.PostEditor })));
const CategoriesManager = lazy(() => import("./admin/CategoriesManager.tsx").then(m => ({ default: m.CategoriesManager })));
const AdmissionsManager = lazy(() => import("./admin/AdmissionsManager.tsx").then(m => ({ default: m.AdmissionsManager })));
const InquiriesManager = lazy(() => import("./admin/InquiriesManager.tsx").then(m => ({ default: m.InquiriesManager })));
const SystemOpsView = lazy(() => import("./admin/SystemOpsView.tsx").then(m => ({ default: m.SystemOpsView })));

const PageFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3 py-16">
    <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    <span className="text-xs text-muted-foreground font-medium tracking-wide">Đang nạp dữ liệu...</span>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes cache
    },
  },
});

const routerBasename = import.meta.env.BASE_URL;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" richColors />
      <BrowserRouter basename={routerBasename}>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/bai-viet/:slug" element={<PostDetail />} />
            <Route path="/chuyen-muc" element={<CategoryArchive />} />
            <Route path="/chuyen-muc/:slug" element={<CategoryArchive />} />
            <Route path="/tim-kiem" element={<SearchResults />} />
            <Route path="/lien-he" element={<ContactPage />} />
            <Route path="/to-roi-tuyen-sinh" element={<BrochureViewer />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="posts" element={<PostsManager />} />
              <Route path="posts/new" element={<PostEditor />} />
              <Route path="posts/edit/:id" element={<PostEditor />} />
              <Route path="categories" element={<CategoriesManager />} />
              <Route path="admissions" element={<AdmissionsManager />} />
              <Route path="inquiries" element={<InquiriesManager />} />
              <Route path="system" element={<SystemOpsView />} />
              {/* Backwards compatibility redirects for old agent routes */}
              <Route path="agent" element={<Navigate to="/admin/system" replace />} />
              <Route path="agent-ops" element={<Navigate to="/admin/system" replace />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
