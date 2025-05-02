"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar, ExternalLink, MapPin, Package } from "lucide-react";
import Link from "next/link";

// Define the profile type
interface Profile {
  id: string;
  full_name: string | null;
  username: string;
  avatar_url: string | null;
  created_at: string | null;

  // Add other relevant fields
}

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
}

interface Order {
  id: number;
  status: string;
  created_at: string | null;
  total_amount: number;
  order_items: OrderItem[];
}
interface PublicProfileProps {
  profile: Profile;
  recentOrders: Order[];
  isOwnProfile: boolean;
}

export const PublicProfile = ({
  profile,
  recentOrders,
  isOwnProfile,
}: PublicProfileProps) => {
  // Format the date when the account was created
  const joinedDate = profile.created_at
    ? format(new Date(profile.created_at), "MMMM yyyy")
    : "N/A";

  // Get initials for avatar
  const getInitials = () => {
    if (profile.full_name) {
      return profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    return profile.username?.substring(0, 2).toUpperCase() || "U";
  };

  return (
    <div className="grid gap-8 md:grid-cols-3 relative">
      <div className="h-fit md:col-span-1 p-4 text-gray-500 md:sticky md:top-40">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="size-24 border border-neutral-700">
                <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="flex items-center justify-center bg-neutral-200 text-xl font-medium text-neutral-500">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">
              {profile.full_name || profile.username}
            </CardTitle>
            <p className="text-gray-500">@{profile.username}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm">
                🧨 Problem 2: Sending email in form but not using it in server
                action.
              </p>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Abuja, Nigeria</span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Joined {joinedDate}</span>
                </div>

                <div className="flex items-center text-sm">
                  <ExternalLink className="h-4 w-4 mr-2 text-gray-500" />
                  <Link
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    <Link
                      href="/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      browny.dev.replace(&#47;^https?:&#47;&#47;/, &#34;&#34;)
                    </Link>
                  </Link>
                </div>
              </div>

              {isOwnProfile && (
                <div className="pt-4">
                  <Link href="/account">
                    <Button variant="outline" className="w-full">
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 text-gray-500 md:col-span-2">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">Order #{order.id}</h3>
                        <p className="text-sm text-gray-500">
                          {order.created_at
                            ? format(new Date(order.created_at), "MMMM d, yyyy")
                            : "Date unavailable"}
                        </p>
                      </div>
                      <Badge
                        className={
                          order.status === "delivered"
                            ? "bg-green-500"
                            : order.status === "shipped"
                            ? "bg-purple-500"
                            : order.status === "processing"
                            ? "bg-blue-500"
                            : order.status === "pending"
                            ? "bg-yellow-500"
                            : order.status === "cancelled"
                            ? "bg-red-500"
                            : "bg-gray-500"
                        }
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <p>
                        {order.order_items.length}{" "}
                        {order.order_items.length === 1 ? "item" : "items"} • $
                        {order.total_amount.toFixed(2)}
                      </p>
                    </div>
                    {isOwnProfile && (
                      <div className="mt-2">
                        <Link href={`/orders/${order.id}`}>
                          <Button
                            variant="link"
                            className="h-auto p-0 text-blue-600"
                          >
                            View Order Details
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No orders yet</p>
              </div>
            )}

            {isOwnProfile && recentOrders.length > 0 && (
              <div className="mt-4 text-center">
                <Link href="/orders">
                  <Button variant="outline">View All Orders</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
