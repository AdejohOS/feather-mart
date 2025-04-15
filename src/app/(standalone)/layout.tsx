import Link from "next/link";
import { UserMenu } from "@/components/user-menu";

interface StandaloneLayoutProps {
  children: React.ReactNode;
}

const StandaloneLayout = ({ children }: StandaloneLayoutProps) => {
  return (
    <main className="min-h-screen bg-neutral-100">
      <div className="mx-auto max-w-6xl p-4">
        <nav className="flex h-[73px] items-center justify-between drop-shadow-sm">
          <h1 className="text-3xl font-bold">
            <Link href="/">
              Feather<span className="text-teal-600">Mart</span>
            </Link>
          </h1>
          <UserMenu />
        </nav>
        <div className="flex flex-col items-center justify-center py-4">
          {children}
        </div>
      </div>
    </main>
  );
};

export default StandaloneLayout;
