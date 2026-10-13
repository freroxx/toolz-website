import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LazyMotion, domMax } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";
import LoadingIndicator from "./components/landing/LoadingIndicator";
import Index from "./pages/Index";

// Route-level splitting: the landing page stays lean; heavy routes
// (Spec, News, Downloads, admin) load on demand.
const Downloads = lazy(() => import("./pages/Downloads"));
const Spec = lazy(() => import("./pages/Spec"));
const News = lazy(() => import("./pages/News"));
const AdminNews = lazy(() => import("./pages/AdminNews"));
const AdminSkins = lazy(() => import("./pages/AdminSkins"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div
    className="min-h-screen flex items-center justify-center"
    style={{ background: "hsl(var(--md-surface))" }}
    aria-label="Loading page"
  >
    <LoadingIndicator />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* domMax instead of the full framer-motion bundle (~70% smaller runtime).
        Covers everything used: AnimatePresence, layoutId, useScroll,
        useTransform, useSpring, useMotionValue, useInView. */}
    <LazyMotion features={domMax} strict>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/spec" element={<Spec />} />
            <Route path="/news" element={<News />} />
            <Route path="/admin/news" element={<AdminNews />} />
            <Route path="/admin/skins" element={<AdminSkins />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Analytics />
    </LazyMotion>
  </QueryClientProvider>
);

export default App;
