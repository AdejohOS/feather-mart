import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import { FarmDetails } from "../_components/farm-details";

const Page = async ({ params }: { params: Promise<{ farmId: string }> }) => {
  const { farmId } = await params;
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 pt-4 pb-16 space-y-4">
        <Link href="/farms" className="mb-4">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Farms
          </Button>
        </Link>
        <FarmDetails farmId={farmId} />
      </div>
    </section>
  );
};

export default Page;
