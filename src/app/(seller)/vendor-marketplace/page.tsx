import { createClient } from "@/utils/supabase/server";

import { redirect } from "next/navigation";
import VendorDashboardContent from "./(dashboard)/_components/vendor-dashboard-content";

export const dynamic = "force-dynamic";

const Page = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login if not authenticated
    redirect("/login?redirect=/vendor/analytics");
  }

  // Check if the user is a vendor
  const { data: farm, error } = await supabase
    .from("farms")
    .select("id, name, description, city, state, contact_email")
    .eq("seller_id", user.id)
    .single();

  if (error || !farm) {
    // Redirect to vendor registration if not a vendor
    redirect("/vendor/register");
  }

  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("farm_id", farm.id);

  // Get recent orders for this vendor
  const { data: recentOrders } = await supabase
    .from("order_items")
    .select(
      `
    id,
    quantity,
    product_price,
    product_name,
    created_at,
    orders(id, status, created_at)
  `
    )
    .eq("farm_id", farm.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Get total sales for this vendor
  const { data: totalSales } = await supabase
    .from("order_items")
    .select("product_price, quantity")
    .eq("farm_id", farm.id);

  // Calculate total revenue
  const totalRevenue =
    totalSales?.reduce(
      (sum, item) => sum + item.product_price * item.quantity,
      0
    ) || 0;

  return (
    <section className="">
      <VendorDashboardContent
        farm={farm}
        recentOrders={recentOrders || []}
        totalRevenue={totalRevenue}
        productCount={productCount || 0}
      />
    </section>
  );
};

export default Page;
