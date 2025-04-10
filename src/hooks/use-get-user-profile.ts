'use client'

import { useQuery } from '@tanstack/react-query'

import { createClient } from '@/utils/supabase/client'

export interface ProfileType {
  id: string
  username: string
  email: string
  full_name: string
  avatar_url: string
  phone_number: string
  updated_at: string
}

export function useGetUserProfile() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<ProfileType | null> => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError || !user) {
        return null
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        return null
      }

      return {
        ...data,
        email: user.email
      } as ProfileType
    }
  })
}
