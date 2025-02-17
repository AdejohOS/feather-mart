"use client";
import { ClipboardList, HeartIcon, User2Icon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DottedSeparator } from "./ui/dotted-separator";

import { Button } from "./ui/button";

export const UserMenu = () => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild className="relative outline-none">
        <button className="flex items-center gap-1 border-none stroke-none">
          <User2Icon className="size-10 shrink-0" />
          <div>
            <p className="text-sm">Account</p>
            <p className="font-medium">LOGIN</p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        className="w-60"
        sideOffset={10}
      >
        <div className="flex flex-col items-center justify-center gap-2 px-2.5 py-4 ">
          <Button className="w-full">Sign In</Button>
          <Button className="w-full" variant="ghost">
            Register
          </Button>
        </div>
        <DottedSeparator className="mb-1" />

        {/*<div className="flex items-center gap-x-2 px-2.5 py-4 ">
          <Avatar className="size-52px border border-neutral-700">
            <AvatarFallback className="flex items-center justify-center bg-neutral-200 text-xl font-medium text-neutral-500">
              SA
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-neutral-500 text-sm truncate">
              Welcome back, <span className="font-medium">Sunday</span>
            </p>
            <p className="text-xs text-neutral-500 truncate">
              elusivebrown@gmail.com
            </p>
          </div>
    </div> */}

        <DropdownMenuItem className="flex h-10 cursor-pointer items-center  font-medium">
          <ClipboardList className="mr-2 size-4" /> My Orders
        </DropdownMenuItem>
        <DropdownMenuItem className="flex h-10 cursor-pointer items-center  font-medium">
          <HeartIcon className="mr-2 size-4" /> My Wishlist
        </DropdownMenuItem>
        {/*<DropdownMenuItem
          className="flex h-10 cursor-pointer items-center  font-medium text-amber-700"
          onClick={() => {}}
        >
          <GoSignOut className="mr-2 size-4" /> Logout
        </DropdownMenuItem>*/}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
