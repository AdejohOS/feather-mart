import { Role } from '@/types/types'
import { z } from 'zod'

export const SignUpUserSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email(),
  role: z.nativeEnum(Role, {
    required_error: 'Role is required',
    invalid_type_error: 'Invalid user role'
  }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .regex(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter'
    })
    .regex(/[!@#$%^&*]/, {
      message: 'Password must contain at least one special character (!@#$%^&*)'
    })
})

export type SignUpUserValues = z.infer<typeof SignUpUserSchema>

export const SignInUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters')
})
export type SignInUserValues = z.infer<typeof SignInUserSchema>
