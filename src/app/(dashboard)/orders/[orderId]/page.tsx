import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import React from "react";
import { OrderDetails } from "../_components/order-details";

const Page = async ({ params }: { params: Promise<{ orderId: number }> }) => {
  const { orderId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login if not authenticated
    redirect("/auth/sign-in?redirect=/orders/" + orderId);
  }

  // Fetch the order
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (*)
    `
    )
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (error || !order) {
    notFound();
  }

  return (
    <section className="bg-gray-50">
      <div className="px-4 pt-4 pb-16 mx-auto max-w-6xl">
        <div className=" px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-2">
                Thank You for Your Order!
              </h1>
              <p className="text-gray-600">
                Your order #{order.id} has been confirmed and is now being
                processed.
              </p>
            </div>

            <OrderDetails order={order} />

            <div className="mt-8 flex justify-center gap-4">
              <Link href="/orders">
                <Button variant="outline">View All Orders</Button>
              </Link>
              <Link href="/">
                <Button>Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Page;
