"use client";

import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/use-wishlist";
import { Loader } from "lucide-react";
import Link from "next/link";
import { WishlistItems } from "./wishlist-items";
import { Wishlist } from "@/types/types";

interface WishlistClientWrapperProps {
  initialWishlist: Wishlist;
  isAuthenticated: boolean;
}
export const WishlistClientWrapper = ({
  initialWishlist,
  isAuthenticated,
}: WishlistClientWrapperProps) => {
  const { wishlist, isLoading } = useWishlist();

  // Use the fetched wishlist data, falling back to initial data
  const currentWishlist = isLoading ? initialWishlist : wishlist;
  const hasItems = currentWishlist.items.length > 0;

  // If the wishlist is loading and we have initial data with items, show the initial data
  if (isLoading && initialWishlist.items.length > 0) {
    return (
      <div>
        <WishlistItems items={initialWishlist.items} />
      </div>
    );
  }

  // If the wishlist is loading and we don't have initial data with items, show loading
  if (isLoading && initialWishlist.items.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }
  return (
    <div>
      {hasItems ? (
        <WishlistItems items={currentWishlist.items} />
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8">
            Save items you&apos;re interested in for later.
          </p>
          <Link href="/">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      )}

      {!isAuthenticated && hasItems && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            Sign in to save your wishlist and access it from any device.
          </p>
          <Link href="/auth/sign-in?redirect=/wishlist">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
