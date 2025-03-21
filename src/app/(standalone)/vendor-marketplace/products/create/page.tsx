import React from 'react'
import { ProductForm } from '../_components/product-form'
import { PlusCircle } from 'lucide-react'

const page = () => {
  return (
    <div className='w-full lg:max-w-xl'>
      <h1 className='mb-6 flex items-center gap-3 text-3xl font-bold'>
        Add New Poultry Product <PlusCircle className='size-6' />
      </h1>
      <ProductForm />
    </div>
  )
}

export default page
