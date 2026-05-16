export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  meta?: Record<string, unknown>;
};

export type BlockType =
  | "hero"
  | "product-grid"
  | "banner"
  | "text"
  | "image"
  | "cta";

export type BlockProps = Record<string, unknown>;
