"use client";

import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteProduct } from "@/hooks/use-products";
import { ArrowLeft, PenBox, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TaskActionProps {
  productId: string;
  onEdit?: boolean;
  onDelete?: boolean;
}

export const TaskAction = ({ productId, onEdit }: TaskActionProps) => {
  const router = useRouter();

  const { mutate: deleteProduct, isPending } = useDeleteProduct();

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete product",
    "The action cannot be undone",
    "destructive"
  );

  const onConfirm = async () => {
    const ok = await confirm();
    if (!ok) return;

    deleteProduct(productId, {
      onSuccess: () => {
        router.push("/vendor-marketplace/products");
      },
    });
  };

  const isLoading = isPending;

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

        {onEdit ? (
          <Button
            size="sm"
            onClick={() =>
              router.push(`/vendor-marketplace/products/${productId}/update`)
            }
          >
            <PenBox className="size-4" />
            Edit product
          </Button>
        ) : (
          <Button variant="destructive" size="sm" onClick={onConfirm}>
            <Trash className="size-4" />
            Delete product
          </Button>
        )}
      </div>
    </>
  );
};
