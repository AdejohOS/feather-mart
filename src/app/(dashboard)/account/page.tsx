import { createClient } from "@/utils/supabase/server";
import { User } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";
import { AccountTabs } from "./_components/account-tabs";

const Page = async () => {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login if not authenticated
    redirect("/auth/sign-in?redirect=/account");
  }

  // Get user profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/auth/sign-in?redirect=/account");
  }

  return (
    <section className="bg-gray-50">
      <div className="px-4 max-w-6xl mx-auto pb-16 pt-4">
        <h1 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <User className="size-6" />
          Manage Account
        </h1>

        <AccountTabs user={user} profile={profile} />
      </div>
    </section>
  );
};

export default Page;
