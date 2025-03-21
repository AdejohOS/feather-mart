'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { uploadToSupabase } from './upload-to-supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { FileImage, FileVideo, Loader, Trash2, Upload, X } from 'lucide-react'
import { FileInfo } from '@/types/types'
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@/utils/supabase/client'

interface FileUploadPrpos {
  onFilesChange: (files: FileInfo[]) => void
  value?: FileInfo[]
}
export const FileUpload = ({ onFilesChange, value = [] }: FileUploadPrpos) => {
  const [files, setFiles] = useState<FileInfo[]>(value)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setUploading(true)
    const newFiles: FileInfo[] = []
    const fileArray = Array.from(e.target.files)
    const supabase = await createClient()

    try {
      for (const file of fileArray) {
        if (
          !file.type.startsWith('image/') &&
          !file.type.startsWith('video/')
        ) {
          continue
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `uploads/${fileName}`

        const { data, error } = await supabase.storage
          .from('farm_media')
          .upload(filePath, file)

        if (error) {
          console.error('Error uploading file:', error)
          continue
        }

        const {
          data: { publicUrl }
        } = supabase.storage.from('farm_media').getPublicUrl(filePath)

        newFiles.push({
          url: publicUrl,
          name: file.name,
          size: file.size,
          type: file.type,
          path: filePath
        })
      }

      const updatedFiles = [...files, ...newFiles]
      setFiles(updatedFiles)
      onFilesChange(updatedFiles)
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Error uploading file. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeFile = async (index: number) => {
    const supabase = await createClient()
    try {
      const fileToRemove = files[index]
      const { error } = await supabase.storage
        .from('farm_media')
        .remove([fileToRemove.path])

      if (error) {
        console.error('Error removing file from storage:', error)
      }

      const updatedFiles = files.filter((_, i) => i !== index)
      setFiles(updatedFiles)
      onFilesChange(updatedFiles)
    } catch (error) {
      console.error('Error removing file:', error)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <Button
          type='button'
          variant='outline'
          onClick={triggerFileInput}
          disabled={uploading}
        >
          <Upload className='mr-2 h-4 w-4' />
          {uploading ? (
            <span className='flex items-center gap-2'>
              <Loader className='size-4 animate-spin' />
              Uploading...
            </span>
          ) : (
            'Upload Files'
          )}
        </Button>
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept='image/*,video/*'
          className='hidden'
        />
      </div>

      {files.length > 0 && (
        <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {files.map((file, index) => (
            <div
              key={index}
              className='relative flex items-center gap-3 rounded-md border p-3'
            >
              {file.type.startsWith('image/') ? (
                <FileImage className='h-8 w-8 text-blue-500' />
              ) : (
                <FileVideo className='h-8 w-8 text-red-500' />
              )}
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium'>{file.name}</p>
                <p className='text-xs text-gray-500'>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => removeFile(index)}
                className='h-8 w-8'
              >
                <Trash2 className='h-4 w-4 text-red-500' />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
