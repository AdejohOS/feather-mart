"use client";
import { Button } from "@/components/ui/button";
import { useGetFarms } from "@/hooks/use-seller-farms";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import Image from "next/image";
import {
  Globe,
  ImageIcon,
  Mail,
  MapPin,
  PenBoxIcon,
  PhoneCall,
  PlusCircle,
  VideoIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BusinessSkeleton } from "@/components/ui/dasboard-skeleton";
import { DottedSeparator } from "@/components/ui/dotted-separator";
import { Badge } from "@/components/ui/badge";

export const Farms = () => {
  const router = useRouter();
  const { data: farms = [], isLoading } = useGetFarms();

  if (isLoading) {
    return <BusinessSkeleton />;
  }

  return (
    <Card className="p-4">
      <h3 className="text-xl font-semibold">BUSINESS SETTINGS</h3>
      <Separator className="my-4" />
      {farms.length === 0 ? (
        <div className="flex items-center justify-center text-muted-foreground">
          <Button
            className="flex items-center gap-x-2"
            variant="secondary"
            size="lg"
            onClick={() => router.push("/vendor-marketplace/farms/create")}
          >
            <PlusCircle className="size-5" /> Add Farm
          </Button>
        </div>
      ) : (
        <div>
          {farms?.map((farm) => (
            <div className="text-muted-foreground" key={farm.id}>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold">{farm.name}</h3>
                  </div>

                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() =>
                      router.push(`/vendor-marketplace/farms/${farm.id}/update`)
                    }
                    className="flex items-center gap-2"
                  >
                    <PenBoxIcon className="size-3 shrink-0" />
                    Update Farm
                  </Button>
                </div>

                <address className="flex items-center gap-2">
                  <MapPin className="size-4 text-teal-600" />
                  <p>
                    {farm.address}, {farm.state}, {farm.country}
                  </p>
                </address>
                <p className="flex items-center gap-2">
                  <PhoneCall className="size-4 text-teal-600" />{" "}
                  {farm.contact_phone}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="size-4 text-teal-600" />
                  {farm.contact_email}
                </p>
                <p className="flex items-center gap-2">
                  <Globe className="size-4 text-teal-600" />
                  {farm.website ? (
                    <>{farm.website}</>
                  ) : (
                    <em className="text-sm">Update to provide website</em>
                  )}
                </p>
                <p className="mt-2 rounded-md bg-neutral-50 p-4 text-sm">
                  <em>" {farm.description} "</em>
                </p>
              </div>

              <DottedSeparator className="my-7" />

              <div className="space-y-1">
                <p>
                  <strong>Poultry type:</strong> {farm.farm_type}
                </p>
                <p>
                  {" "}
                  <strong>Housing type :</strong> {farm.housing_types}
                </p>
                <p>
                  <strong>Capacity:</strong> {farm.size}
                </p>
                <div className="flex items-center gap-2">
                  <strong>Certifications:</strong>{" "}
                  <span className="flex items-center flex-wrap gap-3">
                    {farm.certifications && farm.certifications.length > 0 ? (
                      farm.certifications?.map((cert, index) => (
                        <Badge key={index} variant="secondary">
                          {farm.certifications}
                        </Badge>
                      ))
                    ) : (
                      <em className="text-sm">No certificate available</em>
                    )}
                  </span>
                </div>
              </div>
              <DottedSeparator className="my-7" />
              <h2 className="mb-4">
                <strong>Farm Media:</strong>
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {farm.media.length > 0 ? (
                  farm.media.map((mediaItem, index) => {
                    console.log("Rendering media:", mediaItem);
                    const isImage = mediaItem.type.startsWith("image");
                    const isVideo = mediaItem.type.startsWith("video");

                    return (
                      <div key={index} className="relative aspect-video">
                        {isImage && (
                          <Zoom>
                            <div className="h-full w-full">
                              <Image
                                src={mediaItem.url}
                                alt={mediaItem.url ?? "farm media"}
                                loading="lazy"
                                fill
                                className="rounded-md border object-contain"
                              />
                            </div>
                            <p className="absolute left-1 top-1">
                              <ImageIcon className="size-4" />
                            </p>
                          </Zoom>
                        )}
                        {isVideo && (
                          <div className="relative h-full w-full">
                            <video
                              controls
                              className="h-full w-full rounded-md object-cover"
                            >
                              <source
                                src={mediaItem.url}
                                type={mediaItem.type}
                              />
                              Your browser does not support videos.
                            </video>
                            <p className="absolute left-1 top-1">
                              <VideoIcon className="size-4" />
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">No media available.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
