import { Button } from '@/components/ui/button'
import { ArrowRight, ListCheck, ShieldCheck, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
export const SellProducts = () => {
  return (
    <main className=''>
      <section className='mx-auto max-w-6xl px-4 py-16'>
        <div className='grid grid-cols-1 items-center gap-5 md:grid-cols-2'>
          <div className='space-y-4'>
            <h2 className='text-3xl font-bold'>
              Sell Your <span className='text-teal-600'>Poultry Products</span>
            </h2>
            <p>
              Are you a poultry farmer looking to reach more customers? Join our
              marketplace and start selling your products directly to consumers.
            </p>
            <div className='space-y-4'>
              <div className='flex gap-3'>
                <div className='h-fit rounded-full bg-gray-50 p-2'>
                  <Users className='size-6 shrink-0' />
                </div>

                <div>
                  <h3 className='text-xl font-semibold'>
                    Create Your Seller Profile
                  </h3>
                  <p>
                    Sign up and create your farm profile to showcase your story
                    and products.
                  </p>
                </div>
              </div>
              <div className='flex gap-3'>
                <div className='h-fit rounded-full bg-gray-50 p-2'>
                  <ListCheck className='size-6 shrink-0' />
                </div>

                <div>
                  <h3 className='text-xl font-semibold'>List Your Products</h3>
                  <p>
                    Add your poultry products with descriptions, pricing, and
                    availability.
                  </p>
                </div>
              </div>
              <div className='flex gap-3'>
                <div className='h-fit rounded-full bg-gray-50 p-2'>
                  <ShieldCheck className='size-6 shrink-0' />
                </div>

                <div>
                  <h3 className='text-xl font-semibold'>Start Selling</h3>
                  <p>
                    Receive orders, manage inventory, and grow your customer
                    base.
                  </p>
                </div>
              </div>
            </div>
            <Button>
              <Link href='/vendor-market' className='flex items-center gap-2'>
                <span>Become a seller</span>

                <ArrowRight className='size-4' />
              </Link>
            </Button>
          </div>

          <div className='relative aspect-video'>
            <Image
              alt='seller-image'
              src='/images/712X384.jpg'
              width={1000}
              height={1000}
              className='object-cover'
            />
          </div>
        </div>
      </section>
    </main>
  )
}
