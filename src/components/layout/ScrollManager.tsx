import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Scrolls to the top on new page navigations, and to the matching element for
 * in-page anchors such as /about#leadership (retrying briefly while content loads).
 * Back/forward navigations keep the browser's own scroll restoration.
 */
const ScrollManager = () => {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "POP") return;

    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const id = decodeURIComponent(hash.slice(1));
    let attempts = 0;
    let timer: number | undefined;
    const tryScroll = () => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView();
        return;
      }
      if (attempts++ < 20) timer = window.setTimeout(tryScroll, 100);
    };
    tryScroll();
    return () => window.clearTimeout(timer);
  }, [pathname, hash, navigationType]);

  return null;
};

export default ScrollManager;
