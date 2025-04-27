import React from "react";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { VendorProductList } from "./_components/vendor-product-list";

const Page = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login if not authenticated
    redirect(
      "/vendor-marketplace/auth/sign-in?redirect=/vendor-marketplace/products"
    );
  }

  // Check if user is a seller via their profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "seller") {
    redirect("/auth/sign-in");
  }
  return (
    <section className="">
      <VendorProductList />
    </section>
  );
};

export default Page;
