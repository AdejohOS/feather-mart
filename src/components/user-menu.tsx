"use client";

import {
  ClipboardList,
  HeartIcon,
  List,
  Loader,
  LogOut,
  Settings,
  User,
  User2Icon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DottedSeparator } from "./ui/dotted-separator";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";

import { useState } from "react";

export const UserMenu = () => {
  const { user, profile, loading, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await signOut();
    // Force refetch cart data
    queryClient.invalidateQueries({ queryKey: ["cart"] });
    setIsLoggingOut(false);
  };

  const signIn = () => {
    router.push("/auth/sign-in");
  };

  if (loading) {
    return (
      <div className="flex size-10 items-center justify-center rounded-full border border-neutral-300 bg-neutral-200">
        <Loader className="text-muted-foreground size-4 animate-spin" />
      </div>
    );
  }

  const { full_name, avatar_url, email, username } = profile || {
    full_name: "",
    avatar_url: "",
    email: "",
  };

  const avatarFallback = full_name
    ? full_name.charAt(0).toUpperCase()
    : email?.charAt(0).toLocaleUpperCase() ?? "U";

  const surname = profile?.full_name?.split(" ").pop();
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild className="relative outline-none">
        <button className="flex items-center gap-1 border-none stroke-none cursor-pointer">
          {user ? (
            <Avatar className="size-10 border border-neutral-700 transition hover:opacity-75">
              <AvatarImage src={avatar_url || ""} />
              <AvatarFallback className="flex items-center justify-center bg-neutral-200 font-medium text-neutral-500">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          ) : (
            <User2Icon className="size-8 shrink-0" />
          )}

          <div className="text-start">
            <p className="text-sm">
              {user ? <span>Hi, {surname} </span> : "Account"}
            </p>
            <p className="text-sm font-medium">
              {user ? "Account" : "Login/Register"}
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>
      {!user ? (
        <DropdownMenuContent
          align="end"
          side="bottom"
          className="w-60"
          sideOffset={10}
        >
          <div className="flex flex-col items-center justify-center gap-2 px-2.5 py-4">
            <DropdownMenuItem
              onClick={signIn}
              className="flex h-10 w-full cursor-pointer items-center justify-center bg-teal-600 font-medium text-white hover:bg-teal-700 hover:text-white"
            >
              Sign In
            </DropdownMenuItem>
          </div>

          <DottedSeparator className="mb-1" />

          <DropdownMenuItem
            onClick={() => router.push("/orders")}
            className="flex h-10 cursor-pointer items-center font-medium"
          >
            <ClipboardList className="mr-2 size-4" /> My Orders
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/wishlist")}
            className="flex h-10 cursor-pointer items-center font-medium"
          >
            <HeartIcon className="mr-2 size-4" /> My Wishlist
          </DropdownMenuItem>
        </DropdownMenuContent>
      ) : (
        <DropdownMenuContent
          align="end"
          side="bottom"
          className="w-60"
          sideOffset={10}
        >
          <div className="flex items-center gap-x-2 px-2.5 py-4">
            <Avatar className="size-[52px] border border-neutral-700">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="flex items-center justify-center bg-neutral-200 text-xl font-medium text-neutral-500">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="truncate text-sm text-neutral-500">
                Welcome back, <span className="font-medium">{surname}</span>
              </p>
              <p className="truncate text-xs text-neutral-500">{email}</p>
            </div>
          </div>
          <DottedSeparator className="mb-1" />
          <DropdownMenuItem
            onClick={() => router.push("/orders")}
            className="flex h-10 cursor-pointer items-center font-medium"
          >
            <List className="mr-2 size-4" /> My Orders
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/wishlist")}
            className="flex h-10 cursor-pointer items-center font-medium"
          >
            <HeartIcon className="mr-2 size-4" /> My Wishlist
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => router.push(`/profile/${username}`)}
            className="flex h-10 cursor-pointer items-center font-medium"
          >
            <Settings className="mr-2 size-4" />
            Manage Account
          </DropdownMenuItem>

          <DottedSeparator className="my-1" />
          <DropdownMenuItem
            className="flex h-10 cursor-pointer items-center font-medium text-amber-700 gap-2"
            onClick={handleSignOut}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader className="size-4 animate-spin " />
            ) : (
              <LogOut className=" size-4" />
            )}{" "}
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};
