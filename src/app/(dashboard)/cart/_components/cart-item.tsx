"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DottedSeparator } from "@/components/ui/dotted-separator";
import { Separator } from "@/components/ui/separator";
import { Loader, Minus, Plus, Trash } from "lucide-react";
import Image from "next/image";

interface CartItemType {
  id: number;
  productId: string;
  name: string;
  price: number;
  media?: { url: string }[];
  quantity: number;
  stock?: number;
  seller: string;
}

interface CartItemsProps {
  items: CartItemType[];
}

import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { removeFromCart, updateCartItemQuantity } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const CartItem = ({ items }: CartItemsProps) => {
  const [removingItems, setRemovingItems] = useState<Record<string, boolean>>(
    {}
  );
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>(
    {}
  );
  const handleRemoveItem = async (productId: string) => {
    if (removingItems[productId]) return; // prevent double click spam

    setRemovingItems((prev) => ({ ...prev, [productId]: true }));

    try {
      await removeFromCart(productId);
      toast.success("The item has been removed from your cart.");
    } catch (error) {
      toast.error("Failed to remove item. Please try again.");
    } finally {
      setRemovingItems((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1 || updatingItems[productId]) return;

    setUpdatingItems((prev) => ({ ...prev, [productId]: true }));

    try {
      await updateCartItemQuantity(productId, quantity);
    } catch (error) {
      toast.error("Failed to update quantity. Please try again.");
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <>
      {items.map((item) => (
        <div className="" key={item.productId}>
          <div className="space-y-4">
            <div className="flex justify-between gap-3">
              <div className="flex flex-1 gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-md sm:h-20 sm:w-20">
                  <Image
                    src={item.media?.[0]?.url ?? "/placeholder.svg"}
                    alt={item.name}
                    width={80} // Matches sm:w-20 (20 * 4px = 80px)
                    height={80}
                    className="h-full w-full object-cover"
                    priority={false}
                    quality={80}
                    sizes="(max-width: 640px) 40px, 80px" // h-10 (10 * 4px = 40px) on mobile
                  />
                </div>
                <div>
                  <p className="text-lg font-semibold">{item.name}</p>
                  <p>
                    Seller: <span>{item.seller}</span>
                  </p>
                  <p className="text-sm">In stock: {item.stock}</p>
                </div>
              </div>
              <div>
                <p> {formatCurrency(item.price)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="destructive"
                className="flex items-center gap-2"
                size="sm"
                onClick={() => handleRemoveItem(item.productId)}
                disabled={removingItems[item.productId]}
              >
                {removingItems[item.productId] ? (
                  <Loader className="size-4 animate-spin" />
                ) : (
                  <Trash className="size-4" />
                )}
                Remove
              </Button>

              <div className="flex items-center gap-4">
                <Button
                  variant="secondary"
                  aria-label="Decrease quantity"
                  size="icon"
                  onClick={() =>
                    handleUpdateQuantity(item.productId, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1 || updatingItems[item.productId]}
                >
                  <Minus className="size-4" />
                </Button>

                <span className="w-14 text-center">{item.quantity}</span>
                <Button
                  aria-label="Increase quantity"
                  size="icon"
                  onClick={() =>
                    handleUpdateQuantity(item.productId, item.quantity + 1)
                  }
                  disabled={
                    updatingItems[item.productId] ||
                    (item.stock !== undefined && item.quantity >= item.stock)
                  }
                >
                  <Plus className="size-4" />
                </Button>

                <div className="text-right min-w-[80px]">
                  <div className="font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-4" />
        </div>
      ))}
    </>
  );
};
