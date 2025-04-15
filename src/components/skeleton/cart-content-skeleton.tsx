import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export function CartContentSkeleton() {
  return (
    <div className="flex gap-5">
      <Card className="p-4 basis-4/6">
        <Skeleton className="w-32 h-6" />
        <div className="space-y-4 mt-4">
          <div className="flex justify-between gap-3">
            <div className="flex flex-1 gap-3">
              <Skeleton className="h-32 w-32" />
              <div className="space-y-3">
                <Skeleton className=" w-40 h-6" />
                <Skeleton className=" w-40 h-6" />
                <Skeleton className=" w-30 h-6" />
              </div>
            </div>
            <div>
              <Skeleton className=" w-30 h-6" />
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <Skeleton className="w-30 h-6" />
          <Skeleton className="w-30 h-6" />
        </div>
      </Card>

      <div className="h-fit w-2/6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
