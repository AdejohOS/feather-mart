'use client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  deleteFarmAction,
  deleteProductAction
} from '@/app/(standalone)/vendor-marketplace/products/action'
import { useConfirm } from '@/hooks/use-confirm'
import { useQueryClient } from '@tanstack/react-query'

import { ExternalLinkIcon, PencilIcon, TrashIcon } from 'lucide-react'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

interface TaskActionsProps {
  id: string

  children: React.ReactNode
}
export const TaskActions = ({ id, children }: TaskActionsProps) => {
  const router = useRouter()
  const [isLoading, startTransition] = useTransition()
  const [open, setOpen] = useState<boolean>(false)
  const queryClient = useQueryClient()

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

  const onConfirm = async () => {
    const ok = await confirm()
    if (!ok) return
    startTransition(async () => {
      try {
        const result = await deleteProductAction(id)

        if (result.success) {
          toast.success('Product deleted successfully.')
          queryClient.invalidateQueries({ queryKey: ['products'] })
          setOpen(false)
          router.push('/vendor-marketplace/products')
        } else {
          toast.error(result.message || 'Failed to delete product')
        }
      } catch (error) {
        toast.error('An unexpected error occured.')
      }
    })
  }
  return (
    <div className='flex justify-end'>
      <ConfirmDialog isLoading={isLoading} />
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
            onClick={onConfirm}
            className='p-[10px] font-medium text-amber-700 focus:text-amber-700'
          >
            <TrashIcon className='mr-2 size-4 stroke-2' />
            Delete product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
