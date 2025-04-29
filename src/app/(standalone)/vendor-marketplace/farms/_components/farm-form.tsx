"use client";

import { UploadedMedia } from "@/hooks/use-supabase-uploads";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Loader } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { MediaUpload } from "@/components/media-upload";
import { useCreateFarm, useUpdateFarm } from "@/hooks/use-seller-farms";

const farmFormSchema = z.object({
  // Basic Information
  id: z.string().optional(),
  name: z
    .string()
    .min(3, { message: "Farm name must be at least 3 characters" })
    .max(100, { message: "Farm name cannot exceed 100 characters" }),

  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" })
    .max(2000, { message: "Description cannot exceed 2000 characters" }),

  establishedDate: z.date().optional(),

  size: z.string().optional(),

  // Location
  address: z
    .string()
    .max(200, { message: "Address cannot exceed 200 characters" })
    .optional(),
  city: z
    .string()
    .max(100, { message: "City cannot exceed 100 characters" })
    .optional(),
  state: z
    .string()
    .max(100, { message: "State/Province cannot exceed 100 characters" })
    .optional(),
  postalCode: z
    .string()
    .max(20, { message: "Postal code cannot exceed 20 characters" })
    .optional(),
  country: z
    .string()
    .max(100, { message: "Country cannot exceed 100 characters" })
    .optional(),

  // Contact Information
  contactName: z
    .string()
    .max(100, { message: "Contact name cannot exceed 100 characters" })
    .optional(),
  contactEmail: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .optional()
    .or(z.literal("")),
  contactPhone: z
    .string()
    .max(50, { message: "Phone number cannot exceed 50 characters" })
    .optional(),
  website: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .or(z.literal("")),

  // Farm Specifics
  farmType: z
    .array(z.string())
    .min(1, { message: "Please select at least one farm type" }),

  certifications: z.array(z.string()).optional(),

  productionCapacity: z.string().optional(),

  breeds: z.array(z.string()).optional(),

  farmingPractices: z
    .string()
    .max(2000, { message: "Farming practices cannot exceed 2000 characters" })
    .optional(),

  // Facilities
  housingTypes: z.array(z.string()).optional(),

  hasProcessingFacility: z.boolean().default(false),

  processingDetails: z
    .string()
    .max(1000, { message: "Processing details cannot exceed 1000 characters" })
    .optional(),

  storageCapabilities: z
    .string()
    .max(1000, {
      message: "Storage capabilities cannot exceed 1000 characters",
    })
    .optional(),

  biosecurityMeasures: z
    .string()
    .max(1000, {
      message: "Biosecurity measures cannot exceed 1000 characters",
    })
    .optional(),

  // Business Information
  businessHours: z
    .string()
    .max(500, { message: "Business hours cannot exceed 500 characters" })
    .optional(),

  deliveryOptions: z.array(z.string()).optional(),

  deliveryDetails: z
    .string()
    .max(1000, { message: "Delivery details cannot exceed 1000 characters" })
    .optional(),

  pickupAvailable: z.boolean().default(false),

  pickupDetails: z
    .string()
    .max(1000, { message: "Pickup details cannot exceed 1000 characters" })
    .optional(),

  paymentMethods: z.array(z.string()).optional(),

  wholesaleAvailable: z.boolean().default(false),

  wholesaleDetails: z
    .string()
    .max(1000, { message: "Wholesale details cannot exceed 1000 characters" })
    .optional(),

  // Media
  uploadedMedia: z.array(z.custom<UploadedMedia>()).optional(),
  existingMedia: z.array(z.custom<UploadedMedia>()).optional(),
});

type FarmFormValues = z.infer<typeof farmFormSchema>;

// Default values for the form
const defaultValues: Partial<FarmFormValues> = {
  name: "",
  description: "",
  farmType: [],
  size: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  website: "",
  certifications: [],
  breeds: [],
  housingTypes: [],
  hasProcessingFacility: false,
  deliveryOptions: [],
  pickupAvailable: false,
  paymentMethods: [],
  wholesaleAvailable: false,
  uploadedMedia: [],
  existingMedia: [],
  address: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  productionCapacity: "",
};

const farmTypes = [
  { label: "Broiler Farm", value: "broiler" },
  { label: "Layer Farm", value: "layer" },
  { label: "Free-Range", value: "free-range" },
  { label: "Organic", value: "organic" },
  { label: "Backyard", value: "backyard" },
  { label: "Commercial", value: "commercial" },
  { label: "Hatchery", value: "hatchery" },
  { label: "Breeding Farm", value: "breeding" },
];

const certificationOptions = [
  { label: "USDA Organic", value: "usda-organic" },
  { label: "Certified Humane", value: "certified-humane" },
  { label: "Animal Welfare Approved", value: "animal-welfare-approved" },
  { label: "Non-GMO Project Verified", value: "non-gmo" },
  { label: "Global Animal Partnership", value: "gap" },
  { label: "American Humane Certified", value: "american-humane" },
];

const breedOptions = [
  { label: "Rhode Island Red", value: "rhode-island-red" },
  { label: "Leghorn", value: "leghorn" },
  { label: "Plymouth Rock", value: "plymouth-rock" },
  { label: "Orpington", value: "orpington" },
  { label: "Sussex", value: "sussex" },
  { label: "Wyandotte", value: "wyandotte" },
  { label: "Australorp", value: "australorp" },
  { label: "Jersey Giant", value: "jersey-giant" },
  { label: "Brahma", value: "brahma" },
  { label: "Cochin", value: "cochin" },
  { label: "Silkie", value: "silkie" },
  { label: "Cornish Cross", value: "cornish-cross" },
];

const housingOptions = [
  { label: "Free-Range", value: "free-range" },
  { label: "Pasture-Raised", value: "pasture-raised" },
  { label: "Cage-Free", value: "cage-free" },
  { label: "Conventional Cages", value: "conventional-cages" },
  { label: "Enriched Colony Housing", value: "enriched-colony" },
  { label: "Aviary Systems", value: "aviary" },
  { label: "Barn Housing", value: "barn" },
];

const deliveryOptions = [
  { label: "Local Delivery", value: "local" },
  { label: "Regional Shipping", value: "regional" },
  { label: "Nationwide Shipping", value: "nationwide" },
  { label: "International Shipping", value: "international" },
  { label: "Third-Party Delivery", value: "third-party" },
];

const paymentOptions = [
  { label: "Credit Card", value: "credit-card" },
  { label: "Bank Transfer", value: "bank-transfer" },
  { label: "PayPal", value: "paypal" },
  { label: "Cash", value: "cash" },
  { label: "Check", value: "check" },
  { label: "Cryptocurrency", value: "crypto" },
];

interface FarmFormProps {
  initialData?: Partial<FarmFormValues>;
  isEditing?: boolean;
}

export const FarmForm = ({ initialData, isEditing }: FarmFormProps) => {
  const router = useRouter();
  const [allMedia, setAllMedia] = useState<UploadedMedia[]>([]);

  const form = useForm<FarmFormValues>({
    resolver: zodResolver(farmFormSchema) as Resolver<FarmFormValues>,
    defaultValues: initialData
      ? { ...defaultValues, ...initialData }
      : defaultValues,
  });

  // Initialize allMedia with existing media when component mounts
  useEffect(() => {
    if (initialData?.existingMedia && initialData.existingMedia.length > 0) {
      console.log(
        "Initializing with existing media:",
        initialData.existingMedia
      );

      // Set the initial media state
      setAllMedia(initialData.existingMedia);

      // Make sure form values are properly set
      form.setValue("existingMedia", initialData.existingMedia, {
        shouldDirty: false, // Don't mark as dirty since this is initial data
        shouldTouch: false, // Don't mark as touched
        shouldValidate: false, // Don't trigger validation
      });
    }
  }, [initialData?.existingMedia, form]);

  // Handle media updates from the MediaUpload component
  const handleMediaUpdate = (media: UploadedMedia[]) => {
    console.log("Media update received:", media);

    // Update local state
    setAllMedia(media);

    // Separate existing media from new uploads
    const existingMediaItems = media.filter((item) => item.id);
    const newUploads = media.filter((item) => !item.id);

    console.log("Existing media items:", existingMediaItems);
    console.log("New uploads:", newUploads);

    // Update form values
    form.setValue("existingMedia", existingMediaItems, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });

    form.setValue("uploadedMedia", newUploads, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });

    // Force a form state update to ensure the UI reflects the changes
    form.trigger();
  };
  const createFarm = useCreateFarm();
  const updateFarm = useUpdateFarm();

  async function onSubmit(data: FarmFormValues) {
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === "uploadedMedia") {
            // Only include newly uploaded media, not existing media
            if (Array.isArray(value) && value.length > 0) {
              console.log("Form submission - uploadedMedia:", value);
              // Convert to a simple object structure to avoid UUID issues
              const simplifiedMedia = value.map((media) => ({
                url: (media as UploadedMedia).url,
                type: (media as UploadedMedia).type,
                name:
                  typeof media === "object" && "name" in media
                    ? media.name
                    : "file",
              }));
              formData.append(key, JSON.stringify(simplifiedMedia));
            }
          } else if (key === "existingMedia") {
            // Include existing media for preservation
            if (Array.isArray(value) && value.length > 0) {
              console.log("Form submission - existingMedia:", value);
              // We only need the IDs for existing media
              const mediaIds = value
                .filter(
                  (media): media is UploadedMedia =>
                    typeof media === "object" && "id" in media
                )
                .map((media) => media.id)
                .filter(Boolean);
              formData.append(key, JSON.stringify(mediaIds));
            }
          } else if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (key === "establishedDate" && value instanceof Date) {
            formData.append(key, value.toISOString());
          } else {
            formData.append(key, String(value));
          }
        }
      });

      if (isEditing && initialData?.id) {
        await updateFarm.mutateAsync(formData);
        router.push("/vendor-marketplace/settings");
      } else {
        await createFarm.mutateAsync(formData);
        router.push(`/vendor-marketplace/settings`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Something went wrong");
    }
  }

  const isPending = createFarm.isPending || updateFarm.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="mb-6 grid grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="specifics">Farm Specifics</TabsTrigger>
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
            <TabsTrigger value="business">Business Info</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Farm Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter farm name" {...field} />
                        </FormControl>
                        <FormDescription>
                          The name of your farm as it will appear in the
                          marketplace.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your farm in detail"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a detailed description of your farm, including
                          it&apos;s history, mission, and values.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="establishedDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Established Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Select date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              disabled={(date) => date > new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          When was your farm established?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Farm Size</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 5 acres, 2000 sq ft"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The size of your farm (acres, square feet, etc.)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter contact person's name"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Primary contact person for the farm
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="farm@domain.com"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Email address for business inquiries
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+234 (706) 349-4394" {...field} />
                        </FormControl>
                        <FormDescription>
                          Phone number for business inquiries
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://www.yourfarm.com"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Your farm&apos;s website or social media page
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-2">
                    <MediaUpload
                      form={form}
                      maxFiles={10}
                      existingMedia={allMedia}
                      mediaType="farm"
                      entityId={initialData?.id}
                      onMediaUpdate={handleMediaUpdate}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Farm Road" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your farm&apos;s street address (will not be publicly
                          displayed)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter state or province"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter postal code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Farm Specifics Tab */}
          <TabsContent value="specifics" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="farmType"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Farm Type</FormLabel>
                          <FormDescription>
                            Select all types that apply to your farm
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                          {farmTypes.map((type) => (
                            <FormField
                              key={type.value}
                              control={form.control}
                              name="farmType"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={type.value}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          type.value
                                        )}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                type.value,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) =>
                                                    value !== type.value
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {type.label}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="certifications"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">
                            Certifications
                          </FormLabel>
                          <FormDescription>
                            Select all certifications that your farm has
                            obtained
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                          {certificationOptions.map((cert) => (
                            <FormField
                              key={cert.value}
                              control={form.control}
                              name="certifications"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={cert.value}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          cert.value
                                        )}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...(field.value || []),
                                                cert.value,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) =>
                                                    value !== cert.value
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {cert.label}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="productionCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Production Capacity</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 1000 birds per month, 500 dozen eggs per week"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Describe your farm&apos;s production capacity
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="breeds"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">
                            Breeds Raised
                          </FormLabel>
                          <FormDescription>
                            Select all poultry breeds that you raise on your
                            farm
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                          {breedOptions.map((breed) => (
                            <FormField
                              key={breed.value}
                              control={form.control}
                              name="breeds"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={breed.value}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          breed.value
                                        )}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...(field.value || []),
                                                breed.value,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) =>
                                                    value !== breed.value
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {breed.label}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="farmingPractices"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Farming Practices</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your farming practices, including feed, animal welfare, sustainability measures, etc."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide details about your farming practices to help
                          buyers understand your approach
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Facilities Tab */}
          <TabsContent value="facilities" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="housingTypes"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">
                            Housing Types
                          </FormLabel>
                          <FormDescription>
                            Select all housing types used on your farm
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                          {housingOptions.map((option) => (
                            <FormField
                              key={option.value}
                              control={form.control}
                              name="housingTypes"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={option.value}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          option.value
                                        )}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...(field.value || []),
                                                option.value,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) =>
                                                    value !== option.value
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {option.label}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="hasProcessingFacility"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>On-Site Processing Facility</FormLabel>
                          <FormDescription>
                            Check if your farm has an on-site processing
                            facility
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="processingDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Processing Facility Details</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your processing facility, capacity, certifications, etc."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide details about your processing facility if
                          applicable
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="storageCapabilities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Storage Capabilities</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your storage facilities, refrigeration, freezer capacity, etc."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide details about your storage capabilities
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="biosecurityMeasures"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biosecurity Measures</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your biosecurity protocols and disease prevention measures"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Outline the biosecurity measures implemented on your
                          farm
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Information Tab */}
          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="businessHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Hours</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Monday-Friday: 8am-5pm, Saturday: 9am-3pm, Sunday: Closed"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Specify your farm&apos;s operating hours
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="deliveryOptions"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">
                            Delivery Options
                          </FormLabel>
                          <FormDescription>
                            Select all delivery options that you offer
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                          {deliveryOptions.map((option) => (
                            <FormField
                              key={option.value}
                              control={form.control}
                              name="deliveryOptions"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={option.value}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          option.value
                                        )}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...(field.value || []),
                                                option.value,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) =>
                                                    value !== option.value
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {option.label}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveryDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Details</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide details about delivery areas, minimum orders, fees, etc."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Specify details about your delivery services
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="pickupAvailable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Farm Pickup Available</FormLabel>
                          <FormDescription>
                            Check if customers can pick up products directly
                            from your farm
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pickupDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pickup Details</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide details about pickup hours, location, procedures, etc."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Specify details about your farm pickup service
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="paymentMethods"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">
                            Payment Methods
                          </FormLabel>
                          <FormDescription>
                            Select all payment methods that you accept
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                          {paymentOptions.map((option) => (
                            <FormField
                              key={option.value}
                              control={form.control}
                              name="paymentMethods"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={option.value}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          option.value
                                        )}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...(field.value || []),
                                                option.value,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) =>
                                                    value !== option.value
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {option.label}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="wholesaleAvailable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Wholesale Available</FormLabel>
                          <FormDescription>
                            Check if you offer wholesale pricing for bulk orders
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wholesaleDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wholesale Details</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide details about wholesale minimums, pricing, terms, etc."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Specify details about your wholesale offerings
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/vendor-marketplace/settings")}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button disabled={isPending}>
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader className="size-4 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </span>
            ) : (
              `${isEditing ? "Update" : "Create"} Farm`
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
