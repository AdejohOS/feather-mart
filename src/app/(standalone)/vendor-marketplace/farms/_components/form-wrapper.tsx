'use client'

import { useGetFarm } from '@/hooks/use-seller-farms'
import { FarmForm } from './farm-form'
import { Loader } from 'lucide-react'
import { notFound } from 'next/navigation'

interface FormWrapperProps {
  farmId: string
}

export const FormWrapper = ({ farmId }: FormWrapperProps) => {
  const { data: farm, isLoading } = useGetFarm(farmId)

  if (isLoading) {
    return (
      <div className='flex items-center gap-2'>
        Loading...
        <Loader className='size-4 animate-spin' />
      </div>
    )
  }

  if (!farm) notFound()

  const farmData = {
    id: farm.id,
    name: farm.name,
    description: farm.description,
    establishedDate: farm.established_date
      ? new Date(farm.established_date)
      : undefined,
    size: farm.size || undefined,
    address: farm.address || undefined,
    city: farm.city || undefined,
    state: farm.state || undefined,
    postalCode: farm.postal_code || undefined,
    country: farm.country || undefined,
    latitude: farm.latitude || undefined,
    longitude: farm.longitude || undefined,
    formattedAddress: farm.formatted_address || undefined,
    placeId: farm.place_id || undefined,
    contactName: farm.contact_name || undefined,
    contactEmail: farm.contact_email || undefined,
    contactPhone: farm.contact_phone || undefined,
    website: farm.website || undefined,
    farmType: farm.farm_type || [],
    certifications: farm.certifications || [],
    productionCapacity: farm.production_capacity || undefined,
    breeds: farm.breeds || [],
    farmingPractices: farm.farming_practices || undefined,
    housingTypes: farm.housing_types || [],
    hasProcessingFacility: farm.has_processing_facility,
    processingDetails: farm.processing_details || undefined,
    storageCapabilities: farm.storage_capabilities || undefined,
    biosecurityMeasures: farm.biosecurity_measures || undefined,
    businessHours: farm.business_hours || undefined,
    deliveryOptions: farm.delivery_options || [],
    deliveryDetails: farm.delivery_details || undefined,
    pickupAvailable: farm.pickup_available,
    pickupDetails: farm.pickup_details || undefined,
    paymentMethods: farm.payment_methods || [],
    wholesaleAvailable: farm.wholesale_available,
    wholesaleDetails: farm.wholesale_details || undefined,
    // Transform media data
    existingMedia:
      farm.media?.map(item => ({
        id: item.id,
        url: item.url,
        type: item.type as 'image' | 'video',
        size: 0, // Size is not stored in the database
        name: item.url.split('/').pop() || 'file'
      })) || []
  }

  return (
    <div>
      <FarmForm initialData={farmData} isEditing={true} />
    </div>
  )
}
