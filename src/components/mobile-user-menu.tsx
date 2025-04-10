'use client'

import { ClipboardList, HeartIcon, LogOut, User, User2Icon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { DottedSeparator } from './ui/dotted-separator'

import { useRouter } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

import { useLogout } from '@/hooks/use-logout'
import { useGetUserProfile } from '@/hooks/use-get-user-profile'

export const MobileUserMenu = () => {
  const { data: user, isLoading } = useGetUserProfile()

  const router = useRouter()

  const signIn = () => {
    router.push('/auth/sign-in')
  }

  const { mutate: logout } = useLogout()

  const { full_name, avatar_url, email } = user || {
    full_name: '',
    avatar_url: '',
    email: ''
  }

  const avatarFallback = full_name
    ? full_name.charAt(0).toUpperCase()
    : (email?.charAt(0).toLocaleUpperCase() ?? 'U')

  const surname = user?.full_name?.split(' ').pop()
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild className='relative outline-none'>
        <button className='flex items-center gap-1 border-none stroke-none'>
          {user ? (
            <Avatar className='size-10 border border-neutral-700 transition hover:opacity-75'>
              <AvatarImage src={avatar_url || ''} />
              <AvatarFallback className='flex items-center justify-center bg-neutral-200 font-medium text-neutral-500'>
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          ) : (
            <User2Icon className='size-10 shrink-0' />
          )}

          <div className='text-start'>
            <p className='text-sm'>
              {user ? <span>Hi, {surname} </span> : 'Account'}
            </p>
            <p className='text-sm font-medium'>
              {user ? 'Account' : 'Login/Register'}
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>
      {!user ? (
        <DropdownMenuContent
          align='end'
          side='bottom'
          className='w-60'
          sideOffset={10}
        >
          <div className='flex flex-col items-center justify-center gap-2 px-2.5 py-4'>
            <DropdownMenuItem
              onClick={signIn}
              className='flex h-10 w-full cursor-pointer items-center justify-center bg-teal-600 font-medium text-white hover:bg-teal-700 hover:text-white'
            >
              Sign In
            </DropdownMenuItem>
          </div>

          <DottedSeparator className='mb-1' />

          <DropdownMenuItem className='flex h-10 cursor-pointer items-center font-medium'>
            <ClipboardList className='mr-2 size-4' /> My Orders
          </DropdownMenuItem>
          <DropdownMenuItem className='flex h-10 cursor-pointer items-center font-medium'>
            <HeartIcon className='mr-2 size-4' /> My Wishlist
          </DropdownMenuItem>
        </DropdownMenuContent>
      ) : (
        <DropdownMenuContent
          align='end'
          side='bottom'
          className='w-60'
          sideOffset={10}
        >
          <div className='flex items-center gap-x-2 px-2.5 py-4'>
            <Avatar className='size-[52px] border border-neutral-700'>
              <AvatarImage src={user.avatar_url || ''} />
              <AvatarFallback className='flex items-center justify-center bg-neutral-200 text-xl font-medium text-neutral-500'>
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className='truncate text-sm text-neutral-500'>
                Welcome back, <span className='font-medium'>{surname}</span>
              </p>
              <p className='truncate text-xs text-neutral-500'>{email}</p>
            </div>
          </div>
          <DottedSeparator className='mb-1' />
          <DropdownMenuItem className='flex h-10 cursor-pointer items-center font-medium'>
            <User className='mr-2 size-4' /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem className='flex h-10 cursor-pointer items-center font-medium'>
            <User className='mr-2 size-4' />
            Manage Account
          </DropdownMenuItem>
          <DropdownMenuItem className='flex h-10 cursor-pointer items-center font-medium'>
            <User className='mr-2 size-4' /> Profile
          </DropdownMenuItem>
          <DottedSeparator className='my-1' />
          <DropdownMenuItem
            className='flex h-10 cursor-pointer items-center font-medium text-amber-700'
            onClick={() => logout()}
          >
            <LogOut className='mr-2 size-4' /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  )
}
