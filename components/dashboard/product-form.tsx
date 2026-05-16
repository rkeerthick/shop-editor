"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createProductSchema, type CreateProductInput } from "@/lib/validations/product";
import { ImageUpload } from "@/components/ui/image-upload";

interface ProductFormProps {
  shopId: string;
  defaultValues?: Partial<CreateProductInput> & { id?: string };
}

export function ProductForm({ shopId, defaultValues }: ProductFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditing = !!defaultValues?.id;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema) as Resolver<CreateProductInput>,
    defaultValues: { isActive: true, stock: 0, images: [], ...defaultValues },
  });

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value;
    setValue("title", title);
    if (!isEditing) {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      setValue("slug", slug);
    }
  }

  async function onSubmit(data: CreateProductInput) {
    setServerError(null);
    const url = isEditing ? `/api/products/${defaultValues!.id}` : "/api/products";
    const method = isEditing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, shopId }),
    });

    const json = await res.json();
    if (!res.ok) {
      setServerError(json.error ?? "Something went wrong");
      return;
    }

    router.push("/dashboard/products");
    router.refresh();
  }

  const isActive = watch("isActive");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {serverError && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">{serverError}</p>
      )}

      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold">Basic information</h2>
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" placeholder="Product name" {...register("title")} onChange={handleTitleChange} />
          {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" placeholder="product-slug" {...register("slug")} />
          {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" placeholder="Describe your product…" rows={4} {...register("description")} />
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold">Pricing & inventory</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="price">Price ($)</Label>
            <Input id="price" type="number" step="0.01" min="0" placeholder="0.00" {...register("price", { valueAsNumber: true })} />
            {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="comparePrice">Compare-at price ($) <span className="text-muted-foreground font-normal text-xs">optional</span></Label>
            <Input id="comparePrice" type="number" step="0.01" min="0" placeholder="0.00" {...register("comparePrice", { valueAsNumber: true })} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="stock">Stock quantity</Label>
          <Input id="stock" type="number" min="0" step="1" placeholder="0" {...register("stock", { valueAsNumber: true })} />
          {errors.stock && <p className="text-xs text-red-500">{errors.stock.message}</p>}
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold">Images</h2>
        <div className="flex flex-wrap gap-4">
          {watch("images").map((url, i) => (
            <div key={i} className="relative">
              <ImageUpload
                value={url}
                onChange={(newUrl) => {
                  const imgs = [...watch("images")];
                  imgs[i] = newUrl;
                  setValue("images", imgs);
                }}
                onRemove={() => {
                  setValue("images", watch("images").filter((_, idx) => idx !== i));
                }}
                aspectRatio="square"
              />
            </div>
          ))}
          <ImageUpload
            value={null}
            onChange={(url) => setValue("images", [...watch("images"), url])}
            label="Add image"
            aspectRatio="square"
          />
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 space-y-3">
        <h2 className="font-semibold">Visibility</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" {...register("isActive")} className="h-4 w-4 rounded" />
          <span className="text-sm">
            Active — visible on your storefront
            <Badge variant={isActive ? "default" : "secondary"} className="ml-2 text-xs">
              {isActive ? "Active" : "Draft"}
            </Badge>
          </span>
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : isEditing ? "Save changes" : "Create product"}
        </Button>
        <button
          type="button"
          onClick={() => router.back()}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
