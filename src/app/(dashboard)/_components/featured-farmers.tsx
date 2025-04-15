"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useGetFarms } from "@/hooks/general-app/use-farms";
import { Skeleton } from "@/components/ui/skeleton";

export const FeaturedFarmers = () => {
  const { data: farms, isPending } = useGetFarms();

  return (
    <main className="bg-gray-50">
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">
              Featured <span className="text-teal-600">Farmers</span>
            </h2>
            <p>Get your products from these farmers near you.</p>
          </div>

          {isPending && (
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col space-y-3">
                <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-4 w-[250px]" />
              </div>
              <div className="flex flex-col space-y-3">
                <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-4 w-[250px]" />
              </div>
              <div className="flex flex-col space-y-3">
                <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-4 w-[250px]" />
              </div>
              <div className="flex flex-col space-y-3">
                <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-4 w-[250px]" />
              </div>
            </div>
          )}

          {farms?.length === 0 && (
            <div className="mt-4 flex items-center justify-center rounded-lg bg-red-50 p-4 text-sm text-red-800">
              <svg
                className="mr-3 h-5 w-5 flex-shrink-0 text-red-700"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1.293-11.293a1 1 0 00-1.414 0L7.586 9.586a1 1 0 001.414 1.414L10 9.414l2.293 2.293a1 1 0 001.414-1.414l-2.293-2.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <span className="font-medium">No farmers found.</span> Please
                check back later.
              </div>
            </div>
          )}
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {farms?.map((farm) => (
              <Link
                href={`/farms/${farm.name
                  .toLocaleLowerCase()
                  .replace(/\s+/g, "-")}`}
                key={farm.id}
                className="group"
              >
                <Card className="h-full overflow-hidden border-0 shadow-sm transition-shadow hover:shadow-md">
                  <div className="relative aspect-square">
                    <Image
                      src={farm.image || "/placeholder.svg"}
                      alt={farm.name}
                      width={1000}
                      height={1000}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="mb-2 text-xl font-semibold">{farm.name}</h3>
                    <p className="mb-1 text-sm text-muted-foreground">
                      {farm.address}
                    </p>
                    <p className="mb-3 text-sm">Specialty: {farm.farm_type}</p>
                    <Badge variant="outline" className="px-3 py-1">
                      {farm.productCount} Product
                      {farm.productCount > 1 ? "s" : ""}
                    </Badge>
                  </CardContent>
                  <CardFooter className="px-6 pb-6 pt-0">
                    <Button className="flex w-full items-center gap-2">
                      View Profile <ArrowRight className="size-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
