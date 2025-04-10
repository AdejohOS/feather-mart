import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useGetFarms(){
    return useQuery({
        queryKey: ['farms'],
        queryFn: async () => {

            const supabase = await createClient()

            const { data: farms, error: farmsError } = await supabase
                .from('farms')
                .select(`*, media:farm_media(id, url, type), products(id)`)

            if (farmsError) {
                throw new Error("Failed to fetch seller's farms" + farmsError.message)
            }

            return farms.map(farm => ({
                ...farm,
                image: farm.media?.[0]?.url,
                productCount: farm.products?.length ?? 0 // Adjust if using `.count`
              }))
        }
    });
}