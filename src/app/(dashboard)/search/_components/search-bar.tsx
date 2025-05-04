"use client";

import { Input } from "@/components/ui/input";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useDebounce } from "@/hooks/use-debounce";
import { Loader, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SearchSuggestions from "./search-suggestions";
import { getSearchSuggestions } from "../actions";

type SearchSuggestion = {
  id: string;
  name: string;
  type: "product" | "farm" | "category" | "tag";
};

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Handle click outside to close suggestions
  useClickOutside(searchRef, () => {
    setIsFocused(false);
  });

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await getSearchSuggestions(debouncedQuery);
        setSuggestions(results);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === "product") {
      router.push(`/products/${suggestion.id}`);
    } else if (suggestion.type === "farm") {
      router.push(`/farms/${suggestion.id}`);
    } else if (suggestion.type === "category") {
      router.push(`/search?category=${encodeURIComponent(suggestion.name)}`);
    } else if (suggestion.type === "tag") {
      router.push(`/search?tag=${encodeURIComponent(suggestion.name)}`);
    }
    setIsFocused(false);
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
  };

  return (
    <div className="relative max-w-sm md:w-lg" ref={searchRef}>
      <form action="" onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search products, farms, categories..."
            type="search"
            className="w-full pr-10 pl-10 h-12"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button type="submit" className="sr-only">
          Search
        </button>
      </form>
      {isFocused && (query.length >= 2 || suggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-md border border-gray-200 bg-white shadow-lg">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <SearchSuggestions
              suggestions={suggestions}
              onSelect={handleSuggestionClick}
              query={query}
            />
          )}
        </div>
      )}
    </div>
  );
};
