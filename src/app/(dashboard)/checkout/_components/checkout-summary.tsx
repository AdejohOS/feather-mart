import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Cart } from "@/types/types";

interface CheckoutSummaryProps {
  cart: Cart;
}
export const CheckoutSummary = ({ cart }: CheckoutSummaryProps) => {
  // Calculate subtotal, tax, and shipping
  const subtotal = cart.total;
  const shipping: number = 0; // Free shipping for now
  const tax = subtotal * 0.08; // 8% tax rate
  const total = subtotal + shipping + tax;

  return (
    <div className="">
      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

      <div className="max-h-80 overflow-y-auto mb-4">
        {cart.items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-3 py-3 border-b"
          >
            <div className="relative h-16 w-16 flex-shrink-0">
              <Image
                src={
                  item.media && item.media.length > 0
                    ? item.media[0].url
                    : "/placeholder.svg?height=100&width=100"
                }
                alt={item.name}
                fill
                className="object-cover rounded-md"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.name}</p>
              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax (8%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/cart">
          <Button variant="outline" className="w-full">
            Edit Cart
          </Button>
        </Link>
      </div>
    </div>
  );
};
