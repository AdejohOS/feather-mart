"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

import { AccountDetails } from "./account-details";
import { PasswordChange } from "./password-change";
import { ProfileSettings } from "./profile-settings";

type User = {
  email: string;
  app_metadata: {
    provider: string;
  };
  user_metadata: {
    full_name: string;
    avatar_url: string;
  };
  phone_number?: string | null;
  id?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any; // Allow additional properties in the user object
};

type Profile = {
  full_name: string;
  avatar_url: string;
  email: string;
  phone_number?: string | null;
  [key: string]: any; // Allow additional properties in the profile object
};
interface AccountTabsProps {
  user: User;
  profile: Profile;
}
export const AccountTabs = ({ user, profile }: AccountTabsProps) => {
  const [activeTab, setActiveTab] = useState("account");

  // Determine if the user is using OAuth or email/password
  const isOAuthUser = !!(
    user?.app_metadata?.provider && user.app_metadata.provider !== "email"
  );
  const authProvider = user?.app_metadata?.provider || "email";

  return (
    <Tabs
      defaultValue="account"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full mx-auto"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="account">Account</TabsTrigger>
        {!isOAuthUser && <TabsTrigger value="password">Password</TabsTrigger>}
        {isOAuthUser && (
          <TabsTrigger value="password" disabled>
            Password
          </TabsTrigger>
        )}
        <TabsTrigger value="profile">Profile</TabsTrigger>
      </TabsList>

      <TabsContent value="account">
        <Card>
          <AccountDetails
            user={user}
            profile={profile}
            isOAuthUser={isOAuthUser}
            authProvider={authProvider}
          />
        </Card>
      </TabsContent>

      <TabsContent value="password">
        <Card>
          {!isOAuthUser ? (
            <PasswordChange user={user} />
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">
                Password management is not available for accounts that sign in
                with {authProvider}.
              </p>
            </div>
          )}
        </Card>
      </TabsContent>

      <TabsContent value="profile">
        <Card>
          <ProfileSettings user={user} profile={profile} />
        </Card>
      </TabsContent>
    </Tabs>
  );
};
