import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, PlusCircle } from 'lucide-react'
import { FarmForm } from '../_components/farm-form'

const FarmCreatePage = async () => {
  return (
    <div className='w-full space-y-7'>
      <Button variant='outline'>
        <Link
          href='/vendor-marketplace/settings'
          className='flex items-center gap-2'
        >
          <ArrowLeft className='size-4' />
          Back to Profile
        </Link>
      </Button>
      <h1 className='mb-6 flex items-center gap-3 text-3xl font-bold'>
        Add New Farm <PlusCircle className='size-6' />
      </h1>
      <FarmForm />
    </div>
  )
}

export default FarmCreatePage
