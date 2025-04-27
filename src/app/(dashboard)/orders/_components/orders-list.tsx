import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { OrderType } from "@/types/types";

interface OrdersListProps {
  orders: OrderType[];
}
export const OrdersList = ({ orders }: OrdersListProps) => {
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
    <div className="space-y-4">
      {orders.map((order) => {
        // Format the date
        const orderDate = new Date(order.created_at);
        const formattedDate = format(orderDate, "MMMM d, yyyy");

        // Calculate total items
        const totalItems = order.order_items.reduce(
          (sum: number, item) => sum + item.quantity,
          0
        );

        return (
          <Card key={order.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">Placed on {formattedDate}</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="font-medium">
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Total: ${order.total_amount.toFixed(2)}
                  </p>
                </div>
                <Link href={`/orders/${order.id}`}>
                  <Button variant="outline">View Order Details</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
