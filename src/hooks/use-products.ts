
import { Product } from "@/types/types";
import { createClient } from "@/utils/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UploadedMedia } from "./use-supabase-uploads";
import { toast } from "sonner";

export type ProductFormData = {
    id?: string
    name: string
    description: string
    category: string
    breed?: string
    age?: string
    weight?: string
    farmId?: string
    price: number
    discountPrice?: number
    stock: number
    unit: string
    minimumOrder?: number
    availableDate?: Date
    sku?: string
    isOrganic: boolean
    isFreeRange: boolean
    isAntibiotic: boolean
    isHormone: boolean
    isVaccinated: boolean
    isAvailable: boolean
    tags?: string[]
    nutritionalInfo?: string
    storageInstructions?: string
    origin?: string
    uploadedMedia?: UploadedMedia[]
  }
  


export const useCreateProduct = () => {
    return useMutation({
      mutationFn: async (formData: ProductFormData) => {
        
        const supabase = await createClient()
       
        const { data: sessionData } = await supabase.auth.getSession()

        if (!sessionData.session?.user) {
          throw new Error("You must be logged in to create a product")
        }

        const user = sessionData.session.user

        // Insert the product into Supabase
        const { data, error } = await supabase
          .from("products")
          .insert([
            {
              seller_id: user.id,
              farm_id: formData.farmId,
              name: formData.name,
              description: formData.description,
              category: formData.category,
              breed: formData.breed,
              age: formData.age,
              weight: formData.weight,
              price: formData.price,
              discount_price: formData.discountPrice,
              stock: formData.stock,
              unit: formData.unit,
              minimum_order: formData.minimumOrder,
              available_date: formData.availableDate ? formData.availableDate.toISOString().split("T")[0] : null,
              sku: formData.sku,
              is_organic: formData.isOrganic,
              is_free_range: formData.isFreeRange,
              is_antibiotic: formData.isAntibiotic,
              is_hormone: formData.isHormone,
              is_vaccinated: formData.isVaccinated,
              is_available: formData.isAvailable,
              tags: formData.tags,
              nutritional_info: formData.nutritionalInfo,
              storage_instructions: formData.storageInstructions,
              origin: formData.origin,
              created_at: new Date().toISOString(),
            },
          ])
          .select()

        if (error) {
          throw new Error(`Error creating product: ${error.message}`)
        }

        const productId = data[0].id

        // Handle uploaded media if there is any
        if (formData.uploadedMedia && formData.uploadedMedia.length > 0) {
          const mediaEntries = formData.uploadedMedia.map((media) => ({
            product_id: productId,
            url: media.url,
            type: media.type,
            created_at: new Date().toISOString(),
          }))

          const { error: mediaError } = await supabase.from("product_media").insert(mediaEntries)

          if (mediaError) {
            console.error("Error saving media entries:", mediaError)
            // We don't fail the whole operation if media upload fails
          }
        }

        return { ...data[0], id: productId }
      },
      onSuccess: () => {
        const queryClient = useQueryClient()
        queryClient.invalidateQueries({ queryKey: ["products"] })
        toast.success( "Product created successfully!",
        )
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }

export const useUpdateProduct = () => {
  return useMutation({
    mutationFn: async (formData: ProductFormData) => {
      
      const supabase = await createClient()
      if (!formData.id) {
        throw new Error("Product ID is required for updates")
      }

      // Get the current user session
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session?.user) {
        throw new Error("You must be logged in to update a product")
      }

      // First check if the product belongs to the current user
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("seller_id")
        .eq("id", formData.id)
        .single()

      if (fetchError) {
        throw new Error(`Error fetching product: ${fetchError.message}`)
      }

      if (product.seller_id !== sessionData.session.user.id) {
        throw new Error("You can only update your own products")
      }

      // Update the product in Supabase
      const { data, error } = await supabase
        .from("products")
        .update({
          farm_id: formData.farmId,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          breed: formData.breed,
          age: formData.age,
          weight: formData.weight,
          price: formData.price,
          discount_price: formData.discountPrice,
          stock: formData.stock,
          unit: formData.unit,
          minimum_order: formData.minimumOrder,
          available_date: formData.availableDate ? formData.availableDate.toISOString().split("T")[0] : null,
          sku: formData.sku,
          is_organic: formData.isOrganic,
          is_free_range: formData.isFreeRange,
          is_antibiotic: formData.isAntibiotic,
          is_hormone: formData.isHormone,
          is_vaccinated: formData.isVaccinated,
          is_available: formData.isAvailable,
          tags: formData.tags,
          nutritional_info: formData.nutritionalInfo,
          storage_instructions: formData.storageInstructions,
          origin: formData.origin,
        })
        .eq("id", formData.id)
        .select()

      if (error) {
        throw new Error(`Error updating product: ${error.message}`)
      }

      // Handle uploaded media if there is any new media
      if (formData.uploadedMedia && formData.uploadedMedia.length > 0) {
        // We can't filter by ID since UploadedMedia doesn't have an ID property
        // Instead, we'll assume all media in uploadedMedia are new and need to be inserted
        const mediaEntries = formData.uploadedMedia.map((media) => ({
          product_id: formData.id || "",
          url: media.url,
          type: media.type,
          created_at: new Date().toISOString(),
        }))

        const { error: mediaError } = await supabase.from("product_media").insert(mediaEntries)

        if (mediaError) {
          console.error("Error saving media entries:", mediaError)
          // We don't fail the whole operation if media upload fails
        }
      }

      return data[0]
    },
    onSuccess: (data) => {
      const queryClient = useQueryClient()
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["products", data.id] })
      toast.success( "Product updated successfully!",
      )
    },
    onError: (error) => {
      toast.error(error.message,
        )
    },
  })
}

   export function  useGetProducts(){
        return useQuery<Product[]>({
            queryKey: ["products"],
            queryFn: async (): Promise<Product[]> => {
                const supabase = await createClient()

                const {data: {user}, error: userError} = await supabase.auth.getUser()
                if(!user || userError){
                    throw new  Error("Authentication required")
                }
            
                const {data:products, error: productsError} = await supabase.from("products").select(`*, media:product_media(id, url, type)`).eq("seller_id", user.id).order("created_at", {ascending: false})
            
            if (productsError){
                throw new Error(productsError.message)
            }
            
            return products ?? []
            },
            
        })
    }

   export function useGetProduct(productId: string){
    return useQuery({
        queryKey: ["product", productId],
        queryFn: async () => {
            const supabase = await createClient()

            const {data: {user}, error: userError} = await supabase.auth.getUser()
            if(!user || userError){
                throw new Error("Authentication required")
            }

            const {data:product, error: productError} = await supabase.from("products").select(`*, farms: farm_id(id, name, address), media:product_media(*)`).eq("id", productId).single()
            if(productError){
                throw new Error(productError.message)
            }

            return product
        },
        
        enabled: !!productId,
    })
    }



