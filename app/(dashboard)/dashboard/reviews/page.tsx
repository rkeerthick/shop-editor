import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ReviewsModerationClient } from "@/components/dashboard/reviews-moderation-client";

export default async function ReviewsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const shop = await db.shop.findFirst({ where: { ownerId: session.user.id } });
  if (!shop) redirect("/dashboard/setup");

  const reviews = await db.review.findMany({
    where: { product: { shopId: shop.id } },
    include: { product: { select: { title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>
        <p className="text-sm text-slate-500 mt-1">Approve reviews before they appear on your storefront</p>
      </div>
      <ReviewsModerationClient
        shopSlug={shop.slug}
        initialReviews={reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          body: r.body,
          reviewerName: r.reviewerName,
          isApproved: r.isApproved,
          createdAt: r.createdAt.toISOString(),
          productTitle: r.product.title,
          productSlug: r.product.slug,
        }))}
      />
    </div>
  );
}
