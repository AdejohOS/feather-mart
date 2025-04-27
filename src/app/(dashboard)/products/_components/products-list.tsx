"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { useGetProducts } from "@/hooks/general-app/use-products";
import { Filter, Loader } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "../../search/_components/product-card";
import { useDebounce } from "@/hooks/use-debounce";

export const ProductsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [filterOrganic, setFilterOrganic] = useState(false);
  const [filterFreeRange, setFilterFreeRange] = useState(false);
  const [filterInStock, setFilterInStock] = useState(false);

  const { data: products, isLoading, isFetching } = useGetProducts();

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const showLoading = isLoading || isFetching;

  const categories = useMemo(
    () => Array.from(new Set(products?.map((p) => p.category).filter(Boolean))),
    [products]
  );

  const farms = useMemo(() => {
    if (!products) return [];
    const farmSet = new Map();
    for (const product of products) {
      if (product.farm) farmSet.set(product.farm.id, product.farm.name);
    }
    return Array.from(farmSet.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  const [minPrice, maxPrice] = useMemo(() => {
    const prices = products?.map((p) => Number(p.price)).filter(Boolean) ?? [];
    if (prices.length === 0) return [0, 1000];
    return [Math.min(...prices), Math.max(...prices)];
  }, [products]);

  // Filter products based on search query and filters
  const filteredProducts = products?.filter((product) => {
    // Text search
    const matchesSearch =
      debouncedSearchQuery === "" ||
      product.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      (product.description &&
        product.description
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase())) ||
      (product.category &&
        product.category
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase())) ||
      (product.breed &&
        product.breed
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase()));

    // Category filter
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;

    // Farm filter
    const matchesFarm =
      !selectedFarm ||
      (product.farm && product.farm.id.toString() === selectedFarm);

    // Price range filter
    const price = Number(product.price);
    const matchesPriceRange = price >= priceRange[0] && price <= priceRange[1];

    // Organic filter
    const matchesOrganic = !filterOrganic || product.is_organic === true;

    // Free range filter
    const matchesFreeRange = !filterFreeRange || product.is_free_range === true;

    // In stock filter
    const matchesInStock =
      !filterInStock || (product.stock && product.stock > 0);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesFarm &&
      matchesPriceRange &&
      matchesOrganic &&
      matchesFreeRange &&
      matchesInStock
    );
  });

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedFarm(null);
    setPriceRange([minPrice, maxPrice]);
    setFilterOrganic(false);
    setFilterFreeRange(false);
    setFilterInStock(false);
  };

  const hasActiveFilters =
    selectedCategory ||
    selectedFarm ||
    priceRange[0] > minPrice ||
    priceRange[1] < maxPrice ||
    filterOrganic ||
    filterFreeRange ||
    filterInStock;
  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search products by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12"
          />
        </div>

        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    !
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="p-4">
              <SheetHeader>
                <SheetTitle>Filter Products</SheetTitle>
                <SheetDescription>
                  Narrow down products based on your preferences
                </SheetDescription>
              </SheetHeader>

              <div className="py-4 space-y-6">
                {categories.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={selectedCategory || ""}
                      onValueChange={(value) =>
                        setSelectedCategory(value === "all" ? null : value)
                      }
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {farms.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="farm">Farm</Label>
                    <Select
                      value={selectedFarm || ""}
                      onValueChange={(value) =>
                        setSelectedFarm(value === "all" ? null : value)
                      }
                    >
                      <SelectTrigger id="farm">
                        <SelectValue placeholder="All farms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All farms</SelectItem>
                        {farms.map((farm) => (
                          <SelectItem
                            key={farm.id.toString()}
                            value={farm.id.toString()}
                          >
                            {farm.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-4">
                  <Label>
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </Label>
                  <Slider
                    defaultValue={[minPrice, maxPrice]}
                    min={minPrice}
                    max={maxPrice}
                    step={1}
                    value={priceRange}
                    onValueChange={(value) =>
                      setPriceRange(value as [number, number])
                    }
                    className="my-6"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="organic"
                      checked={filterOrganic}
                      onCheckedChange={(checked) =>
                        setFilterOrganic(checked === true)
                      }
                    />
                    <Label htmlFor="organic">Organic</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="freeRange"
                      checked={filterFreeRange}
                      onCheckedChange={(checked) =>
                        setFilterFreeRange(checked === true)
                      }
                    />
                    <Label htmlFor="freeRange">Free Range</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inStock"
                      checked={filterInStock}
                      onCheckedChange={(checked) =>
                        setFilterInStock(checked === true)
                      }
                    />
                    <Label htmlFor="inStock">In Stock</Label>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                  <SheetClose asChild>
                    <Button>Apply Filters</Button>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={resetFilters}
              className="hidden md:flex"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {showLoading ? (
        <div className="flex justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (filteredProducts ?? []).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(filteredProducts ?? []).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">
            No products found matching{" "}
            {debouncedSearchQuery
              ? ` “${debouncedSearchQuery}”`
              : " your criteria"}
            .
          </p>
          {hasActiveFilters && (
            <Button onClick={resetFilters} variant="outline">
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
