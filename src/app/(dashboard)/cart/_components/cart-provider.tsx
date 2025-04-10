'use client'

import type React from 'react'

import { createContext, useContext, useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCart,
  addToCart as addToCartAction,
  updateCartItem as updateCartItemAction,
  removeFromCart as removeFromCartAction,
  clearCart as clearCartAction,
  syncLocalCartToDatabase
} from '../actions'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

// Define the structure for cart items and summary
type CartItem = {
  id: string
  product_id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    description: string
    media?: { url: string }[]
  }
}

type CartSummary = {
  items: CartItem[]
  totalItems: number
  subtotal: number
}

type CartContextType = {
  cart: CartSummary
  isLoading: boolean
  isAuthenticated: boolean
  addToCart: (
    productId: string,
    quantity: number,
    product?: any
  ) => Promise<void>
  updateCartItem: (
    itemId: string,
    quantity: number,
    productId?: string
  ) => Promise<void>
  removeCartItem: (itemId: string, productId?: string) => Promise<void>
  clearCart: () => Promise<void>
}

const CartContext = createContext<CartContextType>({
  cart: { items: [], totalItems: 0, subtotal: 0 },
  isLoading: false,
  isAuthenticated: false,
  addToCart: async () => {},
  updateCartItem: async () => {},
  removeCartItem: async () => {},
  clearCart: async () => {}
})

export const useCart = () => useContext(CartContext)

// Define the structure for local storage cart items
type LocalCartItem = {
  product_id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    description: string
    media?: { url: string }[]
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const queryClient = useQueryClient()
  const supabase = createClient()

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }

    checkAuth()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const isLoggedIn = !!session?.user
      setIsAuthenticated(isLoggedIn)

      // If user just logged in, sync local cart to database
      if (isLoggedIn) {
        syncLocalCartWithDatabase()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Function to sync local cart with database after login
  const syncLocalCartWithDatabase = async () => {
    try {
      // Get cart from local storage
      const localCartJSON = localStorage.getItem('cart')
      if (!localCartJSON) return

      const localCart = JSON.parse(localCartJSON)
      if (localCart.length === 0) return

      // Sync with database
      const result = await syncLocalCartToDatabase(localCart)

      if (result.success) {
        // Clear local storage cart after successful sync
        localStorage.removeItem('cart')

        // Invalidate cart query to refetch from database
        queryClient.invalidateQueries({ queryKey: ['cart'] })

        toast.success('Your cart has been synced with your account')
      }
    } catch (error) {
      console.error('Error syncing cart:', error)
    }
  }

  // Query to fetch cart data
  const {
    data: cart = { items: [], totalItems: 0, subtotal: 0 },
    isLoading: isCartLoading
  } = useQuery({
    queryKey: ['cart', isAuthenticated],
    queryFn: async () => {
      if (isAuthenticated) {
        // Fetch from database for authenticated users
        return await getCart()
      } else {
        // Load from local storage for anonymous users
        return loadLocalCart()
      }
    },
    // Refetch on window focus to keep cart in sync
    refetchOnWindowFocus: true
  })

  // Load cart from local storage
  const loadLocalCart = (): CartSummary => {
    if (typeof window === 'undefined') {
      return { items: [], totalItems: 0, subtotal: 0 }
    }

    try {
      const localCartJSON = localStorage.getItem('cart')
      if (!localCartJSON) {
        return { items: [], totalItems: 0, subtotal: 0 }
      }

      const localCartItems = JSON.parse(localCartJSON) as LocalCartItem[]

      // Transform local cart items to match CartItem structure
      const items = localCartItems.map((item, index) => ({
        id: `local-${index}`,
        product_id: item.product_id,
        quantity: item.quantity,
        product: item.product
      })) as CartItem[]

      // Calculate totals
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
      const subtotal = items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      )

      return {
        items,
        totalItems,
        subtotal
      }
    } catch (error) {
      console.error('Error loading cart from local storage:', error)
      return { items: [], totalItems: 0, subtotal: 0 }
    }
  }

  // Mutation to add item to cart
  const addToCartMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
      product
    }: {
      productId: string
      quantity: number
      product?: any
    }) => {
      if (isAuthenticated) {
        // Use server action for authenticated users
        return await addToCartAction(productId, quantity)
      } else {
        // Handle local storage for anonymous users
        if (!product) {
          throw new Error('Product details required for anonymous cart')
        }

        addToLocalCart(productId, product, quantity)
        return { success: true }
      }
    },
    onSuccess: () => {
      // Invalidate cart query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['cart'] })

      toast.success('Product has been added to your cart')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add to cart')
    }
  })

  // Mutation to update cart item
  const updateCartItemMutation = useMutation({
    mutationFn: async ({
      itemId,
      quantity,
      productId
    }: {
      itemId: string
      quantity: number
      productId?: string
    }) => {
      if (isAuthenticated) {
        // Use server action for authenticated users
        return await updateCartItemAction(itemId, quantity)
      } else {
        // Handle local storage for anonymous users
        if (!productId) {
          throw new Error('Product ID required for anonymous cart update')
        }

        updateLocalCartItem(productId, quantity)
        return { success: true }
      }
    },
    onMutate: async ({ itemId, quantity, productId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cart'] })

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData(['cart']) as CartSummary

      // Optimistically update the cart
      if (previousCart) {
        const updatedItems = previousCart.items.map(item => {
          if (
            (isAuthenticated && item.id === itemId) ||
            (!isAuthenticated && item.product_id === productId)
          ) {
            return {
              ...item,
              quantity
            }
          }
          return item
        })

        // If quantity is 0 or less, remove the item
        const filteredItems =
          quantity <= 0
            ? updatedItems.filter(
                item =>
                  (isAuthenticated && item.id !== itemId) ||
                  (!isAuthenticated && item.product_id !== productId)
              )
            : updatedItems

        // Calculate new totals
        const totalItems = filteredItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        )
        const subtotal = filteredItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        )

        const updatedCart = {
          items: filteredItems,
          totalItems,
          subtotal
        }

        queryClient.setQueryData(['cart'], updatedCart)
      }

      return { previousCart }
    },
    onError: (error, variables, context) => {
      // Revert to previous cart on error
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart)
      }

      toast.error(error.message || 'Failed to update cart')
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })

  // Mutation to remove cart item
  const removeCartItemMutation = useMutation({
    mutationFn: async ({
      itemId,
      productId
    }: {
      itemId: string
      productId?: string
    }) => {
      if (isAuthenticated) {
        // Use server action for authenticated users
        return await removeFromCartAction(itemId)
      } else {
        // Handle local storage for anonymous users
        if (!productId) {
          throw new Error('Product ID required for anonymous cart removal')
        }

        removeLocalCartItem(productId)
        return { success: true }
      }
    },
    onMutate: async ({ itemId, productId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cart'] })

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData(['cart']) as CartSummary

      // Optimistically update the cart
      if (previousCart) {
        const updatedItems = previousCart.items.filter(
          item =>
            (isAuthenticated && item.id !== itemId) ||
            (!isAuthenticated && item.product_id !== productId)
        )

        // Calculate new totals
        const totalItems = updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        )
        const subtotal = updatedItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        )

        const updatedCart = {
          items: updatedItems,
          totalItems,
          subtotal
        }

        queryClient.setQueryData(['cart'], updatedCart)
      }

      return { previousCart }
    },
    onError: (error, variables, context) => {
      // Revert to previous cart on error
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart)
      }

      toast.error(error.message || 'Failed to remove item')
    },
    onSuccess: () => {
      toast.success('Item has been removed from your cart')
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })

  // Mutation to clear cart
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (isAuthenticated) {
        // Use server action for authenticated users
        return await clearCartAction()
      } else {
        // Handle local storage for anonymous users
        localStorage.removeItem('cart')
        return { success: true }
      }
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cart'] })

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData(['cart']) as CartSummary

      // Optimistically update the cart
      const emptyCart = { items: [], totalItems: 0, subtotal: 0 }
      queryClient.setQueryData(['cart'], emptyCart)

      return { previousCart }
    },
    onError: (error, variables, context) => {
      // Revert to previous cart on error
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart)
      }

      toast.error(error.message || 'Failed to clear cart')
    },
    onSuccess: () => {
      toast.success('Your cart has been cleared')
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })

  // Add to local storage cart
  const addToLocalCart = (
    productId: string,
    product: any,
    quantity: number
  ) => {
    try {
      // Get existing cart from local storage
      const existingCartJSON = localStorage.getItem('cart')
      const existingCart = existingCartJSON ? JSON.parse(existingCartJSON) : []

      // Check if product already exists in cart
      const existingItemIndex = existingCart.findIndex(
        (item: any) => item.product_id === product.id
      )

      if (existingItemIndex >= 0) {
        // Update quantity if product exists
        existingCart[existingItemIndex].quantity += quantity

        // Check if new quantity exceeds available stock
      } else {
        // Add new product to cart
        existingCart.push({
          product_id: product.id,
          quantity: quantity,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            description: product.description,
            media: product.media
          }
        })
      }

      // Save updated cart to local storage
      localStorage.setItem('cart', JSON.stringify(existingCart))
    } catch (error) {
      console.error('Error adding to local cart:', error)
      throw new Error('Failed to add to local cart')
    }
  }

  // Update local storage cart item
  const updateLocalCartItem = (productId: string, newQuantity: number) => {
    try {
      // Get existing cart from local storage
      const existingCartJSON = localStorage.getItem('cart')
      if (!existingCartJSON) return

      let existingCart = JSON.parse(existingCartJSON)

      if (newQuantity <= 0) {
        // Remove item if quantity is 0 or negative
        existingCart = existingCart.filter(
          (item: any) => item.product_id !== productId
        )
      } else {
        // Update quantity
        const itemIndex = existingCart.findIndex(
          (item: any) => item.product_id === productId
        )
        if (itemIndex >= 0) {
          existingCart[itemIndex].quantity = newQuantity
        }
      }

      // Save updated cart to local storage
      localStorage.setItem('cart', JSON.stringify(existingCart))
    } catch (error) {
      console.error('Error updating local cart:', error)
      throw new Error('Failed to update local cart')
    }
  }

  // Remove item from local storage cart
  const removeLocalCartItem = (productId: string) => {
    try {
      // Get existing cart from local storage
      const existingCartJSON = localStorage.getItem('cart')
      if (!existingCartJSON) return

      let existingCart = JSON.parse(existingCartJSON)

      // Remove item
      existingCart = existingCart.filter(
        (item: any) => item.product_id !== productId
      )

      // Save updated cart to local storage
      localStorage.setItem('cart', JSON.stringify(existingCart))
    } catch (error) {
      console.error('Error removing from local cart:', error)
      throw new Error('Failed to remove from local cart')
    }
  }

  // Wrapper functions for mutations
  const addToCart = async (
    productId: string,
    quantity: number,
    product?: any
  ) => {
    await addToCartMutation.mutateAsync({ productId, quantity, product })
  }

  const updateCartItem = async (
    itemId: string,
    quantity: number,
    productId?: string
  ) => {
    await updateCartItemMutation.mutateAsync({ itemId, quantity, productId })
  }

  const removeCartItem = async (itemId: string, productId?: string) => {
    await removeCartItemMutation.mutateAsync({ itemId, productId })
  }

  const clearCart = async () => {
    await clearCartMutation.mutateAsync()
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading:
          isCartLoading ||
          addToCartMutation.isPending ||
          updateCartItemMutation.isPending ||
          removeCartItemMutation.isPending ||
          clearCartMutation.isPending,
        isAuthenticated,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
