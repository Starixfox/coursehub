import { ImageResponse } from "next/og";

/**
 * The social card, generated at build time.
 *
 * A static PNG in public/ was the other option and it is the wrong one: it
 * drifts the moment the headline or the palette changes, and nobody ever
 * notices because nobody looks at their own link previews. Generating it from
 * the same tokens the site uses means it cannot go stale.
 *
 * Deliberately not a screenshot of the page. A card is read at about 500px
 * wide in a feed, so it carries one line of type, the mark, and the domain.
 */

export const alt = "Agora · AI-powered workflow automation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0d14",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        {/* One warm bloom off the top left, the same gesture the page shader
            makes, flattened to a static gradient. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(900px 520px at 12% -10%, rgba(227,189,108,0.16), transparent 62%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#e3bd6c",
              color: "#1a1107",
              fontSize: 28,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            A
          </div>
          <div style={{ color: "#e8eaf2", fontSize: 30, fontWeight: 600 }}>
            Agora
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              display: "flex",
              color: "#ffffff",
              fontSize: 76,
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
              maxWidth: 940,
            }}
          >
            Turn repetitive work into automated workflows.
          </div>
          <div
            style={{
              display: "flex",
              color: "rgba(255,255,255,0.55)",
              fontSize: 26,
            }}
          >
            midnightspaceconsultancy.com
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 5,
            background: "#e3bd6c",
          }}
        />
      </div>
    ),
    size,
  );
}
