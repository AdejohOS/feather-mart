import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const JoinMarketplace = () => {
  return (
    <section className='bg-teal-700 px-4 py-16 text-primary-foreground'>
      <div className='container text-center'>
        <h2 className='mb-4 text-3xl font-bold md:text-4xl'>
          Join Our Marketplace Community
        </h2>
        <p className='mx-auto mb-8 max-w-lg text-lg'>
          Sign up to receive updates on new farmers, seasonal products, and
          exclusive deals.
        </p>
        <div className='mx-auto flex max-w-md flex-col gap-3 sm:flex-row'>
          <Input
            type='email'
            placeholder='Enter your email'
            className='bg-teal-50 text-gray-500 focus:border-0'
          />
          <Button variant='secondary' size='lg' className='px-8'>
            Subscribe
          </Button>
        </div>
      </div>
    </section>
  )
}
