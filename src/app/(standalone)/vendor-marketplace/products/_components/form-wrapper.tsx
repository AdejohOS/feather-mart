'use client'

import { useGetProduct } from '@/hooks/use-products'
import { ProductForm } from './product-form'
import { notFound } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getSellerFarms } from '@/features/action'

interface FormWrapperProps {
  productId: string
}

export const FormWrapper = ({ productId }: FormWrapperProps) => {
  const [farms, setFarms] = useState<Array<{ id: string; name: string }>>([])
  const [isLoadingFarms, setIsLoadingFarms] = useState(true)

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const farmsData = await getSellerFarms()
        setFarms(farmsData)
      } catch (error) {
        console.error('Error fetching farms:', error)
      } finally {
        setIsLoadingFarms(false)
      }
    }
    fetchFarms()
  }, [])

  const { data: product, error: productError } = useGetProduct(productId)
  if (!product || productError) {
    return notFound()
  }
  const productData = {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    breed: product.breed || undefined,
    age: product.age || undefined,
    weight: product.weight || undefined,
    farmId: product.farm_id || undefined,
    price: product.price,
    discountPrice: product.discount_price || undefined,
    stock: product.stock,
    unit: product.unit,
    minimumOrder: product.minimum_order || undefined,
    availableDate: product.available_date
      ? new Date(product.available_date)
      : undefined,
    sku: product.sku || undefined,
    isOrganic: product.is_organic,
    isFreeRange: product.is_free_range,
    isAntibiotic: product.is_antibiotic,
    isHormone: product.is_hormone,
    isVaccinated: product.is_vaccinated,
    isAvailable: product.is_available,
    tags: product.tags || [],
    nutritionalInfo: product.nutritional_info || undefined,
    storageInstructions: product.storage_instructions || undefined,
    origin: product.origin || undefined,
    // Transform media data
    existingMedia:
      product.media?.map(item => ({
        id: item.id,
        url: item.url,
        type: item.type,
        size: 0, // Size is not stored in the database
        name: item.url.split('/').pop() || 'file'
      })) || []
  }
  return (
    <div>
      <ProductForm initialData={productData} farms={farms} isEditing={true} />
    </div>
  )
}
