import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  
  const role = searchParams.get("role"); // Extract role


  type UserRole = "admin" | "buyer" | "seller" | null | undefined;

  const isValidRole = (role: string | null | undefined): role is UserRole => {
    return role === "admin" || role === "buyer" || role === "seller" || role === null || role === undefined;
  };
  

  if (code) {
    const supabase = await createClient()
    const {data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.session) {
      const user = data.session.user;

      if (isValidRole(role)) {
  await supabase.from("profiles").update({ role }).eq("id", user.id);
} else {
  console.error("Invalid role:", role);
}


// Determine redirect URL based on role
let redirectPath = "/";
if (role === "seller") {
  redirectPath = "/vendor-marketplace";
} else if (role === "buyer") {
  redirectPath = "/";
}

    
     
const redirectUrl = new URL(`${origin}${redirectPath}`);

      return NextResponse.redirect(redirectUrl.toString());

      
      
      
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}