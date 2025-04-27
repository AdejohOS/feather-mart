"use client";

import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";
import { Heart, Loader } from "lucide-react";
import { GoHeart, GoHeartFill } from "react-icons/go";

interface WishlistButtonProps {
  productId: string;
  size?: "default" | "sm" | "lg" | "icon";

  className?: string;
  showText?: boolean;
}

export const WishlistButton = ({
  productId,
  size = "icon",
  className = "",
}: WishlistButtonProps) => {
  const {
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    isAddingToWishlist,
    isRemovingFromWishlist,
  } = useWishlist();

  const isInWishlistState = isInWishlist(productId);
  const isLoading = isAddingToWishlist || isRemovingFromWishlist;

  const handleToggleWishlist = () => {
    if (isLoading) return;

    if (isInWishlistState) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };
  return (
    <Button
      size={size}
      variant={isInWishlistState ? "secondary" : "outline"}
      className={cn(className)}
      onClick={handleToggleWishlist}
      disabled={isLoading}
      aria-label={
        isInWishlistState ? "Remove from wishlist" : "Add to wishlist"
      }
      role="button"
      type="button"
    >
      {isLoading ? (
        <Loader className="size-5 animate-spin" />
      ) : (
        <Heart
          className={cn(
            "size-5",
            isInWishlistState ? "fill-red-500" : "fill-none"
          )}
        />
      )}
    </Button>
  );
};
