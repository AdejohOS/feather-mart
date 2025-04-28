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

import { useActionState, useState } from "react";

import { CheckCircle2, Eye, EyeOff, Loader, TriangleAlert } from "lucide-react";

import { createClient } from "@/utils/supabase/client";

import { ActionResponse } from "@/types/types";

import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { signInWithPassword, signUpWithPassword } from "@/actions/action";
import { cn } from "@/lib/utils";

const initialState: ActionResponse = {
  success: false,
  message: "",
  inputs: {
    name: "",
    email: "",
    password: "",
    role: "seller",
  },
};

interface VendorSignInCardProps {
  role: "buyer" | "seller";
  mode: "sign-up" | "sign-in";
}

export const VendorSignInCard = ({ mode }: VendorSignInCardProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);

  const [authState, authAction, isPending] = useActionState(
    mode === "sign-up" ? signUpWithPassword : signInWithPassword,
    initialState
  );

  const oAuthSignin = async () => {
    setLoading(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/vendor-market/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "An error occurred during Google sign up");
      } else if (typeof error === "string") {
        toast.error(error);
      } else {
        toast.error("An unknown error occurred");
      }
    }
  };

  return (
    <Card className="h-full w-full border-none shadow-none md:w-[487px]">
      <CardHeader className=" text-center p-7">
        <CardTitle className="text-2xl">
          {mode === "sign-in" ? "Welcome back " : "Create your seller account"}
        </CardTitle>
        <CardDescription>
          {mode === "sign-in"
            ? "Sign in to your seller dashboard"
            : "Get started with your new seller account"}
        </CardDescription>
      </CardHeader>

      <div className="px-7">
        <DottedSeparator />
      </div>

      <CardContent className="p-7">
        {authState.message && (
          <div className="mb-7">
            <div
              className={cn(
                `rounded-md p-6`,
                authState.success ? "bg-green-50" : "bg-amber-50"
              )}
            >
              <h3
                className={cn(
                  `text-sm font-medium`,
                  authState.success ? "text-green-700" : "text-amber-700"
                )}
              >
                {authState.success ? (
                  <p className="flex items-center gap-x-2">
                    <CheckCircle2 className="size-4" /> Check your email
                  </p>
                ) : (
                  <p className="flex items-center gap-x-2">
                    <TriangleAlert className="size-4" /> We&apos;ve got a
                    problem
                  </p>
                )}
              </h3>
              <p
                className={cn(
                  "mt-2 text-sm",
                  authState.success ? "text-green-800" : "text-amber-800"
                )}
              >
                {authState.message}
              </p>
            </div>
          </div>
        )}

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

        <div className="relative my-7 flex items-center">
          <Separator className="flex-1" />
          <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-muted-foreground">
            Or
          </p>
        </div>

        <form action={authAction} className="space-y-4">
          {mode === "sign-up" && (
            <input type="hidden" name="role" value="seller" />
          )}

          {mode === "sign-up" && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="name"
                name="name"
                placeholder="Enter your name"
                autoComplete="name"
                aria-describedby="name-error"
                required
                defaultValue={authState.inputs?.name}
                disabled={isPending || loading}
                className={authState.errors?.name ? "border-red-500" : ""}
              />
              {authState.errors?.name && (
                <p id="name-error" className="text-sm text-red-500">
                  {authState.errors?.name?.[0]}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              autoComplete="email"
              aria-describedby="email-error"
              defaultValue={authState.inputs?.email}
              required
              disabled={isPending || loading}
              className={authState.errors?.email ? "border-red-500" : ""}
            />
            {authState.errors?.email && (
              <p id="name-error" className="text-sm text-red-500">
                {authState.errors?.email?.[0]}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="*******"
                name="password"
                autoComplete="password"
                required
                aria-describedby="password-error"
                defaultValue={authState.inputs?.password}
                disabled={isPending || loading}
                className={authState.errors?.password ? "border-red-500" : ""}
              />
              <Button
                className="absolute right-2 top-0.5"
                size="icon"
                variant="ghost"
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </Button>
            </div>

            {authState.errors?.password && (
              <p id="password-error" className="text-sm text-red-500">
                {authState.errors?.password?.[0]}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="flex-items-center w-full gap-x-2"
            size="lg"
            disabled={isPending || loading}
          >
            {isPending && <Loader className="size-4 animate-spin" />}{" "}
            {mode === "sign-up"
              ? "Create a seller account"
              : "Sign in to seller account"}
          </Button>
        </form>
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
          {mode === "sign-in" ? (
            <>
              <span>New to FeatherMart?</span>{" "}
              <Link
                className="text-teal-600 underline"
                href="/vendor-market/auth/sign-up"
              >
                Signup
              </Link>
            </>
          ) : (
            <>
              <span>Already have an account?</span>{" "}
              <Link
                className="text-teal-600 underline"
                href="/vendor-market/auth/sign-in"
              >
                Login
              </Link>{" "}
            </>
          )}
        </p>
      </CardFooter>
    </Card>
  );
};
