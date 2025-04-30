import { SignInCard } from "@/features/buyer/auth/sign-in-card";
import { createClient } from "@/utils/supabase/server";

import React from "react";

const SignInPage = async () => {
  const supabase = await createClient();

  return <SignInCard />;
};

export default SignInPage;
