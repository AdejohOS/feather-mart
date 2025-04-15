import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

interface VendorLayoutProps {
  children: React.ReactNode;
}
const VendorLayout = async ({ children }: VendorLayoutProps) => {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow pt-[150px]">{children}</main>
      <Footer />
    </main>
  );
};

export default VendorLayout;
