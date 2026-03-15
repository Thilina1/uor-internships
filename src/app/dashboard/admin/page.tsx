"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, X, Briefcase, Clock, Building2, Users, MessageSquare } from "lucide-react";
import { getUser } from "@/lib/auth/actions";
import Link from "next/link";

export default function AdminDashboard() {
    const [pendingPosts, setPendingPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            const user = await getUser();
            if (!user || user.role !== "admin") {
                router.push("/auth/login");
                return;
            }
            fetchPendingPosts();
        };

        checkAuthAndFetch();
    }, []);


    const fetchPendingPosts = async () => {
        setIsLoading(true);
        try {
            // Fetch internships first
            const { data: internships, error: internshipsError } = await supabase
                .from("internships")
                .select("*")
                .eq("status", "pending")
                .order("created_at", { ascending: false });

            if (internshipsError) throw internshipsError;

            if (internships && internships.length > 0) {
                // Fetch profiles for these internships manually
                const userIds = Array.from(new Set(internships.map(i => i.company_id)));
                const { data: profiles, error: profilesError } = await supabase
                    .from("profiles")
                    .select("id, name, email")
                    .in("id", userIds);

                if (profilesError) throw profilesError;

                // Map profiles to internships
                const profileMap = new Map(profiles?.map(p => [p.id, p]));
                const combinedData = internships.map(i => ({
                    ...i,
                    profiles: profileMap.get(i.company_id)
                }));

                setPendingPosts(combinedData);
            } else {
                setPendingPosts([]);
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch pending posts");
        } finally {
            setIsLoading(false);
        }
    };

    const handleModerate = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from("internships")
                .update({ status: newStatus })
                .eq("id", id);

            if (error) throw error;

            // Update local state
            setPendingPosts(pendingPosts.filter(post => post.id !== id));
        } catch (err: any) {
            console.error("Moderation Error:", err);
            alert("Failed to update post status");
        }
    };

    if (isLoading) {
        return (
            <div className="container py-20 text-center">
                <p className="text-muted-foreground animate-pulse">Loading moderation queue...</p>
            </div>
        );
    }

    return (
        <div className="container py-10 px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Moderation</h1>
                    <p className="text-muted-foreground mt-1">
                        Review and approve internship posts from students and partners.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/admin/inquiries">
                        <Button variant="outline" className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" /> Inquiries
                        </Button>
                    </Link>
                    <Link href="/dashboard/admin/students">
                        <Button variant="outline" className="flex items-center gap-2">
                            <Users className="h-4 w-4" /> Student Directory
                        </Button>
                    </Link>
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold">
                        {pendingPosts.length} Pending
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-xl mb-8">
                    {error}
                </div>
            )}

            <div className="grid gap-6">
                {pendingPosts.length > 0 ? (
                    pendingPosts.map((post) => (
                        <div key={post.id} className="p-6 rounded-2xl border bg-card shadow-sm hover:border-primary/50 transition-all group overflow-hidden relative">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Left Info */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold group-hover:text-primary transition-colors">
                                                {post.title}
                                            </h2>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                                <Building2 className="h-4 w-4" />
                                                <span>Posted by {post.profiles?.name || "Unknown User"}</span>
                                                <span className="hidden md:inline">&bull;</span>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm line-clamp-3 text-foreground/80 leading-relaxed">
                                            {post.description}
                                        </p>
                                        {post.requirements && (
                                            <div className="pt-2">
                                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Requirements</span>
                                                <p className="text-xs text-foreground/70 mt-1 line-clamp-2">
                                                    {post.requirements}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Actions */}
                                <div className="flex md:flex-col gap-3 justify-center md:border-l md:pl-6">
                                    <Button
                                        onClick={() => handleModerate(post.id, "open")}
                                        className="w-32 h-10 bg-green-600 hover:bg-green-700 text-white font-bold"
                                    >
                                        <Check className="h-4 w-4 mr-2" /> Approve
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleModerate(post.id, "rejected")}
                                        className="w-32 h-10 border-destructive text-destructive hover:bg-destructive hover:text-white font-bold"
                                    >
                                        <X className="h-4 w-4 mr-2" /> Reject
                                    </Button>
                                    <Link href={`/internships/${post.id}`}>
                                        <Button variant="ghost" className="w-32 h-10 border border-input">
                                            Preview
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-32 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center space-y-4">
                        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                            <Check className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl font-bold">All caught up!</p>
                            <p className="text-muted-foreground">There are no pending posts to review at the moment.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
