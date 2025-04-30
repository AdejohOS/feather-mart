"use client";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useGetFarms } from "@/hooks/use-seller-farms";
import { UseFormReturn } from "react-hook-form";

interface FarmSelectorProps {
  form: UseFormReturn;
}

export function FarmSelector({ form }: FarmSelectorProps) {
  const { data: farms, isLoading } = useGetFarms();

  return (
    <FormField
      control={form?.control}
      name="farmId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Farm (Optional)</FormLabel>
          <div className="flex gap-2">
            <Select
              disabled={isLoading || !farms || farms?.length === 0}
              onValueChange={(value) =>
                field.onChange(value === "none" ? "null" : value)
              }
              value={field.value ?? ""}
            >
              <FormControl>
                <SelectTrigger className="flex-1">
                  <SelectValue
                    placeholder={
                      isLoading
                        ? "Loading farms..."
                        : farms?.length === 0
                        ? "No farms available"
                        : "Select a farm"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {farms?.map((farm) => (
                  <SelectItem key={farm.id} value={farm.id}>
                    {farm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Link href="/vendor-marketplace/farms/create">
              <Button type="button" variant="outline" size="icon">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <FormDescription>
            Associate this product with one of your farms (optional)
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
