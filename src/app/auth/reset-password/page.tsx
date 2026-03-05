"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/auth/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing reset token.");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            setError("Invalid or missing reset token.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const formData = new FormData(e.target as HTMLFormElement);
            const newPassword = formData.get("password") as string;
            const res = await resetPassword(token, newPassword);

            if (res.error) {
                setError(res.error);
            } else {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/auth/login");
                }, 2000);
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="space-y-4 text-center">
                <Alert className="bg-green-50 text-green-900 border-green-200">
                    <AlertDescription>
                        Password reset successfully! Redirecting to login...
                    </AlertDescription>
                </Alert>
                <div className="text-sm">
                    <Link href="/auth/login" className="text-primary hover:underline font-medium">
                        Click here
                    </Link>{" "}
                    if you are not automatically redirected.
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!token}
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={!token}
                />
            </div>

            {error && (
                <p className="text-sm text-destructive font-medium">
                    {error}
                </p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || !token}>
                {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
        </form>
    );
}

export default function ResetPasswordPage() {
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
                href="/auth/login"
                className="absolute z-10 left-4 top-6 md:left-8 md:top-8 text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-primary transition-colors flex items-center gap-1 bg-background/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-border/50 shadow-sm"
            >
                <span>&larr;</span> Back to Login
            </Link>

            <div className="relative z-10 mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] p-8 rounded-2xl border bg-card/95 backdrop-blur-sm shadow-xl shadow-primary/10">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Create New Password
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter a new secure password for your account.
                    </p>
                </div>

                <Suspense fallback={<div className="text-center text-sm text-muted-foreground p-4">Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>

                <div className="text-center text-sm">
                    <Link href="/auth/login" className="text-primary hover:underline font-medium">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
