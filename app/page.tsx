import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton, Show, PricingTable } from "@clerk/nextjs";
import Link from "next/dist/client/link";

export default function Home() {
  return (
    <div className="landing-wrapper">
      <header className = "landing-header">
        <div className="landing-header-inner">
        <div className="logo-container">
          <Link  href="/"> 
          <span className="logo-text">Exec-OS</span>
          </Link>
          
          <Show when="signed-in">
        <div className="nav-actions">
          <Link href="/dashboard">
          <Button variant="outline">Dashboard</Button>
          </Link>
          <p>You are signed in!</p>
          <UserButton />
        </div>
      </Show>

          <Show when="signed-out">
        <div className="nav-actions">
          <SignInButton mode="modal">
            <Button variant="outline">Sign In</Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button>Sign Up</Button>
          </SignUpButton>
        </div>
      </Show>
        </div>

        </div>
      </header>

    <section className="section-heading">
      <h1 className="main-heading">Welcome to Exec-OS</h1>
      <h2> Simple, Transparent Pricing </h2>
        <PricingTable/>
    </section>

    </div>
  );
}

// flex flex-col items-center justify-center min-h-screen gap-4 p-4