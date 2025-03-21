"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { v4 as uuidv4 } from "uuid"
import { createClient } from "@/utils/supabase/client"

export type UploadedMedia = {
  url: string
  type: "image" | "video"
  name: string
  size: number
}

type UploadProgress = Record<string, number>

interface UseSupabaseUploadsResult {
  uploadMedia: (files: File[]) => Promise<UploadedMedia[]>
  isUploading: boolean
  progress: UploadProgress
  error: Error | null
}

export function useSupabaseUploads(): UseSupabaseUploadsResult {
  const [progress, setProgress] = useState<UploadProgress>({})
  const supabase = createClient()

  const uploadMutation = useMutation<UploadedMedia[], Error, File[]>({
    mutationFn: async (files) => {
      if (!files.length) return []

      const tempId = uuidv4() // Generate a temporary ID for the product
      const uploadedMedia: UploadedMedia[] = []
      const newProgress = { ...progress }

      // Process each file
      for (const file of files) {
        const fileId = uuidv4()
        newProgress[fileId] = 0
        setProgress(newProgress)

        // Determine file type
        const isVideo = file.type.startsWith("video/")
        const fileType = isVideo ? "video" : "image"

        // Create a unique file name with safe extension handling
        let fileExt = file.name.split(".").pop() || ""
        if (!fileExt) {
          fileExt = isVideo ? "mp4" : "jpg"
        }

        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `products/${tempId}/${fileName}`

        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage.from("product-media").upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
          // Note: Supabase does not support onUploadProgress. Progress tracking needs to be handled externally.
        })

        if (error) {
          console.error("Error uploading file:", error)
          throw new Error(`Failed to upload ${file.name}: ${error.message}`)
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage.from("product-media").getPublicUrl(filePath)

        uploadedMedia.push({
          url: publicUrlData.publicUrl,
          type: fileType,
          name: file.name,
          size: file.size,
        })
      }

      return uploadedMedia
    },
  })

  const uploadMedia = async (files: File[]): Promise<UploadedMedia[]> => {
    return uploadMutation.mutateAsync(files)
  }

  return {
    uploadMedia,
    isUploading: uploadMutation.isPending,
    progress,
    error: uploadMutation.error,
  }
}

