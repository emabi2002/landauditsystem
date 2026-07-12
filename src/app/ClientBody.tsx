"use client";

import { useEffect } from "react";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";
  }, []);

  // Auto-recover from transient ChunkLoadErrors. Large Next.js dev chunks can
  // occasionally fail to load over the preview proxy or momentarily go missing
  // mid-HMR-rebuild. Instead of leaving the user on a broken page, reload once.
  // A time-guard (via sessionStorage) ensures this can never loop: if a reload
  // doesn't fix it within the window, we stop and surface the error normally.
  useEffect(() => {
    const RELOAD_KEY = "__chunk_reload_at";
    const RELOAD_WINDOW_MS = 10000;

    // Signatures of a chunk that failed to load OR arrived truncated/corrupt.
    // A truncated JS chunk fails to parse with errors like
    // "SyntaxError: missing ) after argument list" / "Unexpected end of input".
    const isChunkError = (msg: string) =>
      /ChunkLoadError|Loading chunk [\w./()-]+ failed|Loading CSS chunk|error loading dynamically imported module|missing \) after argument list|Unexpected end of (input|script|JSON input)/i.test(
        msg || ""
      );

    const doReload = () => {
      let last = 0;
      try {
        last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
      } catch {
        /* sessionStorage unavailable */
      }
      const now = Date.now();
      if (now - last < RELOAD_WINDOW_MS) return; // already reloaded recently
      try {
        sessionStorage.setItem(RELOAD_KEY, String(now));
      } catch {
        /* ignore */
      }
      window.location.reload();
    };

    const onError = (e: ErrorEvent) => {
      const msg = e?.message || (e?.error && (e.error as Error).message) || "";
      // A parse/eval error whose source file is a Next static chunk means the
      // chunk was delivered truncated/corrupt — reload to fetch a fresh copy.
      const fromChunk =
        typeof e?.filename === "string" && /\/_next\/static\//.test(e.filename);
      if (fromChunk || isChunkError(msg)) doReload();
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const reason = e?.reason as { message?: string; name?: string } | string | undefined;
      const msg = typeof reason === "string" ? reason : reason?.message || reason?.name || "";
      if (isChunkError(msg)) doReload();
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return <div className="antialiased">{children}</div>;
}
