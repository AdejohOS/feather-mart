import { Product } from "@/types/types";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";

type ProductWithFarm = Product & {
  farm: {
    id: string;
    name: string;
  } | null;
};

export function useGetProducts() {
  return useQuery<ProductWithFarm[]>({
    queryKey: ["products"],
    queryFn: async (): Promise<ProductWithFarm[]> => {
      const supabase = await createClient();

      const { data: products, error: productsError } = await supabase
        .from("products")
        .select(`*, media:product_media(id, url, type), farm:farms(id, name)`)
        .order("created_at", { ascending: false });

      if (productsError) {
        throw new Error("Failed to fetch products" + productsError.message);
      }

      return products ?? [];
    },
  });
}

export function useGetProduct(productId: string) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const supabase = await createClient();

      const { data: product, error: productError } = await supabase
        .from("products")
        .select(
          `*, farm: farms(id, name, address, city, state), media:product_media(*)`
        )
        .eq("id", productId)
        .single();

      if (productError)
        throw new Error("Failed to fetch product: " + productError.message);
      if (!product) throw new Error("Product not found");

      return product;
    },

    enabled: !!productId,
  });
}

export function useGetRelatedProducts(
  productFarmId: string,
  productId: string
) {
  return useQuery({
    queryKey: ["related-products", productFarmId, productId],
    queryFn: async () => {
      const supabase = await createClient();

      const { data: products, error: productsError } = await supabase
        .from("products")
        .select(`*, media:product_media(id, url, type), farm:farms(*)`)
        .eq("farm_id", productFarmId)
        .neq("id", productId)
        .limit(4);

      if (productsError) {
        throw new Error("Failed to fetch products" + productsError.message);
      }

      return products ?? [];
    },
    enabled: !!productFarmId && !!productId,
  });
}
