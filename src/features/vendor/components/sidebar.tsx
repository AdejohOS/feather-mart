'use client'
import { DottedSeparator } from '@/components/ui/dotted-separator'
import { Navigation } from './navigation'
import { Button } from '@/components/ui/button'
import { useLogout } from '@/hooks/use-logout'
import { LogOut } from 'lucide-react'

const Sidebar = () => {
  const { mutate } = useLogout()

  const signOut = () => {
    mutate()
  }
  return (
    <aside className='h-full w-full bg-neutral-50 p-4'>
      Hello sidebar
      <DottedSeparator className='my-4' />
      <Navigation />
      <DottedSeparator className='my-4' />
      <Button onClick={signOut} variant='danger' className='text-amber-600'>
        <LogOut />
        Logout
      </Button>
    </aside>
  )
}

export default Sidebar
