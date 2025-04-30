"use server";

import { createClient } from "@/utils/supabase/server";
import {
  CreateFarmSchema,
  CreateFarmValues,
  CreateProductSchema,
  UpdateFarmSchema,
  UpdateFarmValues,
  UpdateProfileSchema,
} from "./schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { HousingSystem, PoultryType } from "@/types/types";
import { deleteProductMedia } from "@/lib/upload-product";

type MediaItem = {
  url: string;
  path: string;
  name: string;
  type: string;
  size: number;
};

type UploadedMediaItem = {
  url: string;
  type: string;
};

export const updateProfileAction = async (
  prevState: { success: boolean; error: string | null },
  formData: FormData
) => {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User authentication error:", userError);
      throw new Error("User not authenticated");
    }

    const profileData = {
      name: formData.get("full_name") as string,
      username: formData.get("username") as string,
      phone_number: formData.get("phone_number") as string,
    };

    const validatedData = UpdateProfileSchema.safeParse(profileData);

    if (!validatedData.success) {
      return {
        success: false,
        error: validatedData.error.issues[0]?.message || "Invalid input data.",
      };
    }

    const { error } = await supabase
      .from("profiles")
      .update(validatedData.data)
      .eq("id", user.id);

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to update profile",
      };
    }

    revalidatePath("/vendor-marketplace/settings");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update profile",
    };
  }
};

export type FormState = {
  errors?: {
    name?: string[];
    description?: string[];
    category?: string[];
    farmId?: string[];
    price?: string[];
    discountPrice?: string[];
    stock?: string[];
    unit?: string[];
    minimumOrder?: string[];
    media?: string[];
  };
  message?: string;
  success?: boolean;
  productId?: string;
};

export async function createProductAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user || userError) {
      return {
        success: false,
        message: "Authentication error",
      };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "seller") {
      return {
        success: false,
        message: "Seller priviledge required",
      };
    }

    const rawFormData = Object.fromEntries(formData.entries());

    const formDataObject = { ...rawFormData } as Record<string, unknown>;

    if (typeof formDataObject.availableDate === "string") {
      formDataObject.availableDate = new Date(formDataObject.availableDate);
    }

    const booleanFields = [
      "isOrganic",
      "isFreeRange",
      "isAntibiotic",
      "isHormone",
      "isVaccinated",
      "isAvailable",
    ];
    booleanFields.forEach((field) => {
      formDataObject[field] =
        formDataObject[field] === "on" || formDataObject[field] === "true";
    });

    if (formDataObject.tags && typeof formDataObject.tags === "string") {
      try {
        formDataObject.tags = JSON.parse(formDataObject.tags);
      } catch (e) {
        formDataObject.tags = [];
      }
    }

    const validatedData = CreateProductSchema.safeParse(formDataObject);

    if (!validatedData.success) {
      return {
        success: false,
        errors: validatedData.error.flatten().fieldErrors,
        message:
          "Form valiation failed, please check the fields and try again.",
      };
    }

    const productData = {
      seller_id: user.id,
      farm_id: validatedData.data.farmId || null,
      name: validatedData.data.name,
      description: validatedData.data.description,
      category: validatedData.data.category,
      breed: validatedData.data.breed || null,
      age: validatedData.data.age || null,
      weight: validatedData.data.weight || null,
      price: validatedData.data.price,
      discount_price: validatedData.data.discountPrice ?? null,
      stock: validatedData.data.stock,
      unit: validatedData.data.unit,
      minimum_order: validatedData.data.minimumOrder,
      available_date: validatedData.data.availableDate
        ? new Date(validatedData.data.availableDate).toISOString().split("T")[0]
        : null,
      sku: validatedData.data.sku,
      is_organic: validatedData.data.isOrganic ?? false,
      is_free_range: validatedData.data.isFreeRange ?? false,
      is_antibiotic: validatedData.data.isAntibiotic ?? false,
      is_hormone: validatedData.data.isHormone ?? false,
      is_vaccinated: validatedData.data.isVaccinated ?? false,
      is_available: validatedData.data.isAvailable ?? false,
      tags: Array.isArray(validatedData.data.tags)
        ? validatedData.data.tags
        : [],
      nutritional_info: validatedData.data.nutritionalInfo,
      storage_instructions: validatedData.data.storageInstructions || null,
      origin: validatedData.data.origin || null,
    };

    const { data, error } = await supabase
      .from("products")
      .insert(productData)
      .select();

    if (error) {
      console.error("Error inserting product:", error);
      return {
        message: `Database error: ${error.message}`,
        success: false,
      };
    }

    const productId = data[0].id;
    // Handle uploaded media if there is any
    if (validatedData.data.uploadedMedia) {
      try {
        const uploadedMedia = JSON.parse(validatedData.data.uploadedMedia);

        // Save media entries to database
        if (uploadedMedia.length > 0) {
          const mediaEntries = uploadedMedia.map(
            (media: UploadedMediaItem) => ({
              product_id: productId,
              url: media.url,
              type: media.type,
            })
          );

          const { error: mediaError } = await supabase
            .from("product_media")
            .insert(mediaEntries);

          if (mediaError) {
            console.error("Error saving media entries:", mediaError);
          }
        }
      } catch (uploadError) {
        console.error("Error handling media uploads:", uploadError);
        // We don't fail the whole operation if media upload fails
        // Just log the error and continue
      }
    }

    revalidatePath("/vendor-marketplace/products");

    return {
      message: "Product created successfully!",
      success: true,
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      message: `An unexpected error occurred: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      success: false,
    };
  }
}

export async function updateProductAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        message: "You must be logged in to update a product",
        success: false,
      };
    }

    const productId = formData.get("id") as string;

    if (!productId) {
      return {
        message: "Product Id is required for updates",
        success: false,
      };
    }

    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("seller_id, id")
      .eq("seller_id", user.id)
      .eq("id", productId)
      .single();

    if (fetchError) {
      return {
        message: `Error fetching product: ${fetchError.message}`,
        success: false,
      };
    }

    if (product.seller_id !== user.id) {
      return {
        message: "You can only update your own products",
        success: false,
      };
    }

    const rawFormData = Object.fromEntries(formData.entries());

    // Handle special fields
    const formDataObject = { ...rawFormData } as Record<string, unknown>;

    // Handle date fields
    if (typeof formDataObject.availableDate === "string") {
      formDataObject.availableDate = new Date(formDataObject.availableDate);
    }
    // Handle boolean fields
    const booleanFields = [
      "isOrganic",
      "isFreeRange",
      "isAntibiotic",
      "isHormone",
      "isVaccinated",
      "isAvailable",
    ];
    booleanFields.forEach((field) => {
      formDataObject[field] =
        formDataObject[field] === "on" || formDataObject[field] === "true";
    });

    // Handle tags (assuming they come as a JSON string)
    if (formDataObject.tags && typeof formDataObject.tags === "string") {
      try {
        formDataObject.tags = JSON.parse(formDataObject.tags);
      } catch (e) {
        formDataObject.tags = [];
      }
    }

    const validatedData = CreateProductSchema.safeParse(formDataObject);

    if (!validatedData.success) {
      return {
        success: false,
        errors: validatedData.error.flatten().fieldErrors,
        message:
          "Form valiation failed, please check the fields and try again.",
      };
    }

    const productData = {
      farm_id: validatedData.data.farmId || null,
      name: validatedData.data.name,
      description: validatedData.data.description,
      category: validatedData.data.category,
      breed: validatedData.data.breed || null,
      age: validatedData.data.age || null,
      weight: validatedData.data.weight || null,
      price: validatedData.data.price,
      discount_price: validatedData.data.discountPrice ?? null,
      stock: validatedData.data.stock,
      unit: validatedData.data.unit,
      minimum_order: validatedData.data.minimumOrder,
      available_date: validatedData.data.availableDate
        ? new Date(validatedData.data.availableDate).toISOString().split("T")[0]
        : null,
      sku: validatedData.data.sku,
      is_organic: validatedData.data.isOrganic ?? false,
      is_free_range: validatedData.data.isFreeRange ?? false,
      is_antibiotic: validatedData.data.isAntibiotic ?? false,
      is_hormone: validatedData.data.isHormone ?? false,
      is_vaccinated: validatedData.data.isVaccinated ?? false,
      is_available: validatedData.data.isAvailable ?? false,
      tags: Array.isArray(validatedData.data.tags)
        ? validatedData.data.tags
        : [],
      nutritional_info: validatedData.data.nutritionalInfo,
      storage_instructions: validatedData.data.storageInstructions || null,
      origin: validatedData.data.origin || null,
    };

    const { data, error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", productId);

    if (error) {
      console.error("Error inserting product:", error);
      return {
        message: `Database error: ${error.message}`,
        success: false,
      };
    }

    if (validatedData.data.uploadedMedia) {
      try {
        const uploadedMedia = JSON.parse(validatedData.data.uploadedMedia);

        // Save media entries to database
        if (uploadedMedia.length > 0) {
          const mediaEntries = uploadedMedia.map(
            (media: UploadedMediaItem) => ({
              product_id: productId,
              url: media.url,
              type: media.type,
            })
          );

          const { error: mediaError } = await supabase
            .from("product_media")
            .insert(mediaEntries);

          if (mediaError) {
            console.error("Error saving media entries:", mediaError);
          }
        }
      } catch (uploadError) {
        console.error("Error handling media uploads:", uploadError);
        // We don't fail the whole operation if media upload fails
        // Just log the error and continue
      }
    }
    revalidatePath("/vendor-marketplace/products");
    revalidatePath(`/vendor-marketplace/products/${productId}`);

    return {
      message: "Product updated successfully!",
      success: true,
      productId,
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      message: `An unexpected error occurred: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      success: false,
    };
  }
}

export async function deleteMediaAction(mediaId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return {
      success: false,
      message: "You must be logged in to delete media",
    };
  }
  try {
    const { data: existingMedia, error: existingMediaError } = await supabase
      .from("product_media")
      .select("product_id, id")
      .eq("id", mediaId)
      .single();
    if (!existingMedia || existingMediaError) {
      return {
        success: false,
        message: `Error fetching media ${existingMediaError.message}`,
      };
    }

    const { data: product, error: fetchProductError } = await supabase
      .from("products")
      .select("seller_id")
      .eq("id", existingMedia.product_id)
      .single();
    if (fetchProductError) {
      return {
        success: false,
        message: `Error fetching product: ${fetchProductError.message}`,
      };
    }

    if (product.seller_id !== user.id) {
      return {
        success: false,
        message: "You can only delete media for your own products",
      };
    }

    const success = await deleteProductMedia(mediaId);
    if (!success) {
      return { success: false, message: "Failed to delete media" };
    }
    return { success: true, message: "Media deleted successfully" };
  } catch (error) {
    console.error("Error deleting media:", error);
    return {
      success: false,
      message: `An unexpected error occurred: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

//new
export async function deleteProductAction(productId: string) {
  const supabase = await createClient();
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "You must be logged in to delete a product",
      };
    }

    const { data: existingProduct, error: existingProductError } =
      await supabase
        .from("products")
        .select("seller_id")
        .eq("id", productId)
        .eq("seller_id", user.id)
        .single();
    if (existingProductError) {
      return {
        success: false,
        message: `Error fetching product: ${existingProductError.message}`,
      };
    }

    if (existingProduct.seller_id !== user.id) {
      return {
        success: false,
        message: "You can only delete your own products",
      };
    }

    // Delete media files
    const { data: mediaItems, error: mediaError } = await supabase
      .from("product_media")
      .select("*")
      .eq("product_id", productId);

    if (mediaError) {
      return {
        success: false,
        message: `Error fetching product: ${mediaError}`,
      };
    }

    // Delete accompanying media
    if (mediaItems && mediaItems.length > 0) {
      const filePaths = mediaItems
        .map((item) => {
          const url = item.url;

          const pathMatch = url.match(/product-media\/(.+)$/);
          return pathMatch ? pathMatch[1] : null;
        })
        .filter((path): path is string => path !== null);

      if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("product-media")
          .remove(filePaths);

        if (storageError) {
          console.error(
            "Error deleting media files from storage:",
            storageError
          );
        }
      }

      const { error: deleteMediaError } = await supabase
        .from("product_media")
        .delete()
        .eq("product_id", productId);

      if (deleteMediaError) {
        console.error("Error deleting media records:", deleteMediaError);
      }
    }

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (deleteError) {
      return {
        success: false,
        message: `Error deleting product: ${deleteError.message}`,
      };
    }

    revalidatePath("/vendor-marketplace/products");

    return {
      success: true,
      message: "Product deleted successfully.",
    };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      message: `An unexpected error occurred: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

export async function deleteMedia(mediaId: string) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "You must be logged in to delete a product",
      };
    }
    // First check if the media belongs to the current user's product
    const { data: media, error: fetchMediaError } = await supabase
      .from("product_media")
      .select("product_id")
      .eq("id", mediaId)
      .single();

    if (fetchMediaError) {
      return {
        success: false,
        message: `Error fetching media: ${fetchMediaError.message}`,
      };
    }

    // Check if the product belongs to the current user
    const { data: product, error: fetchProductError } = await supabase
      .from("products")
      .select("seller_id")
      .eq("id", media.product_id)
      .single();

    if (fetchProductError) {
      return {
        success: false,
        message: `Error fetching product: ${fetchProductError.message}`,
      };
    }

    if (product.seller_id !== user.id) {
      return {
        success: false,
        message: "You can only delete media for your own products",
      };
    }

    // Delete the media from storage and database
    const success = await deleteProductMedia(mediaId);

    if (!success) {
      return { success: false, message: "Failed to delete media" };
    }

    return { success: true, message: "Media deleted successfully" };
  } catch (error) {
    console.error("Error deleting media:", error);
    return {
      success: false,
      message: `An unexpected error occurred: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}
