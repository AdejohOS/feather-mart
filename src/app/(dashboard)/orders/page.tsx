import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import { OrdersList } from "./_components/orders-list";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { Card } from "@/components/ui/card";
import { List } from "lucide-react";

const Page = async () => {
  const supabase = await createClient();
  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login if not authenticated
    redirect("/auth/sign-in?redirect=/orders");
  }

  // Fetch the user's orders
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (*)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
  }
  return (
    <section className="bg-gray-50">
      <div className="mx-auto px-4 max-w-6xl pt-4 pb-16">
        <h1 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <List className="size-6" />
          My Orders
        </h1>

        {orders && orders.length > 0 ? (
          <Card className="p-4">
            <DataTable columns={columns} data={orders || []} />
          </Card>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">No orders found</h2>
            <p className="text-gray-500 mb-8">
              You haven't placed any orders yet.
            </p>
            <Link href="/">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default Page;
