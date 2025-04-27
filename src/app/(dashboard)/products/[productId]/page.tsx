import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import React from "react";
import { ProductDetails } from "../_components/product-details";

const Page = async ({ params }: { params: Promise<{ productId: string }> }) => {
  const { productId } = await params;

  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 pt-4 pb-16">
        <ProductDetails productId={productId} />
      </div>
    </section>
  );
};

export default Page;
