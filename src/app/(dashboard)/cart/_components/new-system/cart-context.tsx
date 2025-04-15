"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useTransition,
  useOptimistic,
  type ReactNode,
} from "react";
import type { Cart } from "./cart-types";
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  mergeAnonymousCartWithUserCart,
} from "./cart";
import { createClient } from "@/utils/supabase/client";

interface CartContextType {
  cart: Cart;
  isLoading: boolean;
  isPending: boolean;
  addItem: (product: any, quantity: number) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  optimisticAddItem: (product: any, quantity: number) => void;
  optimisticUpdateQuantity: (itemId: string, quantity: number) => void;
  optimisticRemoveItem: (itemId: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart>({
    items: [],
    subtotal: 0,
    totalItems: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  // Optimistic state updates
  const [optimisticCart, updateOptimisticCart] = useOptimistic(
    cart,
    (state, action: { type: string; payload: any }) => {
      const { type, payload } = action;

      // Create a deep copy of the state to avoid mutating it
      const newState = {
        ...state,
        items: [...state.items],
      };

      switch (type) {
        case "ADD_ITEM": {
          const { product, quantity } = payload;
          const existingItemIndex = newState.items.findIndex(
            (item) => item.productId === product.id
          );

          // Parse media to get the first image
          let image = null;
          if (product.uploadedMedia) {
            try {
              const media = JSON.parse(product.uploadedMedia);
              if (media.length > 0) {
                image = media[0].url;
              }
            } catch (e) {
              console.error("Error parsing media:", e);
            }
          }

          if (existingItemIndex !== -1) {
            // Update quantity if item exists
            newState.items[existingItemIndex] = {
              ...newState.items[existingItemIndex],
              quantity: newState.items[existingItemIndex].quantity + quantity,
            };
          } else {
            // Add new item
            newState.items.push({
              id: `temp-${Date.now()}`, // Temporary ID until server response
              productId: product.id,
              name: product.name,
              price: product.price,
              discountPrice: product.discountPrice,
              quantity,
              unit: product.unit,
              minimumOrder: product.minimumOrder,
              image,
            });
          }
          break;
        }

        case "UPDATE_QUANTITY": {
          const { itemId, quantity } = payload;
          const itemIndex = newState.items.findIndex(
            (item) => item.id === itemId
          );

          if (itemIndex !== -1) {
            if (quantity <= 0) {
              // Remove item
              newState.items.splice(itemIndex, 1);
            } else {
              // Update quantity
              newState.items[itemIndex] = {
                ...newState.items[itemIndex],
                quantity,
              };
            }
          }
          break;
        }

        case "REMOVE_ITEM": {
          const { itemId } = payload;
          const itemIndex = newState.items.findIndex(
            (item) => item.id === itemId
          );

          if (itemIndex !== -1) {
            newState.items.splice(itemIndex, 1);
          }
          break;
        }

        default:
          return state;
      }

      // Recalculate totals
      const totalItems = newState.items.reduce(
        (total, item) => total + item.quantity,
        0
      );
      const subtotal = newState.items.reduce((total, item) => {
        const itemPrice = item.discountPrice ?? item.price;
        return total + itemPrice * item.quantity;
      }, 0);

      return {
        ...newState,
        subtotal,
        totalItems,
      };
    }
  );

  // Initialize cart
  useEffect(() => {
    const initCart = async () => {
      setIsLoading(true);
      try {
        const currentCart = await getCart();
        setCart(currentCart);
      } catch (error) {
        console.error("Error initializing cart:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initCart();
  }, []);

  // Listen for auth state changes to merge carts
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN") {
        // Merge anonymous cart with user cart when signing in
        await mergeAnonymousCartWithUserCart();
        // Refresh cart after merging
        const currentCart = await getCart();
        setCart(currentCart);
      } else if (event === "SIGNED_OUT") {
        // Refresh cart after signing out
        const currentCart = await getCart();
        setCart(currentCart);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Optimistic UI updates
  const optimisticAddItem = (product: any, quantity: number) => {
    updateOptimisticCart({ type: "ADD_ITEM", payload: { product, quantity } });
  };

  const optimisticUpdateQuantity = (itemId: string, quantity: number) => {
    updateOptimisticCart({
      type: "UPDATE_QUANTITY",
      payload: { itemId, quantity },
    });
  };

  const optimisticRemoveItem = (itemId: string) => {
    updateOptimisticCart({ type: "REMOVE_ITEM", payload: { itemId } });
  };

  // Add item to cart
  const addItem = async (product: any, quantity: number) => {
    // Optimistic update
    optimisticAddItem(product, quantity);

    // Actual update
    startTransition(async () => {
      try {
        const updatedCart = await addToCart(product, quantity);
        setCart(updatedCart);
      } catch (error) {
        console.error("Error adding item to cart:", error);
        // Refresh cart to revert optimistic update on error
        const currentCart = await getCart();
        setCart(currentCart);
      }
    });
  };

  // Update item quantity
  const updateItemQuantity = async (itemId: string, quantity: number) => {
    // Optimistic update
    optimisticUpdateQuantity(itemId, quantity);

    // Actual update
    startTransition(async () => {
      try {
        const updatedCart = await updateCartItemQuantity(itemId, quantity);
        setCart(updatedCart);
      } catch (error) {
        console.error("Error updating cart item:", error);
        // Refresh cart to revert optimistic update on error
        const currentCart = await getCart();
        setCart(currentCart);
      }
    });
  };

  // Remove item from cart
  const removeItem = async (itemId: string) => {
    // Optimistic update
    optimisticRemoveItem(itemId);

    // Actual update
    startTransition(async () => {
      try {
        const updatedCart = await removeFromCart(itemId);
        setCart(updatedCart);
      } catch (error) {
        console.error("Error removing item from cart:", error);
        // Refresh cart to revert optimistic update on error
        const currentCart = await getCart();
        setCart(currentCart);
      }
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart: optimisticCart, // Use optimistic cart for UI
        isLoading,
        isPending,
        addItem,
        updateItemQuantity,
        removeItem,
        optimisticAddItem,
        optimisticUpdateQuantity,
        optimisticRemoveItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
