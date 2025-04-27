import { createClient } from "@/utils/supabase/server";

import { redirect } from "next/navigation";
import { VendorAnalytics } from "./_components/vendor-analytics";

const Page = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login if not authenticated
    redirect("/vendor-marketplace/auth/sign-in?redirect=/vendor/analytics");
  }

  // Check if the user is a vendor
  const { data: farm, error } = await supabase
    .from("farms")
    .select("id")
    .eq("seller_id", user.id)
    .single();

  if (error || !farm) {
    // Redirect to vendor registration if not a vendor
    redirect("/vendor-marketplace/auth/sign-in");
  }

  const { data: salesData } = await supabase
    .from("order_items")
    .select("product_price, quantity, created_at, product_name")
    .eq("farm_id", farm.id)
    .order("created_at", { ascending: false });

  const { data: topProductsData } = await supabase
    .from("products")
    .select("id, name, stock, price, farm_id")
    .eq("farm_id", farm.id)
    .order("stock", { ascending: false })
    .limit(5);

  return (
    <section className="">
      <VendorAnalytics
        farmId={farm.id}
        salesData={salesData || []}
        topProducts={topProductsData || []}
      />
    </section>
  );
};

export default Page;
