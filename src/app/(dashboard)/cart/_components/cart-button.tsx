"use client";

import { Loader, ShoppingCart } from "lucide-react";
import Link from "next/link";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

type CartItem = {
  quantity: number;
};

export const CartButton = () => {
  const { cart, isLoading } = useCart();
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevCount, setPrevCount] = useState(0);

  // Calculate total items in cart
  const itemCount = cart.items.reduce(
    (sum: number, item: CartItem) => sum + item.quantity,
    0
  );

  // Trigger animation when item count increases
  useEffect(() => {
    if (itemCount > prevCount && prevCount > 0) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
    setPrevCount(itemCount);
  }, [itemCount, prevCount]);

  return (
    <Link href="/cart" className="">
      <Button
        className="relative"
        variant="ghost"
        size="icon"
        aria-label="View cart"
      >
        <ShoppingCart className="size-8" />

        {itemCount > 0 && (
          <span
            className={cn(
              "absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transition-transform",
              isAnimating && "animate-bounce"
            )}
          >
            {isLoading ? "..." : itemCount}
          </span>
        )}
      </Button>
    </Link>
  );
};
