'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ProfileSkeleton } from '@/components/ui/dasboard-skeleton'
import { Separator } from '@/components/ui/separator'
import { useGetUserProfile } from '@/hooks/use-get-user-profile'
import { useUpdateProfileModal } from '@/hooks/use-update-profile-modal'

import { PenBoxIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import React from 'react'

export const Profile = () => {
  const { data: user, isLoading } = useGetUserProfile()

  const pathname = usePathname()
  const { open } = useUpdateProfileModal()

  const { full_name, avatar_url, email, phone_number } = user || {
    full_name: '',
    avatar_url: '',
    email: ''
  }

  const avatarFallback = full_name
    ? full_name.charAt(0).toUpperCase()
    : (email?.charAt(0).toLocaleUpperCase() ?? 'U')

  if (isLoading) {
    return <ProfileSkeleton />
  }

  return (
    <Card className='p-4'>
      <h3 className='text-xl font-semibold'>PROFILE SETTINGS</h3>
      <Separator className='my-4' />
      <div className='text-muted-foreground'>
        <div className='flex justify-between'>
          <div className='flex gap-3'>
            <Avatar className='size-20 border border-neutral-700 transition hover:opacity-75'>
              <AvatarImage src={avatar_url || ''} />
              <AvatarFallback className='flex items-center justify-center bg-neutral-200 font-medium text-neutral-500'>
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            <div>
              <p>
                <strong className='text-semibold'>Name:</strong> {full_name}
              </p>
              <p className=''>
                <strong className='text-semi-bold'>Email:</strong> {email}
              </p>
              <p>
                <strong className='text-semi-bold'>Phone:</strong>{' '}
                {phone_number || <em className='text-xs'>update to provide</em>}
              </p>
            </div>
          </div>
          <Button
            variant='secondary'
            size='xs'
            onClick={open}
            className='flex items-center gap-2'
          >
            <PenBoxIcon className='size-2' />
            Update profile
          </Button>
        </div>
      </div>
    </Card>
  )
}
