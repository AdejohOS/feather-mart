import { SignInCard } from "@/features/buyer/auth/sign-in-card";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

import React from "react";

type SignInPageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const SignInPage = async ({ searchParams }: SignInPageProps) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const redirectTo =
      typeof searchParams.redirect === "string" ? searchParams.redirect : "/";
    redirect(redirectTo);
  }

  return <SignInCard />;
};

export default SignInPage;
