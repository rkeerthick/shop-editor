import type { EditorBlock } from "@/types/blocks";

interface BlockPreviewProps {
  block: EditorBlock;
}

function str(v: unknown): string { return v != null ? String(v) : ""; }
function num(v: unknown): number { return Number(v) || 0; }
function bool(v: unknown): boolean { return Boolean(v); }

export function BlockPreview({ block }: BlockPreviewProps) {
  const p = block.props;

  switch (block.type) {
    case "hero":
      return (
        <div
          className="relative flex flex-col items-center justify-center text-center py-16 px-6 bg-gray-800 text-white min-h-45"
          style={bool(p.backgroundImage) ? { backgroundImage: `url(${str(p.backgroundImage)})`, backgroundSize: "cover" } : {}}
        >
          <h1 className="text-2xl font-bold mb-2">{str(p.heading)}</h1>
          <p className="text-sm opacity-80 mb-4">{str(p.subheading)}</p>
          {bool(p.buttonText) && (
            <span className="px-4 py-2 bg-white text-gray-900 rounded text-sm font-medium">
              {str(p.buttonText)}
            </span>
          )}
        </div>
      );

    case "product-grid":
      return (
        <div className="p-6">
          {bool(p.heading) && <h2 className="text-lg font-bold mb-4">{str(p.heading)}</h2>}
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: Math.min(num(p.limit) || 3, 6) }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded aspect-square flex items-center justify-center text-xs text-muted-foreground">
                Product {i + 1}
              </div>
            ))}
          </div>
        </div>
      );

    case "banner":
      return (
        <div
          className="py-3 px-6 text-center text-sm font-medium"
          style={{ backgroundColor: str(p.backgroundColor) || "#1a1a1a", color: str(p.textColor) || "#fff" }}
        >
          {str(p.text) || "Banner text"}
        </div>
      );

    case "text":
      return (
        <div className="p-6" style={{ textAlign: (str(p.alignment) as "left" | "center" | "right") || "left" }}>
          {bool(p.heading) && <h2 className="text-lg font-bold mb-2">{str(p.heading)}</h2>}
          <p className="text-sm text-muted-foreground">{str(p.body)}</p>
        </div>
      );

    case "image":
      return (
        <div className={bool(p.fullWidth) ? "" : "p-6"}>
          {bool(p.src) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={str(p.src)} alt={str(p.alt)} className="w-full object-cover rounded" />
          ) : (
            <div className="bg-gray-100 rounded aspect-video flex items-center justify-center text-sm text-muted-foreground">
              No image selected
            </div>
          )}
          {bool(p.caption) && <p className="text-xs text-muted-foreground mt-2 text-center">{str(p.caption)}</p>}
        </div>
      );

    case "cta":
      return (
        <div className={`py-12 px-6 text-center ${str(p.variant) === "dark" ? "bg-gray-900 text-white" : "bg-gray-50"}`}>
          <h2 className="text-xl font-bold mb-2">{str(p.heading)}</h2>
          {bool(p.subheading) && <p className="text-sm opacity-70 mb-4">{str(p.subheading)}</p>}
          {bool(p.buttonText) && (
            <span className={`px-5 py-2 rounded text-sm font-medium ${str(p.variant) === "dark" ? "bg-white text-gray-900" : "bg-gray-900 text-white"}`}>
              {str(p.buttonText)}
            </span>
          )}
        </div>
      );

    default:
      return <div className="p-4 text-sm text-muted-foreground">Unknown block type</div>;
  }
}
