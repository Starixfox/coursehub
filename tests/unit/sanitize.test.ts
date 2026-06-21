import { describe, it, expect } from "vitest";
import { sanitizeLessonHtml, escapeHtml } from "@/lib/security/sanitize";

describe("sanitizeLessonHtml", () => {
  it("strips <script> tags entirely", () => {
    const out = sanitizeLessonHtml('<p>hi</p><script>alert(1)</script>');
    expect(out).not.toMatch(/<script/i);
    expect(out).not.toContain("alert(1)");
    expect(out).toContain("<p>hi</p>");
  });

  it("removes inline on* event handlers", () => {
    const out = sanitizeLessonHtml('<p onclick="steal()">x</p>');
    expect(out).not.toMatch(/onclick/i);
    expect(out).not.toContain("steal()");
    expect(out).toContain("x");
  });

  it("drops javascript: URLs on links", () => {
    const out = sanitizeLessonHtml('<a href="javascript:alert(1)">click</a>');
    expect(out).not.toMatch(/javascript:/i);
  });

  it("keeps allowed formatting tags (h2, p)", () => {
    const out = sanitizeLessonHtml("<h2>Title</h2><p>Body</p>");
    expect(out).toContain("<h2>Title</h2>");
    expect(out).toContain("<p>Body</p>");
  });

  it("keeps https links and hardens them with rel + target", () => {
    const out = sanitizeLessonHtml('<a href="https://example.com">go</a>');
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain('target="_blank"');
    expect(out).toMatch(/rel="[^"]*noopener[^"]*"/);
    expect(out).toMatch(/rel="[^"]*noreferrer[^"]*"/);
  });

  it("discards disallowed tags like <iframe>", () => {
    const out = sanitizeLessonHtml('<iframe src="https://evil.test"></iframe><p>safe</p>');
    expect(out).not.toMatch(/<iframe/i);
    expect(out).toContain("<p>safe</p>");
  });
});

describe("escapeHtml", () => {
  it("escapes all HTML-significant characters", () => {
    expect(escapeHtml(`<>&"'`)).toBe("&lt;&gt;&amp;&quot;&#39;");
  });

  it("neutralizes a script payload so it cannot break out of a text node", () => {
    const out = escapeHtml('<script>alert("x")</script>');
    expect(out).not.toContain("<script>");
    expect(out).toContain("&lt;script&gt;");
  });

  it("leaves plain text untouched", () => {
    expect(escapeHtml("Hello world 123")).toBe("Hello world 123");
  });
});
