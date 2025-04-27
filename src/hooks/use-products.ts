import { Product } from "@/types/types";
import { createClient } from "@/utils/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/app/(standalone)/vendor-marketplace/products/action";

type ProductWithMedia = Product & {
  media: {
    id: string;
    url: string;
    type: string;
  }[];
};

export function useGetProducts() {
  return useQuery<ProductWithMedia[]>({
    queryKey: ["products"],
    queryFn: async (): Promise<ProductWithMedia[]> => {
      const supabase = await createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (!user || userError) {
        return [];
      }

      const { data: products, error: productsError } = await supabase
        .from("products")
        .select(`*, media:product_media(id, url, type)`)
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (productsError) {
        throw new Error(productsError.message);
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

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (!user || userError) {
        throw new Error("Authentication required");
      }

      const { data: product, error: productError } = await supabase
        .from("products")
        .select(`*, farms: farm_id(id, name, address), media:product_media(*)`)
        .eq("id", productId)
        .single();
      if (productError) {
        throw new Error(productError.message);
      }

      return product;
    },

    enabled: !!productId,
  });
}

// new

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      // Get the current user session
      const response = await createProductAction({}, formData);

      if (!response.success) {
        throw new Error(response.message || "Failed to create farm");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await updateProductAction({}, formData);
      // First check if the product belongs to the current user
      if (!response.success) {
        throw new Error(response.message || "Failed to update product");
      }
      return response;
    },

    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({
        queryKey: ["product", response.productId],
      });
      toast.success("Product updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await deleteProductAction(productId);

      if (!response.success) {
        throw new Error(response.message || "Failed to delete product");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      mediaId,
      productId,
    }: {
      mediaId: string;
      productId: string;
    }) => {
      return { mediaId, productId };
    },
    onSuccess: ({ productId }) => {
      queryClient.invalidateQueries({ queryKey: ["products", productId] });
      toast.success("Media deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
