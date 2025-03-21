import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DottedSeparator } from '@/components/ui/dotted-separator'
import { capitalizeFirst, formatNumber } from '@/lib/utils'
import { Farm, FarmTypes } from '@/types/types'
import { createClient } from '@/utils/supabase/client'

import {
  Globe,
  ImageIcon,
  Loader,
  Mail,
  MapPin,
  PenBoxIcon,
  PhoneCall,
  VideoIcon
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

interface FarmListProps {
  farm: FarmTypes
}

type MediaItem = {
  url: string
  name: string
  path: string
  size: number
  type: string
}

export const FarmList = ({ farm }: FarmListProps) => {
  const supabase = createClient()

  const mediaItems: MediaItem[] = Array.isArray(farm.media)
    ? farm.media.filter(
        (item): item is MediaItem =>
          typeof item === 'object' &&
          item !== null &&
          'url' in item &&
          'type' in item
      )
    : []

  const getMediaUrl = (mediaItem: MediaItem) => {
    if (!mediaItem.url.startsWith('http')) {
      return supabase.storage.from('farm_media').getPublicUrl(mediaItem.path)
        .data.publicUrl
    }
    return mediaItem.url
  }

  const router = useRouter()

  return (
    <div className='text-muted-foreground'>
      <div className='space-y-1'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <h3 className='text-xl font-bold'>{farm.name}</h3>
            {farm.is_approved === true ? (
              <Badge className='bg-green-50 text-green-600 hover:bg-green-100'>
                Farm approved
              </Badge>
            ) : (
              <Badge className='bg-yellow-50 text-yellow-600 hover:bg-yellow-100'>
                Approval pending
              </Badge>
            )}
          </div>

          <Button
            variant='secondary'
            size='xs'
            onClick={() =>
              router.push(`/vendor-marketplace/farms/update/${farm.id}`)
            }
            className='flex items-center gap-2'
          >
            <PenBoxIcon className='size-2' />
            Update Farm
          </Button>
        </div>

        <address className='flex items-center gap-2'>
          <MapPin className='size-4 text-teal-600' />
          <p>
            {farm.address}, {farm.state}, {farm.country}
          </p>
        </address>
        <p className='flex items-center gap-2'>
          <PhoneCall className='size-4 text-teal-600' /> {farm.phone_number}
        </p>
        <p className='flex items-center gap-2'>
          <Mail className='size-4 text-teal-600' />
          {farm.farm_email}
        </p>
        <p className='flex items-center gap-2'>
          <Globe className='size-4 text-teal-600' />
          {farm.website ? (
            <>{farm.website}</>
          ) : (
            <em className='text-sm'>Update to provide website</em>
          )}
        </p>
        <p className='mt-2 rounded-md bg-neutral-50 p-4 text-sm'>
          <em>" {farm.description} "</em>
        </p>
      </div>

      <DottedSeparator className='my-7' />

      <div className='space-y-1'>
        <p>
          <strong>Poultry type:</strong> {capitalizeFirst(farm.poultry_type)}
        </p>
        <p>
          {' '}
          <strong>Housing type :</strong> {capitalizeFirst(farm.housing_system)}
        </p>
        <p>
          <strong>Capacity:</strong> {formatNumber(farm.capacity)} birds
        </p>
        <div className='flex items-center gap-2'>
          <strong>Certifications:</strong>{' '}
          <span className='flex items-center gap-3'>
            {farm.certifications && farm.certifications.length > 0 ? (
              farm.certifications?.map((cert, index) => (
                <Badge key={index} variant='secondary'>
                  {cert}
                </Badge>
              ))
            ) : (
              <em className='text-sm'>No certificate available</em>
            )}
          </span>
        </div>
      </div>
      <DottedSeparator className='my-7' />
      <h2 className='mb-4'>
        <strong>Farm Media:</strong>
      </h2>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3'>
        {mediaItems.length > 0 ? (
          mediaItems.map((mediaItem, index) => {
            const mediaUrl = getMediaUrl(mediaItem) // Get the correct URL
            const isImage = mediaItem.type.startsWith('image/')
            const isVideo = mediaItem.type.startsWith('video/')

            return (
              <div key={index} className='relative aspect-video'>
                {isImage && (
                  <Zoom>
                    <div className='h-full w-full'>
                      <Image
                        src={mediaUrl}
                        alt={mediaItem.name}
                        loading='lazy'
                        fill
                        className='rounded-md object-cover'
                      />
                    </div>
                    <p className='absolute left-1 top-1'>
                      <ImageIcon className='size-4' />
                    </p>
                  </Zoom>
                )}
                {isVideo && (
                  <div className='relative h-full w-full'>
                    <video
                      controls
                      className='h-full w-full rounded-md object-cover'
                    >
                      <source src={mediaUrl} type={mediaItem.type} />
                      Your browser does not support videos.
                    </video>
                    <p className='absolute left-1 top-1'>
                      <VideoIcon className='size-4' />
                    </p>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <p className='text-sm text-gray-500'>No media available.</p>
        )}
      </div>
    </div>
  )
}
