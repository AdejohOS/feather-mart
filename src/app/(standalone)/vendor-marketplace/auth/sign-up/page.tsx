import { SignInCard } from '@/features/buyer/auth/sign-in-card'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

import React from 'react'

const SignUpPage = async () => {
  const supabase = await createClient()

  return <SignInCard mode='signup' />
}

export default SignUpPage
