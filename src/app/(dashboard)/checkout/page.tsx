import React from "react";
import { CheckoutForm } from "./_components/checkout-form";
import { getCart } from "../cart/actions";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ShoppingBasket } from "lucide-react";

const Page = async () => {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    // Redirect to login if not authenticated
    redirect("/auth/sign-in?redirect=/checkout");
  }

  const cart = await getCart();
  return (
    <section className="bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-4">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <ShoppingBasket className="size-6" />
          Checkout
        </h2>
        <CheckoutForm cart={cart} userId={session.user.id} />
      </div>
    </section>
  );
};

export default Page;
