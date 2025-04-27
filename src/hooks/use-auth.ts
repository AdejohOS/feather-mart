"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { createClient } from "@/utils/supabase/client";
import { mergeAnonymousCartWithUserCart } from "@/app/(dashboard)/cart/actions";
import { mergeAnonymousWishlistWithUserWishlist } from "@/app/(dashboard)/wishlist/action";

export interface ProfileType {
  id: string;
  username: string;
  email: string;
  full_name: string;
  avatar_url: string;
  phone_number: string;
  updated_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Handle auth + cart merging + refresh
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user || null);
      setLoading(false);

      const {
        data: { subscription },
      } = await supabase.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user || null);

        if (event === "SIGNED_IN" && session?.user) {
          try {
            await mergeAnonymousCartWithUserCart(session.user.id);
            await mergeAnonymousWishlistWithUserWishlist(session.user.id);

            queryClient.invalidateQueries({ queryKey: ["cart"] });
            queryClient.invalidateQueries({ queryKey: ["wishlist"] });
          } catch (error) {
            console.error("Error merging user data:", error);
          }
        }

        if (event === "SIGNED_OUT") {
          queryClient.invalidateQueries({ queryKey: ["cart"] });
          queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        }

        router.refresh();
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    getUser();
  }, [supabase, router, queryClient]);

  // Sign out
  const signOut = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Session check error:", userError);
        throw new Error("Failed to check for active session");
      }

      if (!user) {
        console.warn("No active session found, skipping logout");
        return { success: true, message: "No active session found" };
      }

      const userId = user.id;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Failed to fetch user role:", profileError);
      }

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        console.error("Logout error:", signOutError);
        throw new Error("Failed to logout");
      }

      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      router.refresh();

      if (profile?.role === "seller") {
        router.push("/vendor-market/auth/sign-in");
      } else {
        router.push("/auth/sign-in");
      }

      return {
        success: true,
        message: "Logout successful",
        role: profile?.role,
      };
    } catch (error: any) {
      console.error("Logout process error:", error.message);
      return { success: false, message: error.message };
    }
  };

  // Fetch profile info
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery<ProfileType | null>({
    queryKey: ["profile"],
    queryFn: async (): Promise<ProfileType | null> => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) return null;

      return {
        ...data,
        email: user.email,
      } as ProfileType;
    },
    enabled: !!user, // only fetch profile if user is logged in
  });

  return {
    user,
    profile,
    loading: loading || profileLoading,
    isAuthenticated: !!user,
    signOut,
    profileError,
  };
}
