"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { addToCart, getCart } from "../actions";
import { toast } from "sonner";
import { Check, Loader, ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
  productId: string;
  quantity?: number;
  disabled?: boolean;
}

interface CartItem {
  productId: string;
  quantity: number;
}

interface Cart {
  items: CartItem[];
}

export const AddToCartButton = ({
  productId,
  disabled = false,
  quantity = 1,
}: AddToCartButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  // Check cart on mount
  useEffect(() => {
    const checkCart = async () => {
      try {
        const cart: Cart = await getCart();
        const inCart = cart.items.some((item) => item.productId === productId);
        setIsInCart(inCart);
      } catch (error) {
        console.error("Failed to check cart:", error);
      }
    };
    checkCart();
  }, [productId]);

  const handleAddToCart = async () => {
    if (isLoading || isInCart || disabled) return;

    setIsLoading(true);
    try {
      await addToCart(productId, quantity);
      setIsInCart(true);
      toast.success("The item has been added to your cart.");
    } catch (error) {
      toast.error("Failed to add item to cart. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isLoading || isInCart || disabled}
      className="w-full flex items-center gap-2 "
      aria-label="Add to cart"
    >
      {isLoading ? (
        <>
          <Loader className=" h-4 w-4 animate-spin" />
          Adding to Cart...
        </>
      ) : isInCart ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </>
      )}
    </Button>
  );
};
