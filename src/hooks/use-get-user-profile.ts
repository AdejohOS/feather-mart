"use client"

import { useQuery } from "@tanstack/react-query"


import { createClient } from "@/utils/supabase/client"
import { Profile } from "@/types/types"

export function useGetUserProfile() {
  const supabase = createClient()
 
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<Profile | null> => {
      // Get the current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("User not authenticated")
      }

      // Fetch the profile
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error) {
        throw error
      }

      // Add email from auth user to profile data
      return {
        ...data,
        email: user.email,
      } as Profile
    },
  })
}

