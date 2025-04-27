import React from "react";
import { getWishlist } from "./action";
import { createClient } from "@/utils/supabase/server";
import { WishlistClientWrapper } from "./_components/wishlist-client-wrapper";
import { Heart } from "lucide-react";

const Page = async () => {
  // Get initial wishlist data for SSR
  const wishlist = await getWishlist();

  // Check if user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = !!user;
  return (
    <section className="bg-gray-100">
      <div className="mx-auto px-4 max-w-6xl pt-4 pb-16 space-y-4">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <Heart className="size-6" />
          My Wishlist
        </h2>

        <WishlistClientWrapper
          initialWishlist={wishlist}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </section>
  );
};

export default Page;
