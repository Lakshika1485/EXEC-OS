import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createOAuth2Client, GoogleProvider } from "@/lib/google";
import { getUserByClerkId } from "@/db/queries"; 
import { upsertIntegration } from "@/db/queries";
import { encrypt } from "@/lib/encryption";


export async function GET(request:NextRequest) {
    
    console.log("[CALLBACK] Starting Google OAuth callback");

    // get the cookies
    const cookieStore = await cookies();
    try {
        // verify auth
        const { userId : clerkId } = await auth();
        console.log("[CALLBACK] Clerk ID:", clerkId);
        if (!clerkId) {
            return NextResponse.redirect(new URL("/sign-in", request.url));
        }

        //  parse the code from the query parameters

        const code = request.nextUrl.searchParams.get("code");
        const state =  request.nextUrl.searchParams.get("state");
        const error = request.nextUrl.searchParams.get("error");
        
        console.log("[CALLBACK] Code:", code ? "present" : "missing");
        console.log("[CALLBACK] State:", state ? "present" : "missing");
        console.log("[CALLBACK] Error:", error);

        if (error) {
            return NextResponse.redirect(new URL("/settings?error=consent_denied", request.url));
        }

        if (!code || !state) {
            return NextResponse.redirect(new URL("/settings?error=missing_params", request.url));
        }
        // validate the csrf state

        const storedState = cookieStore.get('google_oauth_state')?.value;
        console.log("[CALLBACK] Stored state:", storedState ? "present" : "missing");
        console.log("[CALLBACK] States match:", storedState === state);
        
        if (!storedState || storedState !== state) {
            return NextResponse.redirect(
                new URL('/settings?error=invalid_state', request.url)
            );
        }


        // parse the provider from the state

        const {provider} = JSON.parse(
            Buffer.from(state, 'base64url').toString() 
        ) as  { nonce :string, provider: GoogleProvider };

        console.log("[CALLBACK] Provider:", provider);
            
        // exchange the code for a token

        const oauth2Client = createOAuth2Client();
        const {tokens} = await oauth2Client.getToken(code);

        if (!tokens.access_token || !tokens.refresh_token )
        {
            return NextResponse.redirect(
                new URL("/settings?error=no_tokens", request.url));
        }


        // look up internal user

        const user = await getUserByClerkId(clerkId);
        if (!user) {
            return NextResponse.redirect(
                new URL("/settings?error=user_not_found", request.url));
        }

        // encrypt the token
        await upsertIntegration({
            userId: user.id,
            provider,
            accessToken: encrypt(tokens.access_token),
            refreshToken: encrypt(tokens.refresh_token),
            expiresAt: new Date(tokens.expiry_date ?? Date.now() + 3600 * 1000),
            scope: tokens.scope?.split(" ") ?? [],
        });
 
        // clear the state cookie
        cookieStore.delete('google_oauth_state');
        
        // redirect to settings with success
        return NextResponse.redirect(new URL("/settings?success=integration_connected", request.url));

    }catch (error) {
        console.error("Google OAuth callback error:", error);
        cookieStore.delete('google_oauth_state');
        return NextResponse.redirect(new URL("/settings?error=callback_failed", request.url));
        }
    
} 