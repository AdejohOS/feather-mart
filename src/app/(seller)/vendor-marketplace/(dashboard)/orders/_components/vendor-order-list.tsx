"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ShippingAddress = {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  email: string;
  phone: string;
};

type Order = {
  id: number;
  quantity: number;
  product_price: number;
  product_name: string;
  created_at: string | null; // remove `| null`
  orders: {
    id: number;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    created_at: string | null; // remove `| null`
    user_id: string;
    total_amount: number;
    shipping_address: ShippingAddress;
  };
};

interface VendorOrdersListProps {
  initialOrders: Order[];
}

export default function VendorOrdersList({
  initialOrders,
}: VendorOrdersListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const orders = initialOrders;

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orders.id.toString().includes(searchQuery);

    const matchesStatus = !statusFilter || order.orders.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const exportOrders = () => {
    // Create CSV content
    const headers = [
      "Order ID",
      "Product",
      "Quantity",
      "Price",
      "Total",
      "Date",
      "Status",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredOrders.map((order) =>
        [
          order.orders.id,
          `"${order.product_name.replace(/"/g, '""')}"`,
          order.quantity,
          order.product_price.toFixed(2),
          (order.quantity * order.product_price).toFixed(2),
          format(new Date(order.created_at!), "yyyy-MM-dd"),
          order.orders.status,
        ].join(",")
      ),
    ].join("\n");

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `orders_export_${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Button onClick={exportOrders}>
          <Download className="mr-2 h-4 w-4" />
          Export Orders
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search by product name or order ID..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select
          value={statusFilter || ""}
          onValueChange={(value) =>
            setStatusFilter(value === "all" ? null : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredOrders.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.orders.id}</TableCell>
                  <TableCell className="font-medium">
                    {order.product_name}
                  </TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>
                    ${(order.product_price * order.quantity).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.created_at!), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.orders.status)}>
                      {order.orders.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-md">
          <h3 className="text-lg font-medium mb-2">No orders found</h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter
              ? "No orders match your search criteria."
              : "You haven't received any orders yet."}
          </p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.orders.id} -{" "}
              {selectedOrder?.created_at
                ? format(new Date(selectedOrder.created_at), "MMMM d, yyyy")
                : "Unknown date"}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Product Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="font-medium">Product:</dt>
                        <dd>{selectedOrder.product_name}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Price:</dt>
                        <dd>${selectedOrder.product_price.toFixed(2)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Quantity:</dt>
                        <dd>{selectedOrder.quantity}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Total:</dt>
                        <dd>
                          $
                          {(
                            selectedOrder.product_price * selectedOrder.quantity
                          ).toFixed(2)}
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Shipping Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedOrder.orders.shipping_address ? (
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="font-medium">Name:</dt>
                          <dd>
                            {selectedOrder.orders.shipping_address.fullName}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium">Address:</dt>
                          <dd>
                            {selectedOrder.orders.shipping_address.address}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium">City:</dt>
                          <dd>
                            {selectedOrder.orders.shipping_address.city},{" "}
                            {selectedOrder.orders.shipping_address.state}{" "}
                            {selectedOrder.orders.shipping_address.postalCode}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium">Country:</dt>
                          <dd>
                            {selectedOrder.orders.shipping_address.country}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium">Email:</dt>
                          <dd>{selectedOrder.orders.shipping_address.email}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium">Phone:</dt>
                          <dd>{selectedOrder.orders.shipping_address.phone}</dd>
                        </div>
                      </dl>
                    ) : (
                      <p className="text-gray-500">
                        No shipping information available
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Order Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge
                      className={getStatusColor(selectedOrder.orders.status)}
                    >
                      {selectedOrder.orders.status}
                    </Badge>
                    <p className="text-sm text-gray-500">
                      Order placed on{" "}
                      {format(
                        new Date(selectedOrder.orders.created_at!),
                        "MMMM d, yyyy 'at' h:mm a"
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
