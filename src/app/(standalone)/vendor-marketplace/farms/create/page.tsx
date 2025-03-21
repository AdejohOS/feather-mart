import React from 'react'
import { CreateFarmForm } from '../../_components/create-farm-form'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

const FarmCreatePage = async () => {
  return (
    <div className='w-full lg:max-w-xl'>
      <CreateFarmForm />
    </div>
  )
}

export default FarmCreatePage
