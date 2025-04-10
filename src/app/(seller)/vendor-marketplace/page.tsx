import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { createClient } from '@/utils/supabase/server'
import { ShoppingCart, TrendingDown, TrendingUp } from 'lucide-react'
import { redirect } from 'next/navigation'
import React from 'react'
import { MdMoney } from 'react-icons/md'

const page = async () => {
  return (
    <section className=''>
      <div className='space-y-3'>
        <div className='grid grid-cols-2 gap-3'>
          <Card className='space-y-4 p-4 text-muted-foreground'>
            <p className='flex items-center gap-x-2 font-semibold'>
              <MdMoney className='size-5 text-teal-600' />
              <span>Total Sales</span>
            </p>
            <h2 className='text-2xl font-bold'>N100,000</h2>
            <Badge
              className='flex w-max items-center gap-x-2'
              variant='outline'
            >
              <TrendingUp className='size-4' />
              29.3%
            </Badge>
          </Card>
          <Card className='space-y-4 p-4 text-muted-foreground'>
            <p className='flex items-center gap-x-2 font-semibold'>
              <ShoppingCart className='size-5 text-teal-600' />
              <span>Total Orders</span>
            </p>
            <h2 className='text-2xl font-bold'>200k</h2>
            <Badge
              className='flex w-max items-center gap-x-2'
              variant='destructive'
            >
              <TrendingDown className='size-4' />
              29.3%
            </Badge>
          </Card>
        </div>
        <div>
          <Card className='p-4 text-muted-foreground'>
            <p className='font-semibold'>Product Views</p>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default page
