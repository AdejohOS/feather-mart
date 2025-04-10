import { ShoppingCart } from 'lucide-react'

export const Cart = () => {
  return (
    <div className='relative'>
      <ShoppingCart className='size-8 shrink-0' />
      <p className='absolute right-[-4px] top-0 rounded-md bg-teal-700 p-[2px] text-xs text-white'>
        43
      </p>
    </div>
  )
}
