"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/lib/auth/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successLink, setSuccessLink] = useState("");
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const formData = new FormData(e.target as HTMLFormElement);
            const userEmail = formData.get("email") as string;
            const res = await forgotPassword(userEmail);

            if (res.error) {
                setError(res.error);
            } else if (res.simulatedLink) {
                setSuccessLink(res.simulatedLink);
            } else {
                // Generic success message to prevent email enumeration
                setSuccessLink("If an account exists with that email, a reset link has been generated.");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}${successLink}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

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
                        Reset Password
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email address and we will send you a link to reset your password.
                    </p>
                </div>

                {successLink ? (
                    <div className="space-y-4">
                        <Alert className="bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-50 border-green-200 dark:border-green-900/50">
                            <AlertDescription>
                                Password reset link generated successfully!
                            </AlertDescription>
                        </Alert>

                        <div className="p-4 bg-muted rounded-lg border flex flex-col gap-3">
                            <p className="text-sm font-medium">Simulated Email Received:</p>
                            <p className="text-xs text-muted-foreground break-all">
                                {window.location.origin}{successLink}
                            </p>
                            <div className="flex gap-2 w-full mt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 flex gap-2"
                                    onClick={handleCopy}
                                >
                                    <Copy className="h-4 w-4" />
                                    {copied ? "Copied!" : "Copy Link"}
                                </Button>
                                <Link href={successLink} className="flex-1">
                                    <Button size="sm" className="w-full">
                                        Open Link
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                {error && (
                                    <p className="text-sm text-destructive font-medium">
                                        {error}
                                    </p>
                                )}

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "Sending link..." : "Send Reset Link"}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="text-center text-sm">
                    Remember your password?{" "}
                    <Link href="/auth/login" className="text-primary hover:underline font-medium">
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    );
}
