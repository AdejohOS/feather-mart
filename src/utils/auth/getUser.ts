import { LoggedInUser } from '@/types/types'
import { createClient } from '../supabase/server'

export async function getUser(): Promise<LoggedInUser | null> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('No active session or user', authError?.message)
      return null
    }

    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError.message)
      return null
    }

    return data as LoggedInUser
  } catch (error) {
    console.error('Unexpected error in getUser:', error)
    return null
  }
}
