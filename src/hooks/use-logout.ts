'use client'

import { createClient } from '@/utils/supabase/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export function useLogout() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      type UserRole = 'admin' | 'buyer' | 'seller'

      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession()
      console.log('Session Data before logout:', session) // Debugging session info

      if (sessionError) {
        console.error('Session check error:', sessionError)
        throw new Error('Failed to check for active session')
      }

      if (!session) {
        console.warn('No active session found, skipping logout')
        return { success: true, message: 'No active session found' }
      }

      const userId = session.user.id

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('Failed to fetch user role:', profileError)
      }

      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error)
        throw new Error('Failed to logout')
      }
      return {
        success: true,
        message: 'Logout successful',
        role: profile?.role
      }
    },

    onSuccess: async data => {
      queryClient.clear()

      if (data.role === 'seller') {
        router.push('/vendor-market/auth/sign-in')
      } else {
        router.push('/auth/sign-in')
      }
    },
    onError: (error: Error) => {
      console.error('Logout process error:', error.message)
    }
  })
}
