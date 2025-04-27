"use client";

import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { TaskActions } from "./task-actions";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-500 font-semibold";
    case "processing":
      return "bg-blue-500 font-semibold";
    case "shipped":
      return "bg-purple-500 font-semibold";
    case "delivered":
      return "bg-green-500 font-semibold";
    case "cancelled":
      return "bg-red-500 font-semibold";
    default:
      return "bg-gray-500 font-semibold";
  }
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: string | null;
  product_name: string;
  product_price: number;
  quantity: number;
  created_at: string | null;
};

export type Order = {
  id: number;
  user_id: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shipping_address: any;
  total_amount: number;
  created_at: string | null;
  updated_at: string | null;
  order_items: OrderItem[]; // 👈 important
};

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Order #
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
  },

  {
    header: "Total Items",
    accessorKey: "order_items",
    cell: ({ row }) => {
      const items = row.original.order_items;
      const totalItems =
        items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

      return <div className="font-medium">{totalItems}</div>;
    },
  },
  {
    accessorKey: "total_amount",
    header: "Total Amount",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("total_amount")) || 0;
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);

      return <div className="font-medium">{formatted}</div>;
    },
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      return (
        <Badge className={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Placed on",
    cell: ({ row }) => {
      const date = row.getValue("created_at");
      if (!date) return "N/A";
      return (
        <span>{format(new Date(date as string | number), "MMM dd, yyy")}</span>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.id;

      return (
        <TaskActions id={id}>
          <Button variant="ghost" className="size-4 p-0">
            <MoreHorizontal className="size-4" />
          </Button>
        </TaskActions>
      );
    },
  },
];
