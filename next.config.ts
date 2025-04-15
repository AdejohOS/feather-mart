import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vddbmhfthnptkrwwjhyy.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "gvbpmhxsnejrbraprbys.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "gvbpmhxsnejrbraprbys.supabase.co",
        port: "",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
