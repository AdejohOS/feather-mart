import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";

type Farm = {
  id: string;
  name: string;
  established_date: string | null;
  address?: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  farm_type: string[];
  contact_email: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  website: string | null;
  description: string | null;
  size: number | null;
  certifications: string[] | null;
  business_hours: string | null;
  delivery_options: string[] | null;
  delivery_details: string[] | null;
  pickup_available: boolean | null;
  pickup_details: string[] | null;
  payment_methods: string[] | null;
  wholesale_available: boolean | null;
  wholesale_details: string | null;
  production_capacity: string | null;
  breeds: string[] | null;
  farming_practices: string[] | null;
  housing_types: string[] | null;
  has_processing_facility: boolean | null;
  processing_details: string | null;
  storage_capabilities: string | null;
  biosecurity_measures: string | null;

  // Add other fields from your `farms` table
  media: {
    id: string;
    url: string;
    type: string;
  }[];
};

export function useGetFarms() {
  return useQuery({
    queryKey: ["farms"],
    queryFn: async () => {
      const supabase = await createClient();

      const { data: farms, error: farmsError } = await supabase
        .from("farms")
        .select(
          `*, media:farm_media(id, url, type), products:products(id, name, price)`
        )
        .order("name", { ascending: true });

      if (farmsError) {
        throw new Error("Failed to fetch seller's farms" + farmsError.message);
      }

      return farms.map((farm) => ({
        ...farm,
        image: farm.media?.[0]?.url,
        productCount: farm.products?.length ?? 0, // Adjust if using `.count`
      }));
    },
  });
}

export function useGetFarm(farmId: string) {
  return useQuery<Farm>({
    queryKey: ["farms", farmId],
    queryFn: async () => {
      const supabase = await createClient();

      const { data: farm, error: farmError } = await supabase
        .from("farms")
        .select(`*, media:farm_media(id, url, type)`)
        .eq("id", farmId)
        .single();

      if (farmError) {
        throw new Error("Failed to fetch seller's farms" + farmError.message);
      }

      return farm as Farm;
    },
    enabled: !!farmId,
  });
}

export function useGetFarmProducts(farmId: string) {
  return useQuery({
    queryKey: ["farms", farmId, "products"],
    queryFn: async () => {
      const supabase = await createClient();

      const { data: products, error: productsError } = await supabase
        .from("products")
        .select(`*, media:product_media(id, url, type)`)
        .eq("farm_id", farmId)
        .order("name", { ascending: true });

      if (productsError) {
        throw new Error(
          "Failed to fetch seller's farms" + productsError.message
        );
      }

      return products;
    },
    enabled: !!farmId,
  });
}
