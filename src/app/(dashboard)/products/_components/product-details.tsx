"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import {
  ArrowLeft,
  Calendar,
  Check,
  Droplets,
  Info,
  Leaf,
  Loader,
  MapPin,
  Pill,
  RefreshCw,
  ShoppingCart,
  Syringe,
  Tag,
  Truck,
  Wind,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { WishlistButton } from "../../wishlist/_components/wishlist-button";
import Image from "next/image";
import { ProductMedia } from "./product-media";
import {
  useGetProduct,
  useGetRelatedProducts,
} from "@/hooks/general-app/use-products";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "../../search/_components/product-card";

interface ProductDetailsProps {
  productId: string;
}

export const ProductDetails = ({ productId }: ProductDetailsProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [quantity, setQuantity] = useState(1);

  const {
    data: product,
    isLoading: isLoadingProduct,
    isFetching: isFetchingProduct,
    error,
  } = useGetProduct(productId);

  const isLoadingProductData = isLoadingProduct || isFetchingProduct;

  const productFarmId = product?.farm?.id;

  const {
    data: relatedProducts,
    isLoading: isLoadingRelated,
    isFetching: isFetchingRelated,
  } = useGetRelatedProducts(productFarmId ?? "", productId);

  console.log("Related Product Data:", relatedProducts);
  console.log("Loading State:", isLoadingRelated);
  console.log("ProductFarmId", productFarmId);

  const { addToCart, isAddingToCart, cart } = useCart();
  const productInCart = cart.items.some((item) => item.productId === productId);

  const isLoadingRelatedData = isLoadingRelated || isFetchingRelated;

  const handleAddToCart = () => {
    if (isAddingToCart || productInCart) return;

    // Add to cart with the selected quantity
    addToCart(productId, quantity);
  };

  const incrementQuantity = () => {
    if (product?.stock && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const formattedPrice = `$${Number(product?.price).toFixed(2)}${
    product?.unit ? `/${product.unit}` : ""
  }`;

  const discountPercentage = product?.discount_price
    ? Math.round(
        ((Number(product.price) - Number(product.discount_price)) /
          Number(product.price)) *
          100
      )
    : 0;
  // Format available date if it exists
  const availableDate = product?.available_date
    ? new Date(product.available_date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  if (isLoadingProductData) {
    return <h2>Loading...</h2>;
  }

  return (
    <section>
      <div className="max-w-6xl px-4 pt-4 pb-16 mx-auto">
        <div className="mb-4">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft />
              Back to Products
            </Button>
          </Link>
        </div>

        {isLoadingProductData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="lg:col-span-1">
              <Skeleton className="aspect-square rounded-lg w-full" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-16 w-16 rounded-md" />
                <Skeleton className="h-16 w-16 rounded-md" />
                <Skeleton className="h-16 w-16 rounded-md" />
              </div>
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-10 w-2/3 mb-4" />
              <Skeleton className="h-6 w-1/3 mb-4" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-3/4 mb-4" />
              <div className="flex gap-2 mt-6">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3 md:grid-rows-[auto,1fr] relative">
            <div className="lg:col-span-1h-fit md:col-span-1  h-fit  ">
              <div className="relative ">
                <ProductMedia
                  media={
                    product?.media?.map((item) => ({
                      id: item.id,
                      url: item.url,
                      type: item.type as "image" | "video",
                    })) || []
                  }
                />

                {/* Product badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {product?.is_organic && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Leaf className="h-3 w-3" />
                      Organic
                    </Badge>
                  )}

                  {product?.is_free_range && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Wind className="h-3 w-3" />
                      Free Range
                    </Badge>
                  )}

                  {product?.discount_price && discountPercentage > 0 && (
                    <Badge variant="destructive">
                      {discountPercentage}% OFF
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full md:col-span-2">
              {product?.category && (
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Tag className="h-4 w-4 mr-1" />
                  {product.category}
                </div>
              )}

              <h1 className="text-3xl font-bold mb-4">{product?.name}</h1>

              <div className="mb-4">
                {product?.discount_price ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-semibold">
                      ${Number(product.discount_price).toFixed(2)}
                    </span>
                    <span className="text-gray-500 text-lg line-through">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    {product.unit && (
                      <span className="text-gray-500">/{product.unit}</span>
                    )}
                  </div>
                ) : (
                  <p className="text-2xl font-semibold">{formattedPrice}</p>
                )}
              </div>

              {product?.farm && (
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
                  <Link
                    href={`/farms/${product.farm.id}`}
                    className="hover:underline"
                  >
                    From: {product.farm.name}
                    {product.farm.city && `, ${product.farm.city}`}
                    {product.farm.state && `, ${product.farm.state}`}
                  </Link>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {product?.is_organic && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Leaf className="h-3 w-3" />
                    Organic
                  </Badge>
                )}

                {product?.is_free_range && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Wind className="h-3 w-3" />
                    Free Range
                  </Badge>
                )}

                {product?.is_antibiotic === false && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Pill className="h-3 w-3" />
                    No Antibiotics
                  </Badge>
                )}

                {product?.is_hormone === false && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Droplets className="h-3 w-3" />
                    No Hormones
                  </Badge>
                )}

                {product?.is_vaccinated && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Syringe className="h-3 w-3" />
                    Vaccinated
                  </Badge>
                )}
              </div>

              <div className="prose max-w-none mb-6">
                <p>
                  {product?.description ||
                    "No description available for this product."}
                </p>
              </div>

              {/* Product details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {product?.breed && (
                  <div>
                    <span className="text-gray-500 text-sm">Breed:</span>
                    <p>{product.breed}</p>
                  </div>
                )}

                {product?.age && (
                  <div>
                    <span className="text-gray-500 text-sm">Age:</span>
                    <p>{product.age}</p>
                  </div>
                )}

                {product?.weight && (
                  <div>
                    <span className="text-gray-500 text-sm">Weight:</span>
                    <p>{product.weight}</p>
                  </div>
                )}

                {product?.origin && (
                  <div>
                    <span className="text-gray-500 text-sm">Origin:</span>
                    <p>{product.origin}</p>
                  </div>
                )}

                {product?.sku && (
                  <div>
                    <span className="text-gray-500 text-sm">SKU:</span>
                    <p>{product.sku}</p>
                  </div>
                )}

                {availableDate && (
                  <div>
                    <span className="text-gray-500 text-sm">
                      Available From:
                    </span>
                    <p>{availableDate}</p>
                  </div>
                )}
              </div>

              {/* Quantity selector and add to cart */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <span className="mr-4">Quantity:</span>
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="px-3"
                    >
                      -
                    </Button>
                    <span className="w-10 text-center">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={incrementQuantity}
                      disabled={
                        product?.stock !== undefined &&
                        quantity >= product.stock
                      }
                      className="px-3"
                    >
                      +
                    </Button>
                  </div>

                  <span className="ml-4 text-sm text-gray-500">
                    {(product?.stock ?? 0) > 0
                      ? `${product?.stock} available`
                      : "Out of stock"}
                  </span>
                </div>

                {product?.minimum_order != null &&
                  product.minimum_order > 0 && (
                    <p className="text-sm text-gray-500 mb-4">
                      Minimum order: {product.minimum_order}{" "}
                      {product.unit || "units"}
                    </p>
                  )}

                <div className="flex gap-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={
                      isAddingToCart ||
                      productInCart ||
                      product?.stock === 0 ||
                      product?.is_available === false ||
                      (product?.minimum_order !== undefined &&
                        quantity < (product.minimum_order ?? 0))
                    }
                    size="lg"
                    className="flex-1"
                  >
                    {isAddingToCart ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Adding to Cart...
                      </>
                    ) : productInCart ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Added to Cart
                      </>
                    ) : product?.stock === 0 ||
                      product?.is_available === false ? (
                      "Out of Stock"
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  {product && (
                    <WishlistButton
                      productId={product.id}
                      showText={true}
                      size="lg"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="grid grid-cols-3 md:grid-cols-4 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition & Storage</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
          </TabsList>

          {isLoadingProductData ? (
            <div className="mt-6 flex justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">
                      Product Overview
                    </h3>
                    <div className="prose max-w-none">
                      <p>
                        {product?.description ||
                          "No detailed description available for this product."}
                      </p>

                      {product?.tags && product.tags.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-lg font-medium mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {product.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">
                      Product Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-medium mb-3">
                          Specifications
                        </h4>
                        <dl className="space-y-2">
                          {product?.category && (
                            <div className="flex">
                              <dt className="w-1/3 text-gray-500">Category:</dt>
                              <dd className="w-2/3">{product.category}</dd>
                            </div>
                          )}

                          {product?.breed && (
                            <div className="flex">
                              <dt className="w-1/3 text-gray-500">Breed:</dt>
                              <dd className="w-2/3">{product.breed}</dd>
                            </div>
                          )}

                          {product?.age && (
                            <div className="flex">
                              <dt className="w-1/3 text-gray-500">Age:</dt>
                              <dd className="w-2/3">{product.age}</dd>
                            </div>
                          )}

                          {product?.weight && (
                            <div className="flex">
                              <dt className="w-1/3 text-gray-500">Weight:</dt>
                              <dd className="w-2/3">{product.weight}</dd>
                            </div>
                          )}

                          {product?.origin && (
                            <div className="flex">
                              <dt className="w-1/3 text-gray-500">Origin:</dt>
                              <dd className="w-2/3">{product.origin}</dd>
                            </div>
                          )}

                          {product?.sku && (
                            <div className="flex">
                              <dt className="w-1/3 text-gray-500">SKU:</dt>
                              <dd className="w-2/3">{product.sku}</dd>
                            </div>
                          )}
                        </dl>
                      </div>

                      <div>
                        <h4 className="text-lg font-medium mb-3">
                          Product Attributes
                        </h4>
                        <ul className="space-y-2">
                          <li className="flex items-center">
                            <span
                              className={`mr-2 ${
                                product?.is_organic
                                  ? "text-green-500"
                                  : "text-gray-400"
                              }`}
                            >
                              {product?.is_organic ? "✓" : "✗"}
                            </span>
                            <span>Organic</span>
                          </li>

                          <li className="flex items-center">
                            <span
                              className={`mr-2 ${
                                product?.is_free_range
                                  ? "text-green-500"
                                  : "text-gray-400"
                              }`}
                            >
                              {product?.is_free_range ? "✓" : "✗"}
                            </span>
                            <span>Free Range</span>
                          </li>

                          <li className="flex items-center">
                            <span
                              className={`mr-2 ${
                                product?.is_antibiotic === false
                                  ? "text-green-500"
                                  : "text-gray-400"
                              }`}
                            >
                              {product?.is_antibiotic === false ? "✓" : "✗"}
                            </span>
                            <span>No Antibiotics</span>
                          </li>

                          <li className="flex items-center">
                            <span
                              className={`mr-2 ${
                                product?.is_hormone === false
                                  ? "text-green-500"
                                  : "text-gray-400"
                              }`}
                            >
                              {product?.is_hormone === false ? "✓" : "✗"}
                            </span>
                            <span>No Hormones</span>
                          </li>

                          <li className="flex items-center">
                            <span
                              className={`mr-2 ${
                                product?.is_vaccinated
                                  ? "text-green-500"
                                  : "text-gray-400"
                              }`}
                            >
                              {product?.is_vaccinated ? "✓" : "✗"}
                            </span>
                            <span>Vaccinated</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="nutrition" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {product?.nutritional_info ? (
                        <div>
                          <h3 className="text-xl font-semibold mb-4 flex items-center">
                            <Info className="h-5 w-5 mr-2" />
                            Nutritional Information
                          </h3>
                          <div className="prose max-w-none">
                            <p className="whitespace-pre-line">
                              {product.nutritional_info}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-xl font-semibold mb-4 flex items-center">
                            <Info className="h-5 w-5 mr-2" />
                            Nutritional Information
                          </h3>
                          <p className="text-gray-500">
                            No nutritional information available for this
                            product.
                          </p>
                        </div>
                      )}

                      {product?.storage_instructions ? (
                        <div>
                          <h3 className="text-xl font-semibold mb-4 flex items-center">
                            <RefreshCw className="h-5 w-5 mr-2" />
                            Storage Instructions
                          </h3>
                          <div className="prose max-w-none">
                            <p className="whitespace-pre-line">
                              {product.storage_instructions}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-xl font-semibold mb-4 flex items-center">
                            <RefreshCw className="h-5 w-5 mr-2" />
                            Storage Instructions
                          </h3>
                          <p className="text-gray-500">
                            No storage instructions available for this product.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shipping" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Truck className="h-5 w-5 mr-2" />
                      Shipping Information
                    </h3>

                    <div className="prose max-w-none">
                      <p>
                        Standard shipping typically takes 3-5 business days.
                        Expedited shipping options may be available at checkout.
                      </p>

                      {product?.farm && product.farm.id && (
                        <p className="mt-4">
                          This product ships directly from {product.farm.name}.
                          <Link
                            href={`/farms/${product.farm.id}`}
                            className="text-blue-600 hover:underline ml-1"
                          >
                            View farm details
                          </Link>
                        </p>
                      )}

                      {availableDate && (
                        <div className="mt-4">
                          <h4 className="text-lg font-medium mb-2 flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Availability
                          </h4>
                          <p>
                            This product will be available from {availableDate}.
                          </p>
                        </div>
                      )}

                      {product?.minimum_order && (
                        <div className="mt-4">
                          <h4 className="text-lg font-medium mb-2">
                            Minimum Order
                          </h4>
                          <p>
                            This product requires a minimum order of{" "}
                            {product.minimum_order} {product.unit || "units"}.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>

          {isLoadingRelatedData ? (
            <div className="flex justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (relatedProducts ?? []).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(relatedProducts ?? []).map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No related products found.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
