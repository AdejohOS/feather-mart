"use client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useGetProducts } from "@/hooks/general-app/use-products";
import { Heart, Star } from "lucide-react";
import { AddToCartButton } from "../cart/_components/add-to-cart-button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { WishlistButton } from "../wishlist/_components/wishlist-button";
import Link from "next/link";

const categories = [
  { label: "Live Poultry", value: "live-poultry" },
  { label: "Eggs", value: "eggs" },
  { label: "Meat", value: "meat" },
  { label: "Feed & Supplements", value: "feed-supplements" },
  { label: "Equipment", value: "equipment" },
];

export const FeaturedProducts = () => {
  const { data: products, isPending } = useGetProducts();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts =
    selectedCategory === null
      ? products
      : products?.filter((p) => p.category === selectedCategory);

  return (
    <div className="bg-gray-50">
      <section className="mx-auto max-w-6xl space-y-4 px-4 py-16">
        <div>
          <h2 className="text-3xl font-bold">
            Featured <span className="text-teal-600">Products</span>
          </h2>
          <div className="flex flex-col justify-between gap-3 md:flex-row">
            <p>Handpicked selections from our trusted farmers</p>

            <ScrollArea className="">
              <div className="w-max flex gap-3 space-x-4 py-4">
                <Button
                  size="sm"
                  variant={selectedCategory === null ? "secondary" : "ghost"}
                  className={cn("bg-gray-100", {
                    "bg-teal-600 text-white": selectedCategory === null,
                  })}
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Button>

                {categories.map((category) => (
                  <Button
                    size="sm"
                    key={category.value}
                    variant={
                      selectedCategory === category.value ? "default" : "ghost"
                    }
                    className={cn("bg-gray-100", {
                      "bg-teal-600 text-white":
                        selectedCategory === category.value,
                    })}
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>

              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>

        {isPending && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <div className="flex flex-col space-y-3">
              <Skeleton className="h-[125px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex flex-col space-y-3">
              <Skeleton className="h-[125px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex flex-col space-y-3">
              <Skeleton className="h-[125px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex flex-col space-y-3">
              <Skeleton className="h-[125px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex flex-col space-y-3">
              <Skeleton className="h-[125px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        )}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {filteredProducts?.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-md border transition hover:shadow-md"
            >
              <div className="group relative">
                <Link href={`/products/${product.id}`}>
                  <div className="absolute left-2 top-2 rounded bg-rose-400 px-2 py-1 text-xs font-bold text-white">
                    SALE
                  </div>
                  <Image
                    src={product.media[0]?.url || "/placeholder.svg"}
                    alt={product.name}
                    className="h-48 w-full object-contain p-4"
                    width={1000}
                    height={1000}
                    loading="lazy"
                  />
                  <div className="absolute right-2">
                    <WishlistButton productId={product.id} />
                  </div>
                </Link>
              </div>
              <div className="p-4">
                <div className="text-sm text-gray-500">
                  {" "}
                  {product.category.replace("-", " ")}
                </div>
                <h3 className="mt-1 font-medium text-gray-800">
                  {product.name} {product.weight}
                </h3>
                <div className="mt-2 flex">
                  {[1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                  <Star className="h-4 w-4 text-gray-300" />
                </div>
                <div className="mt-2 flex items-center">
                  <span className="font-bold text-gray-800">
                    ${product.discount_price}
                  </span>
                  <span className="ml-2 text-sm text-gray-500 line-through">
                    ${product.price}
                  </span>
                </div>
                <AddToCartButton productId={product.id} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
