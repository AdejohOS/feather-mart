import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import VendorAnalytics from "../_components/vendor-analytics";
import VendorLayout from "../_components/vendor-layout";

export default async function VendorAnalyticsPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    // Redirect to login if not authenticated
    redirect("/login?redirect=/vendor/analytics");
  }

  // Check if the user is a vendor
  const { data: farm, error } = await supabase
    .from("farms")
    .select("id")
    .eq("user_id", session.user.id)
    .single();

  if (error || !farm) {
    // Redirect to vendor registration if not a vendor
    redirect("/vendor/register");
  }

  // Get sales data for this vendor
  const { data: salesData } = await supabase
    .from("order_items")
    .select("product_price, quantity, created_at, product_name")
    .eq("farm_id", farm.id)
    .order("created_at", { ascending: false });

  // Get product data for this vendor
  const { data: products } = await supabase
    .from("products")
    .select("id, name, stock, price")
    .eq("farm_id", farm.id)
    .order("stock", { ascending: true })
    .limit(5);

  return (
    <VendorLayout>
      <VendorAnalytics
        farmId={farm.id}
        salesData={salesData || []}
        topProducts={products || []}
      />
    </VendorLayout>
  );
}
