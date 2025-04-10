import { VendorSignInCard } from '@/features/vendor/components/auth/vendor-signin-card'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

import React from 'react'

const VendorSignUpPage = async () => {
  return <VendorSignInCard role='seller' mode='sign-up' />
}

export default VendorSignUpPage
