import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle } from 'lucide-react'

export const DangerZone = () => {
  return (
    <Card className='p-4'>
      <h3 className='text-xl font-semibold'>DANGER ZONE</h3>
      <Separator className='my-4' />
      <div>
        <div className='flex gap-3'>
          <AlertTriangle className='size-6 shrink-0 text-amber-600' />
          <p className='flex flex-col gap-3'>
            <span>
              {' '}
              Request for account deletion <br /> Deleting your account is
              permanent and cannot be undone. Your data will be deleted within
              30 days, except we may retain some metadata and logs for longer
              where required or permitted by law.
            </span>

            <Button size='sm' className='w-fit' variant='destructive'>
              Delete my account
            </Button>
          </p>
        </div>
      </div>
    </Card>
  )
}
