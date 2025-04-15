import { CartContentSkeleton } from "@/components/skeleton/cart-content-skeleton";
import { getCart } from "./actions";
import { createClient } from "@/utils/supabase/server";
import { DottedSeparator } from "@/components/ui/dotted-separator";
import { Card } from "@/components/ui/card";
import { CartItem } from "./_components/cart-item";
import { CartSummary } from "./_components/cart-summary";
import { EmptyCart } from "./_components/empty-cart";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Page = async () => {
  const { items, total, isAuthenticated } = await getCart();

  return (
    <section className="bg-gray-100">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-4">
        {items.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-3 ">
            <Card className="p-4 text-gray-500 md:col-span-2">
              <h2 className="text-xl font-bold">My Cart ({items.length})</h2>
              <DottedSeparator className="my-4" />

              <CartItem items={items} />
            </Card>

            <CartSummary total={total} isAuthenticated={isAuthenticated} />
          </div>
        ) : (
          <EmptyCart />
        )}
      </div>
    </section>
  );
};

export default Page;
