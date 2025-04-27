"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { Loader, ShoppingCart, Trash } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  category: string;
  stock?: number;
  media?: Array<{ url: string }>;
  farm?: { name: string };
}

interface WishlistItemsProps {
  items: WishlistItem[];
}

export const WishlistItems = ({ items }: WishlistItemsProps) => {
  const { removeFromWishlist, isRemovingFromWishlist } = useWishlist();
  const { addToCart, isAddingToCart, cart } = useCart();

  const handleRemoveItem = (productId: string) => {
    removeFromWishlist(productId);
  };

  const handleAddToCart = (productId: string) => {
    addToCart(productId);
  };

  const cartProductIds = new Set(
    cart.items.map((item: { productId: string }) => item.productId)
  );
  const isInCart = (productId: string) => cartProductIds.has(productId);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <div
          key={item.productId}
          className="overflow-hidden rounded-md border transition hover:shadow-md"
        >
          <div className="group relative">
            <Image
              src={
                item.media && item.media.length > 0
                  ? item.media[0].url
                  : "/placeholder.svg?height=200&width=200"
              }
              width={300}
              height={300}
              alt={item.name}
              loading="lazy"
              className="h-48 w-full object-contain p-4"
            />
            <div className="absolute right-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleRemoveItem(item.productId)}
                disabled={isRemovingFromWishlist}
                aria-label="Remove from wishlist"
              >
                <Trash className="size-4" />
              </Button>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-500"> {item.category}</p>
            <Link
              href={`/products/${item.productId}`}
              className="hover:underline"
            >
              <h3 className="font-semibold text-lg">{item.name}</h3>
            </Link>
            <p className="text-gray-700 mb-2">
              ${Number(item.price).toFixed(2)}
            </p>

            {item.farm?.name && (
              <p className="text-xs text-gray-500 mb-4">
                Seller: {item.farm.name}
              </p>
            )}

            <p className="text-sm text-gray-500 mb-4">
              {item.stock && item.stock > 0
                ? `In stock: ${item.stock}`
                : "Out of stock"}
            </p>

            <Button
              onClick={() => handleAddToCart(item.productId)}
              disabled={
                isAddingToCart ||
                isInCart(item.productId) ||
                (item.stock !== undefined && item.stock <= 0)
              }
              className="w-full"
            >
              {isAddingToCart ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : isInCart(item.productId) ? (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
