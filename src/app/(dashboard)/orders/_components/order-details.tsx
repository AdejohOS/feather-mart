"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSeparator } from "@/components/ui/dotted-separator";

import { format } from "date-fns";

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  email: string;
  phone: string;
}

export interface Order {
  id: number;
  user_id: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string | null;
  updated_at: string | null;
  total_amount: number;
  shipping_address: ShippingAddress;
  order_items: OrderItem[];
}

export interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

interface OrderDetailsProps {
  order: Order;
}

type OrderItemType = {
  id: number;
  product_name: string;
  product_price: number;
  quantity: number;
};

export const OrderDetails = ({ order }: OrderDetailsProps) => {
  // Format the date
  const orderDate = order.created_at ? new Date(order.created_at) : null;
  const formattedDate = orderDate
    ? format(orderDate, "MMMM d, yyyy 'at' h:mm a")
    : "Date not available";

  // Calculate order totals
  const subtotal = order.order_items.reduce(
    (sum: number, item) => sum + item.product_price * item.quantity,
    0
  );
  const shipping = 0; // Free shipping
  const tax = subtotal * 0.08; // 8% tax
  const total = order.total_amount;

  // Get shipping address
  const shippingAddress = order.shipping_address || {};
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      case "shipped":
        return "bg-purple-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Order #{order.id}</CardTitle>
            <Badge className={getStatusColor(order.status)}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">Placed on {formattedDate}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Items</h3>
              <div className="space-y-3">
                {order.order_items.map((item: OrderItemType) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${(item.product_price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <DottedSeparator />

            <div>
              <h3 className="font-medium mb-2">Order Summary</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <DottedSeparator />

            <div>
              <h3 className="font-medium mb-2">Shipping Address</h3>
              <div className="text-sm">
                <p>{shippingAddress.fullName}</p>
                <p>{shippingAddress.address}</p>
                <p>
                  {shippingAddress.city}, {shippingAddress.state}{" "}
                  {shippingAddress.postalCode}
                </p>
                <p>{shippingAddress.country}</p>
                <p className="mt-1">{shippingAddress.email}</p>
                <p>{shippingAddress.phone}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
