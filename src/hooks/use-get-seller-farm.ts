"use client"

import { createClient } from "@/utils/supabase/client"
import { useQuery } from "@tanstack/react-query"

async function getSellerFarm(){
const supabase =  createClient()

const {data: {user}, error: userError} = await supabase.auth.getUser()

console.log("Authenticated User ID:", user?.id) // Debugging user ID

if(!user || userError){
    throw new Error("Unauthorized access" )
}

const {data: profile, error: profileError} = await supabase.from("profiles").select("id, role").eq("id", user.id).single()



if(!profile || profileError || profile.role !== "seller"){
    throw new Error("Unauthorized access")
}
const {data: farms, error:farmsError } = await supabase.from("farms").select("*").eq("seller_id", profile.id)

if (farmsError){
    throw new Error("Failed to fetch seller's farms")
}

return farms || []
}

export function useGetSellerFarm(){
    return useQuery({
        queryKey: ["seller-farm"],
        queryFn: getSellerFarm,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}