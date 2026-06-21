import sanitizeHtml from "sanitize-html";

/**
 * Sanitize creator-authored lesson HTML before it is STORED. Rich content is
 * untrusted: strip scripts, event handlers, and dangerous URLs to prevent
 * stored XSS. Rendered output is still wrapped in a constrained container.
 */
export function sanitizeLessonHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "p", "blockquote", "ul", "ol", "li",
      "b", "i", "strong", "em", "u", "s", "code", "pre", "a", "img",
      "figure", "figcaption", "hr", "br", "span", "table", "thead",
      "tbody", "tr", "th", "td",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      span: ["class"],
      code: ["class"],
      "*": [],
    },
    allowedSchemes: ["https", "mailto"],
    allowedSchemesByTag: { img: ["https", "data"] },
    disallowedTagsMode: "discard",
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer nofollow",
        target: "_blank",
      }),
    },
  });
}

/** Escape a plain string for safe interpolation into HTML text nodes. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
