import { SignInCard } from "@/features/buyer/auth/sign-in-card";

import { createClient } from "@/utils/supabase/server";

import React from "react";

const SignUpPage = async () => {
  return <SignInCard mode="signup" />;
};

export default SignUpPage;
