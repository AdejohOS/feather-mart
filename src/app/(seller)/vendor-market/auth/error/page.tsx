// app/auth/error/page.tsx
'use client'
import { useSearchParams } from 'next/navigation'

const errorMessages: Record<string, string> = {
  MISSING_PARAMETERS: 'Authentication parameters missing',
  INVALID_STATE: 'Invalid registration session',
  SESSION_ERROR: 'Failed to create user session',
  PROFILE_UPDATE_FAILED: 'Failed to complete seller registration',
  DEFAULT: 'An error occurred during authentication'
}

export default function AuthErrorPage() {
  const params = useSearchParams()
  const errorCode = params.get('code') || 'DEFAULT'

  return (
    <div className='mx-auto max-w-md p-4'>
      <h1 className='mb-4 text-2xl font-bold'>Authentication Error</h1>
      <p className='text-red-500'>
        {errorMessages[errorCode] || errorMessages.DEFAULT}
      </p>
      <a
        href='/vendor-marketplace/auth/sign-up'
        className='mt-4 inline-block text-blue-500'
      >
        Try Again
      </a>
    </div>
  )
}
