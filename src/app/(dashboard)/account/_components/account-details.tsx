"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { updateEmail } from "../actions";
import { User as SupabaseUser } from "@supabase/supabase-js";

const accountSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type AccountFormValues = z.infer<typeof accountSchema>;

type User = SupabaseUser & {
  app_metadata: {
    provider: string;
  };
  user_metadata: {
    full_name: string;
    avatar_url: string;
  };
};

type Profile = {
  full_name: string;
  avatar_url: string;
  email: string;
  phone_number?: string | null;
};

interface AccountDetailsProps {
  user: User;
  profile: Profile;
  isOAuthUser: boolean;
  authProvider: string;
}

export const AccountDetails = ({
  user,
  isOAuthUser,
  authProvider,
}: AccountDetailsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      email: user?.email || "",
    },
  });

  const onSubmit = async (data: AccountFormValues) => {
    if (isOAuthUser) {
      toast.error(
        `Email updates are not available for accounts that sign in with ${authProvider}.`
      );
      return;
    }

    if (data.email === user.email) {
      toast("Your email address is already set to this value.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateEmail(data.email);

      if (result.success) {
        toast.success(
          "Email update confirmation has been sent to your new email address."
        );
      } else {
        throw new Error(result.error || "Failed to update email");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error.message || "Failed to update email. Please try again."
        );
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format the date when the account was created
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : "N/A";

  // Format the auth provider name for display
  const formatProviderName = (provider: string) => {
    if (provider === "email") return "Email/Password";
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Account Details</CardTitle>
        {isOAuthUser && (
          <CardDescription>
            You&apos;re signed in with {formatProviderName(authProvider)}. Some
            account settings are managed by your provider.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form
          id="account-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="email">Email Address</Label>
              {isOAuthUser && (
                <Badge variant="outline" className="text-xs">
                  Managed by {formatProviderName(authProvider)}
                </Badge>
              )}
            </div>
            <Input
              id="email"
              type="email"
              {...register("email")}
              disabled={isOAuthUser}
              className={isOAuthUser ? "opacity-70" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
            {!isOAuthUser && (
              <p className="text-xs text-gray-500">
                Changing your email will require confirmation from your new
                email address.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Authentication Method</Label>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {formatProviderName(authProvider)}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Account ID</Label>
            <Input value={user?.id || "N/A"} disabled className="opacity-70" />
            <p className="text-xs text-gray-500">
              This is your unique account identifier.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Account Created</Label>
            <Input value={createdAt} disabled className="opacity-70" />
            <p className="text-xs text-gray-500">
              This is when your account was created.
            </p>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        {!isOAuthUser && (
          <Button type="submit" form="account-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Email"
            )}
          </Button>
        )}
      </CardFooter>
    </>
  );
};
