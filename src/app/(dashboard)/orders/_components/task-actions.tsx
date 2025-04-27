"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ExternalLinkIcon } from "lucide-react";

import { useRouter } from "next/navigation";

interface TaskActionsProps {
  id: number;
  children: React.ReactNode;
}
export const TaskActions = ({ id, children }: TaskActionsProps) => {
  const router = useRouter();

  const openOrderDetails = () => {
    router.push(`/orders/${id}`);
  };

  return (
    <div className="flex justify-end">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={openOrderDetails}
            className="p-[10px] font-medium"
          >
            <ExternalLinkIcon className="mr-2 size-4 stroke-2" />
            View Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
