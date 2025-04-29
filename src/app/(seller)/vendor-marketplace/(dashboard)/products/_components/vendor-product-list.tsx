"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/utils/supabase/client";
import {
  AlertCircle,
  CheckCircle,
  Edit,
  Plus,
  Search,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { useGetProducts } from "@/hooks/use-products";
import { ProfileSkeleton } from "@/components/ui/dasboard-skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const VendorProductList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const router = useRouter();

  const supabase = createClient();
  const { data: products, isLoading, refetch } = useGetProducts();

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  const filteredProducts =
    products?.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);

    try {
      // Delete the product
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productToDelete);

      if (error) {
        throw error;
      }

      // Update the local state
      await refetch();
      toast.success("The product has been successfully deleted.");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  const handleToggleAvailability = async (
    productId: string,
    currentStatus: boolean
  ) => {
    setIsMutating(true);
    try {
      // Update the product availability
      const { error } = await supabase
        .from("products")
        .update({ is_available: !currentStatus })
        .eq("id", productId);

      if (error) {
        throw error;
      }

      await refetch();

      toast(
        `The product is now ${
          !currentStatus ? "available" : "unavailable"
        } for purchase.`
      );
    } catch (error) {
      console.error("Error updating product availability:", error);
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => router.push("/vendor/products/new")}>
          <Plus className="mr-2 size-4" />
          Add New Product
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isMutating && (
        <div className="py-4 text-center text-sm text-gray-500 animate-pulse">
          Updating...
        </div>
      )}

      {filteredProducts.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="relative h-10 w-10 flex-shrink-0">
                        <Image
                          src={
                            product.media && product.media.length > 0
                              ? product.media[0].url
                              : "/placeholder.svg?height=40&width=40"
                          }
                          alt={product.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="truncate max-w-[200px]">
                        <Link
                          href={`/vendor/products/${product.id}`}
                          className="font-medium hover:underline truncate"
                        >
                          {product.name}
                        </Link>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    {product.stock > 0 ? (
                      product.stock
                    ) : (
                      <Badge variant="destructive">Out of stock</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={product.is_available ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() =>
                        handleToggleAvailability(
                          product.id,
                          !!product.is_available
                        )
                      }
                    >
                      {product.is_available ? (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      ) : (
                        <AlertCircle className="mr-1 h-3 w-3" />
                      )}
                      {product.is_available ? "Available" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/vendor/products/${product.id}`)
                        }
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setProductToDelete(product.id);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-md">
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery
              ? "No products match your search criteria."
              : "You haven't added any products yet."}
          </p>
          {!searchQuery && (
            <Button onClick={() => router.push("/vendor/products/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Product
            </Button>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
