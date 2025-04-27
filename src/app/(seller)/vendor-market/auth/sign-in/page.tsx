import { FullPageLoader } from "@/app/(seller)/vendor-marketplace/_components/full-page-loader";
import { VendorSignInCard } from "@/features/vendor/components/auth/vendor-signin-card";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

const VendorLoginPage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <VendorSignInCard role="seller" mode="sign-in" />;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  if (!profile) {
    return <FullPageLoader />;
  }

  if (profile?.role === "seller") {
    redirect("/vendor-marketplace");
  }
  return <VendorSignInCard role="seller" mode="sign-in" />;
};

export default VendorLoginPage;
