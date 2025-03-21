'use client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { DottedSeparator } from '@/components/ui/dotted-separator'
import { Input } from '@/components/ui/input'
import { FcGoogle } from 'react-icons/fc'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

import { useActionState, useState } from 'react'

import { CheckCircle2, Loader, TriangleAlert } from 'lucide-react'
import { signInWithMagicLink } from '@/actions/action'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

import { createClient } from '@/utils/supabase/client'
import { Provider } from '@supabase/supabase-js'
import { ActionResponse, Role } from '@/types/types'

const initialState: ActionResponse = {
  success: false,
  message: ''
}

export const VendorSignInCard = ({
  mode = 'signin'
}: {
  mode?: 'signin' | 'signup'
}) => {
  const [loading, setLoading] = useState<boolean>(false)

  const [magicLinkState, magicLinkAction, isPending] = useActionState(
    signInWithMagicLink,
    initialState
  )

  const oAuthSignin = async (provider: Provider, role: Role) => {
    const redirectTo = `${window.location.origin}/auth/callback?role=${role}`
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: { redirectTo }
      })
      if (error) throw error
    } catch (error) {
      console.error('Unexpected error:', error)
    }
  }

  return (
    <Card className='h-full w-full border-none shadow-none md:w-[487px]'>
      <CardHeader className='flex items-center justify-center p-7'>
        <CardTitle className='text-2xl'>
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </CardTitle>
        <p className='mt-2 text-sm text-muted-foreground'>
          {mode === 'signin'
            ? 'Sign in to your dashboard'
            : 'Get started with your new account'}
        </p>
      </CardHeader>
      <div className='px-7'>
        <DottedSeparator />
      </div>

      <CardContent className='p-7'>
        {magicLinkState?.message && (
          <div className='mb-4'>
            <div
              className={cn(
                'rounded-md p-6',
                magicLinkState.success ? 'bg-green-50' : 'bg-amber-50'
              )}
            >
              <h3
                className={cn(
                  'text-sm font-medium',
                  magicLinkState.success ? 'text-green-700' : 'text-amber-700'
                )}
              >
                {magicLinkState.success ? (
                  <p className='flex items-center gap-x-2'>
                    <CheckCircle2 className='size-4' /> Check your email
                  </p>
                ) : (
                  <p className='flex items-center gap-x-2'>
                    <TriangleAlert className='size-4' /> We&apos;ve got a
                    problem
                  </p>
                )}
              </h3>
              <p
                className={cn(
                  'mt-2 text-sm',
                  magicLinkState.success ? 'text-green-800' : 'text-amber-800'
                )}
              >
                {magicLinkState.message}
              </p>
            </div>
          </div>
        )}

        <form
          action={formData => {
            console.log('Role before form submission:', Role.seller)
            console.log('FormData role:', formData.get('role')) // Check what actually gets submitted
            return magicLinkAction(formData)
          }}
          className='space-y-4'
        >
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              name='email'
              placeholder='Enter your email'
              autoComplete='email'
              aria-describedby='email-error'
              required
              disabled={isPending}
              className={magicLinkState.errors?.email ? 'border-red-500' : ''}
            />

            {magicLinkState.errors?.email && (
              <p id='title-error' className='text-sm text-red-500'>
                {magicLinkState.errors.email[0]}
              </p>
            )}

            <input type='hidden' name='role' value={Role.seller} />
          </div>
          <Button
            type='submit'
            className='flex-items-center w-full gap-x-2'
            size='lg'
            disabled={isPending}
          >
            {isPending && <Loader className='size-5 animate-spin' />} Continue
            with email
          </Button>
        </form>

        <p className='mt-4 text-center text-sm text-muted-foreground'>
          By continuing, you confirm that you’ve read and accepted
          FeatherMart&apos;s {''}
          <Link href='/terms-conditions' className='text-teal-600 underline'>
            Terms and Conditions
          </Link>
        </p>

        <div className='relative mt-6 flex items-center'>
          <Separator className='flex-1' />
          <p className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-muted-foreground'>
            Or
          </p>
        </div>
        <div className='mt-6 flex items-center space-x-3'>
          <Button
            className='flex w-full items-center gap-x-2'
            variant='outline'
            size='lg'
            disabled={isPending || loading}
            onClick={() => oAuthSignin('google', Role.seller)}
          >
            {loading ? (
              <Loader className='size-5 animate-spin' />
            ) : (
              <FcGoogle className='size-4' />
            )}
            Google
          </Button>
        </div>
      </CardContent>
      <div className='px-7'>
        <DottedSeparator />
      </div>
      <CardFooter className='p-7'>
        <p className='text-sm text-muted-foreground'>
          {mode === 'signin' ? (
            <>
              <span>New to FeatherMart?</span>{' '}
              <Link
                className='text-teal-600 underline'
                href='/vendor-market/auth/sign-up'
              >
                Signup
              </Link>
            </>
          ) : (
            <>
              <span>Already have an account?</span>{' '}
              <Link
                className='text-teal-600 underline'
                href='/vendor-market/auth/sign-in'
              >
                Login
              </Link>{' '}
            </>
          )}
        </p>
      </CardFooter>
    </Card>
  )
}
