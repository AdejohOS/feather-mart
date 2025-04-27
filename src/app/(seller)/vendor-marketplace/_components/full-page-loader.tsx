import { Loader } from "lucide-react";

export function FullPageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
