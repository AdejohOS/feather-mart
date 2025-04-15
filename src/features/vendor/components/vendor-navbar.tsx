"use client";
import { MobileSidebar } from "./mobile-sidebar";

const VendorNavbar = () => {
  return (
    <div className="flex gap-3">
      <MobileSidebar />
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>
    </div>
  );
};
export default VendorNavbar;
