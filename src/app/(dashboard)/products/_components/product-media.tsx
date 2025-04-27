"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Maximize, Play, X } from "lucide-react";
import { useState } from "react";

type ProductMedia = {
  id: string;
  url: string;
  type: "image" | "video";
};

interface ProductMediaProps {
  media: ProductMedia[];
}
export const ProductMedia = ({ media }: ProductMediaProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!media || media.length === 0) {
    return (
      <Card className="h-fit basis-2/5 space-y-5 md:sticky md:top-20">
        <div className="flex aspect-square items-center justify-center bg-muted">
          <p className="text-muted-foreground">No media available</p>
        </div>
      </Card>
    );
  }

  const activeMedia = media[activeIndex];

  const nextMedia = () => {
    setActiveIndex((prev) => (prev + 1) % media.length);
  };

  const prevMedia = () => {
    setActiveIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  return (
    <div className="">
      <div className="space-y-4">
        <Card className="group relative overflow-hidden p-0 bg-gray-500">
          <div className="h-[300px] w-full bg-background">
            {activeMedia.type === "video" ? (
              <div className="relative h-full w-full">
                <video
                  src={activeMedia.url}
                  className="h-full w-full object-cover"
                  controls
                />
              </div>
            ) : (
              <div className="relative h-full w-full">
                <Image
                  src={activeMedia.url || "/placeholder.svg"}
                  alt="Product"
                  className="h-full w-full object-contain"
                  width={1000}
                  height={1000}
                  loading="lazy"
                />
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogHeader>
                    <DialogTitle className="sr-only">Product Media</DialogTitle>
                  </DialogHeader>
                  <DialogContent className="max-w-md p-0">
                    <div className="relative aspect-square w-full">
                      {media[activeIndex].type === "video" ? (
                        <video
                          src={media[activeIndex].url}
                          className="absolute inset-0 h-full w-full object-cover"
                          controls
                        />
                      ) : (
                        <Image
                          src={media[activeIndex].url || "/placeholder.svg"}
                          alt="Product"
                          className="absolute inset-0 h-full w-full object-cover"
                          fill
                        />
                      )}

                      <DialogClose asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 bg-black/20 text-white hover:bg-black/40"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </DialogClose>

                      {media.length > 1 && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 text-white hover:bg-black/40"
                            onClick={prevMedia}
                          >
                            <ChevronLeft className="h-6 w-6" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 text-white hover:bg-black/40"
                            onClick={nextMedia}
                          >
                            <ChevronRight className="h-6 w-6" />
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Thumbnail navigation for dialog */}
                    {media.length > 1 && (
                      <div className="flex justify-center gap-1 px-2 pt-2 pb-2">
                        {media.map((item, index) => (
                          <div
                            key={`dialog-thumb-${item.id}`}
                            className={cn(
                              "h-14 w-14 cursor-pointer overflow-hidden rounded-md transition-all",
                              activeIndex === index
                                ? "ring-2 ring-primary"
                                : "opacity-70 hover:opacity-100"
                            )}
                            onClick={() => setActiveIndex(index)}
                          >
                            {item.type === "video" ? (
                              <div className="relative h-full w-full">
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                  <Play className="h-4 w-4 text-white" />
                                </div>
                                <video
                                  src={item.url}
                                  className="h-full w-full object-cover"
                                  muted
                                />
                              </div>
                            ) : (
                              <Image
                                src={item.url || "/placeholder.svg"}
                                alt={`Product ${index + 1}`}
                                className="h-full w-full object-cover"
                                height={1000}
                                width={1000}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          {media.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={prevMedia}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={nextMedia}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </Card>

        {media.length > 1 && (
          <div className="grid grid-cols-5 gap-1">
            {media.map((item, index) => (
              <Card
                key={item.id}
                className={cn(
                  "p-0 cursor-pointer overflow-hidden transition-all",
                  activeIndex === index
                    ? "ring-2 ring-primary"
                    : "opacity-70 hover:opacity-100"
                )}
                onClick={() => setActiveIndex(index)}
              >
                <div className="relative h-16 w-full">
                  {item.type === "video" ? (
                    <div className="relative h-full w-full">
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <Play className="h-5 w-5 text-white" />
                      </div>
                      <video
                        src={item.url}
                        className="h-full w-full object-cover"
                        muted
                      />
                    </div>
                  ) : (
                    <Image
                      src={item.url || "/placeholder.svg"}
                      alt={`Product ${index + 1}`}
                      fill
                      className=" object-cover"
                    />
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
