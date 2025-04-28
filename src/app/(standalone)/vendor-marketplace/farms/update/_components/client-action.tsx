"use client";

import { Button } from "@/components/ui/button";

import { useConfirm } from "@/hooks/use-confirm";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteFarmAction } from "../../action";

interface ClientActionProps {
  farmId: string;
}

export const ClientAction = ({ farmId }: ClientActionProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isLoading, startTransition] = useTransition();

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete farm",
    "The action cannot be undone",
    "destructive"
  );

  const onConfirm = async () => {
    const ok = await confirm();
    if (!ok) return;
    startTransition(async () => {
      try {
        const result = await deleteFarmAction(farmId);

        if (result.success) {
          toast.success("Farm deleted successfully.");
          queryClient.invalidateQueries({ queryKey: ["seller-farm"] });

          router.push("/vendor-marketplace/settings");
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.log(error);
        toast.error("An unexpected error occured.");
      }
    });
  };

  return (
    <>
      <ConfirmDialog isLoading={isLoading} />
      <div className="flex w-full justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href="/vendor-marketplace">
            <ArrowLeft className="mr-2 size-4" />
            Back to dashboard
          </Link>
        </Button>

        <Button variant="destructive" size="sm" onClick={onConfirm}>
          <Trash className="size-4" />
          Delete farm
        </Button>
      </div>
    </>
  );
};
