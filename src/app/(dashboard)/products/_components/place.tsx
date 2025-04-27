"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { ArrowLeft, Check, Loader, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { IoMdArrowDropleft } from "react-icons/io";
import { WishlistButton } from "../../wishlist/_components/wishlist-button";
import Image from "next/image";
import { ProductMedia } from "./product-media";
import { useGetProduct } from "@/hooks/general-app/use-products";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface ProductDetailsProps {
  productId: string;
}

export const ProductDetails = ({ productId }: ProductDetailsProps) => {
  const { data: product, isLoading, error } = useGetProduct(productId);
  const { addToCart, isAddingToCart, cart } = useCart();
  const productInCart = cart.items.some((item) => item.productId === productId);

  if (isLoading) {
    return <h2>loading....</h2>;
  }

  if (error || !product) {
    console.error("Error fetching product:", error?.message || error);
    notFound();
  }

  const handleAddToCart = () => {
    if (isAddingToCart || productInCart) return;
    addToCart(productId);
  };
  return (
    <section>
      <div className="max-w-6xl px-4 pt-4 pb-16 mx-auto">
        <div className="mb-4">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft />
              Back to Products
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3 md:grid-rows-[auto,1fr] relative">
          <div className="h-fit md:col-span-1  text-gray-500 md:sticky md:top-40">
            <ProductMedia
              media={
                product?.media?.map((item) => ({
                  id: item.id,
                  url: item.url,
                  type: item.type as "image" | "video",
                })) || []
              }
            />
          </div>

          <div className="w-full md:col-span-2">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold mb-2">{product?.name}</h1>

              <WishlistButton productId={product.id} />
            </div>

            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-semibold mb-4">
                ${Number(product.price)}
              </p>
              <span className="ml-1 text-sm text-muted-foreground">
                per {product.unit}
              </span>
            </div>

            {product.farms && (
              <p className="text-sm text-gray-600 mb-4">
                Seller: {product.farms.name}
              </p>
            )}

            {(product.age || product.weight) && (
              <div className="grid grid-cols-2 gap-4">
                {product.age && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Age</h2>
                    <p>{product.age}</p>
                  </div>
                )}

                {product.weight && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Weight</h2>
                    <p>{product.weight}</p>
                  </div>
                )}
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-600">
                {product.description ||
                  `This is a placeholder description for ${product.name}. In a real application, this would contain detailed information about the product's features, specifications, and benefits.`}
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Availability</h2>
              <p
                className={
                  product.stock > 0 ? "text-green-600" : "text-red-600"
                }
              >
                {product.stock > 0
                  ? `In Stock (${product.stock} available)`
                  : "Out of Stock"}
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={
                  isAddingToCart || productInCart || product.stock === 0
                }
                size="lg"
                className="flex-1"
              >
                {isAddingToCart ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Adding to Cart...
                  </>
                ) : productInCart ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </Button>{" "}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
