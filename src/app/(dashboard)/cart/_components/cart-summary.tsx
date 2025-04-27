"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DottedSeparator } from "@/components/ui/dotted-separator";

import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface CartSummaryProps {
  total: number;
  isAuthenticated: boolean;
}

export const CartSummary = ({ total, isAuthenticated }: CartSummaryProps) => {
  return (
    <Card className="h-fit md:col-span-1 p-4 text-gray-500 md:sticky md:top-40">
      <h2 className="text-lg font-bold">Order Summary</h2>
      <DottedSeparator className="my-4" />
      <div className="flex items-center justify-between">
        <p className="font-semibold">SubTotal</p>
        {formatCurrency(total)}
      </div>
      <div className="flex items-center justify-between">
        <p className="font-semibold">Shipping</p>
        Calculated on checkout
      </div>
      <div className="flex items-center justify-between">
        <p className="font-semibold">Tax</p>
        Calculated on checkout
      </div>
      <Link
        href={
          isAuthenticated ? "/checkout" : "/auth/sign-in?redirect=/checkout"
        }
      >
        <Button className="mt-6 w-full">
          Checkout {formatCurrency(total)}
        </Button>
      </Link>
    </Card>
  );
};
