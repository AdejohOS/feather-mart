import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

export function CartContentSkeleton() {
  return (
    <div className='grid gap-8 md:grid-cols-3'>
      <div className='md:col-span-2'>
        <div className='space-y-4'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='flex items-start space-x-4 border-b py-4'>
              <Skeleton className='h-20 w-20 rounded-md' />
              <div className='flex-1 space-y-2'>
                <div className='flex justify-between'>
                  <Skeleton className='h-5 w-40' />
                  <Skeleton className='h-5 w-16' />
                </div>
                <Skeleton className='h-4 w-full' />
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <Skeleton className='h-7 w-7 rounded-md' />
                    <Skeleton className='h-5 w-8' />
                    <Skeleton className='h-7 w-7 rounded-md' />
                  </div>
                  <Skeleton className='h-8 w-20' />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='md:col-span-1'>
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-32' />
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex justify-between'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-16' />
            </div>
            <div className='flex justify-between'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-16' />
            </div>
            <div className='h-px bg-border' />
            <div className='flex justify-between'>
              <Skeleton className='h-5 w-24' />
              <Skeleton className='h-5 w-20' />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className='h-10 w-full' />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
