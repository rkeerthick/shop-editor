export type BlockType = "hero" | "product-grid" | "banner" | "text" | "image" | "cta";

export interface EditorBlock {
  id: string;
  type: BlockType;
  order: number;
  props: Record<string, unknown>;
  isVisible: boolean;
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: "Hero",
  "product-grid": "Product Grid",
  banner: "Banner",
  text: "Text",
  image: "Image",
  cta: "Call to Action",
};

export const BLOCK_DEFAULTS: Record<BlockType, Record<string, unknown>> = {
  hero: {
    heading: "Welcome to our store",
    subheading: "Discover amazing products",
    buttonText: "Shop now",
    buttonLink: "/",
    backgroundImage: "",
  },
  "product-grid": {
    heading: "Featured Products",
    columns: 3,
    limit: 6,
  },
  banner: {
    text: "Free shipping on orders over ₹50",
    backgroundColor: "#1a1a1a",
    textColor: "#ffffff",
    link: "",
  },
  text: {
    heading: "",
    body: "Add your content here.",
    alignment: "left",
  },
  image: {
    src: "",
    alt: "",
    caption: "",
    fullWidth: false,
  },
  cta: {
    heading: "Ready to get started?",
    subheading: "",
    buttonText: "Get started",
    buttonLink: "/",
    variant: "dark",
  },
};
