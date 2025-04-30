"use client";

import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { ArrowLeft, PenBox, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useDeleteFarm } from "@/hooks/use-seller-farms";

interface TaskActionProps {
  productId: string;
  onEdit?: boolean;
  onDelete?: boolean;
}

export const TaskAction = ({ productId, onEdit = false }: TaskActionProps) => {
  const router = useRouter();

  const { mutate: deleteFarm, isPending } = useDeleteFarm();

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete farm",
    "The action cannot be undone",
    "destructive"
  );

  const onConfirm = async () => {
    const ok = await confirm();
    if (!ok) return;
    deleteFarm(productId, {
      onSuccess: () => {
        router.push("/vendor-marketplace/farms");
      },
      onError: (error) => {
        console.log(error);
      },
    });
  };

  const isLoading = isPending;

  return (
    <>
      <ConfirmDialog isLoading={isLoading} />
      <div className="flex w-full justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href="/vendor-marketplace/settings">
            <ArrowLeft className="mr-2 size-4" />
            Back to dashboard
          </Link>
        </Button>

        {onEdit ? (
          <Button size="sm">
            <PenBox className="size-4" />
            Edit farm
          </Button>
        ) : (
          <Button variant="destructive" size="sm" onClick={onConfirm}>
            <Trash className="size-4" />
            Delete farm
          </Button>
        )}
      </div>
    </>
  );
};
