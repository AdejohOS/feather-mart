import { createClient } from "@/utils/supabase/client";
import type { CartItem, Cart } from "./cart-types";
import { v4 as uuidv4 } from "uuid";

const CART_STORAGE_KEY = "farm_fresh_cart";

// Initialize an empty cart
export const initializeCart = (): Cart => ({
  items: [],
  subtotal: 0,
  totalItems: 0,
});

// Calculate cart totals
export const calculateCartTotals = (
  items: CartItem[]
): { subtotal: number; totalItems: number } => {
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => {
    const itemPrice = item.discountPrice ?? item.price;
    return total + itemPrice * item.quantity;
  }, 0);

  return { subtotal, totalItems };
};

// Update the getCart function to properly handle the database schema and error cases
export const getCart = async (): Promise<Cart> => {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If user is authenticated, get cart from Supabase
  if (session?.user) {
    // First, get the cart items
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select("id, quantity, product_id")
      .eq("user_id", session.user.id);

    if (cartError) {
      console.error("Error fetching cart:", cartError);
      return initializeCart();
    }

    // If we have cart items, fetch the product details for each item
    if (cartItems && cartItems.length > 0) {
      const items: CartItem[] = [];

      // Process each cart item
      for (const item of cartItems) {
        // Get product details
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("id", item.product_id)
          .single();

        if (productError) {
          console.error(
            `Error fetching product ${item.product_id}:`,
            productError
          );
          continue; // Skip this item if there's an error
        }

        // Parse media to get the first image
        let image = null;
        if (product && product.uploadedMedia) {
          try {
            const media = JSON.parse(product.uploadedMedia);
            if (media && Array.isArray(media) && media.length > 0) {
              image = media[0].url;
            }
          } catch (e) {
            console.error("Error parsing media:", e);
          }
        }

        // Add the item to our cart items array
        items.push({
          id: item.id,
          productId: product.id,
          name: product.name,
          price: product.price,
          discountPrice: product.discountPrice || null,
          quantity: item.quantity,
          unit: product.unit,
          minimumOrder: product.minimumOrder || null,
          image,
        });
      }

      const { subtotal, totalItems } = calculateCartTotals(items);
      return { items, subtotal, totalItems };
    }

    // Return empty cart if no items
    return initializeCart();
  }

  // For anonymous users, get cart from localStorage
  if (typeof window !== "undefined") {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart) as Cart;
        return parsedCart;
      } catch (e) {
        console.error("Error parsing stored cart:", e);
      }
    }
  }

  return initializeCart();
};

// Save cart for anonymous users
export const saveCartToLocalStorage = (cart: Cart): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }
};

// Update the addToCart function to handle the uploadedMedia parsing more safely
export const addToCart = async (
  product: {
    id: string;
    name: string;
    price: number;
    discountPrice?: number | null;
    unit: string;
    minimumOrder?: number | null;
    uploadedMedia?: string;
  },
  quantity: number
): Promise<Cart> => {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Parse media to get the first image
  let image = null;
  if (product.uploadedMedia) {
    try {
      const media = JSON.parse(product.uploadedMedia);
      if (media && Array.isArray(media) && media.length > 0) {
        image = media[0].url;
      }
    } catch (e) {
      console.error("Error parsing media:", e);
    }
  }

  // For authenticated users
  if (session?.user) {
    // Check if the product is already in the cart
    const { data: existingItem, error: fetchError } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", session.user.id)
      .eq("product_id", product.id)
      .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no item is found

    if (fetchError) {
      console.error("Error checking cart:", fetchError);
    }

    if (existingItem) {
      // Update quantity if item exists
      const newQuantity = existingItem.quantity + quantity;
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq("id", existingItem.id);

      if (updateError) {
        console.error("Error updating cart item:", updateError);
      }
    } else {
      // Add new item if it doesn't exist
      const { error: insertError } = await supabase.from("cart_items").insert({
        id: uuidv4(),
        user_id: session.user.id,
        product_id: product.id,
        quantity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Error adding item to cart:", insertError);
      }
    }

    // Return the updated cart
    return getCart();
  }

  // For anonymous users
  const currentCart = await getCart();
  const existingItemIndex = currentCart.items.findIndex(
    (item) => item.productId === product.id
  );

  if (existingItemIndex !== -1) {
    // Update quantity if item exists
    currentCart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    currentCart.items.push({
      id: uuidv4(),
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

  // Recalculate totals
  const { subtotal, totalItems } = calculateCartTotals(currentCart.items);
  currentCart.subtotal = subtotal;
  currentCart.totalItems = totalItems;

  // Save to localStorage
  saveCartToLocalStorage(currentCart);

  return currentCart;
};

// Update cart item quantity
export const updateCartItemQuantity = async (
  itemId: string,
  quantity: number
): Promise<Cart> => {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // For authenticated users
  if (session?.user) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId)
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error removing cart item:", error);
      }
    } else {
      // Update quantity
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq("id", itemId)
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error updating cart item:", error);
      }
    }

    // Return the updated cart
    return getCart();
  }

  // For anonymous users
  const currentCart = await getCart();
  const itemIndex = currentCart.items.findIndex((item) => item.id === itemId);

  if (itemIndex !== -1) {
    if (quantity <= 0) {
      // Remove item
      currentCart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      currentCart.items[itemIndex].quantity = quantity;
    }

    // Recalculate totals
    const { subtotal, totalItems } = calculateCartTotals(currentCart.items);
    currentCart.subtotal = subtotal;
    currentCart.totalItems = totalItems;

    // Save to localStorage
    saveCartToLocalStorage(currentCart);
  }

  return currentCart;
};

// Remove item from cart
export const removeFromCart = async (itemId: string): Promise<Cart> => {
  return updateCartItemQuantity(itemId, 0);
};

// Merge anonymous cart with user cart on sign-in
export const mergeAnonymousCartWithUserCart = async (): Promise<void> => {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) return;

  // Get anonymous cart from localStorage
  if (typeof window !== "undefined") {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!storedCart) return;

    try {
      const anonymousCart = JSON.parse(storedCart) as Cart;

      // For each item in the anonymous cart
      for (const item of anonymousCart.items) {
        // Check if the product is already in the user's cart
        const { data: existingItem, error: fetchError } = await supabase
          .from("cart_items")
          .select("id, quantity")
          .eq("user_id", session.user.id)
          .eq("product_id", item.productId)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Error checking cart:", fetchError);
          continue;
        }

        if (existingItem) {
          // Update quantity if item exists
          const newQuantity = existingItem.quantity + item.quantity;
          const { error: updateError } = await supabase
            .from("cart_items")
            .update({
              quantity: newQuantity,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingItem.id);

          if (updateError) {
            console.error("Error updating cart item:", updateError);
          }
        } else {
          // Add new item if it doesn't exist
          const { error: insertError } = await supabase
            .from("cart_items")
            .insert({
              id: uuidv4(),
              user_id: session.user.id,
              product_id: item.productId,
              quantity: item.quantity,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (insertError) {
            console.error("Error adding item to cart:", insertError);
          }
        }
      }

      // Clear the anonymous cart
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      console.error("Error merging carts:", e);
    }
  }
};
