'use client'

import {
  createFarmAction,
  deleteFarmAction,
  updateFarmAction
} from '@/app/(standalone)/vendor-marketplace/farms/action'
import { FarmTypes } from '@/types/types'
import { createClient } from '@/utils/supabase/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useGetFarms() {
  return useQuery({
    queryKey: ['seller-farm'],
    queryFn: async () => {
      const supabase = await createClient()
 
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (!user || userError) {
        throw new Error('Failed to fetch authenticated user')
      }

      const { data: farms, error: farmsError } = await supabase
        .from('farms')
        .select(`*, media:farm_media(id, url, type)`)
        .eq('seller_id', user.id)

      if (farmsError) {
        throw new Error("Failed to fetch seller's farms" + farmsError.message)
      }

      return farms || []
    }
  })
}

export function useGetFarm(farmId: string) {
  return useQuery({
    queryKey: ['seller-farm', farmId],
    queryFn: async () => {
      const supabase = await createClient()

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (!user || userError) {
        throw new Error('Failed to fetch authenticated user')
      }

      const { data: farm, error: farmError } = await supabase
        .from('farms')
        .select(`*, media:farm_media(id, url, type)`)
        .eq('id', farmId)
        .eq('seller_id', user.id)
        .single()

      if (farmError) {
        throw new Error(`Failed to fetch farm: ${farmError.message}`)
      }

      return farm
    },

    enabled: !!farmId
  })
}

export function useCreateFarm() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await createFarmAction({}, formData) // Call server action

      if (!response.success) {
        throw new Error(response.message || 'Failed to create farm')
      }
      return response
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-farm'] }) // Refresh farm data

      toast.success('Farm created successfully!')
    },
    onError: error => {
      toast.error(error.message)
    }
  })
}

export function useUpdateFarm() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await updateFarmAction({}, formData) // Call server action

      if (!response.success) {
        throw new Error(response.message || 'Failed to update farm')
      }
      return response
    },

    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['seller-farm'] })
      queryClient.invalidateQueries({ queryKey: ['seller-farm', response.farmId] }) // Refresh farm data

      toast.success('Farm updated successfully!')
    },
    onError: error => {
      toast.error(error.message)
    }
  })
}

export const useDeleteFarm = () => {

  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (farmId: string) => {
      const response = await deleteFarmAction(farmId)

      if (!response.success) {  
        throw new Error(response.message || "Failed to delete farm")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-farm"] })
      toast.success( "Farm deleted successfully",)
    },
    onError: (error) => {
      toast( error.message)
    },
  })
}

export const useDeleteMedia = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ mediaId, farmId }: { mediaId: string; farmId: string }) => {
      const response = await fetch(`/api/farms/media/${mediaId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete media")
      }

      return { mediaId, farmId }
    },
    onSuccess: ({ farmId }) => {
      queryClient.invalidateQueries({ queryKey: ["farms", farmId] })
      toast.success("Media deleted successfully")
    },
    onError: (error) => {
      toast.error( error.message,
       )
    },
  })
}
