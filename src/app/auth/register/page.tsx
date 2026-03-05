"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

function RegisterForm() {
    const searchParams = useSearchParams();
    const defaultRole = searchParams.get("role") || "student";
    const [role, setRole] = useState(defaultRole);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const supabase = createClient();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { registerUser } = await import("@/lib/auth/actions");
            const result = await registerUser({
                email,
                password,
                name,
                role,
            });

            if (result.error) throw new Error(result.error);

            if (result.role === "alumni" || result.role === "lecturer" || result.role === "external") {
                router.push("/dashboard/member");
            } else {
                router.push("/internships");
            }
        } catch (err: any) {
            setError(err.message || "Failed to create account");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid gap-6">
            <form onSubmit={handleRegister}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <label htmlFor="name" className="text-sm font-medium">
                            {role === "student" ? "Full Name" : "Name / Organization"}
                        </label>
                        <Input
                            id="name"
                            placeholder={role === "student" ? "John Doe" : "Full Name or Organization"}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            type="text"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email
                        </label>
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="password" className="text-sm font-medium">
                            Password
                        </label>
                        <Input
                            id="password"
                            placeholder="••••••••"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="role" className="text-sm font-medium">
                            Account Type
                        </label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="student">Student</option>
                            <option value="alumni">Alumnus</option>
                            <option value="lecturer">Lecturer</option>
                            <option value="external">External Partner / Company</option>
                        </select>
                    </div>

                    {error && (
                        <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                            {error}
                        </p>
                    )}

                    <Button className="w-full mt-4" disabled={isLoading}>
                        {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <div className="relative flex min-h-[calc(100vh-64px)] w-screen flex-col items-center justify-center py-10">
            <div className="absolute inset-0 z-0">
                <img
                    src="/login.webp"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-background/50 dark:bg-background/80 backdrop-blur-[2px]" />
            </div>

            <Link
                href="/"
                className="absolute z-10 left-4 top-6 md:left-8 md:top-8 text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-primary transition-colors flex items-center gap-1 bg-background/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-border/50 shadow-sm"
            >
                <span>&larr;</span> Back to Home
            </Link>

            <div className="relative z-10 mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] p-8 rounded-2xl border bg-card/95 backdrop-blur-sm shadow-xl shadow-primary/10">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Create an account
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your details below to create your account
                    </p>
                </div>

                <Suspense fallback={<div className="text-center text-sm py-8">Loading form...</div>}>
                    <RegisterForm />
                </Suspense>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                            Already have an account?
                        </span>
                    </div>
                </div>

                <Link href="/auth/login" className="w-full">
                    <Button variant="outline" className="w-full">
                        Sign In
                    </Button>
                </Link>
            </div>
        </div>
    );
}
