import { createClient } from '@/utils/supabase/client'

export const getProfile = async () => {
  const supabase = createClient()
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (!user || userError) {
    console.log('No user found', userError)
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profileError) {
    console.log('No profile found', profileError)
    return null
  }
  return profile
}
