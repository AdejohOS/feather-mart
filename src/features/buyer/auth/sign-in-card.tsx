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
import { toast } from 'sonner'

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

  const oAuthSignin = async () => {
    setLoading(true)
    const supabase = createClient()
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      })
      if (error) throw error
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during Google sign up')
      setLoading(false)
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
        <div className='flex items-center space-x-3'>
          <Button
            className='flex w-full items-center gap-x-2'
            variant='outline'
            size='lg'
            disabled={isPending || loading}
            onClick={oAuthSignin}
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
              <span>Already have an account?</span>{' '}
              <Link className='text-teal-600 underline' href='/auth/sign-in'>
                SignIn
              </Link>{' '}
            </>
          )}
        </p>
      </CardFooter>
    </Card>
  )
}
