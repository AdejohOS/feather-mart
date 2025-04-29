"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

type Wishlist = {
  items: Array<{
    productId: string;
    name?: string;
    price?: number;
    stock?: number;
    description?: string;
    media?: Array<{ url: string }> | null;
    farm?: string | null;
  }>;
};

// Helper function to get the anonymous wishlist from cookies
const getAnonymousWishlist = async () => {
  const cookieStore = await cookies();
  const wishlistCookie = cookieStore.get("anonymous_wishlist")?.value;

  if (wishlistCookie) {
    try {
      return JSON.parse(wishlistCookie);
    } catch (error) {
      console.error("Error parsing anonymous wishlist:", error);
      return { items: [] };
    }
  }

  return { items: [] };
};

// Helper function to save the anonymous wishlist to cookies
const saveAnonymousWishlist = async (wishlist: Wishlist) => {
  const cookieStore = await cookies();
  cookieStore.set("anonymous_wishlist", JSON.stringify(wishlist), {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
};

// Get wishlist for the current user (authenticated or anonymous)
export async function getWishlist() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // User is authenticated, get wishlist from database
    const { data: wishlistItems, error } = await supabase
      .from("wishlist_items")
      .select(
        `
        id,
        product_id,
        products (
          id,
          name,
          price,
          stock,
          category,
          description,
          media:product_media(url),
          farm:farms(name)
        )
      `
      )
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching wishlist:", error);
      return { items: [] };
    }

    // Transform the data to match our wishlist structure
    const items = wishlistItems.map((item) => ({
      id: item.id,
      productId: item.products.id,
      name: item.products.name,
      price: item.products.price,
      stock: item.products.stock,
      category: item.products.category,
      description: item.products.description,
      media: item.products.media,
      farm: item.products.farm,
    }));

    return { items };
  } else {
    // User is not authenticated, get wishlist from cookies
    const anonymousWishlist = await getAnonymousWishlist();

    // If there are items in the wishlist, fetch their complete details from the database
    if (anonymousWishlist.items && anonymousWishlist.items.length > 0) {
      // Get all product IDs from the wishlist
      const productIds = anonymousWishlist.items.map(
        (item: any) => item.productId
      );

      // Fetch product details for all products in the wishlist
      const { data: products, error } = await supabase
        .from("products")
        .select(
          `
          id, name, price, stock, description,
          media:product_media(url),
          farm:farms(name)
        `
        )
        .in("id", productIds);

      if (error) {
        console.error(
          "Error fetching product details for anonymous wishlist:",
          error
        );
        return { items: [] };
      }

      // Map the products data to the wishlist items
      const enrichedItems = productIds
        .map((productId: string) => {
          const product = products.find((p) => p.id === productId);
          if (!product) return null; // Skip if product not found

          return {
            productId,
            name: product.name,
            price: Number(product.price) || 0,
            stock: Number(product.stock) || 0,
            description: product.description,
            media: product.media?.map((m: any) => ({ url: m.url })) || [],
            farm: product.farm,
          };
        })
        .filter(Boolean); // Remove null items

      return { items: enrichedItems };
    }

    return anonymousWishlist;
  }
}

// Add an item to the wishlist
export async function addToWishlist(productId: string) {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    // User is authenticated, add item to database
    // First, check if the product exists
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      throw new Error("Product not found");
    }

    // Check if the product is already in the wishlist
    const { data: existingItem, error: existingItemError } = await supabase
      .from("wishlist_items")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("product_id", productId)
      .single();

    if (existingItemError && existingItemError.code !== "PGRST116") {
      // PGRST116 means no rows returned, which is expected if the item isn't in the wishlist
      console.error(
        "Error checking existing wishlist item:",
        existingItemError
      );
      throw new Error("Failed to check if item is already in wishlist");
    }

    if (existingItem) {
      // Item already exists, do nothing
      return;
    } else {
      // Item doesn't exist, add it
      const { error: insertError } = await supabase
        .from("wishlist_items")
        .insert({
          user_id: session.user.id,
          product_id: productId,
        });

      if (insertError) {
        console.error("Error adding item to wishlist:", insertError);
        throw new Error("Failed to add item to wishlist");
      }
    }
  } else {
    // User is not authenticated, add item to cookie
    const wishlist = await getAnonymousWishlist();

    // Check if the product is already in the wishlist
    const existingItemIndex = wishlist.items.findIndex(
      (item: any) => item.productId === productId
    );

    if (existingItemIndex >= 0) {
      // Item already exists, do nothing
      return;
    } else {
      // Add the new item to the wishlist
      wishlist.items.push({
        productId,
      });

      // Save the updated wishlist to cookies
      await saveAnonymousWishlist(wishlist);
    }
  }

  // Revalidate the wishlist page to update the UI
  revalidatePath("/wishlist");
  revalidatePath("/products/[id]");
  revalidatePath("/");
}

// Remove an item from the wishlist
export async function removeFromWishlist(productId: string) {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // User is authenticated, remove item from database
    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (error) {
      console.error("Error removing item from wishlist:", error);
      throw new Error("Failed to remove item from wishlist");
    }
  } else {
    // User is not authenticated, remove item from cookie
    const wishlist = await getAnonymousWishlist();

    // Filter out the item to remove
    wishlist.items = wishlist.items.filter(
      (item: any) => item.productId !== productId
    );

    // Save the updated wishlist to cookies
    saveAnonymousWishlist(wishlist);
  }

  // Revalidate the wishlist page to update the UI
  revalidatePath("/wishlist");
  revalidatePath("/products/[id]");
  revalidatePath("/");
}

// Merge anonymous wishlist with user wishlist after login
export async function mergeAnonymousWishlistWithUserWishlist(userId: string) {
  const anonymousWishlist = await getAnonymousWishlist();

  if (anonymousWishlist.items.length === 0) {
    return; // No items to merge
  }

  const supabase = await createClient();

  // For each item in the anonymous wishlist
  for (const item of anonymousWishlist.items) {
    try {
      // Check if the item already exists in the user's wishlist
      const { data: existingItem, error: existingItemError } = await supabase
        .from("wishlist_items")
        .select("*")
        .eq("user_id", userId)
        .eq("product_id", item.productId)
        .single();

      if (existingItemError && existingItemError.code !== "PGRST116") {
        console.error(
          "Error checking existing wishlist item:",
          existingItemError
        );
        continue;
      }

      if (!existingItem) {
        // Item doesn't exist, add it
        await supabase.from("wishlist_items").insert({
          user_id: userId,
          product_id: item.productId,
        });
      }
    } catch (error) {
      console.error(`Error merging wishlist item ${item.productId}:`, error);
    }
  }

  // Clear the anonymous wishlist
  const cookieStore = await cookies();
  cookieStore.set("anonymous_wishlist", "", { maxAge: 0, path: "/" });

  // Revalidate the wishlist page to update the UI
  revalidatePath("/wishlist");
}
