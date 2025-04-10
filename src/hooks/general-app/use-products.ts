import { createClient } from "@/utils/supabase/client"
import { useQuery } from "@tanstack/react-query"

export function useGetProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const supabase = await createClient()

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`*, media:product_media(id, url, type)`)

      if (productsError) {
        throw new Error('Failed to fetch products' + productsError.message)
      }

      return products.map(product => ({
        ...product,
        image: product.media?.[0]?.url
      }))
    }
  })
}

