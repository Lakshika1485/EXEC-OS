import { auth, currentUser } from "@clerk/nextjs/server";
import {redirect} from "next/navigation";
import Link from "next/dist/client/link";
import { HomeIcon, MailIcon, SettingsIcon, ZapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserButton } from "@clerk/nextjs";
import { getOrCreateUser } from "@/db/queries";


export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) { 
    // check if user is authenticated, 
    const { userId, has } = await auth();
    if (!userId) {
        redirect("/sign-in");
    }
    const clerkUser = await currentUser();
    // if not redirect to login page
    const email = clerkUser?.emailAddresses[0].emailAddress ?? "";
    const name = clerkUser?.fullName ?? "";
    
    const user = await getOrCreateUser(userId, email, name);

    const isPaidUser = has({plan: "pro_plan"});
    // if authenticated, render the children

    const navItems= [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: HomeIcon
        },
        {
            label: "Monitoring",
            href: "/monitoring",
            icon: MailIcon
        },
        {
            label: "Settings",
            href: "/settings",
            icon: SettingsIcon
        }

    ];

    return (
        <div className="layout-wrapper">
            <aside className="sidebar-container">
                <div className="sidebar-inner">
                    <div className="logo-container">
                        <Link href="/">
                        <span className="logo-text">
                            Exec-OS
                        </span>
                        </Link>
                         </div>
                        <nav className="sidebar-nav">
                            {navItems.map((item) => (
                                <Link key={item.href} href={item.href} >
                                    <Button variant="ghost" className="sidebar-button">
                                        <item.icon className="sidebar-icon" />
                                    
                                    <span className="sidebar-text">{item.label}</span>
                                </Button>
                                </Link>
                            ))}
                        </nav>
                   {!isPaidUser && (
                    <div className="sidebar-section">
                        <div className="upgrade-card">
                            <div className="upgrade-card-header">
                                <ZapIcon className="sidebar-icon" />
                                <span className="font-semibold">Upgrade to Pro</span>
                            </div>
                            <p className="upgrade-card-description">
                                Unlock advanced features and Ai 
                            </p>
                            <Button variant="secondary" className="w-full" asChild>
                                <Link href="/pricing">
                                    Upgrade Now
                            </Link>
                            </Button>
                        </div>
                    </div>
                )}

                <div className="sidebar-section">
                    <div className= "user-profile">
                        <UserButton />
                        {isPaidUser && <Badge>Pro</Badge>}                  
                     </div>
                </div>
                </div>
            </aside>
            <main className="main-content">
               <div className="main-content-inner">{children}
                </div> 
            </main>
            
        </div>
    );
}
