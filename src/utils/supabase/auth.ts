import { createClient } from '@/utils/supabase/client'

export const getSession = async () => {
  const supabase = createClient()
  try {
    const {
      data: { session }
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

export const getUser = async () => {
  const session = await getSession()
  return session?.user ?? null
}

export const handleLogout = async () => {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Logout error:', error)
    throw error
  }
  // Clear any cached data
  window.location.href = '/login' // Force full page reload
}
