"use client";

import { useEffect } from "react";

/**
 * The <html lang> attribute lives in the root layout (shared with the app,
 * which is English). This flips it for the Dutch marketing route.
 */
export function SetHtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = previous;
    };
  }, [lang]);

  return null;
}
