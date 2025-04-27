"use client";

import { cn } from "@/lib/utils";
import { AiOutlineProduct, AiFillProduct } from "react-icons/ai";
import { IoSettingsOutline, IoSettingsSharp } from "react-icons/io5";
import { IoIosList, IoIosListBox } from "react-icons/io";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LuLayoutDashboard } from "react-icons/lu";
import { MdDashboard } from "react-icons/md";

const routes = [
  {
    label: "Overview",
    href: "",
    icon: LuLayoutDashboard,
    activeIcon: MdDashboard,
  },
  {
    label: "Products",
    href: "/products",
    icon: AiOutlineProduct,
    activeIcon: AiFillProduct,
  },

  {
    label: "Orders",
    href: "/orders",
    icon: IoIosList,
    activeIcon: IoIosListBox,
  },

  {
    label: "Settings",
    href: "/settings",
    icon: IoSettingsOutline,
    activeIcon: IoSettingsSharp,
  },
];

export const Navigation = () => {
  const pathname = usePathname();
  return (
    <ul className="flex flex-col">
      {routes.map((route) => {
        const fullHref = `/vendor-marketplace${route.href}`;
        const isActive = pathname === fullHref;
        const Icon = isActive ? route.activeIcon : route.icon;
        return (
          <Link key={route.href} href={fullHref}>
            <div
              className={cn(
                "flex items-center gap-2.5 rounded-md p-2.5 font-medium text-neutral-500 transition hover:text-primary",
                isActive &&
                  "bg-teal-50 text-primary shadow-sm hover:opacity-100"
              )}
            >
              <Icon className="size-5 text-teal-500" /> {route.label}
            </div>
          </Link>
        );
      })}
    </ul>
  );
};
