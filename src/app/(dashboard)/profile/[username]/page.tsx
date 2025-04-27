import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import React from "react";
import { PublicProfile } from "../_components/public-profile";

const Page = async ({ params }: { params: Promise<{ username: string }> }) => {
  const { username } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email;

  // Fetch the profile by username
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !profile) {
    notFound();
  }

  // Fetch user's recent orders
  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
     id,
     total_amount,
     status,
     created_at,
     order_items (
       id,
       product_name,
       quantity
     )
   `
    )
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Check if the current user is viewing their own profile

  const isOwnProfile = user?.id === profile.id;

  return (
    <section className="bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 pt-4 pb-16">
        <PublicProfile
          profile={profile}
          recentOrders={orders || []}
          isOwnProfile={isOwnProfile}
        />
      </div>
    </section>
  );
};

export default Page;
