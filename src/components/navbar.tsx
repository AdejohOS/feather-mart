import { FaPhoneAlt, FaWhatsapp } from "react-icons/fa";

import Link from "next/link";
import { Input } from "./ui/input";
import { Search, ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { UserMenu } from "./user-menu";

export const Navbar = () => {
  return (
    <header className="">
      <div className="bg-slate-50 ">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-x-3 text-sm">
            <div className="flex items-center gap-x-1">
              <FaPhoneAlt size={15} />
              <span className="sm">+234 706 349 4394</span>
            </div>
            <div className="flex items-center gap-x-1">
              <FaWhatsapp size={15} />
              <span className="sm">+234 706 349 4394</span>
            </div>
          </div>
          <div>
            <p className="text-sm">
              Africa&apos;s Fastest Online Poultry Store{" "}
            </p>
          </div>

          <div className="flex items-center gap-x-3 text-sm">
            <Link className="hover:text-[#27667B] transition" href="/faq">
              Help?
            </Link>

            <Link
              className="hover:text-[#27667B] transition "
              href="/track-order"
            >
              Track Order?
            </Link>
            <Link
              className="hover:text-[#27667B] transition "
              href="/track-order"
            >
              Sell on FeatherMart
            </Link>
          </div>
        </div>
      </div>
      <nav className=" bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            Feather<span className="text-[#5CAF90]">Mart</span>
          </h1>
          <div className="w-1/2 relative">
            <Input
              placeholder="I am shoping for..."
              type="search"
              className="w-full pr-9"
            />
            <Button className="absolute right-0 top-0 " variant="ghost">
              <Search />
            </Button>
          </div>
          <div className="flex items-center gap-x-4">
            <UserMenu />

            <div className="flex items-center gap-1 ">
              <ShoppingCart className="size-10" />
              <div>
                <p className="text-sm">Cart</p>
                <p className="font-medium bg-slate-700 rounded-md text-center text-white ">
                  43
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
