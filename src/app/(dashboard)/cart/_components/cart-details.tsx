"use client";
import { DottedSeparator } from "@/components/ui/dotted-separator";
import { CartSummary } from "./cart-summary";
import { EmptyCart } from "./empty-cart";
import { CartItem } from "./cart-item";
import { Card } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { CartContentSkeleton } from "@/components/skeleton/cart-content-skeleton";
import { CartItemType } from "@/types/types";

interface CartDetailsProps {
  initialCart: {
    items: CartItemType[];
    total: number;
    isAuthenticated: boolean;
  };
}

export const CartDetails = ({ initialCart }: CartDetailsProps) => {
  const { cart, isLoading, isAuthenticated } = useCart();
  // Use the fetched cart data, falling back to initial data
  const currentCart = isLoading ? initialCart : cart;
  const hasItems = currentCart.items.length > 0;

  if (isLoading) {
    return <CartContentSkeleton />;
  }

  return (
    <>
      {hasItems ? (
        <div className="grid gap-8 md:grid-cols-3 ">
          <Card className="p-4 text-gray-500 md:col-span-2">
            <h2 className="text-lg font-bold">
              Items ({currentCart.items.length})
            </h2>
            <DottedSeparator className="my-4" />

            <CartItem items={currentCart.items as CartItemType[]} />
          </Card>

          <CartSummary
            total={currentCart.total}
            isAuthenticated={isAuthenticated}
          />
        </div>
      ) : (
        <EmptyCart />
      )}
    </>
  );
};
