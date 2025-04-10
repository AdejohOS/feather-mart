'use client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Maximize, Play, X } from 'lucide-react'
import React, { useState } from 'react'

type ProductMedia = {
  id: string
  url: string
  type: 'image' | 'video'
}

interface ProductMediaProps {
  media: ProductMedia[]
}

export const ProductMedia = ({ media }: ProductMediaProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)

  if (!media || media.length === 0) {
    return (
      <Card className='h-fit basis-2/5 space-y-5 md:sticky md:top-20'>
        <div className='flex aspect-square items-center justify-center bg-muted'>
          <p className='text-muted-foreground'>No media available</p>
        </div>
      </Card>
    )
  }

  const activeMedia = media[activeIndex]

  const nextMedia = () => {
    setActiveIndex(prev => (prev + 1) % media.length)
  }

  const prevMedia = () => {
    setActiveIndex(prev => (prev - 1 + media.length) % media.length)
  }

  return (
    <div className='h-fit basis-2/6 space-y-5 md:sticky md:top-20'>
      <div className='space-y-4'>
        <Card className='group relative overflow-hidden'>
          <div className='aspect-square bg-background'>
            {activeMedia.type === 'video' ? (
              <div className='relative h-full w-full'>
                <video
                  src={activeMedia.url}
                  className='h-full w-full object-cover'
                  controls
                />
              </div>
            ) : (
              <div className='relative h-full w-full'>
                <img
                  src={activeMedia.url || '/placeholder.svg'}
                  alt='Product'
                  className='h-full w-full object-cover'
                />
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100'
                    >
                      <Maximize className='h-4 w-4' />
                    </Button>
                  </DialogTrigger>
                  <DialogHeader>
                    <DialogTitle className='sr-only'>Product Media</DialogTitle>
                  </DialogHeader>
                  <DialogContent className='max-w-md p-0'>
                    <div className='relative'>
                      <img
                        src={media[activeIndex].url || '/placeholder.svg'}
                        alt='Product'
                        className='h-auto w-full'
                      />

                      <DialogClose asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='absolute right-2 top-2 bg-black/20 text-white hover:bg-black/40'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </DialogClose>

                      {media.length > 1 && (
                        <>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 text-white hover:bg-black/40'
                            onClick={prevMedia}
                          >
                            <ChevronLeft className='h-6 w-6' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 text-white hover:bg-black/40'
                            onClick={nextMedia}
                          >
                            <ChevronRight className='h-6 w-6' />
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Thumbnail navigation for dialog */}
                    {media.length > 1 && (
                      <div className='flex justify-center gap-2 bg-background p-4'>
                        {media.map((item, index) => (
                          <div
                            key={`dialog-thumb-${item.id}`}
                            className={cn(
                              'h-16 w-16 cursor-pointer overflow-hidden rounded-md transition-all',
                              activeIndex === index
                                ? 'ring-2 ring-primary'
                                : 'opacity-70 hover:opacity-100'
                            )}
                            onClick={() => setActiveIndex(index)}
                          >
                            {item.type === 'video' ? (
                              <div className='relative h-full w-full'>
                                <div className='absolute inset-0 flex items-center justify-center bg-black/10'>
                                  <Play className='h-4 w-4 text-white' />
                                </div>
                                <video
                                  src={item.url}
                                  className='h-full w-full object-cover'
                                  muted
                                />
                              </div>
                            ) : (
                              <img
                                src={item.url || '/placeholder.svg'}
                                alt={`Product ${index + 1}`}
                                className='h-full w-full object-cover'
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          {media.length > 1 && (
            <>
              <Button
                variant='ghost'
                size='icon'
                className='absolute left-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100'
                onClick={prevMedia}
              >
                <ChevronLeft className='h-6 w-6' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                className='absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100'
                onClick={nextMedia}
              >
                <ChevronRight className='h-6 w-6' />
              </Button>
            </>
          )}
        </Card>

        {media.length > 1 && (
          <div className='grid grid-cols-5 gap-2'>
            {media.map((item, index) => (
              <Card
                key={item.id}
                className={cn(
                  'cursor-pointer overflow-hidden transition-all',
                  activeIndex === index
                    ? 'ring-2 ring-primary'
                    : 'opacity-70 hover:opacity-100'
                )}
                onClick={() => setActiveIndex(index)}
              >
                <div className='relative aspect-square'>
                  {item.type === 'video' ? (
                    <div className='relative h-full w-full'>
                      <div className='absolute inset-0 flex items-center justify-center bg-black/10'>
                        <Play className='h-6 w-6 text-white' />
                      </div>
                      <video
                        src={item.url}
                        className='h-full w-full object-cover'
                        muted
                      />
                    </div>
                  ) : (
                    <img
                      src={item.url || '/placeholder.svg'}
                      alt={`Product ${index + 1}`}
                      className='h-full w-full object-cover'
                    />
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
