"use client";

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "@/app/(dashboard)/wishlist/action";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useWishlist() {
  const queryClient = useQueryClient();

  // Fetch wishlist data
  const {
    data: wishlist = { items: [] },
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
  });

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: addToWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Item has been added to your wishlist.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add item to wishlist.");
    },
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: removeFromWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Item has been removed from your wishlist.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove item from wishlist.");
    },
  });

  return {
    wishlist,
    isLoading,
    error,
    addToWishlist: (productId: string) =>
      addToWishlistMutation.mutate(productId),
    removeFromWishlist: (productId: string) =>
      removeFromWishlistMutation.mutate(productId),
    isAddingToWishlist: addToWishlistMutation.isPending,
    isRemovingFromWishlist: removeFromWishlistMutation.isPending,
    isInWishlist: (productId: string) =>
      wishlist.items.some((item: any) => item.productId === productId),
  };
}
