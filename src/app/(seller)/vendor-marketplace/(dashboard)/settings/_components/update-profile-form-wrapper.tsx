import { UpdateProfileForm } from "./update-profile-form";

import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";

import { useGetUserProfile } from "@/hooks/use-get-user-profile";

interface UpdateProfileFormWrapperProps {
  onCancel: () => void;
}
export const UpdateProfileFormWrapper = ({
  onCancel,
}: UpdateProfileFormWrapperProps) => {
  const { data: user, isPending } = useGetUserProfile();

  if (isPending) {
    return (
      <Card className="h-[714px] w-full border-none shadow-none">
        <CardContent className="flex h-full items-center justify-center">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  return (
    <>{user && <UpdateProfileForm onCancel={onCancel} profile={user} />}</>
  );
};
