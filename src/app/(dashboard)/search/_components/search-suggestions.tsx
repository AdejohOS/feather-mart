"use client";

import { Tag, ShoppingBag, Home, Hash } from "lucide-react";
import { Highlighter } from "./highlighter";

type Suggestion = {
  id: string;
  name: string;
  subtitle?: string;
  type: "product" | "farm" | "category" | "tag";
};

interface SearchSuggestionsProps {
  suggestions: Suggestion[];
  onSelect: (suggestion: Suggestion) => void;
  query: string;
}

export default function SearchSuggestions({
  suggestions,
  onSelect,
  query,
}: SearchSuggestionsProps) {
  if (suggestions.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        {query.length >= 2
          ? "No results found"
          : "Type at least 2 characters to search"}
      </div>
    );
  }

  // Group suggestions by type
  const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.type]) {
      acc[suggestion.type] = [];
    }
    acc[suggestion.type].push(suggestion);
    return acc;
  }, {} as Record<string, Suggestion[]>);

  const getIcon = (type: string) => {
    switch (type) {
      case "product":
        return <ShoppingBag className="h-4 w-4 text-blue-500" />;
      case "farm":
        return <Home className="h-4 w-4 text-green-500" />;
      case "category":
        return <Tag className="h-4 w-4 text-purple-500" />;
      case "tag":
        return <Hash className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getGroupTitle = (type: string) => {
    switch (type) {
      case "product":
        return "Products";
      case "farm":
        return "Farms";
      case "category":
        return "Categories";
      case "tag":
        return "Tags";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div className="max-h-80 overflow-y-auto py-2">
      {Object.entries(groupedSuggestions).map(([type, items]) => (
        <div key={type} className="px-2">
          <div className="px-3 py-1.5 text-xs font-semibold text-gray-500">
            {getGroupTitle(type)}
          </div>
          <ul>
            {items.map((suggestion) => (
              <li key={`${type}-${suggestion.id}`}>
                <button
                  type="button"
                  onClick={() => onSelect(suggestion)}
                  className="flex w-full items-center px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                >
                  <span className="mr-2 flex-shrink-0">{getIcon(type)}</span>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">
                      <Highlighter text={suggestion.name} highlight={query} />
                    </span>
                    {suggestion.subtitle && (
                      <span className="text-xs text-gray-500">
                        <Highlighter
                          text={suggestion.subtitle}
                          highlight={query}
                        />
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
