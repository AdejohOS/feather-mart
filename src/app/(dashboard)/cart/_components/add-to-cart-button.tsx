"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Check, Loader, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

interface AddToCartButtonProps {
  productId: string;
  quantity?: number;
  disabled?: boolean;
}

interface CartItem {
  productId: string;
  quantity: number;
}

export const AddToCartButton = ({
  productId,
  disabled = false,
  quantity = 1,
}: AddToCartButtonProps) => {
  const [isInCart, setIsInCart] = useState(false);
  const { cart, addToCart, isAddingToCart } = useCart();

  // Check cart on mount
  useEffect(() => {
    const inCart = cart.items.some((item) => item.productId === productId);
    setIsInCart(inCart);
  }, [cart.items, productId]);

  const handleAddToCart = async () => {
    if (isInCart || disabled) return;

    addToCart(productId, quantity);
    setIsInCart(true);
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAddingToCart || isInCart || disabled}
      className="w-full flex items-center gap-2 "
      aria-label="Add to cart"
    >
      {isAddingToCart ? (
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
