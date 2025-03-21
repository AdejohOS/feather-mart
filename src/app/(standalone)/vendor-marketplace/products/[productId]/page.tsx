import React from 'react'
import { ProductMedia } from '../_components/product-media'
import { ProductDetails } from '../_components/product-details'
import { ClientAction } from '../_components/client-action'

const page = async ({ params }: { params: Promise<{ productId: string }> }) => {
  const { productId } = await params

  return (
    <div className='w-full space-y-4'>
      <ClientAction productId={productId} onEdit={true} />
      <ProductDetails productId={productId} />
    </div>
  )
}

export default page
