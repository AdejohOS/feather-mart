'use client'
import { Button } from '@/components/ui/button'
import { useCreateFarmModal } from '@/hooks/use-create-farm-modal'
import { useGetSellerFarm } from '@/hooks/use-get-seller-farm'
import { Loader, PlusCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FarmList } from './farm-list'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { BusinessSkeleton } from '@/components/ui/dasboard-skeleton'

export const Farms = () => {
  const router = useRouter()
  const { data: farms, isLoading } = useGetSellerFarm()

  if (isLoading) {
    return <BusinessSkeleton />
  }
  return (
    <Card className='p-4'>
      <h3 className='text-xl font-semibold'>BUSINESS SETTINGS</h3>
      <Separator className='my-4' />
      {(farms ?? []).length === 0 ? (
        <div className='flex items-center justify-center text-muted-foreground'>
          <Button
            className='flex items-center gap-x-2'
            variant='secondary'
            size='lg'
            onClick={() => router.push('/vendor-marketplace/farms/create')}
          >
            <PlusCircle className='size-5' /> Add Farm
          </Button>
        </div>
      ) : (
        <div>{farms?.map(farm => <FarmList key={farm.id} farm={farm} />)}</div>
      )}
    </Card>
  )
}
