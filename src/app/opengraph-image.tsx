import { ImageResponse } from "next/og";
import { profile } from "@/lib/content";

export const alt = "Alec Dewell, Head of Product";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social-sharing preview card, generated at build time in the site's colours. */
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "#171917",
        color: "#eeeae1",
      }}
    >
      <div style={{ fontSize: 26, letterSpacing: 6, color: "#e7b48f" }}>
        {profile.location.toUpperCase()}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 104, fontWeight: 700, lineHeight: 1 }}>{`${profile.name}.`}</div>
        <div style={{ fontSize: 48, marginTop: 24, color: "#e7b48f" }}>Head of Product</div>
      </div>
      <div style={{ fontSize: 26, color: "#a4a99e" }}>Product and AI at Oliver James</div>
    </div>,
    size,
  );
}
