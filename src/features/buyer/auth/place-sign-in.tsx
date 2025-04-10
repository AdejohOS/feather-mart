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
import { signInWithPassword } from '@/actions/action'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

import { createClient } from '@/utils/supabase/client'
import { Provider } from '@supabase/supabase-js'
import { ActionResponse, Role } from '@/types/types'

const initialState: ActionResponse = {
  success: false,
  message: ''
}

export const SignInCard = ({
  mode = 'signin'
}: {
  mode?: 'signin' | 'signup'
}) => {
  const [loading, setLoading] = useState<boolean>(false)

  const [singInState, signUpAction, isPending] = useActionState(
    signInWithPassword,
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
        {singInState?.message && (
          <div className='mb-4'>
            <div
              className={cn(
                'rounded-md p-6',
                singInState.success ? 'bg-green-50' : 'bg-amber-50'
              )}
            >
              <h3
                className={cn(
                  'text-sm font-medium',
                  singInState.success ? 'text-green-700' : 'text-amber-700'
                )}
              >
                {singInState.success ? (
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
                  singInState.success ? 'text-green-800' : 'text-amber-800'
                )}
              >
                {singInState.message}
              </p>
            </div>
          </div>
        )}
        <div className='mt-6 flex items-center space-x-3'>
          <Button
            className='flex w-full items-center gap-x-2'
            variant='outline'
            size='lg'
            disabled={isPending || loading}
            onClick={() => oAuthSignin('google', Role.buyer)}
          >
            {loading ? (
              <Loader className='size-5 animate-spin' />
            ) : (
              <FcGoogle className='size-4' />
            )}
            Google
          </Button>
        </div>

        <div className='relative my-6 flex items-center'>
          <Separator className='flex-1' />
          {/*<p className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-muted-foreground'>
            Or
          </p>*/}
        </div>
        {/*<form
          action={formData => {
            //console.log('Role before form submission:', Role.buyer)
            //console.log('FormData role:', formData.get('role')) // Check what actually gets submitted
            return signUpAction(formData)
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
              className={singInState.errors?.email ? 'border-red-500' : ''}
            />

            {singInState.errors?.email && (
              <p id='title-error' className='text-sm text-red-500'>
                {singInState.errors.email[0]}
              </p>
            )}
          </div>
          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <Input
              type='password'
              id='password'
              placeholder='*******'
              name='password'
              autoComplete='password'
              required
              aria-describedby='password-error'
              disabled={isPending}
              className={singInState.errors?.password ? 'border-red-500' : ''}
            />
            {singInState.errors?.password && (
              <p id='title-error' className='text-sm text-red-500'>
                {singInState.errors.password[0]}
              </p>
            )}
          </div>
          <input type='hidden' name='role' value={Role.buyer} />
          <Button
            type='submit'
            className='flex-items-center w-full gap-x-2'
            size='lg'
            disabled={isPending}
          >
            {isPending && <Loader className='size-5 animate-spin' />} Sign In
          </Button>
        </form>*/}
      </CardContent>
      <div className='px-7'>
        <DottedSeparator />
      </div>
      <CardFooter className='flex-col gap-4'>
        <p className='mt-4 text-center text-sm text-muted-foreground'>
          By continuing, you confirm that you’ve read and accepted
          FeatherMart&apos;s {''}
          <Link href='/terms-conditions' className='text-teal-600 underline'>
            Terms and Conditions
          </Link>
        </p>

        <p className='text-sm text-muted-foreground'>
          {mode === 'signin' ? (
            <>
              <span>New to FeatherMart?</span>{' '}
              <Link className='text-teal-600 underline' href='/auth/sign-up'>
                Signup
              </Link>
            </>
          ) : (
            <>
              <span>New to FeatherMart?</span>{' '}
              <Link className='text-teal-600 underline' href='/auth/sign-up'>
                SignUp
              </Link>{' '}
            </>
          )}
        </p>
      </CardFooter>
    </Card>
  )
}
