"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Plus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Farm {
  id: string;
  name: string;
  description: string;
  city: string | null;
  state: string | null;
  contact_email: string | null;
}

interface Order {
  id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  created_at: string | null;
  orders: {
    id: number;
    status: "processing" | "shipped" | "delivered" | string;
  };
}

interface VendorDashboardContentProps {
  farm: Farm;
  recentOrders: Order[];
  totalRevenue: number;
  productCount: number;
}

export default function VendorDashboardContent({
  farm,
  recentOrders,
  totalRevenue,
  productCount,
}: VendorDashboardContentProps) {
  const router = useRouter();

  // Calculate order count
  const orderCount = recentOrders.length;

  const isApproved = false;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={() => router.push("/vendor/products/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
      </div>

      {isApproved && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Your vendor account is pending approval. You can set up your
                products, but they won&apos;t be visible to customers until your
                account is approved.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime sales revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productCount}</div>
            <p className="text-xs text-muted-foreground">
              Total products in your inventory
            </p>
          </CardContent>
          <CardFooter>
            <Link
              href="/vendor/products"
              className="text-sm text-blue-600 hover:underline"
            >
              View all products
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderCount}</div>
            <p className="text-xs text-muted-foreground">
              Recent orders for your products
            </p>
          </CardContent>
          <CardFooter>
            <Link
              href="/vendor/orders"
              className="text-sm text-blue-600 hover:underline"
            >
              View all orders
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Average conversion rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your most recent orders</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between border-b pb-4"
                  >
                    <div>
                      <p className="font-medium">{order.product_name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Order #{order.orders.id}</span>
                        <span>•</span>
                        <span>
                          {order.created_at
                            ? format(new Date(order.created_at), "MMM d, yyyy")
                            : "No date available"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">
                          ${(order.product_price * order.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {order.quantity}
                        </p>
                      </div>
                      <Badge
                        className={
                          order.orders.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.orders.status === "shipped"
                            ? "bg-blue-100 text-blue-800"
                            : order.orders.status === "processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {order.orders.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No orders yet
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/vendor/orders">
              <Button variant="outline">View All Orders</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Farm Information</CardTitle>
            <CardDescription>Your farm details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Farm Name</h3>
                <p>{farm.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Description
                </h3>
                <p className="line-clamp-3">{farm.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Location
                  </h3>
                  <p>
                    {farm.city}, {farm.state}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact</h3>
                  <p>{farm.contact_email}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/vendor/settings">
              <Button variant="outline">Edit Farm Information</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
