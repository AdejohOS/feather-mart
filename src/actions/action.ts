'use server'

import { createClient } from '@/utils/supabase/server'
import { ActionResponse, Role, SignUpType } from '../types/types'

import { redirect } from 'next/navigation'
import config from '../../config'
import { SignInUserSchema, SignUpUserSchema } from '@/lib/schema'
import { revalidatePath } from 'next/cache'

export async function signUpWithPassword(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient()

  const data: SignUpType = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    role: formData.get('role') as Role
  }

  const validatedData = SignUpUserSchema.safeParse(data)

  if (!validatedData.success) {
    return {
      success: false,
      message: 'Please ensure all fields are filled in correctly.',

      errors: validatedData.error.flatten().fieldErrors,
      inputs: data
    }
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: validatedData.data.email,
    password: validatedData.data.password,
    options: {
      data: {
        role: validatedData.data.role,
        full_name: validatedData.data.name
      }
    }
  })

  if (authError) {
    console.error('Error during sign-up:', authError.message)
    return {
      success: false,
      message: 'Error during sign-up'
    }
  }

  if (authData.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      email: validatedData.data.email,
      username: validatedData.data.email.split('@')[0],
      full_name: validatedData.data.name,
      role: validatedData.data.role
    })

    if (profileError) {
      console.error('Error creating profile:', profileError.message)
      return {
        success: false,
        message: 'Error creating profile'
      }
    }

    return {
      success: true,
      message: 'Check your email for the confirmation link'
    }
  }
  redirect('/vendor-market/auth/sign-in')
}

export async function signInWithPassword(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient()

  const signinData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string
  }

  const validatedData = SignInUserSchema.safeParse(signinData)

  if (!validatedData.success) {
    return {
      success: false,
      message: 'Please ensure all fields are filled in correctly.',
      errors: validatedData.error.flatten().fieldErrors
    }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: validatedData.data.email,
    password: validatedData.data.password
  })

  if (error) {
    console.error('Error during sign-in:', error.message)
    return {
      success: false,
      message: `Could not sign-in user, ${error.message}`
    }
  }

  return redirect('/vendor-marketplace')

  return {
    success: true,
    message: 'Sign-in successful! Redirecting...'
  }
}

export async function signOutAction() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()
  if (error) {
    return { error: error.message }
  }
  redirect('/sign-in')
}
