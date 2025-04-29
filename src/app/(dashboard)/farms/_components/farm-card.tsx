"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  price: number;
  count: number;
  // Add more fields as needed
}

interface Farm {
  id: number | string;
  name: string;
  description?: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  establishedDate?: string | Date;
  farmType?: string[];
  certifications?: string[] | null;
  contactEmail?: string;
  contactPhone?: string;
  website?: string | null;
  businessHours?: string;
  deliveryOptions?: string[];
  pickupAvailable?: boolean;
  wholesaleAvailable?: boolean;
  media?: Array<{ url: string }>;
  products?: Product[];
  productCount?: number;
}

interface FarmCardProps {
  farm: Farm;
}

export const FarmCard = ({ farm }: FarmCardProps) => {
  // Get the product count
  const productCount = farm.products?.[0]?.count || 0;

  // Get the first image if available
  const farmImage =
    farm.media && farm.media.length > 0
      ? farm.media[0].url
      : "/placeholder.svg?height=200&width=200";

  // Format location
  const location = [farm.city, farm.state, farm.country]
    .filter(Boolean)
    .join(", ");

  // Format established date if available
  const established = farm.establishedDate
    ? new Date(farm.establishedDate).getFullYear()
    : null;

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48 w-full">
        <Image
          src={farmImage || "/placeholder.svg"}
          alt={farm.name}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="p-4 flex-grow flex flex-col">
        <h3 className="font-semibold text-lg mb-2">{farm.name}</h3>

        {location && (
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}

        {established && (
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>Est. {established}</span>
          </div>
        )}

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {farm.description || `A producer offering quality products.`}
        </p>

        {farm.farmType && farm.farmType.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {farm.farmType.slice(0, 3).map((type) => (
              <Badge key={type} variant="outline" className="text-xs">
                {type}
              </Badge>
            ))}
            {farm.farmType.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{farm.farmType.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="mt-auto flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {farm.productCount} {productCount === 1 ? "product" : "products"}
          </span>

          <Link href={`/farms/${farm.id}`}>
            <Button variant="outline" size="sm">
              View Farm
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
