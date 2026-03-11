"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { loginUser } = await import("@/lib/auth/actions");
            const result = await loginUser(email, password);

            if (result.error) throw new Error(result.error);

            if (result.role === "admin") {
                router.push("/dashboard/admin");
            } else if (result.role === "alumni" || result.role === "lecturer" || result.role === "external") {
                router.push("/dashboard/member");
            } else if (result.role === "student") {
                router.push("/internships");
            }
        } catch (err: any) {
            setError(err.message || "Failed to sign in");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-[calc(100vh-64px)] w-screen flex-col items-center justify-center py-10">
            <div className="absolute inset-0 z-0 hidden md:block">
                <img
                    src="/login.webp"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-white/40 dark:bg-zinc-950/60 backdrop-blur-[2px]" />
            </div>


            <div className="relative z-10 mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] p-8 rounded-2xl border bg-card shadow-xl shadow-primary/10">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Welcome back
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your credentials to access your account
                    </p>
                </div>

                <div className="grid gap-6">
                    <form onSubmit={handleLogin}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    placeholder="name@example.com"
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect="off"
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="text-sm font-medium">Password</label>
                                    <Link href="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    placeholder="••••••••"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {error && (
                                <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                                    {error}
                                </p>
                            )}

                            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                                {isLoading ? "Signing in..." : "Sign In"}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/register" className="text-primary hover:underline font-medium">
                            Sign up
                        </Link>
                    </div>
                </div>

                <p className="px-8 text-center text-xs text-muted-foreground">
                    By signing in, you agree to our Terms of Service.
                </p>
            </div>
        </div>
    );
}
