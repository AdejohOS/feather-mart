"use server";

import { Farm } from "@/types/types";
import { createClient } from "@/utils/supabase/server";
import { toast } from "sonner";

interface Suggestion {
  id: string;
  name: string;
  subtitle?: string;
  type: "product" | "farm" | "category" | "tag";
}

// Get search suggestions for autocomplete
export async function getSearchSuggestions(query: string) {
  if (!query || query.length < 2) return [];

  const supabase = await createClient();
  const suggestions: Suggestion[] = [];

  // Normalize query for search
  const normalizedQuery = query.toLowerCase().trim();

  try {
    // Search products
    const { data: products } = await supabase
      .from("products")
      .select("id, name, description, category")
      .or(
        `name.ilike.%${normalizedQuery}%,description.ilike.%${normalizedQuery}%,category.ilike.%${normalizedQuery}%`
      )
      .limit(5);

    if (products) {
      products.forEach((product) => {
        suggestions.push({
          id: product.id,
          name: product.name,
          subtitle: product.category || "Product",
          type: "product",
        });
      });
    }

    // Search farms
    const { data: farms } = await supabase
      .from("farms")
      .select("id, name, state")
      .or(`name.ilike.%${normalizedQuery}%,state.ilike.%${normalizedQuery}%`)
      .limit(5);

    if (farms) {
      farms.forEach((farm) => {
        suggestions.push({
          id: farm.id,
          name: farm.name,
          subtitle: farm.state || "Farm",
          type: "farm",
        });
      });
    }

    // Get categories (assuming you have a categories table or a distinct list of categories)
    const { data: categories } = await supabase
      .from("products")
      .select("category")
      .ilike("category", `%${normalizedQuery}%`)
      .not("category", "is", null)
      .limit(5);

    if (categories) {
      // Get unique categories
      const uniqueCategories = Array.from(
        new Set(categories.map((item) => item.category))
      );
      uniqueCategories.forEach((category) => {
        if (category) {
          suggestions.push({
            id: category,
            name: category,
            type: "category",
          });
        }
      });
    }

    // Get tags (assuming you have a tags table or products have a tags array)
    const { data: tags } = await supabase
      .from("products")
      .select("tags")
      .not("tags", "is", null)
      .limit(20);

    if (tags) {
      // Extract all tags and filter by query
      const allTags = tags
        .flatMap((item) =>
          item.tags ? (Array.isArray(item.tags) ? item.tags : [item.tags]) : []
        )
        .filter((tag) => tag && tag.toLowerCase().includes(normalizedQuery));

      // Get unique tags
      const uniqueTags = Array.from(new Set(allTags));
      uniqueTags.slice(0, 5).forEach((tag) => {
        suggestions.push({
          id: tag,
          name: tag,
          type: "tag",
        });
      });
    }

    return suggestions;
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    return [];
  }
}

// Get search results
export async function getSearchResults(params: {
  query?: string;
  category?: string;
  tag?: string;
  page?: number;
  limit?: number;
}) {
  const { query, category, tag, page = 1, limit = 12 } = params;
  const supabase = await createClient();
  const offset = (page - 1) * limit;

  try {
    let productsQuery = supabase.from("products").select(
      `
      *,
      media:product_media(url),
      farm:farms(name, id, state)
    `,
      { count: "exact" }
    );

    // Apply filters
    if (query) {
      productsQuery = productsQuery.or(
        `name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`
      );
    }

    if (category) {
      productsQuery = productsQuery.eq("category", category);
    }

    if (tag) {
      // This assumes tags are stored as an array or in a format that can be queried
      // Adjust based on your actual data structure
      productsQuery = productsQuery.contains("tags", [tag]);
    }

    // Get paginated results
    const {
      data: products,
      count,
      error,
    } = await productsQuery
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    // If searching for farms
    let farms: Farm[] = [];
    let farmsCount = 0;

    if (query) {
      const {
        data: farmsData,
        count: farmsCountData,
        error: farmsError,
      } = await supabase
        .from("farms")
        .select("*", { count: "exact" })
        .or(`name.ilike.%${query}%,state.ilike.%${query}%`)
        .order("name", { ascending: true })
        .range(offset, offset + limit - 1);

      if (!farmsError && farmsData) {
        farms = farmsData;
        farmsCount = farmsCountData || 0;
      }
    }

    return {
      products: products || [],
      farms: farms,
      totalProducts: count || 0,
      totalFarms: farmsCount,
      page,
      limit,
    };
  } catch (error: unknown) {
    console.error(error);
    toast.error("Error fetching search results:");
    return {
      products: [],
      farms: [],
      totalProducts: 0,
      totalFarms: 0,
      page,
      limit,
    };
  }
}
