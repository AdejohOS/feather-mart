"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export type CartItem = {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    description: string;
    media?: { url: string }[];
    stock?: number;
    seller?: string;
  };
};

// Helper function to get the anonymous cart from cookies
const getAnonymousCart = async () => {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get("anonymous_cart")?.value;
  const supabase = await createClient();

  if (cartCookie) {
    try {
      const cart = JSON.parse(cartCookie);

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
const saveAnonymousCart = async (cart: any) => {
  const cookieStore = await cookies();
  cookieStore.set("anonymous_cart", JSON.stringify(cart), {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
};

// Get cart for the current user (authenticated or anonymous)
export async function getCart() {
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

// Add an item to the cart
export async function addToCart(productId: string) {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // User is authenticated, add item to database

    // First, get the product details
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      throw new Error("Product not found");
    }

    // Check if the product is already in the cart
    const { data: existingItem, error: existingItemError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single();

    if (existingItemError && existingItemError.code !== "PGRST116") {
      // PGRST116 means no rows returned, which is expected if the item isn't in the cart
      console.error("Error checking existing cart item:", existingItemError);
      throw new Error("Failed to check if item is already in cart");
    }

    if (existingItem) {
      // Item already exists, update quantity
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({
          quantity: existingItem.quantity + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingItem.id);

      if (updateError) {
        console.error("Error updating cart item:", updateError);
        throw new Error("Failed to update cart item");
      }
    } else {
      // Item doesn't exist, add it
      const { error: insertError } = await supabase.from("cart_items").insert({
        user_id: user.id,
        product_id: productId,
        quantity: 1,
      });

      if (insertError) {
        console.error("Error adding item to cart:", insertError);
        throw new Error("Failed to add item to cart");
      }
    }
  } else {
    // User is not authenticated, add item to cookie
    const cart = await getAnonymousCart();

    // Get product details
    const { data: product, error: productError } = await supabase
      .from("products")
      .select(
        `*,media:product_media(url),
        farm:farms(name)`
      )
      .eq("id", productId)
      .single();

    if (productError || !product) {
      throw new Error("Product not found");
    }

    // Check if the product is already in the cart
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.productId === productId
    );

    if (existingItemIndex >= 0) {
      // Increment quantity if the item is already in the cart
      cart.items[existingItemIndex].quantity += 1;
    } else {
      // Add the new item to the cart
      cart.items.push({
        productId,
        name: product.name,
        price: Number(product.price) || 0,
        quantity: 1,
        stock: Number(product.stock) || 0,
        media: product.media?.map((m: any) => ({ url: m.url })) || [],
        seller: product.farm?.name || "Unknown",
      });
    }

    // Recalculate the total
    cart.total = cart.items.reduce((sum: number, item: any) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);

    // Save the updated cart to cookies
    await saveAnonymousCart(cart);
  }

  // Revalidate the cart page to update the UI
  revalidatePath("/cart");
  revalidatePath("/");
}

// Remove an item from the cart
export async function removeFromCart(productId: string) {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // User is authenticated, remove item from database
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (error) {
      console.error("Error removing item from cart:", error);
      throw new Error("Failed to remove item from cart");
    }
  } else {
    // User is not authenticated, remove item from cookie
    const cart = await getAnonymousCart();

    // Filter out the item to remove
    cart.items = cart.items.filter((item: any) => item.productId !== productId);

    // Recalculate the total
    cart.total = cart.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Save the updated cart to cookies
    await saveAnonymousCart(cart);
  }

  // Revalidate the cart page to update the UI
  revalidatePath("/cart");
  revalidatePath("/");
}

// Update the quantity of an item in the cart
export async function updateCartItemQuantity(
  productId: string,
  quantity: number
) {
  if (quantity < 1) {
    return removeFromCart(productId);
  }

  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // User is authenticated, update item in database
    const { error } = await supabase
      .from("cart_items")
      .update({
        quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (error) {
      console.error("Error updating cart item:", error);
      throw new Error("Failed to update cart item");
    }
  } else {
    // User is not authenticated, update item in cookie
    const cart = await getAnonymousCart();

    // Find the item to update
    const itemIndex = cart.items.findIndex(
      (item: any) => item.productId === productId
    );

    if (itemIndex >= 0) {
      // Update the quantity
      cart.items[itemIndex].quantity = quantity;

      // Recalculate the total
      cart.total = cart.items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );

      // Save the updated cart to cookies
      await saveAnonymousCart(cart);
    }
  }

  // Revalidate the cart page to update the UI
  revalidatePath("/cart");
  revalidatePath("/");
}

// Merge anonymous cart with user cart after login
export async function mergeAnonymousCartWithUserCart(userId: string) {
  const anonymousCart = await getAnonymousCart();

  if (anonymousCart.items.length === 0) {
    return; // No items to merge
  }

  const supabase = await createClient();

  // For each item in the anonymous cart
  for (const item of anonymousCart.items) {
    // Check if the item already exists in the user's cart
    const { data: existingItem, error: existingItemError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", item.productId)
      .single();

    if (existingItemError && existingItemError.code !== "PGRST116") {
      console.error("Error checking existing cart item:", existingItemError);
      continue;
    }

    if (existingItem) {
      // Item already exists, update quantity
      await supabase
        .from("cart_items")
        .update({
          quantity: existingItem.quantity + item.quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingItem.id);
    } else {
      // Item doesn't exist, add it
      await supabase.from("cart_items").insert({
        user_id: userId,
        product_id: item.productId,
        quantity: item.quantity,
      });
    }
  }

  // Clear the anonymous cart
  const cookieStore = await cookies();
  cookieStore.set("anonymous_cart", "", { maxAge: 0, path: "/" });

  // Revalidate the cart page to update the UI
  revalidatePath("/cart");
  revalidatePath("/");
}

// Create an order from the cart
export async function createOrder(formData: FormData) {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    // Redirect to login if not authenticated
    redirect("/login?redirect=/checkout");
  }

  // Get the current cart
  const cart = await getCart();

  if (cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  // Create shipping address object from form data
  const shippingAddress = {
    fullName: formData.get("fullName"),
    address: formData.get("address"),
    city: formData.get("city"),
    state: formData.get("state"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country"),
  };

  // Start a transaction
  // Note: Supabase doesn't support transactions directly through the JS client
  // so we'll do our best to handle errors and rollback manually if needed

  try {
    // 1. Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: session.user.id,
        total_amount: cart.total,
        status: "pending",
        shipping_address: shippingAddress,
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error("Failed to create order");
    }

    // 2. Create order items
    const orderItems = cart.items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      product_price: item.price,
      quantity: item.quantity,
    }));

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (orderItemsError) {
      // Try to delete the order to rollback
      await supabase.from("orders").delete().eq("id", order.id);
      throw new Error("Failed to create order items");
    }

    // 3. Update product stock
    for (const item of cart.items) {
      const { error: stockError } = await supabase
        .from("products")
        .update({
          stock: supabase.rpc("decrement", { x: item.quantity }),
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.productId)
        .gt("stock", item.quantity - 1); // Ensure we don't go below 0

      if (stockError) {
        console.error("Error updating product stock:", stockError);
        // Continue anyway, we don't want to fail the order just because stock update failed
      }
    }

    // 4. Clear the user's cart
    const { error: clearCartError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", session.user.id);

    if (clearCartError) {
      console.error("Error clearing cart:", clearCartError);
      // Continue anyway, the order is already created
    }

    // Revalidate paths
    revalidatePath("/cart");
    revalidatePath("/orders");
    revalidatePath("/");

    // Return the order ID for redirection
    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error("Failed to create order");
  }
}
