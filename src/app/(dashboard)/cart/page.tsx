import { getCart } from "./actions";
import { CartDetails } from "./_components/cart-details";
import { ListCheck } from "lucide-react";

const Page = async () => {
  const cart = await getCart();

  return (
    <section className="bg-gray-100">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-4 space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <ListCheck className="size-6" />
          My Cart
        </h2>
        <CartDetails initialCart={cart} />
      </div>
    </section>
  );
};

export default Page;
