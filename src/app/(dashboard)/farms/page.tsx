import React from "react";
import { FarmsList } from "./_components/farm-list";

const Page = () => {
  return (
    <section className="">
      <div className="mx-auto max-w-6xl px-4 pt-4 pb-16 space-y-4">
        <h2 className="text-2xl font-bold mb-8">Our Farms & Producers</h2>
        <FarmsList />
      </div>
    </section>
  );
};

export default Page;
