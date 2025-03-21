"use client"

import { createClient } from "@/utils/supabase/client"
import { useQuery } from "@tanstack/react-query"


export interface Profile {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  phone_number: string | null
  
}

const supabase = createClient()

async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Custom hook to fetch profile data using React Query
export function useGetProfile(userId: string) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getProfile(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

