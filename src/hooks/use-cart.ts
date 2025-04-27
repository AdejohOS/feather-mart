"use client";

import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
} from "@/app/(dashboard)/cart/actions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product?: {
    name: string;
    price: number;
    // any other product fields you use
  };
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export function useCart() {
  const queryClient = useQueryClient();

  // Fetch cart data
  const {
    data: cart = { items: [], total: 0 },
    isLoading,
    error,
  } = useQuery<Cart>({
    queryKey: ["cart"],
    queryFn: getCart,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => addToCart(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item has been added to your cart.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add item to cart.");
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: removeFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item has been removed from your cart.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove item from cart.");
    },
  });

  // Update cart item quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => updateCartItemQuantity(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update quantity.");
    },
  });

  return {
    cart,
    isLoading,
    error,
    isAuthenticated: true,
    addToCart: (productId: string, quantity = 1) =>
      addToCartMutation.mutate({ productId, quantity }),
    removeFromCart: (productId: string) =>
      removeFromCartMutation.mutate(productId),
    updateQuantity: (productId: string, quantity: number) =>
      updateQuantityMutation.mutate({ productId, quantity }),
    isAddingToCart: addToCartMutation.isPending,
    isRemovingFromCart: removeFromCartMutation.isPending,
    isUpdatingQuantity: updateQuantityMutation.isPending,
  };
}
