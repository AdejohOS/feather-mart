"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ProductCard } from "./product-card";
import { FarmCard } from "./farm-card";
import { Farm, Product } from "@/types/types";

interface SearchResultsProps {
  results: {
    products: Product[];
    farms: Farm[];
    totalProducts: number;
    totalFarms: number;
    page: number;
    limit: number;
  };
  query: string;
  category: string;
  tag: string;
}

export const SearchResults = ({
  results,
  query,
  category,
  tag,
}: SearchResultsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    results.totalFarms > 0 && results.totalProducts === 0 ? "farms" : "products"
  );

  const { products, farms, totalProducts, totalFarms, page, limit } = results;
  const totalPages = Math.ceil(
    activeTab === "products" ? totalProducts / limit : totalFarms / limit
  );

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/search?${params.toString()}`);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Reset to page 1 when switching tabs
    if (page !== 1) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      router.push(`/search?${params.toString()}`);
    }
  };

  if (totalProducts === 0 && totalFarms === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">No results found</h2>
        <p className="text-gray-500 mb-6">
          We couldn&apos;t find any matches for{" "}
          {query ? `"${query}"` : "your search"}
          {category ? ` in category "${category}"` : ""}
          {tag ? ` with tag "${tag}"` : ""}
        </p>
        <Button onClick={() => router.push("/")}>Browse All Products</Button>
      </div>
    );
  }

  return (
    <div>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="products" disabled={totalProducts === 0}>
            Products ({totalProducts})
          </TabsTrigger>
          <TabsTrigger value="farms" disabled={totalFarms === 0}>
            Farms ({totalFarms})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No products found matching your criteria
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="farms">
          {farms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {farms.map((farm) => (
                <FarmCard key={farm.id} farm={farm} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No farms found matching your criteria
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
