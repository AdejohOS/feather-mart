"use server"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export type CartItem = {
  id: string
  product_id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    description: string
    media?: { url: string }[]
    available_quantity?: number
  }
}

export type CartSummary = {
    items: CartItem[]
    totalItems: number
    subtotal: number
  }

  export async function getCart(): Promise<CartSummary> {
    const supabase = await createClient()

    const {data: {user}} = await supabase.auth.getUser()
  
    if (!user) {
        return {items:[], totalItems:0, subtotal:0}
    }

    const {data: cartItems, error} = await supabase.from("cart_items").select(`id, product_id, quantity, product:products(id, name, price, description, stock, media:product_media(url))`).eq("user_id", user.id).order("created_at", {ascending: false})

    if (error) {
      console.error("Error fetching cart:", error)
      return { items: [], totalItems: 0, subtotal: 0 }
    }

    const items = cartItems as CartItem[]
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

    return {
      items, 
      totalItems,
      subtotal
    }

  }

  export async function getProductDetails(productId: string) {
    const supabase = await createClient()

    const {data: product, error} = await supabase.from("products").select(`id, name, price, description, stock, media:product_media(url)`).eq("id", productId).single()

    if (error || !product) {
      console.error("Error fetching product:", error)
      return {
        success: false,
        message: "Product not found",
        product: null,
      }
    }

    return product
  }

  export async function addToCart(productId: string, quantity = 1) {
    const supabase = await createClient()
  
    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()
  
    // Check if product exists and get details
    const { data: product, error: productError } = await supabase
      .from("products")
      .select(`
        id,
        name,
        price,
        description,
        stock as available_quantity,
        media:product_media(url)
      `)
      .eq("id", productId)
      .single()
  
    if (productError || !product) {
      console.error("Error fetching product:", productError)
      return {
        success: false,
        message: "Product not found",
        product: null,
      }
    }
  
    // For anonymous users, return product details
    if (!user) {
      return {
        success: true,
        message: "Product details retrieved for local cart",
        product,
      }
    }
  
    // For authenticated users, add to database
    try {
      // Check if item is already in cart
      const { data: existingItem, error: checkError } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle()
  
      if (checkError) {
        console.error("Error checking cart:", checkError)
        return {
          success: false,
          message: "Failed to check cart",
          product: null,
        }
      }
  
      if (existingItem) {
        // Update quantity if item exists
        const newQuantity = existingItem.quantity + quantity
  
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({
            quantity: newQuantity,
          })
          .eq("id", existingItem.id)
  
        if (updateError) {
          console.error("Error updating cart:", updateError)
          return {
            success: false,
            message: "Failed to update cart",
            product: null,
          }
        }
      } else {
        // Add new item to cart
        const { error: insertError } = await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: productId,
          quantity: quantity,
         
        })
  
        if (insertError) {
          console.error("Error adding to cart:", insertError)
          return {
            success: false,
            message: "Failed to add to cart",
            product: null,
          }
        }
      }
  
      // Revalidate cart-related paths
      revalidatePath("/cart")
      revalidatePath("/products/[id]")
  
      return {
        success: true,
        message: "Added to cart successfully",
        product: null,
      }
    } catch (error) {
      console.error("Error in addToCart:", error)
      return {
        success: false,
        message: "An unexpected error occurred",
        product: null,
      }
    }
  }

  export async function updateCartItem(itemId: string, quantity: number){
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
  
    if (!user) {
      return {
        success: false,
        message: "You must be logged in to update your cart",
      }
    }

    try {
      // Verify the cart item belongs to the user
      const { data: cartItem, error: checkError } = await supabase
        .from("cart_items")
        .select("id, product_id, user_id")
        .eq("id", itemId)
        .eq("user_id", user.id)
        .single()
  
      if (checkError || !cartItem) {
        return {
          success: false,
          message: "Cart item not found",
        }
      }
  
      // Check product availability if increasing quantity
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("stock")
        .eq("id", cartItem.product_id)
        .single()
  
      if (productError || !product) {
        return {
          success: false,
          message: "Product not found",
        }
      }
  
      if (quantity > product.stock) {
        return {
          success: false,
          message: "Not enough quantity available",
        }
      }
  
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        const { error: deleteError } = await supabase.from("cart_items").delete().eq("id", itemId)
  
        if (deleteError) {
          console.error("Error removing cart item:", deleteError)
          return {
            success: false,
            message: "Failed to remove item from cart",
          }
        }
      } else {
        // Update quantity
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({
            quantity: quantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", itemId)
  
        if (updateError) {
          console.error("Error updating cart:", updateError)
          return {
            success: false,
            message: "Failed to update cart",
          }
        }
      }
  
      // Revalidate cart-related paths
      revalidatePath("/cart")
  
      return {
        success: true,
        message: quantity <= 0 ? "Item removed from cart" : "Cart updated successfully",
      }
    }catch (error) {
      console.error("Error in updateCartItem:", error)
      return {
        success: false,
        message: "An unexpected error occurred",
      }
    }
  }

  export async function removeFromCart(itemId:string){
    const supabase = await createClient()

    // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      message: "You must be logged in to remove items from your cart",
    }
  }

  try {
    // Verify the cart item belongs to the user
    const { data: cartItem, error: checkError } = await supabase
      .from("cart_items")
      .select("id, user_id")
      .eq("id", itemId)
      .eq("user_id", user.id)
      .single()

    if (checkError || !cartItem) {
      return {
        success: false,
        message: "Cart item not found",
      }
    }

    // Remove the item
    const { error: deleteError } = await supabase.from("cart_items").delete().eq("id", itemId)

    if (deleteError) {
      console.error("Error removing cart item:", deleteError)
      return {
        success: false,
        message: "Failed to remove item from cart",
      }
    }

    // Revalidate cart-related paths
    revalidatePath("/cart")

    return {
      success: true,
      message: "Item removed from cart",
    }
  } catch (error) {
    console.error("Error in removeFromCart:", error)
    return {
      success: false,
      message: "An unexpected error occurred",
    }
  }
  }

  export async function clearCart() {
    const supabase = await createClient()
  
    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()
  
    if (!user) {
      return {
        success: false,
        message: "You must be logged in to clear your cart",
      }
    }
  
    try {
      // Delete all cart items for the user
      const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id)
  
      if (error) {
        console.error("Error clearing cart:", error)
        return {
          success: false,
          message: "Failed to clear cart",
        }
      }
  
      // Revalidate cart-related paths
      revalidatePath("/cart")
  
      return {
        success: true,
        message: "Cart cleared successfully",
      }
    } catch (error) {
      console.error("Error in clearCart:", error)
      return {
        success: false,
        message: "An unexpected error occurred",
      }
    }
  }

  export async function syncLocalCartToDatabase(localCart: any[]) {
    const supabase = await createClient()
  
    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()
  
    if (!user) {
      return {
        success: false,
        message: "You must be logged in to sync your cart",
      }
    }
  
    try {
      // Get existing cart items
      const { data: existingItems, error: fetchError } = await supabase
        .from("cart_items")
        .select("product_id, quantity")
        .eq("user_id", user.id)
  
      if (fetchError) {
        console.error("Error fetching existing cart items:", fetchError)
        return {
          success: false,
          message: "Failed to fetch existing cart items",
        }
      }
  
      // Create a map of existing items for quick lookup
      const existingItemsMap = new Map()
      existingItems?.forEach((item) => {
        existingItemsMap.set(item.product_id, item.quantity)
      })
  
      // Process local cart items
      for (const item of localCart) {
        const productId = item.product_id
        const quantity = item.quantity
  
        // Check if product exists and is in stock
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("stock")
          .eq("id", productId)
          .single()
  
        if (productError || !product) {
          console.error(`Product ${productId} not found or error:`, productError)
          continue
        }
  
        if (existingItemsMap.has(productId)) {
          // Update existing item
          const newQuantity = Math.min(existingItemsMap.get(productId) + quantity, product.stock)
  
          const { error: updateError } = await supabase
            .from("cart_items")
            .update({
              quantity: newQuantity,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id)
            .eq("product_id", productId)
  
          if (updateError) {
            console.error(`Error updating cart item ${productId}:`, updateError)
          }
        } else {
          // Add new item
          const newQuantity = Math.min(quantity, product.stock)
  
          const { error: insertError } = await supabase.from("cart_items").insert({
            user_id: user.id,
            product_id: productId,
            quantity: newQuantity,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
  
          if (insertError) {
            console.error(`Error inserting cart item ${productId}:`, insertError)
          }
        }
      }
  
      // Revalidate cart-related paths
      revalidatePath("/cart")
  
      return {
        success: true,
        message: "Cart synced successfully",
      }
    } catch (error) {
      console.error("Error in syncLocalCartToDatabase:", error)
      return {
        success: false,
        message: "An unexpected error occurred",
      }
    }
  }


  export async function getProductAction(productId: string) {
    const supabase = await createClient()
  
    const { data: product, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        price,
        description,
        stock,
        media:product_media(url)
      `)
      .eq("id", productId)
      .single()
  
    if (error || !product) {
      console.error("Error fetching product:", error)
      return null
    }
  
    return product
  }