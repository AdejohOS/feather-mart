import React from "react";

import { VendorSettings } from "./_components/vendor-set";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const Page = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login if not authenticated
    redirect(
      "/vendor-marketplace/auth/sign-in?redirect=/vendor-marketplace/settings"
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
    <div className="">
      <VendorSettings />
    </div>
  );
};

export default Page;
