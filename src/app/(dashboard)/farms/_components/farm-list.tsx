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
import { useGetFarms } from "@/hooks/general-app/use-farms";
import { Filter, Loader } from "lucide-react";
import { useState } from "react";
import { FarmCard } from "./farm-card";

export const FarmsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFarmType, setSelectedFarmType] = useState<string | null>(null);
  const [selectedCertification, setSelectedCertification] = useState<
    string | null
  >(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [filterPickupOnly, setFilterPickupOnly] = useState(false);
  const [filterWholesaleOnly, setFilterWholesaleOnly] = useState(false);

  const { data: farms, isLoading } = useGetFarms();

  const showLoading = isLoading;

  const farmTypes = Array.from(
    new Set(farms?.flatMap((farm) => farm.farm_type).filter(Boolean) || [])
  );

  const certifications = Array.from(
    new Set(farms?.flatMap((farm) => farm.certifications).filter(Boolean) || [])
  );

  const countries: string[] = Array.from(
    new Set(
      farms
        ?.map((farm) => farm.country)
        .filter((c): c is string => typeof c === "string") ?? []
    )
  );

  const filteredFarms = (farms ?? []).filter((farm) => {
    // Text search
    const matchesSearch =
      searchQuery === "" ||
      farm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (farm.description &&
        farm.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (farm.city &&
        farm.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (farm.state &&
        farm.state.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (farm.country &&
        farm.country.toLowerCase().includes(searchQuery.toLowerCase()));

    // Farm type filter
    const matchesFarmType =
      !selectedFarmType ||
      (farm.farm_type && farm.farm_type.includes(selectedFarmType));

    // Certification filter
    const matchesCertification =
      !selectedCertification ||
      (farm.certifications &&
        farm.certifications.includes(selectedCertification));

    // Country filter
    const matchesCountry = !selectedCountry || farm.country === selectedCountry;

    // Pickup filter
    const matchesPickup = !filterPickupOnly || farm.pickup_available === true;

    // Wholesale filter
    const matchesWholesale =
      !filterWholesaleOnly || farm.wholesale_available === true;

    return (
      matchesSearch &&
      matchesFarmType &&
      matchesCertification &&
      matchesCountry &&
      matchesPickup &&
      matchesWholesale
    );
  });

  const resetFilters = () => {
    setSelectedFarmType(null);
    setSelectedCertification(null);
    setSelectedCountry(null);
    setFilterPickupOnly(false);
    setFilterWholesaleOnly(false);
  };

  const hasActiveFilters =
    selectedFarmType ||
    selectedCertification ||
    selectedCountry ||
    filterPickupOnly ||
    filterWholesaleOnly;

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            aria-label="Search farms"
            placeholder="Search farms by name, description, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12"
          />
        </div>

        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-12"
              >
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
                <SheetTitle>Filter Farms</SheetTitle>
                <SheetDescription>
                  Narrow down farms based on your preferences
                </SheetDescription>
              </SheetHeader>

              <div className="py-4 space-y-6">
                {farmTypes.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="farmType">Farm Type</Label>
                    <Select
                      value={selectedFarmType || ""}
                      onValueChange={(value) =>
                        setSelectedFarmType(value === "all" ? null : value)
                      }
                    >
                      <SelectTrigger id="farmType">
                        <SelectValue placeholder="All farm types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All farm types</SelectItem>
                        {farmTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {certifications.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="certification">Certification</Label>
                    <Select
                      value={selectedCertification || ""}
                      onValueChange={(value) =>
                        setSelectedCertification(value === "all" ? null : value)
                      }
                    >
                      <SelectTrigger id="certification">
                        <SelectValue placeholder="All certifications" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All certifications</SelectItem>
                        {(certifications as string[]).map((cert) => (
                          <SelectItem key={cert} value={cert}>
                            {cert}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {countries.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={selectedCountry || ""}
                      onValueChange={(value) =>
                        setSelectedCountry(value === "all" ? null : value)
                      }
                    >
                      <SelectTrigger id="country">
                        <SelectValue placeholder="All countries" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All countries</SelectItem>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pickup"
                      checked={filterPickupOnly}
                      onCheckedChange={(checked) =>
                        setFilterPickupOnly(checked === true)
                      }
                    />
                    <Label htmlFor="pickup">Pickup available</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="wholesale"
                      checked={filterWholesaleOnly}
                      onCheckedChange={(checked) =>
                        setFilterWholesaleOnly(checked === true)
                      }
                    />
                    <Label htmlFor="wholesale">Wholesale available</Label>
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
      ) : filteredFarms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarms.map((farm) => (
            <FarmCard key={farm.id} farm={farm} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">
            No farms found matching your criteria.
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
