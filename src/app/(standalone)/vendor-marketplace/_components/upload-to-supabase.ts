import { createClient } from "@/utils/supabase/client";

export const uploadToSupabase = async (file: File): Promise<string> => {
  const supabase = await createClient();
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()
      .toString(36)
      .substring(2, 15)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error } = await supabase.storage
      .from("farm_media")
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from("farm_media")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading to Supabase:", error);
    throw new Error("Failed to upload file");
  }
};
