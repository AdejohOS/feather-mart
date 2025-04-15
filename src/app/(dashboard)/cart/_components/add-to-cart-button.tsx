"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { addToCart, getCart } from "../actions";
import { toast } from "sonner";
import { Check, Loader, ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
  productId: string;
  disabled?: boolean;
}

export const AddToCartButton = ({
  productId,
  disabled = false,
}: AddToCartButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  useEffect(() => {
    const checkCart = async () => {
      try {
        const cart = await getCart();
        const isInCart = cart.items.some(
          (item: any) => item.productId === productId
        );
        setIsInCart(isInCart);
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
      await addToCart(productId);
      setIsInCart(true);
      toast.success("Product added to cart.");
    } catch (error) {
      toast.error("Failed to add product to cart.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isLoading || isInCart || disabled}
      className="w-full flex items-center gap-2"
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
