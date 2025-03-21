'use client'
import { useEffect, useState } from 'react'
import { Modal } from './modal'
import { Button } from '../ui/button'
import { Loader } from 'lucide-react'

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
}

export const AlertModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading
}: AlertModalProps) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }
  return (
    <Modal
      title='Are you sure?'
      description='This action cannot be undone.'
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className='flex w-full items-center justify-end space-x-2 pt-6'>
        <Button variant='outline' disabled={isLoading} onClick={onClose}>
          Cancel
        </Button>

        <Button
          disabled={isLoading}
          variant='destructive'
          onClick={onConfirm}
          className='flex items-center'
        >
          {isLoading && <Loader className='mr-2 h-4 w-4 animate-spin' />}
          Continue
        </Button>
      </div>
    </Modal>
  )
}
