import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'

// Creating a handler to a GET request to route /auth/confirm
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  console.log("Received full URL:", request.url);
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const role = searchParams.get("role");
  console.log("Received role from URL:", role);
  const next = '/account'

  // Define the valid roles
  type UserRole = "admin" | "buyer" | "seller" | null | undefined;

  // Role validation function
  const isValidRole = (role: string | null | undefined): role is UserRole => {
    return role === "admin" || role === "buyer" || role === "seller" || role === null || role === undefined;
  };


  // Create redirect link without the secret token
  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')

  if (role) {
    redirectTo.searchParams.set("role", role); // Preserve role in redirect
  }

  if (token_hash && type) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error && data?.user) {
      const userId = data.user.id;

      

       if (role && isValidRole(role)) {
        try {
          console.log(`Assigning role ${role} to user ${userId}`); // Debugging
          await supabase.from("profiles").update({ role }).eq("id", userId);
        } catch (dbError) {
          console.error("Error updating user profile:", dbError);
        }
        
      } else if (role ){
        console.warn("Invalid role provided:", role); // Log invalid roles
      }

      redirectTo.searchParams.delete('next')
      return NextResponse.redirect(redirectTo)
    }else {
      console.error("OTP verification error:", error);
    }
  }

  // return the user to an error page with some instructions
  redirectTo.pathname = '/error'
  return NextResponse.redirect(redirectTo)
}