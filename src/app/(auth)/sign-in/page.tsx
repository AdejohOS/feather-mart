import { SignInCard } from '@/features/auth/sign-in-card'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import React from 'react'

const SignInPage = async () => {
  const supabase = await createClient()

  const { data } = await supabase.auth.getUser()
  if (data?.user) {
    redirect('/')
  }

  return <SignInCard />
}

export default SignInPage
