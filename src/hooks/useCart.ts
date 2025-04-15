"use client";

import { useQuery } from "@tanstack/react-query";
import { getCartClient } from "@/lib/getCartClient";

export function useGetUserCart() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: getCartClient,
  });
}
