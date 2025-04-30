import React, { Suspense } from "react";
import { getSearchResults } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchResults } from "./_components/search-results";
import { SearchFilters } from "./_components/search-filters";

const Page = async ({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; tag?: string; page?: string };
}) => {
  const query = searchParams.q || "";
  const category = searchParams.category || "";
  const tag = searchParams.tag || "";
  const page = Number.parseInt(searchParams.page || "1", 10);

  // Get search results
  const results = await getSearchResults({
    query,
    category,
    tag,
    page,
    limit: 12,
  });

  // Determine the search title
  let searchTitle = "Search Results";
  if (query) {
    searchTitle = `Results for "${query}"`;
  } else if (category) {
    searchTitle = `Category: ${category}`;
  } else if (tag) {
    searchTitle = `Tag: ${tag}`;
  }
  return (
    <section className="bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 pt-4 pb-16">
        <h1 className="text-2xl font-bold mb-6">{searchTitle}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
          <div className="lg:col-span-1 border-r-1 sticky h-fit">
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              <SearchFilters
                query={query}
                selectedCategory={category}
                selectedTag={tag}
                productCount={results.totalProducts}
                farmCount={results.totalFarms}
              />
            </Suspense>
          </div>

          <div className="lg:col-span-3">
            <Suspense
              fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-[300px] w-full" />
                    ))}
                </div>
              }
            >
              <SearchResults
                results={results}
                query={query}
                category={category}
                tag={tag}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Page;
