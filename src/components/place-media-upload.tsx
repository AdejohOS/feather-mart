'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, X, FileVideo, Loader2, Loader } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

import { cn } from '@/lib/utils'

import { toast } from 'sonner'
import {
  useSupabaseUploads,
  type UploadedMedia
} from '@/hooks/use-supabase-uploads'
import { createClient } from '@/utils/supabase/client'
import { useQueryClient } from '@tanstack/react-query'

interface MediaUploadProps {
  form: any
  maxFiles?: number
  existingMedia?: UploadedMedia[]
  productId?: string
  onMediaUpdate?: (media: UploadedMedia[]) => void
}

export function MediaUpload({
  form,
  maxFiles = 5,
  existingMedia = [],
  productId,
  onMediaUpdate
}: MediaUploadProps) {
  const [previews, setPreviews] = useState<string[]>([])
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([])
  const queryClient = useQueryClient()

  const { uploadMedia, isUploading, progress, error } = useSupabaseUploads()

  // Initialize with existing media if provided
  useEffect(() => {
    if (existingMedia && existingMedia.length > 0) {
      // Set the existing media URLs as previews
      const existingPreviews = existingMedia.map(media => media.url)
      setPreviews(existingPreviews)
      setUploadedMedia(existingMedia)

      // Update form value with the existing media
      form.setValue('uploadedMedia', existingMedia)
    }
  }, [existingMedia, form])

  // Show error toast if upload fails
  useEffect(() => {
    if (error) {
      toast.error(error.message)
    }
  }, [error, toast])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (isUploading) return

      // Check file size (10MB max)
      const validFiles = acceptedFiles.filter(
        file => file.size <= 10 * 1024 * 1024
      )
      const oversizedFiles = acceptedFiles.length - validFiles.length

      if (oversizedFiles > 0) {
        toast.error(
          `${oversizedFiles} file(s) exceeded the 10MB size limit and were not added.`
        )
      }

      // Check file type
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4'
      ]
      const filteredFiles = validFiles.filter(file =>
        allowedTypes.includes(file.type)
      )

      if (filteredFiles.length < validFiles.length) {
        toast.error('Only JPG, PNG, GIF, WEBP, and MP4 files are supported.')
      }

      // Check if adding these files would exceed the max
      if (uploadedMedia.length + filteredFiles.length > maxFiles) {
        toast.error(`You can only upload a maximum of ${maxFiles} files.`)

        // Only add files up to the max
        const remainingSlots = maxFiles - uploadedMedia.length
        const filesToAdd = filteredFiles.slice(0, remainingSlots)

        if (filesToAdd.length > 0) {
          await handleUpload(filesToAdd)
        }
      } else if (filteredFiles.length > 0) {
        await handleUpload(filteredFiles)
      }
    },
    [uploadedMedia, maxFiles, toast, isUploading]
  )

  const handleUpload = async (files: File[]) => {
    try {
      // Create object URLs for previews
      const newPreviews = files.map(file => URL.createObjectURL(file))
      setPreviews(prev => [...prev, ...newPreviews])

      // Upload files to Supabase
      const newUploadedMedia = await uploadMedia(files)

      // Update state with successfully uploaded media
      setUploadedMedia(prev => [...prev, ...newUploadedMedia])

      // Update form value with the uploaded media data
      const allMedia = [...uploadedMedia, ...newUploadedMedia]
      form.setValue('uploadedMedia', allMedia)

      if (newUploadedMedia.length > 0) {
        toast.success(
          `Successfully uploaded ${newUploadedMedia.length} file(s)`
        )
      }
    } catch (error) {
      console.error('Error in upload process:', error)
    }
  }

  const removeFile = async (index: number) => {
    const supabase = await createClient()

    // Revoke the object URL to avoid memory leaks
    const mediaToRemove = uploadedMedia[index]

    const updatedPreviews = [...previews]
    const updatedMedia = [...uploadedMedia]

    URL.revokeObjectURL(previews[index])

    updatedPreviews.splice(index, 1)
    updatedMedia.splice(index, 1)

    setPreviews(updatedPreviews)
    setUploadedMedia(updatedMedia)

    form.setValue('uploadedMedia', updatedMedia)

    if (onMediaUpdate) {
      onMediaUpdate(updatedMedia)
    }

    if (productId && mediaToRemove.id) {
      try {
        const { error } = await supabase
          .from('product_media')
          .delete()
          .eq('id', mediaToRemove.id)

        if (error) {
          toast.error(`Failed to delete media: ${error.message}`)
          return
        }

        queryClient.invalidateQueries({ queryKey: ['product', productId] })

        toast.success('Media deleted successfully.')
      } catch (error) {
        console.error('Error deleting media:', error)
        toast.error('Failed to delete media.')
      }
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploading
  })

  return (
    <FormItem className='col-span-full'>
      <FormLabel>Product Media</FormLabel>
      <FormControl>
        <div className='space-y-4'>
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              'cursor-pointer rounded-lg border-2 border-dashed p-6 transition-colors',
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-primary/50',
              isUploading && 'cursor-not-allowed opacity-50'
            )}
          >
            <input {...getInputProps()} />
            <div className='flex flex-col items-center justify-center text-center'>
              {isUploading ? (
                <>
                  <Loader className='mb-2 h-10 w-10 animate-spin text-primary' />
                  <p className='text-sm font-medium'>Uploading files...</p>
                </>
              ) : (
                <>
                  <Upload className='mb-2 h-10 w-10 text-muted-foreground' />
                  <p className='text-sm font-medium'>
                    {isDragActive
                      ? 'Drop files here'
                      : 'Drag & drop files here'}
                  </p>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    or click to browse
                  </p>
                </>
              )}
              <p className='mt-2 text-xs text-muted-foreground'>
                JPG, PNG, GIF, WEBP, MP4 up to 10MB (max {maxFiles} files)
              </p>
            </div>
          </div>

          {/* Preview area */}
          {previews.length > 0 && (
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
              {previews.map((preview, index) => (
                <Card key={index} className='group relative overflow-hidden'>
                  <div className='relative aspect-square'>
                    {uploadedMedia[index]?.type === 'video' ? (
                      <div className='absolute inset-0 flex items-center justify-center bg-black/5'>
                        <FileVideo className='h-8 w-8 text-muted-foreground' />
                        <video
                          src={preview}
                          className='absolute inset-0 h-full w-full object-cover'
                          muted
                        />
                      </div>
                    ) : (
                      <img
                        src={preview || '/placeholder.svg'}
                        alt={`Preview ${index}`}
                        className='h-full w-full object-cover'
                      />
                    )}

                    {/* Upload progress overlay */}
                    {progress[preview] !== undefined &&
                      progress[preview] < 100 && (
                        <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
                          <div className='font-medium text-white'>
                            {progress[preview]}%
                          </div>
                        </div>
                      )}

                    <Button
                      type='button'
                      variant='destructive'
                      size='icon'
                      className='absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100'
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                    >
                      <X className='h-3 w-3' />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </FormControl>
      <FormDescription>
        Upload up to {maxFiles} images or videos of your product. The first
        image will be used as the main product image.
      </FormDescription>
      <FormMessage />
    </FormItem>
  )
}
