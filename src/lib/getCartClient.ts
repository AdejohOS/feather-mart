"use client";

import { createClient } from "@/utils/supabase/client";

// Assuming this is now running in a client-side environment
const getAnonymousCart = async () => {
  const cartCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("anonymous_cart="))
    ?.split("=")[1];

  const supabase = await createClient();

  if (cartCookie) {
    try {
      const cart = JSON.parse(decodeURIComponent(cartCookie));

      // If there are items in the cart, fetch their complete details from the database
      if (cart.items && cart.items.length > 0) {
        // Get all product IDs from the cart
        const productIds = cart.items.map((item: any) => item.productId);

        // Fetch product details including media for all products in the cart
        const { data: products, error } = await supabase
          .from("products")
          .select(
            `
              id, name, price, stock,
              media:product_media(url),
              farm:farms(name)
            `
          )
          .in("id", productIds);

        if (error) {
          console.error(
            "Error fetching product details for anonymous cart:",
            error
          );
          return { items: [], total: 0 };
        }

        // Map the products data to the cart items
        const enrichedItems = cart.items.map((item: any) => {
          const product = products.find((p) => p.id === item.productId);
          if (!product) return item; // Keep original item if product not found

          return {
            ...item,
            name: product.name,
            price: Number(product.price) || 0,
            stock: Number(product.stock) || 0,
            media: product.media?.map((m: any) => ({ url: m.url })) || [],
            seller: product.farm?.name || "Unknown",
          };
        });

        // Recalculate total with the updated prices
        const total = enrichedItems.reduce((sum: number, item: any) => {
          const price = Number(item.price) || 0;
          const quantity = Number(item.quantity) || 0;
          return sum + price * quantity;
        }, 0);

        return { items: enrichedItems, total };
      }

      return cart;
    } catch (error) {
      console.error("Error parsing anonymous cart:", error);
      return { items: [], total: 0 };
    }
  }

  return { items: [], total: 0 };
};

// Helper function to save the anonymous cart to cookies
const saveAnonymousCart = (cart: any) => {
  // Convert cart to a JSON string and set it as a cookie on the client
  const cartString = JSON.stringify(cart);
  document.cookie = `anonymous_cart=${encodeURIComponent(
    cartString
  )}; max-age=${60 * 60 * 24 * 30}; path=/`;
};

// Get cart for the current user (authenticated or anonymous)
export async function getCartClient() {
  const supabase = await createClient();
  try {
    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isAuthenticated = !!user;

    if (user) {
      // User is authenticated, get cart from database
      const { data: cartItems, error } = await supabase
        .from("cart_items")
        .select(
          `
          id,
          quantity,
          product:products(
            id, name, price, stock,
            media:product_media(url),
            farm:farms(name)
          )`
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase query error:", error);
        return { items: [], total: 0 };
      }

      // Transform the data to match our cart structure
      const validItems = cartItems.filter((item) => item.product);
      const items = validItems.map((item) => ({
        id: item.id,
        productId: item.product.id,
        name: item.product.name,
        price: Number(item.product.price) || 0,
        quantity: Number(item.quantity) || 0,
        stock: Number(item.product.stock) || 0,
        media: item.product.media?.map((m) => ({ url: m.url })) || [],
        seller: item.product.farm?.name || "Unknown",
      }));

      // Calculate total
      const total = items.reduce((sum, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return sum + price * quantity;
      }, 0);

      return { items, total, isAuthenticated };
    } else {
      const anonCart = await getAnonymousCart();
      return anonCart;
    }
  } catch (error) {
    console.error("Error in getCart:", error);
    return { items: [], total: 0 };
  }
}
