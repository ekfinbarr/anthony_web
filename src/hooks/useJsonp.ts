import { useState, useEffect } from "react";

/**
 * useJsonp - A reusable hook to load JSONP data.
 *
 * @param {string} url - The JSONP endpoint (no callback param).
 * @param {string} callbackParam - Query parameter name for callback (e.g. "callback").
 * @param {string} callbackName - Name of the global callback the server will call.
 *
 * Usage:
 *   const { data, loading, error } = useJsonp(
 *     "https://example.com/data",
 *     "callback",
 *     "handleResponse"
 *   );
 */
export function useJsonp(url, callbackParam = "callback", callbackName) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url || !callbackName) {
      // Avoid setting state synchronously in an effect.
      // Instead, let the initial state reflect the requirements,
      // or use a microtask (setTimeout) as a workaround.
      setTimeout(() => {
        setError(new Error("URL and callbackName are required"));
        setLoading(false);
      }, 0);
      return;
    }

    // Define the global callback the JSONP script will call
    (window as unknown as Record<string, (response: unknown) => void>)[callbackName] = (response: unknown) => {
      setData(response);
      setLoading(false);
      // Clean up: remove global function once done
      delete (window as unknown as Record<string, unknown>)[callbackName];

      document.body.removeChild(scriptEl);
    };

    // Build script tag
    const scriptEl = document.createElement("script");
    scriptEl.src = `${url}?${callbackParam}=${callbackName}`;
    scriptEl.async = true;

    // Error handling
    scriptEl.onerror = (e) => {
      setError(new Error(`JSONP script failed to load: ${e instanceof Error ? e.message : 'Unknown error'}`));
      setLoading(false);
      delete (window as unknown as Record<string, unknown>)[callbackName];
      document.body.removeChild(scriptEl);
    };

    // Insert into DOM
    document.body.appendChild(scriptEl);

    // Cleanup on unmount
    return () => {
      if (window[callbackName]) delete window[callbackName];
      if (scriptEl.parentNode) scriptEl.parentNode.removeChild(scriptEl);
    };
  }, [url, callbackParam, callbackName]);

  return { data, loading, error };
}
