import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader } from "lucide-react";
import { useState } from "react";
import { JSX } from "react/jsx-runtime";

export const useConfirm = (
  title: string,
  message: string
): [(props: { isLoading: boolean }) => JSX.Element, () => Promise<unknown>] => {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = async () => {
    return new Promise((resolve) => {
      setPromise({ resolve });
    });
  };
  const handleClose = () => {
    setPromise(null);
  };

  const handleConfirm = async () => {
    if (promise) {
      promise.resolve(true); // Let the caller handle closing after async operation
    }
  };
  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  const ConfirmationDialog = ({ isLoading }: { isLoading: boolean }) => (
    <ResponsiveModal open={promise !== null} onOpenChange={handleClose}>
      <Card className="h-full w-full border-none shadow-none">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="flex w-full items-center justify-end gap-2 pt-4 lg:flex-row">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="w-full lg:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              variant="secondary"
              className="flex w-full items-center gap-2 lg:w-auto"
              disabled={isLoading}
            >
              {isLoading && <Loader className="size-4 animate-spin" />} Confirm
            </Button>
          </div>
        </CardContent>
      </Card>
    </ResponsiveModal>
  );

  return [ConfirmationDialog, confirm];
};
