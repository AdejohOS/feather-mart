import { createClient } from "@/utils/supabase/server";

import { redirect } from "next/navigation";
import VendorOrdersList from "./_components/vendor-order-list";
type ShippingAddress = {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  email: string;
  phone: string;
};

type Order = {
  id: number;
  quantity: number;
  product_price: number;
  product_name: string;
  created_at: string | null; // remove `| null`
  orders: {
    id: number;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    created_at: string | null; // remove `| null`
    user_id: string;
    total_amount: number;
    shipping_address: ShippingAddress | null;
  };
};

function isValidShippingAddress(data: any): data is ShippingAddress {
  return (
    data &&
    typeof data.fullName === "string" &&
    typeof data.address === "string" &&
    typeof data.city === "string" &&
    typeof data.state === "string" &&
    typeof data.postalCode === "string" &&
    typeof data.country === "string" &&
    typeof data.email === "string" &&
    typeof data.phone === "string"
  );
}

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

  const safeOrders: Order[] =
    orders?.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      product_price: item.product_price,
      product_name: item.product_name,
      created_at: item.created_at ?? new Date().toISOString(),
      orders: {
        id: item.orders.id,
        status: item.orders.status,
        created_at: item.orders.created_at ?? new Date().toISOString(),
        user_id: item.orders.user_id,
        total_amount: item.orders.total_amount,
        shipping_address: isValidShippingAddress(item.orders.shipping_address)
          ? item.orders.shipping_address
          : null,
      },
    })) ?? [];

  return (
    <section className="">
      <VendorOrdersList initialOrders={safeOrders} />
    </section>
  );
};

export default Page;
