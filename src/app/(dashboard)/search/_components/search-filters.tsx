"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface SearchFiltersProps {
  query: string;
  selectedCategory: string;
  selectedTag: string;
  productCount: number;
  farmCount: number;
}

export const SearchFilters = ({
  query,
  selectedCategory,
  selectedTag,
  productCount,
  farmCount,
}: SearchFiltersProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [openSections, setOpenSections] = useState({
    categories: true,
    tags: true,
  });

  // Fetch categories and tags
  useEffect(() => {
    const fetchFilters = async () => {
      setIsLoadingFilters(true);
      const supabase = createClient();

      try {
        // Fetch categories
        const { data: categoriesData } = await supabase
          .from("products")
          .select("category")
          .not("category", "is", null);

        if (categoriesData) {
          const uniqueCategories = Array.from(
            new Set(categoriesData.map((item) => item.category).filter(Boolean))
          ).sort();
          setCategories(uniqueCategories as string[]);
        }

        // Fetch tags
        const { data: tagsData } = await supabase
          .from("products")
          .select("tags")
          .not("tags", "is", null);

        if (tagsData) {
          const allTags = tagsData.flatMap((item) =>
            item.tags
              ? Array.isArray(item.tags)
                ? item.tags
                : [item.tags]
              : []
          );
          const uniqueTags = Array.from(new Set(allTags)).sort();
          setTags(uniqueTags as string[]);
        }
      } catch (error) {
        console.error("Error fetching filters:", error);
      } finally {
        setIsLoadingFilters(false);
      }
    };

    fetchFilters();
  }, []);

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (category === selectedCategory) {
      params.delete("category");
    } else {
      params.set("category", category);
    }

    params.delete("page"); // Reset to page 1
    router.push(`/search?${params.toString()}`);
  };

  const handleTagChange = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (tag === selectedTag) {
      params.delete("tag");
    } else {
      params.set("tag", tag);
    }

    params.delete("page"); // Reset to page 1
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (query) {
      params.set("q", query);
    }
    router.push(`/search?${params.toString()}`);
  };

  const hasActiveFilters = selectedCategory || selectedTag;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Categories */}
        <Collapsible
          open={openSections.categories}
          onOpenChange={(open) =>
            setOpenSections({ ...openSections, categories: open })
          }
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="flex w-full justify-between p-0 font-semibold"
            >
              Categories
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  openSections.categories ? "rotate-180" : ""
                }`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            {isLoadingFilters ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-6 w-full animate-pulse rounded bg-gray-200"
                  ></div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={category === selectedCategory}
                      onCheckedChange={() => handleCategoryChange(category)}
                    />
                    <Label
                      htmlFor={`category-${category}`}
                      className="flex-1 cursor-pointer text-sm"
                    >
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Tags */}
        <Collapsible
          open={openSections.tags}
          onOpenChange={(open) =>
            setOpenSections({ ...openSections, tags: open })
          }
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="flex w-full justify-between p-0 font-semibold"
            >
              Tags
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  openSections.tags ? "rotate-180" : ""
                }`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            {isLoadingFilters ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-6 w-full animate-pulse rounded bg-gray-200"
                  ></div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {tags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={tag === selectedTag}
                      onCheckedChange={() => handleTagChange(tag)}
                    />
                    <Label
                      htmlFor={`tag-${tag}`}
                      className="flex-1 cursor-pointer text-sm"
                    >
                      {tag}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="pt-4">
        <div className="text-sm text-gray-500">
          <p>Found {productCount} products</p>
          <p>Found {farmCount} farms</p>
        </div>
      </div>
    </div>
  );
};
