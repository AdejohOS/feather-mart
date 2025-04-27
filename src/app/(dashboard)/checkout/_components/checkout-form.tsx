"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { CheckoutSummary } from "./checkout-summary";
import { createOrder } from "../../orders/action";
import { Cart } from "@/types/types";

// Define the form schema with Zod
const shippingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number is required"),
});

const paymentSchema = z.object({
  cardName: z.string().min(2, "Name on card is required"),
  cardNumber: z.string().min(13, "Card number is required").max(19),
  expiryDate: z.string().min(5, "Expiry date is required"),
  cvv: z.string().min(3, "CVV is required").max(4),
});

const checkoutSchema = z.object({
  shipping: shippingSchema,
  payment: paymentSchema,
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  cart: Cart;
  userId: string;
}

export const CheckoutForm = ({ cart, userId }: CheckoutFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("shipping");
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
    watch,
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange",
    defaultValues: {
      shipping: {
        fullName: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        email: "",
        phone: "",
      },
      payment: {
        cardName: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
      },
    },
  });

  const handleTabChange = async (value: string) => {
    if (value === "payment" && activeTab === "shipping") {
      // Validate shipping info before moving to payment
      const isShippingValid = await trigger("shipping");
      if (!isShippingValid) return;
    }
    setActiveTab(value);
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);

    try {
      // Create form data for server action
      const formData = new FormData();

      // Add shipping info
      Object.entries(data.shipping).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Add payment info (in a real app, you'd use a payment processor)
      // Here we're just simulating the payment process

      // Process the order
      const result = await createOrder(formData);

      if (result.success) {
        // Invalidate cart query to refresh cart data
        queryClient.invalidateQueries({ queryKey: ["cart"] });

        // Show success message
        toast.success(" Order Placed successfully!");

        // Redirect to order confirmation page
        router.push(`/orders/${result.orderId}`);
      } else {
        throw new Error("Failed to place order");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error.message || "Failed to place order. Please try again."
        );
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-3 ">
      <div className="p-4 text-gray-500 md:col-span-2">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
            </TabsList>

            <TabsContent value="shipping">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">
                      Shipping Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          {...register("shipping.fullName")}
                          placeholder="John Doe"
                        />
                        {errors.shipping?.fullName && (
                          <p className="text-sm text-red-500">
                            {errors.shipping.fullName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("shipping.email")}
                          placeholder="john@example.com"
                        />
                        {errors.shipping?.email && (
                          <p className="text-sm text-red-500">
                            {errors.shipping.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        {...register("shipping.address")}
                        placeholder="123 Main St"
                      />
                      {errors.shipping?.address && (
                        <p className="text-sm text-red-500">
                          {errors.shipping.address.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          {...register("shipping.city")}
                          placeholder="New York"
                        />
                        {errors.shipping?.city && (
                          <p className="text-sm text-red-500">
                            {errors.shipping.city.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State/Province</Label>
                        <Input
                          id="state"
                          {...register("shipping.state")}
                          placeholder="NY"
                        />
                        {errors.shipping?.state && (
                          <p className="text-sm text-red-500">
                            {errors.shipping.state.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          {...register("shipping.postalCode")}
                          placeholder="10001"
                        />
                        {errors.shipping?.postalCode && (
                          <p className="text-sm text-red-500">
                            {errors.shipping.postalCode.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          {...register("shipping.country")}
                          placeholder="United States"
                        />
                        {errors.shipping?.country && (
                          <p className="text-sm text-red-500">
                            {errors.shipping.country.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        {...register("shipping.phone")}
                        placeholder="(123) 456-7890"
                      />
                      {errors.shipping?.phone && (
                        <p className="text-sm text-red-500">
                          {errors.shipping.phone.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="button"
                      className="w-full mt-4"
                      onClick={() => handleTabChange("payment")}
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">
                      Payment Information
                    </h2>

                    <div className="space-y-2">
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input
                        id="cardName"
                        {...register("payment.cardName")}
                        placeholder="John Doe"
                      />
                      {errors.payment?.cardName && (
                        <p className="text-sm text-red-500">
                          {errors.payment.cardName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        {...register("payment.cardNumber")}
                        placeholder="4242 4242 4242 4242"
                      />
                      {errors.payment?.cardNumber && (
                        <p className="text-sm text-red-500">
                          {errors.payment.cardNumber.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          {...register("payment.expiryDate")}
                          placeholder="MM/YY"
                        />
                        {errors.payment?.expiryDate && (
                          <p className="text-sm text-red-500">
                            {errors.payment.expiryDate.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          {...register("payment.cvv")}
                          placeholder="123"
                        />
                        {errors.payment?.cvv && (
                          <p className="text-sm text-red-500">
                            {errors.payment.cvv.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleTabChange("shipping")}
                      >
                        Back to Shipping
                      </Button>

                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isSubmitting || !isValid}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          `Place Order`
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>

      <Card className="h-fit md:col-span-1 p-4 text-gray-500 md:sticky md:top-40">
        <CheckoutSummary cart={cart} />
      </Card>
    </div>
  );
};
