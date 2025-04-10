import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  try {
    // Create the product-media bucket if it doesn't exist
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets()

    if (bucketsError) {
      return NextResponse.json({ error: bucketsError.message }, { status: 500 })
    }

    const bucketExists = buckets.some(bucket => bucket.name === 'product-media')

    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(
        'product-media',
        {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'video/mp4'
          ]
        }
      )

      if (createError) {
        return NextResponse.json(
          { error: createError.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Storage bucket setup complete'
    })
  } catch (error) {
    console.error('Error setting up storage:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
