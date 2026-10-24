import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navigation from "./Navigation";
import Footer from "./Footer";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorBoundary from "../common/ErrorBoundary";
import ScrollManager from "./ScrollManager";
import FlashNewsModal from "../flash-news/FlashNewsModal";

const Layout = () => {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollManager />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <Navigation />
      <main id="main-content" tabIndex={-1} className="flex-grow pt-20 focus:outline-none">
        <ErrorBoundary resetKey={pathname}>
          <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <FlashNewsModal />
    </div>
  );
};

export default Layout;
