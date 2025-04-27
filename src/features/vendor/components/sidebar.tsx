"use client";
import { DottedSeparator } from "@/components/ui/dotted-separator";
import { Navigation } from "./navigation";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-logout";
import { Crown, LogOut } from "lucide-react";

const Sidebar = () => {
  const { mutate } = useLogout();

  const signOut = () => {
    mutate();
  };
  return (
    <aside className="h-full w-full bg-neutral-50 p-4">
      <p className="flex items-center gap-x-2 text-lg font-semibold text-neutral-500">
        <Crown className="size-4" /> Navigation
      </p>
      <DottedSeparator className="my-4" />
      <Navigation />
      <DottedSeparator className="my-4" />
      <Button onClick={signOut} variant="outline" className=" w-full">
        <LogOut />
        Logout
      </Button>
    </aside>
  );
};

export default Sidebar;
