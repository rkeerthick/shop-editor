"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createShopSchema, type CreateShopInput } from "@/lib/validations/shop";

export default function SetupPage() {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateShopInput>({ resolver: zodResolver(createShopSchema) });

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    setValue("name", name);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setValue("slug", slug);
  }

  async function onSubmit(data: CreateShopInput) {
    setServerError(null);
    const res = await fetch("/api/shops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      setServerError(json.error ?? "Something went wrong");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create your shop</h1>
          <p className="text-muted-foreground mt-2">You&apos;re just one step away from launching your store.</p>
        </div>
        <Card>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Shop details</CardTitle>
              <CardDescription>This can be changed later in settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {serverError && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">{serverError}</p>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="name">Shop name</Label>
                <Input
                  id="name"
                  placeholder="My Awesome Store"
                  {...register("name")}
                  onChange={handleNameChange}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slug">
                  URL slug
                  <span className="ml-2 text-xs text-muted-foreground font-normal">
                    shop-editor.com/<strong>{watch("slug") || "your-shop"}</strong>
                  </span>
                </Label>
                <Input
                  id="slug"
                  placeholder="my-awesome-store"
                  {...register("slug")}
                />
                {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">
                  Description <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input id="description" placeholder="A short description of your shop" {...register("description")} />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating shop…" : "Create shop"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
