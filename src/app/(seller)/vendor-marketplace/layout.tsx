import Sidebar from "@/features/vendor/components/sidebar";
import { UpdateProfileModal } from "@/app/(seller)/vendor-marketplace/(dashboard)/settings/_components/update-profile-modal";

interface VendorLayoutProps {
  children: React.ReactNode;
}
const VendorLayout = ({ children }: VendorLayoutProps) => {
  return (
    <div className="relative mx-auto flex h-full max-w-6xl p-4">
      <UpdateProfileModal />

      <div className="sticky top-[150px] hidden h-[calc(100vh-150px)] w-[264px] overflow-y-auto border-r lg:block">
        <Sidebar />
      </div>

      <div className="w-full">
        <main className="h-full flex-grow px-6 py-8">{children}</main>
      </div>
    </div>
  );
};

export default VendorLayout;
