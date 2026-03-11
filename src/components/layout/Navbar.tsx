"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { User, LogOut, LayoutDashboard, Briefcase } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

import { getUser, logoutUser } from "@/lib/auth/actions";

export function Navbar() {
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = async () => {
            const user = await getUser();
            setUser(user);
            if (user) {
                setRole(user.role);
            } else {
                setRole(null);
            }
        };
        checkAuth();
    }, [pathname]);

    const handleLogout = async () => {
        await logoutUser();
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
                        UOR Internship
                    </span>
                </Link>
                <nav className="flex items-center gap-6">
                    {user && role !== "admin" && (
                        <Link
                            href="/internships"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-1"
                        >
                            <Briefcase className="h-4 w-4" />
                            Browse
                        </Link>
                    )}

                    <div className="flex items-center gap-3">
                        {role !== "admin" && <ThemeToggle />}
                        {user ? (
                            <>
                                {role !== "admin" && (
                                    <Link href={role === "student" ? "/dashboard/student" : "/dashboard/member"}>
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            <LayoutDashboard className="h-4 w-4" />
                                            <span className="hidden sm:inline">Dashboard</span>
                                        </Button>
                                    </Link>
                                )}
                                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 text-destructive hover:bg-destructive/10">
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden sm:inline">Logout</span>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login">
                                    <Button variant="ghost" size="sm">Log in</Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button size="sm">Get Started</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}
