"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

interface ProfileData {
  email: string;
  full_name?: string;
  username?: string;
  phone_number?: string;
  avatar_url?: string;
}

// Helper function to check if user is using OAuth
function isOAuthUser(user: any) {
  return user?.app_metadata?.provider && user.app_metadata.provider !== "email";
}

// Update email address
export async function updateEmail(newEmail: string) {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "You must be logged in to update your email",
    };
  }

  // Check if user is using OAuth
  if (isOAuthUser(user)) {
    return {
      success: false,
      error: `Email updates are not available for accounts that sign in with ${user.app_metadata.provider}`,
    };
  }

  try {
    const { error } = await supabase.auth.updateUser({ email: newEmail });

    if (error) {
      throw error;
    }

    revalidatePath("/account");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating email:", error);
    return { success: false, error: error.message || "Failed to update email" };
  }
}

// Update password
export async function updatePassword(
  currentPassword: string,
  newPassword: string
) {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "You must be logged in to update your password",
    };
  }

  // Check if user is using OAuth
  if (isOAuthUser(user)) {
    return {
      success: false,
      error: `Password updates are not available for accounts that sign in with ${user.app_metadata.provider}`,
    };
  }

  try {
    // First, verify the current password by trying to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return { success: false, error: "Current password is incorrect" };
    }

    // If current password is correct, update to the new password
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating password:", error);
    return {
      success: false,
      error: error.message || "Failed to update password",
    };
  }
}

// Update profile
export async function updateProfile(profileData: ProfileData) {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "You must be logged in to update your profile",
    };
  }

  try {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (existingProfile) {
      // Update existing profile
      const updatePayload = {
        id: user.id,
        email: user.email!, //
        username:
          profileData.username && profileData.username.trim() !== ""
            ? profileData.username
            : existingProfile.username,
        full_name: profileData.full_name ?? existingProfile?.full_name,
        phone_number: profileData.phone_number ?? existingProfile?.phone_number,
        avatar_url: profileData.avatar_url ?? existingProfile?.avatar_url,
      };

      const { error } = await supabase.from("profiles").upsert(updatePayload);

      if (error) {
        throw error;
      }
    }

    revalidatePath("/account");
    revalidatePath("/profile");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: error.message || "Failed to update profile",
    };
  }
}
