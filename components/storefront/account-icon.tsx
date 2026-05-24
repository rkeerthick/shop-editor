import { getCustomerSession } from "@/lib/customer-session";
import { UserCircle } from "lucide-react";

export async function AccountIcon({ shopSlug }: { shopSlug: string }) {
  const session = await getCustomerSession();
  const href = session
    ? `/store/${shopSlug}/account`
    : `/store/${shopSlug}/account/login`;

  return (
    <a
      href={href}
      aria-label="Account"
      className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
    >
      <UserCircle className="w-5 h-5" />
    </a>
  );
}
