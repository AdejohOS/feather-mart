"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DottedSeparator } from "@/components/ui/dotted-separator";

import { FcGoogle } from "react-icons/fc";

import Link from "next/link";

import { useState } from "react";

import { Loader } from "lucide-react";

import { createClient } from "@/utils/supabase/client";

import { toast } from "sonner";

export const SignInCard = ({
  mode = "signin",
}: {
  mode?: "signin" | "signup";
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const oAuthSignin = async () => {
    setLoading(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "An error occurred during Google sign up");
      setLoading(false);
    }
  };

  return (
    <Card className="h-full w-full border-none shadow-none md:w-[487px]">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </CardTitle>
        <CardDescription className="text-center">
          {mode === "signin"
            ? "Sign in to your dashboard"
            : "Get started with your new account"}
        </CardDescription>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>

      <CardContent className="p-7">
        <div className="flex items-center space-x-3">
          <Button
            className="flex w-full items-center gap-x-2"
            variant="outline"
            size="lg"
            disabled={loading}
            onClick={oAuthSignin}
          >
            {loading ? (
              <Loader className="size-5 animate-spin" />
            ) : (
              <FcGoogle className="size-4" />
            )}
            Google
          </Button>
        </div>
      </CardContent>

      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardFooter className="flex-col gap-4">
        <p className="mt-4 text-center text-sm text-muted-foreground">
          By continuing, you confirm that you’ve read and accepted
          FeatherMart&apos;s {""}
          <Link href="/terms-conditions" className="text-teal-600 underline">
            Terms and Conditions
          </Link>
        </p>

        <p className="text-sm text-muted-foreground">
          {mode === "signin" ? (
            <>
              <span>New to FeatherMart?</span>{" "}
              <Link className="text-teal-600 underline" href="/auth/sign-up">
                Signup
              </Link>
            </>
          ) : (
            <>
              <span>Already have an account?</span>{" "}
              <Link className="text-teal-600 underline" href="/auth/sign-in">
                SignIn
              </Link>{" "}
            </>
          )}
        </p>
      </CardFooter>
    </Card>
  );
};
