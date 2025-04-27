"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetFarm, useGetFarmProducts } from "@/hooks/general-app/use-farms";
import {
  Calendar,
  Clock,
  DollarSign,
  Factory,
  Globe,
  Home,
  Loader,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Ruler,
  Shield,
  ShoppingBag,
  Tag,
  Truck,
  Warehouse,
} from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "../../search/_components/product-card";

interface FarmDetailsProps {
  farmId: string;
}
export const FarmDetails = ({ farmId }: FarmDetailsProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  const {
    data: farm,
    isLoading: isLoadingFarm,
    isFetching: isFetchingFarm,
  } = useGetFarm(farmId);

  const {
    data: products = [],
    isLoading: isLoadingProducts,
    isFetching: isFetchingProducts,
  } = useGetFarmProducts(farmId);

  // Show loading states
  const isLoadingFarmData = isLoadingFarm || isFetchingFarm;
  const isLoadingProductsData = isLoadingProducts || isFetchingProducts;

  const [selectedImage, setSelectedImage] = useState(
    farm?.media && farm.media.length > 0
      ? farm.media[0].url
      : "/placeholder.svg?height=400&width=400"
  );

  useEffect(() => {
    if (farm?.media?.length) {
      setSelectedImage(farm.media[0].url);
    }
  }, [farm]);

  // Format established date if available
  const establishedDate = farm?.established_date
    ? new Date(farm.established_date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // Format location
  const formattedAddress = [
    farm?.address,
    farm?.city,
    farm?.state,
    farm?.postal_code,
    farm?.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      {isLoadingFarmData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <Skeleton className="aspect-square rounded-lg w-full" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-10 w-2/3 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-3/4 mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
              <Image
                src={selectedImage || "/placeholder.svg"}
                alt={farm?.name || "Farm image"}
                fill
                className="object-cover"
              />
            </div>

            {farm?.media && farm.media.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {farm.media.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(media.url)}
                    className={`relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden border-2 ${
                      selectedImage === media.url
                        ? "border-black"
                        : "border-transparent"
                    }`}
                  >
                    <Image
                      src={media.url || "/placeholder.svg"}
                      alt={`${farm.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-4">{farm?.name}</h1>

            {formattedAddress && (
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>{formattedAddress}</span>
              </div>
            )}

            {establishedDate && (
              <div className="flex items-center text-gray-600 mb-4">
                <Calendar className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>Established: {establishedDate}</span>
              </div>
            )}

            {farm?.farm_type && farm.farm_type.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {Array.isArray(farm.farm_type) &&
                  farm.farm_type.map((type) => (
                    <Badge key={type} variant="secondary">
                      {type}
                    </Badge>
                  ))}
              </div>
            )}

            <div className="prose max-w-none mb-6">
              <p>
                {farm?.description || "No description available for this farm."}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              {farm?.website && (
                <a
                  href={
                    farm.website.startsWith("http")
                      ? farm.website
                      : `https://${farm.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                  </Button>
                </a>
              )}

              {farm?.contact_email && (
                <a href={`mailto:${farm.contact_email}`}>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
        <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Farm Details</TabsTrigger>
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
          <TabsTrigger value="business">Business Info</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        {isLoadingFarmData ? (
          <div className="mt-6 flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Basic Information
                    </h3>
                    <dl className="space-y-3">
                      {farm?.size && (
                        <div className="flex items-start">
                          <dt className="w-1/3 text-gray-500 flex items-center">
                            <Ruler className="h-4 w-4 mr-2" />
                            Size:
                          </dt>
                          <dd className="w-2/3">{farm.size}</dd>
                        </div>
                      )}

                      {farm?.farm_type && farm.farm_type.length > 0 && (
                        <div className="flex items-start">
                          <dt className="w-1/3 text-gray-500 flex items-center">
                            <Tag className="h-4 w-4 mr-2" />
                            Farm Type:
                          </dt>
                          <dd className="w-2/3">{farm.farm_type.join(", ")}</dd>
                        </div>
                      )}

                      {farm?.certifications &&
                        farm.certifications.length > 0 && (
                          <div className="flex items-start">
                            <dt className="w-1/3 text-gray-500 flex items-center">
                              <Shield className="h-4 w-4 mr-2" />
                              Certifications:
                            </dt>
                            <dd className="w-2/3">
                              {farm.certifications.join(", ")}
                            </dd>
                          </div>
                        )}
                    </dl>
                  </CardContent>
                </Card>

                {/* Contact Info */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Contact Information
                    </h3>
                    <dl className="space-y-3">
                      {farm?.contact_name && (
                        <div className="flex items-start">
                          <dt className="w-1/3 text-gray-500">Contact:</dt>
                          <dd className="w-2/3">{farm.contact_name}</dd>
                        </div>
                      )}

                      {farm?.contact_email && (
                        <div className="flex items-start">
                          <dt className="w-1/3 text-gray-500 flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            Email:
                          </dt>
                          <dd className="w-2/3">
                            <a
                              href={`mailto:${farm.contact_email}`}
                              className="text-blue-600 hover:underline"
                            >
                              {farm.contact_email}
                            </a>
                          </dd>
                        </div>
                      )}

                      {farm?.contact_phone && (
                        <div className="flex items-start">
                          <dt className="w-1/3 text-gray-500 flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            Phone:
                          </dt>
                          <dd className="w-2/3">
                            <a
                              href={`tel:${farm.contact_phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {farm.contact_phone}
                            </a>
                          </dd>
                        </div>
                      )}

                      {farm?.website && (
                        <div className="flex items-start">
                          <dt className="w-1/3 text-gray-500 flex items-center">
                            <Globe className="h-4 w-4 mr-2" />
                            Website:
                          </dt>
                          <dd className="w-2/3">
                            <a
                              href={
                                farm.website.startsWith("http")
                                  ? farm.website
                                  : `https://${farm.website}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {farm.website}
                            </a>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </CardContent>
                </Card>

                {/* Business Hours & Delivery */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Hours & Delivery
                    </h3>
                    <dl className="space-y-3">
                      {farm?.business_hours && (
                        <div className="flex items-start">
                          <dt className="w-1/3 text-gray-500 flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            Hours:
                          </dt>
                          <dd className="w-2/3">{farm.business_hours}</dd>
                        </div>
                      )}

                      {farm?.delivery_options &&
                        farm.delivery_options.length > 0 && (
                          <div className="flex items-start">
                            <dt className="w-1/3 text-gray-500 flex items-center">
                              <Truck className="h-4 w-4 mr-2" />
                              Delivery:
                            </dt>
                            <dd className="w-2/3">
                              {farm.delivery_options.join(", ")}
                            </dd>
                          </div>
                        )}

                      {farm?.pickup_available && (
                        <div className="flex items-start">
                          <dt className="w-1/3 text-gray-500 flex items-center">
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Pickup:
                          </dt>
                          <dd className="w-2/3">
                            Available
                            {farm.pickup_details && (
                              <span> - {farm.pickup_details}</span>
                            )}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </CardContent>
                </Card>

                {/* Payment & Wholesale */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Payment & Wholesale
                    </h3>
                    <dl className="space-y-3">
                      {farm?.payment_methods &&
                        farm.payment_methods.length > 0 && (
                          <div className="flex items-start">
                            <dt className="w-1/3 text-gray-500 flex items-center">
                              <DollarSign className="h-4 w-4 mr-2" />
                              Payment:
                            </dt>
                            <dd className="w-2/3">
                              {farm.payment_methods.join(", ")}
                            </dd>
                          </div>
                        )}

                      {farm?.wholesale_available && (
                        <div className="flex items-start">
                          <dt className="w-1/3 text-gray-500">Wholesale:</dt>
                          <dd className="w-2/3">
                            Available
                            {farm.wholesale_details && (
                              <span> - {farm.wholesale_details}</span>
                            )}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-6">Farm Details</h3>

                  <div className="space-y-8">
                    {/* Farm Type & Certifications */}
                    <div>
                      <h4 className="text-lg font-medium mb-4">
                        Farm Type & Certifications
                      </h4>
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {farm?.farm_type && farm.farm_type.length > 0 && (
                          <div>
                            <dt className="text-gray-500 mb-1">Farm Type</dt>
                            <dd>
                              <div className="flex flex-wrap gap-2">
                                {farm.farm_type.map((type) => (
                                  <Badge key={type} variant="secondary">
                                    {type}
                                  </Badge>
                                ))}
                              </div>
                            </dd>
                          </div>
                        )}

                        {farm?.certifications &&
                          farm.certifications.length > 0 && (
                            <div>
                              <dt className="text-gray-500 mb-1">
                                Certifications
                              </dt>
                              <dd>
                                <div className="flex flex-wrap gap-2">
                                  {farm.certifications.map((cert) => (
                                    <Badge key={cert} variant="outline">
                                      {cert}
                                    </Badge>
                                  ))}
                                </div>
                              </dd>
                            </div>
                          )}
                      </dl>
                    </div>

                    {/* Production */}
                    <div>
                      <h4 className="text-lg font-medium mb-4">Production</h4>
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {farm?.production_capacity && (
                          <div>
                            <dt className="text-gray-500 mb-1">
                              Production Capacity
                            </dt>
                            <dd>{farm.production_capacity}</dd>
                          </div>
                        )}

                        {farm?.breeds && farm.breeds.length > 0 && (
                          <div>
                            <dt className="text-gray-500 mb-1">Breeds</dt>
                            <dd>{farm.breeds.join(", ")}</dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    {/* Farming Practices */}
                    {farm?.farming_practices && (
                      <div>
                        <h4 className="text-lg font-medium mb-2">
                          Farming Practices
                        </h4>
                        <p className="whitespace-pre-line">
                          {farm.farming_practices}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="facilities" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-6">Facilities</h3>

                  <div className="space-y-8">
                    {/* Housing */}
                    {farm?.housing_types && farm.housing_types.length > 0 && (
                      <div>
                        <h4 className="text-lg font-medium mb-4 flex items-center">
                          <Home className="h-5 w-5 mr-2" />
                          Housing Types
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {farm.housing_types.map((housing) => (
                            <Badge key={housing} variant="outline">
                              {housing}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Processing */}
                    {farm?.has_processing_facility && (
                      <div>
                        <h4 className="text-lg font-medium mb-4 flex items-center">
                          <Factory className="h-5 w-5 mr-2" />
                          Processing Facility
                        </h4>
                        {farm.processing_details ? (
                          <p className="whitespace-pre-line">
                            {farm.processing_details}
                          </p>
                        ) : (
                          <p>On-site processing facility available.</p>
                        )}
                      </div>
                    )}

                    {/* Storage */}
                    {farm?.storage_capabilities && (
                      <div>
                        <h4 className="text-lg font-medium mb-4 flex items-center">
                          <Warehouse className="h-5 w-5 mr-2" />
                          Storage Capabilities
                        </h4>
                        <p className="whitespace-pre-line">
                          {farm.storage_capabilities}
                        </p>
                      </div>
                    )}

                    {/* Biosecurity */}
                    {farm?.biosecurity_measures && (
                      <div>
                        <h4 className="text-lg font-medium mb-4 flex items-center">
                          <Shield className="h-5 w-5 mr-2" />
                          Biosecurity Measures
                        </h4>
                        <p className="whitespace-pre-line">
                          {farm.biosecurity_measures}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="business" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-6">
                    Business Information
                  </h3>

                  <div className="space-y-8">
                    {/* Hours */}
                    {farm?.business_hours && (
                      <div>
                        <h4 className="text-lg font-medium mb-4 flex items-center">
                          <Clock className="h-5 w-5 mr-2" />
                          Business Hours
                        </h4>
                        <p className="whitespace-pre-line">
                          {farm.business_hours}
                        </p>
                      </div>
                    )}

                    {/* Delivery */}
                    <div>
                      <h4 className="text-lg font-medium mb-4 flex items-center">
                        <Truck className="h-5 w-5 mr-2" />
                        Delivery Options
                      </h4>

                      {farm?.delivery_options &&
                      farm.delivery_options.length > 0 ? (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {farm.delivery_options.map((option) => (
                              <Badge key={option} variant="secondary">
                                {option}
                              </Badge>
                            ))}
                          </div>

                          {farm.delivery_details && (
                            <p className="whitespace-pre-line text-gray-700">
                              {farm.delivery_details}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          No delivery options specified.
                        </p>
                      )}
                    </div>

                    {/* Pickup */}
                    <div>
                      <h4 className="text-lg font-medium mb-4 flex items-center">
                        <ShoppingBag className="h-5 w-5 mr-2" />
                        Pickup Options
                      </h4>

                      {farm?.pickup_available ? (
                        <div>
                          <Badge className="mb-2">Pickup Available</Badge>
                          {farm.pickup_details && (
                            <p className="whitespace-pre-line text-gray-700">
                              {farm.pickup_details}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">Pickup not available.</p>
                      )}
                    </div>

                    {/* Payment */}
                    {farm?.payment_methods &&
                      farm.payment_methods.length > 0 && (
                        <div>
                          <h4 className="text-lg font-medium mb-4 flex items-center">
                            <DollarSign className="h-5 w-5 mr-2" />
                            Payment Methods
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {farm.payment_methods.map((method) => (
                              <Badge key={method} variant="outline">
                                {method}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Wholesale */}
                    <div>
                      <h4 className="text-lg font-medium mb-4">Wholesale</h4>

                      {farm?.wholesale_available ? (
                        <div>
                          <Badge className="mb-2">Wholesale Available</Badge>
                          {farm.wholesale_details && (
                            <p className="whitespace-pre-line text-gray-700">
                              {farm.wholesale_details}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          Wholesale not available.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}

        <TabsContent value="products" className="mt-6">
          <h3 className="text-xl font-semibold mb-6">
            Products from {farm?.name}
          </h3>

          {isLoadingProductsData ? (
            <div className="flex justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : products?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    farm: { name: farm!.name },
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                No products available from this farm at the moment.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
};
