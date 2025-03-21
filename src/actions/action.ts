'use server'

import { createClient } from '@/utils/supabase/server'
import { ActionResponse, Role, UserType, } from '../types/types'
import { CreateUserSchema,} from '@/lib/schema'

import { redirect } from 'next/navigation'
import config from '../../config'


export async function signInWithMagicLink  (prevState: ActionResponse | null, formData: FormData, ): Promise<ActionResponse>{
  const supabase = await createClient()

  const data: UserType = {
    email: formData.get('email') as string,
    role: formData.get("role") as Role
    
  }
  
  const validatedData = CreateUserSchema.safeParse(data)

  if (!validatedData.success) {
    
    return {
      success: false,
      message: "Please ensure all fields are filled in correctly.",

      errors: validatedData.error.flatten().fieldErrors,
    };
  }

  const {email, role } = validatedData.data

  const redirectTo = `${config.domainName}/auth/confirm?role=${encodeURIComponent(role)}`;
  console.log("Sending magic link with role:", role, "Redirect URL:", redirectTo);
 
  const {error} = await supabase.auth.signInWithOtp({email, options: {
    emailRedirectTo:redirectTo,
    data: {
      role
    }
  }})
 
  if (error) {
    console.error('Error during sign-in:', error.message);
    return {
      success: false,
      message: "Could not authenticate user, Please try again later.",
    };
  }

  
  return {
    success: true,
    message: "Check your email for the magic link",}
   
}

export async function signOutAction() {
    
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()
    if (error) {
      return {error: error.message}
    }
    redirect('/sign-in')
  }










 
