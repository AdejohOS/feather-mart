"use client";

import { Button } from "@/components/ui/button";
import {
  CardContent,
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
import { updateProfile } from "../actions";

const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .optional()
    .or(z.literal("")),
  email: z.string().email(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .optional()
    .or(z.literal("")),

  phone_number: z.string().optional().or(z.literal("")),
  avatar_url: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type User = {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  phone_number: string | null;
  avatar_url: string | null;
};

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  phone: string | null;
  avatar_url: string | null;
};

interface ProfileSettingsProps {
  user: User;
  profile: Profile;
}
export const ProfileSettings = ({ profile }: ProfileSettingsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: profile.email,
      full_name: profile?.full_name || "",
      username: profile?.username || "",
      phone_number: profile?.phone || "",
      avatar_url: profile?.avatar_url || "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    if (!isDirty) {
      toast("No changes were made to your profile.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateProfile(data);

      if (result.success) {
        toast.success("Your profile has been updated successfully.");
      } else {
        throw new Error(result.error || "Failed to update profile");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error.message || "Failed to update profile. Please try again."
        );
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          id="profile-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" {...register("full_name")} />
            {errors.full_name && (
              <p className="text-sm text-red-500">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...register("username")} />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Your username will be used for your public profile URL.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone No.</Label>
            <Input
              id="phone_number"
              {...register("phone_number")}
              placeholder="+234 706 349 4394"
            />
            {errors.phone_number && (
              <p className="text-sm text-red-500">
                {errors.phone_number.message}
              </p>
            )}
          </div>
        </form>
      </CardContent>

      <CardFooter>
        <div className="flex justify-end w-full">
          <Button
            type="submit"
            form="profile-form"
            disabled={isSubmitting || !isDirty}
          >
            {isSubmitting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Profile"
            )}
          </Button>
        </div>
      </CardFooter>
    </>
  );
};
