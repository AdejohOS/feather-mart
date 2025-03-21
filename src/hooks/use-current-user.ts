
import { useQuery } from '@tanstack/react-query'
import { LoggedInUser } from "@/types/types";
import { createClient } from "@/utils/supabase/client";

async function getUser():Promise<LoggedInUser | null> {
    const supabase = createClient()

    const {data:sessionData, error:sessionError} = await supabase.auth.getSession()

    if (sessionError || !sessionData.session?.user) {
      console.error("Session error:", sessionError?.message || "No active session");
        return null;
    }

    const {error:refreshError} = await supabase.auth.refreshSession();
    if(refreshError) {
        console.error("Session efresh error:", refreshError.message);
        
    }

   
    const {data: user, error: profileError} = await supabase.from("profiles").select("*").eq("id", sessionData.session.user.id).single()
    

        if(profileError) {
            console.error('Profile fetch error:', profileError.message);
            return null
        }

        return user as LoggedInUser
   
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: getUser,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2
  })
}
