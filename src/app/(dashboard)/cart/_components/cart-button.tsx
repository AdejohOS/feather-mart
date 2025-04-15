"use client";

import { Loader, ShoppingCart } from "lucide-react";
import Link from "next/link";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getCart } from "../actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CartItem = {
  quantity: number;
};

export const CartButton = () => {
  const [itemCount, setItemCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cart = await getCart();
        const count = cart.items.reduce(
          (sum: number, item: CartItem) => sum + item.quantity,
          0
        );

        setItemCount((prev) => {
          if (count !== prev) {
            if (count > prev && prev > 0) {
              setIsAnimating(true);
              setTimeout(() => setIsAnimating(false), 300);
            }
            return count;
          }
          return prev;
        });
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCart();

    const interval = setInterval(fetchCart, 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <Link href="/cart">
      <Button className="relative" variant="ghost" size="icon">
        <ShoppingCart className="size-6" />

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
