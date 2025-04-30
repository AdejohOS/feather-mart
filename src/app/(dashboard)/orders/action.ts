"use server";
import { revalidatePath } from "next/cache";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getCart } from "../cart/actions";

type OrderItems = {
  productId: string;
  name?: string;
  price?: number;
  stock?: number;
  description?: string;
  media?: Array<{ url: string }> | null;
  farm?: string | null;
  quantity?: number;
};

// Create an order from the cart
export async function createOrder(formData: FormData) {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login if not authenticated
    redirect("/auth/sign-in?redirect=/checkout");
  }

  // Get the current cart
  const cart = await getCart();

  if (cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  // Create shipping address object from form data
  const shippingAddress = {
    fullName: String(formData.get("fullName") || ""),
    address: String(formData.get("address") || ""),
    city: String(formData.get("city") || ""),
    state: String(formData.get("state") || ""),
    postalCode: String(formData.get("postalCode") || ""),
    country: String(formData.get("country") || ""),
    email: String(formData.get("email") || ""),
    phone: String(formData.get("phone") || ""),
  };
  // Calculate tax and total
  const subtotal = cart.total;
  const tax = subtotal * 0.08; // 8% tax
  const shipping = 0; // Free shipping
  const totalAmount = subtotal + tax + shipping;

  // Start a transaction
  try {
    // 1. Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        status: "pending",
        shipping_address: shippingAddress,
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error("Failed to create order");
    }

    // 2. Create order items
    const orderItems = cart.items.map((item: OrderItems) => ({
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
      const { error: stockError } = await supabase.rpc("decrement_stock", {
        product_id: item.productId,
        amount: item.quantity,
      });

      if (stockError) {
        console.error("Error updating product stock:", stockError);
        // Continue anyway, we don't want to fail the order just because stock update failed
      }
    }

    // 4. Clear the user's cart
    const { error: clearCartError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

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
