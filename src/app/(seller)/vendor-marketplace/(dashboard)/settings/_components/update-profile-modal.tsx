"use client";
import { UpdateProfileFormWrapper } from "@/app/(seller)/vendor-marketplace/(dashboard)/settings/_components/update-profile-form-wrapper";
import { ResponsiveModal } from "@/components/responsive-modal";
import { useUpdateProfileModal } from "@/hooks/use-update-profile-modal";

export const UpdateProfileModal = () => {
  const { isOpen, setIsOpen, close } = useUpdateProfileModal();
  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <UpdateProfileFormWrapper onCancel={close} />
    </ResponsiveModal>
  );
};
