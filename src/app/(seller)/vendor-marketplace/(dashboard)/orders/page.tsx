import { createClient } from "@/utils/supabase/server";

import { redirect } from "next/navigation";
import VendorOrdersList from "./_components/vendor-order-list";

const Page = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login if not authenticated
    redirect(
      "/vendor-marketplace/auth/sign-in?redirect=/vendor-marketplace/orders"
    );
  }

  // Check if user is a seller via their profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "seller") {
    redirect("/vendor/register");
  }

  // Fetch order items and include the related orders and products
  const { data: orders, error: orderError } = await supabase
    .from("order_items")
    .select(
      `
      id, 
      quantity, 
      product_price, 
      product_name, 
      created_at, 
      order_id, 
      orders(id, status, created_at, user_id, total_amount, shipping_address), 
      products(id, seller_id, farm_id)
    `
    )
    .eq("products.seller_id", user.id) // Only seller's products
    .order("created_at", { ascending: false });

  if (orderError) {
    console.error("Error fetching order items:", orderError);
  }

  return (
    <section className="">
      <VendorOrdersList initialOrders={orders || []} />
    </section>
  );
};

export default Page;
