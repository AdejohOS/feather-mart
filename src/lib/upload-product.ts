import { createClient } from "@/utils/supabase/server";
import { v4 as uuidv4 } from "uuid";

export type UploadedFile = {
  url: string;
  type: "image" | "video";
  name: string;
};

/**
 * Uploads files to Supabase Storage and returns their URLs
 */
export async function uploadProductMedia(
  productId: string,
  files: File[]
): Promise<UploadedFile[]> {
  const supabase = await createClient();
  if (!files.length) return [];

  const uploadedFiles: UploadedFile[] = [];
  const errors: string[] = [];

  for (const file of files) {
    try {
      // Determine file type
      const isVideo = file.type.startsWith("video/");
      const fileType = isVideo ? "video" : "image";

      // Create a unique file name with safe extension handling
      let fileExt = file.name.split(".").pop() || "";
      if (!fileExt) {
        // Default extension based on mime type if none is found
        fileExt = isVideo ? "mp4" : "jpg";
      }

      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `products/${productId}/${fileName}`;

      // Upload file to Supabase Storage
      const { error } = await supabase.storage
        .from("product-media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type, // Explicitly set content type
        });

      if (error) {
        errors.push(`Failed to upload ${file.name}: ${error.message}`);
        console.error("Error uploading file:", error);
        continue;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("product-media")
        .getPublicUrl(filePath);

      uploadedFiles.push({
        url: publicUrlData.publicUrl,
        type: fileType,
        name: file.name,
      });
    } catch (err) {
      console.error("Unexpected error uploading file:", err);
      errors.push(`Unexpected error uploading ${file.name}`);
    }
  }

  // If there were errors but some files uploaded successfully, log them
  if (errors.length > 0 && uploadedFiles.length > 0) {
    console.warn("Some files failed to upload:", errors);
  }

  // If all files failed, throw an error
  if (errors.length > 0 && uploadedFiles.length === 0) {
    throw new Error(`Failed to upload files: ${errors.join(", ")}`);
  }

  return uploadedFiles;
}

/**
 * Saves uploaded media to the product_media table
 */
export async function saveProductMedia(
  productId: string,
  files: UploadedFile[]
): Promise<void> {
  const supabase = await createClient();
  if (!files.length) return;

  const mediaEntries = files.map((file) => ({
    product_id: productId,
    url: file.url,
    type: file.type,
    created_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("product_media").insert(mediaEntries);

  if (error) {
    console.error("Error saving media entries:", error);
    throw new Error(`Failed to save media: ${error.message}`);
  }
}

/**
 * Fetches media for a product
 */
export async function getProductMedia(productId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_media")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching product media:", error);
    return [];
  }

  return data || [];
}

/**
 * Extracts the storage path from a Supabase Storage URL
 */
function extractStoragePath(url: string): string | null {
  try {
    // Try to extract the path after the bucket name
    // This handles URLs like:
    // https://xyz.supabase.co/storage/v1/object/public/product-media/products/123/image.jpg
    const regex = /\/product-media\/(.+)$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Error extracting storage path:", error);
    return null;
  }
}

/**
 * Deletes media from storage and database
 */
export async function deleteProductMedia(mediaId: string): Promise<boolean> {
  const supabase = await createClient();
  try {
    // First get the media entry to get the URL
    const { data, error: fetchError } = await supabase
      .from("product_media")
      .select("url")
      .eq("id", mediaId)
      .single();

    if (fetchError) {
      console.error("Error fetching media:", fetchError);
      return false;
    }

    // Extract the path from the URL
    const url = data.url;
    const path = extractStoragePath(url);

    if (!path) {
      console.error("Could not extract storage path from URL:", url);
      // Continue with database deletion even if path extraction fails
    } else {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("product-media")
        .remove([path]);

      if (storageError) {
        console.error("Error deleting from storage:", storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("product_media")
      .delete()
      .eq("id", mediaId);

    if (dbError) {
      console.error("Error deleting from database:", dbError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error in deleteProductMedia:", error);
    return false;
  }
}
