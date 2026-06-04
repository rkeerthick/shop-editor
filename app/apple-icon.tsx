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
        background: "linear-gradient(145deg, #1c9a77 0%, #157561 55%, #0e5a47 100%)",
        borderRadius: "38px",
      }}
    >
      <svg
        width="108"
        height="108"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Bag handle */}
        <path
          d="M 34 42 Q 34 22 50 22 Q 66 22 66 42"
          stroke="white"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />

        {/* Bag body */}
        <rect
          x="18"
          y="40"
          width="64"
          height="48"
          rx="9"
          fill="white"
        />

        {/* Pencil body */}
        <rect
          x="42"
          y="52"
          width="10"
          height="26"
          rx="2"
          fill="#157561"
          transform="rotate(-35 47 65)"
        />
        {/* Pencil tip */}
        <polygon
          points="47,78 52,68 42,68"
          fill="#0e5a47"
          transform="rotate(-35 47 73)"
        />
        {/* Pencil eraser */}
        <rect
          x="42"
          y="50"
          width="10"
          height="5"
          rx="2"
          fill="#a7f3d0"
          transform="rotate(-35 47 52)"
        />
      </svg>
    </div>,
    { width: 180, height: 180 }
  );
}
