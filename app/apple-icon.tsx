import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#157561",
        borderRadius: "40px",
      }}
    >
      <span
        style={{
          color: "white",
          fontSize: 76,
          fontWeight: 800,
          fontFamily: "sans-serif",
          letterSpacing: "-3px",
        }}
      >
        SE
      </span>
    </div>,
    { width: 180, height: 180 }
  );
}
