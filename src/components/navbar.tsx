"use client";

import { FaWhatsapp } from "react-icons/fa";
import { FaPhoneVolume } from "react-icons/fa6";

import Link from "next/link";
import { Input } from "./ui/input";
import { Search, User2Icon } from "lucide-react";
import { Button } from "./ui/button";
import { UserMenu } from "./user-menu";
import { useGetUserProfile } from "@/hooks/use-get-user-profile";
import { Cart } from "./cart";
import { CartButton } from "@/app/(dashboard)/cart/_components/cart-button";

export const Navbar = () => {
  const { data: user } = useGetUserProfile();
  return (
    <header className="fixed left-0 top-0 z-50 h-[150px] w-full">
      <div className="h-[50px] bg-neutral-50 lg:h-[30px]">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
          <div className="hidden items-center gap-x-3 text-sm sm:flex">
            <div className="flex items-center gap-x-1">
              <FaPhoneVolume size={13} />
              <span className="sm">+234 706 349 4394</span>
            </div>
            <div className="flex items-center gap-x-1">
              <FaWhatsapp size={15} />
              <span className="sm">+234 706 349 4394</span>
            </div>
          </div>
          <div className="hidden lg:block">
            <p className="text-sm">
              Africa&apos;s Fastest Online Poultry Store
            </p>
          </div>

          <div className="hidden items-center gap-x-3 text-sm lg:flex">
            <Link className="transition hover:text-teal-600" href="/faq">
              Help?
            </Link>

            <Link
              className="transition hover:text-teal-600"
              href="/track-order"
            >
              Track Order?
            </Link>
            <Link
              className="transition hover:text-teal-600"
              href="/vendor-market"
            >
              Sell on FeatherMart!
            </Link>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground lg:hidden">
            {user ? <UserMenu /> : <User2Icon className="size-8 shrink-0" />}

            <CartButton />
          </div>
        </div>
      </div>

      <nav className="h-[100px] bg-white shadow-sm lg:h-[120px]">
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col items-center justify-center bg-white px-4 sm:flex-row sm:justify-between md:gap-3">
          <h1 className="text-center text-2xl font-bold md:text-3xl">
            <Link href="/">
              Feather<span className="text-teal-600">Mart</span>
            </Link>
          </h1>
          <div className="relative w-[400px] md:w-[500px]">
            <Input
              placeholder="I am shoping for..."
              type="search"
              className="w-full pr-20"
            />
            <Button
              className="absolute right-0 top-0"
              variant="ghost"
              size="lg"
            >
              <Search className="size-5" />
            </Button>
          </div>

          <div className="hidden gap-4 lg:flex lg:items-center">
            <UserMenu />
            <CartButton />
          </div>
        </div>
      </nav>
    </header>
  );
};
