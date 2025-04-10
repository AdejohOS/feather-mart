'use client'

import { updateProfileAction } from '@/app/(standalone)/vendor-marketplace/products/action'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DottedSeparator } from '@/components/ui/dotted-separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { ProfileType } from '@/types/types'
import { useQueryClient } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'

interface UpdateProfileFormProps {
  onCancel?: () => void
  profile: ProfileType
}

export const UpdateProfileForm = ({
  onCancel,
  profile
}: UpdateProfileFormProps) => {
  const queryClient = useQueryClient()

  const [state, formAction, isLoading] = useActionState(updateProfileAction, {
    success: false,
    error: ''
  })

  // Handle successful profile update
  useEffect(() => {
    if (state.success) {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Your profile has been updated successfully.')
      onCancel?.()
    }
  }, [state.success, queryClient, onCancel])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update profile</CardTitle>
      </CardHeader>
      <div className='px-7'>
        <DottedSeparator />
      </div>
      <CardContent className='p-7'>
        <form action={formAction} className='space-y-3'>
          <div className='space-y-2'>
            <Label htmlFor='full_name'>Fullname:</Label>
            <Input
              placeholder='Enter fulname'
              id='full_name'
              name='full_name'
              disabled={isLoading}
              defaultValue={profile?.full_name ?? ''}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='username'>Username:</Label>
            <Input
              placeholder='Enter username'
              id='username'
              name='username'
              disabled={isLoading}
              defaultValue={profile?.username ?? ''}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='phone_number'>Phone Number:</Label>
            <Input
              placeholder='Enter phone number'
              minLength={11}
              id='phone_number'
              name='phone_number'
              type='tel'
              pattern='[0-9]{11}'
              disabled={isLoading}
              defaultValue={profile?.phone_number ?? ''}
            />
          </div>

          <div className='flex justify-end gap-3'>
            <Button
              variant='outline'
              type='button'
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading} className='flex gap-x-2'>
              {isLoading ? (
                <>
                  <Loader className='mr-2 h-4 w-4 animate-spin' />
                  Saving...
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </div>
          {state.error && (
            <p className='text-sm text-destructive'>{state.error}</p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
