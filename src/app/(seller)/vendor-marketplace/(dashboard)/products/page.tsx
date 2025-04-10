import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import { ProductTable } from './_components/product-table'
import { PlusCircle } from 'lucide-react'

const page = () => {
  return (
    <div className='space-y-7'>
      <div className='flex justify-end'>
        <Button asChild>
          <Link href={'/vendor-marketplace/products/create'}>
            {' '}
            <PlusCircle className='size-4' /> Add product
          </Link>
        </Button>
      </div>

      <ProductTable />
    </div>
  )
}

export default page
