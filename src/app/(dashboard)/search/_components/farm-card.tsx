"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";

interface FarmCardProps {
  farm: {
    id: number;
    name: string;
    description?: string;
    location?: string;
    image_url?: string;
    product_count?: number;
  };
}
export const FarmCard = ({ farm }: FarmCardProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={farm.image_url || "/placeholder.svg?height=200&width=200"}
          alt={farm.name}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg">{farm.name}</h3>
        {farm.location && (
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{farm.location}</span>
          </div>
        )}
        {farm.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {farm.description}
          </p>
        )}
        {farm.product_count !== undefined && (
          <p className="text-sm text-gray-500 mt-1">
            {farm.product_count} products
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/farms/${farm.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Farm
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
