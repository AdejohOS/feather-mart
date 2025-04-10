import { Skeleton } from '@/components/ui/skeleton'
import { Card } from './card'

export function ProfileSkeleton() {
  return (
    <Card className='p-4'>
      <div className='flex justify-between'>
        <div className='flex gap-3'>
          <Skeleton className='size-20 rounded-full' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-[250px]' />
            <Skeleton className='h-4 w-[200px]' />
            <Skeleton className='h-4 w-[200px]' />
          </div>
        </div>
        <Skeleton className='h-4 w-[200px]' />
      </div>
    </Card>
  )
}

export function BusinessSkeleton() {
  return (
    <Card className='p-4'>
      <div className='flex justify-between'>
        <div className='flex gap-3'>
          <div className='flex gap-4'>
            <Skeleton className='size-20 w-[250px]' />{' '}
            <Skeleton className='size-10 w-[50px]' />
          </div>

          <div className='space-y-2'>
            <Skeleton className='h-4 w-[250px]' />
            <Skeleton className='h-4 w-[200px]' />
            <Skeleton className='h-4 w-[200px]' />
            <Skeleton className='h-4 w-[200px]' />
          </div>
        </div>
        <Skeleton className='h-4 w-[200px]' />
      </div>
    </Card>
  )
}
