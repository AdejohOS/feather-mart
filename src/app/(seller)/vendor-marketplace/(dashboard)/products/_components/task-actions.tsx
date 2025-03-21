'use client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useConfirm } from '@/hooks/use-confirm'

import { ExternalLinkIcon, PencilIcon, TrashIcon } from 'lucide-react'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface TaskActionsProps {
  id: string

  children: React.ReactNode
}
export const TaskActions = ({ id, children }: TaskActionsProps) => {
  const router = useRouter()

  const openProduct = () => {
    router.push(`/vendor-marketplace/products/${id}`)
  }

  const openProductDetails = () => {
    router.push(`/vendor-marketplace/products/${id}/update`)
  }

  const [ConfirmDialog, confirm] = useConfirm(
    'Delete product',
    'The action cannot be undone',
    'destructive'
  )

  const onDelete = async () => {
    const ok = await confirm()
    if (!ok) return

    toast.success('Deletion coming')
  }
  return (
    <div className='flex justify-end'>
      <ConfirmDialog />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-48'>
          <DropdownMenuItem
            onClick={openProduct}
            className='p-[10px] font-medium'
          >
            <ExternalLinkIcon className='mr-2 size-4 stroke-2' />
            Product Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={openProductDetails}
            className='p-[10px] font-medium'
          >
            <PencilIcon className='mr-2 size-4 stroke-2' />
            Edit Product
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={onDelete}
            className='p-[10px] font-medium text-amber-700 focus:text-amber-700'
          >
            <TrashIcon className='mr-2 size-4 stroke-2' />
            Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
