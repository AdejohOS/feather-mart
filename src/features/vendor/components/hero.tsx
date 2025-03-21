import { Card } from '@/components/ui/card'
import { ChartColumnIncreasing, Check, Handshake } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { FaMoneyBill } from 'react-icons/fa'
export const VendorHero = () => {
  return (
    <div>
      <Link href='/vendor-market/auth/sign-in'>
        <div className='relative overflow-hidden rounded-md bg-neutral-50 p-2'>
          <Image
            src='/images/vendor-hero.png'
            alt='vendor-image'
            width={1500}
            height={328}
            className='rounded-md transition-transform duration-500 hover:scale-[1.01]'
          />
        </div>
      </Link>

      <div className='my-7'>
        <h2 className='mb-4 text-center font-semibold'>
          Why sell on FeatherMart?
        </h2>
        <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
          <Card className='flex flex-col items-center gap-2 p-7 text-muted-foreground'>
            <Handshake className='size-10 text-teal-700' />
            <h2 className='font-semibold'>Connect with more buyers</h2>
            <p>+1m buyers on FeatherMart</p>
          </Card>
          <Card className='flex flex-col items-center gap-2 p-7 text-muted-foreground'>
            <FaMoneyBill className='size-10 text-teal-700' />
            <h2 className='font-semibold'>Improve revenue</h2>
            <p>+1m buyers on FeatherMart</p>
          </Card>
          <Card className='flex flex-col items-center gap-2 p-7 text-muted-foreground'>
            <ChartColumnIncreasing className='size-10 text-teal-700' />
            <h2 className='font-semibold'>Sell more products</h2>
            <p>+1m buyers on FeatherMart</p>
          </Card>
          <Card className='flex flex-col items-center gap-2 p-7 text-muted-foreground'>
            <Check className='size-10 text-teal-700' />
            <h2 className='font-semibold'>Best products</h2>
            <p>+1m buyers on FeatherMart</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
