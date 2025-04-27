import React from "react";
import { ProductsList } from "./_components/products-list";

const Page = () => {
  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 pt-4 pb-16 space-y-4">
        <h2 className="text-2xl font-bold mb-8">Our Products</h2>
        <ProductsList />
      </div>
    </section>
  );
};

export default Page;
