import React from 'react'
import { ProductDetails } from '../_components/product-details'
import { TaskAction } from '../_components/task-action'

const page = async ({ params }: { params: Promise<{ productId: string }> }) => {
  const { productId } = await params

  return (
    <div className='w-full space-y-7'>
      <TaskAction productId={productId} onEdit={true} />
      <ProductDetails productId={productId} />
    </div>
  )
}

export default page
