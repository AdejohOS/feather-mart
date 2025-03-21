import { useQuery } from "@tanstack/react-query"


import { createClient } from "@/utils/supabase/client"
import { Profile } from "@/types/types"

export function useGetCurrentUser() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<Profile | null> => {
        const supabase = await createClient()
      const { data: session, error: sessionError} = await supabase.auth.getSession()

      

      if (sessionError || !session.session) {
        throw new Error("User not authenticated")
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.session.user.id)
        .single()

      if (error) {
        throw error
      }

      return data as Profile
    },
    
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

