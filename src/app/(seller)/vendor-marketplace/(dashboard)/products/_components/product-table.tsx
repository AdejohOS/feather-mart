'use client'

import { useGetProducts } from '@/hooks/use-products'
import { columns } from './columns'
import { DataTable } from './data-table'
import { ProfileSkeleton } from '@/components/ui/dasboard-skeleton'

export const ProductTable = () => {
  const { data, isLoading } = useGetProducts()

  if (isLoading) {
    return <ProfileSkeleton />
  }
  return <DataTable columns={columns} data={data || []} />
}
