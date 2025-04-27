"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { WishlistButton } from "../../wishlist/_components/wishlist-button";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  stock: number;
  description?: string;
  media?: Array<{ url: string }>;
  farm?: { name: string } | null;
}

interface ProductCardProps {
  product: Product;
}

interface CartItem {
  productId: string;
  quantity: number;
  // ... any other fields
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, isAddingToCart, cart } = useCart();

  // Check if product is already in cart
  const productInCart = cart.items.some(
    (item) => item.productId === product.id
  );

  const handleAddToCart = async () => {
    if (isAddingToCart || productInCart) return;

    addToCart(product.id);
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <Link href={`/products/${product.id}`}>
          <div className="relative h-48 w-full">
            <Image
              src={
                product.media && product.media.length > 0
                  ? product.media[0].url
                  : product.image_url || "/placeholder.svg?height=200&width=200"
              }
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
        </Link>
        <div className="absolute top-2 right-2">
          <WishlistButton
            productId={product.id}
            className="bg-white/80 hover:bg-white"
          />
        </div>
      </div>
      <CardContent className="p-4">
        <Link href={`/products/${product.id}`} className="hover:underline">
          <h3 className="font-semibold text-lg">{product.name}</h3>
        </Link>
        <p className="text-gray-700">${Number(product.price).toFixed(2)}</p>
        <p className="text-sm text-gray-500 mt-1">
          {product.stock > 0 ? `In stock: ${product.stock}` : "Out of stock"}
        </p>
        {product.farm && (
          <p className="text-xs text-gray-500">Seller: {product.farm.name}</p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={isAddingToCart || productInCart || product.stock === 0}
          className="w-full"
        >
          {isAddingToCart ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : productInCart ? (
            "Added to Cart"
          ) : (
            "Add to Cart"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
