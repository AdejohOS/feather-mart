import { UpdateFarmForm } from '@/app/(standalone)/vendor-marketplace/_components/update-farm-form'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/server'
import { ArrowLeft, Trash } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React, { Suspense } from 'react'
import { ClientAction } from '../_components/client-action'

const page = async ({ params }: { params: Promise<{ farmId: string }> }) => {
  const { farmId } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const {} = await supabase.from('farms').select('seller_id')

  const { data: farm, error } = await supabase
    .from('farms')
    .select('*')
    .eq('id', farmId)
    .single()

  if (error || !farm) {
    return notFound()
  }

  return (
    <>
      <div className='mx-auto w-full max-w-6xl space-y-6'>
        <ClientAction farmId={farmId} />

        <Suspense fallback={<div>Loading farm data...</div>}>
          <div className='mx-auto lg:max-w-xl'>
            <UpdateFarmForm initialValues={farm} farmId={farmId} />
          </div>
        </Suspense>
      </div>
    </>
  )
}

export default page
