import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, Users, Clock, ChevronLeft, ChevronRight, FolderOpen } from "lucide-react";

import { getSession } from "@/lib/auth/session";

export default async function MemberDashboard({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
        redirect("/auth/login");
    }

    // Students can now access dashboard to manage their posts
    // if (user.role === "student") {
    //     redirect("/");
    // }

    const resolvedSearchParams = await searchParams;
    const page = typeof resolvedSearchParams?.page === "string" ? parseInt(resolvedSearchParams.page) : 1;
    const ITEMS_PER_PAGE = 20;
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const supabase = await createClient();
    // Fetch internships - admins see all, others see only their own
    let query = supabase
        .from("internships")
        .select("*", { count: "exact" });

    if (user.role !== "admin") {
        query = query.eq("company_id", user.id);
    }

    const { data: internshipsData, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

    const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1;

    // Fetch and count applications for these internships
    let internships = [];
    if (internshipsData && internshipsData.length > 0) {
        const internshipIds = internshipsData.map(i => i.id);
        const { data: applicationsData } = await supabase
            .from("applications")
            .select("internship_id")
            .in("internship_id", internshipIds);

        const appCountMap = new Map();
        applicationsData?.forEach(app => {
            appCountMap.set(app.internship_id, (appCountMap.get(app.internship_id) || 0) + 1);
        });

        internships = internshipsData.map(job => ({
            ...job,
            applications: [{ count: appCountMap.get(job.id) || 0 }]
        }));
    }

    return (
        <div className="container py-10 px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, <span className="text-primary font-medium">{user.name}</span>. Manage your internship listings and applicants.
                    </p>
                </div>
                <Link href="/dashboard/member/new">
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Post New Internship
                    </Button>
                </Link>
            </div>



            {/* Listings Section */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold">Your Internship Listings</h2>
                {internships && internships.length > 0 ? (
                    <div className="grid gap-4">
                        {internships.map((job) => (
                            <div key={job.id} className="p-6 rounded-2xl border bg-card hover:border-primary/50 transition-colors flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                                        {job.image_url ? (
                                            <img src={job.image_url} alt={job.title} className="h-full w-full object-cover" />
                                        ) : (
                                            <Briefcase className="h-6 w-6 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg">{job.title}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${job.status === 'open'
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : job.status === 'pending'
                                                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                                    : 'bg-red-100 text-red-700 border border-red-200'
                                                }`}>
                                                {job.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Posted on {new Date(job.created_at).toLocaleDateString()} &bull; {job.applications?.[0]?.count || 0} applicants
                                        </p>
                                        {job.expires_at && (
                                            <p className={`text-xs mt-1 font-medium ${new Date() > new Date(job.expires_at) ? 'text-destructive' : 'text-blue-500'}`}>
                                                {new Date() > new Date(job.expires_at) ? 'Expired on ' : 'Expires on '}
                                                {new Date(job.expires_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {job.drive_url && (
                                        <a href={job.drive_url} target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/5 text-primary">
                                                <FolderOpen className="h-4 w-4" />
                                                <span className="hidden sm:inline">View Folder</span>
                                            </Button>
                                        </a>
                                    )}
                                    <Link href={`/dashboard/member/edit/${job.id}`}>
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </Link>
                                    <Link href={`/dashboard/member/applicants?id=${job.id}`}>
                                        <Button size="sm" className="gap-2">
                                            <Users className="h-4 w-4" />
                                            Applicants
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 rounded-3xl border border-dashed flex flex-col items-center justify-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <Briefcase className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="max-w-xs mx-auto">
                            <p className="font-medium">No internships posted yet</p>
                            <p className="text-sm text-muted-foreground mt-1">Start by posting your first internship opportunity to find undergraduates.</p>
                        </div>
                        <Link href="/dashboard/member/new">
                            <Button>Post an Internship</Button>
                        </Link>
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-8 border-t pt-6">
                        <Link
                            href={`/dashboard/member?page=${Math.max(1, page - 1)}`}
                            className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                        >
                            <Button variant="outline" size="sm" disabled={page <= 1}>
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Previous
                            </Button>
                        </Link>
                        <span className="text-sm font-medium text-muted-foreground">
                            Page {page} of {totalPages}
                        </span>
                        <Link
                            href={`/dashboard/member?page=${Math.min(totalPages, page + 1)}`}
                            className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                        >
                            <Button variant="outline" size="sm" disabled={page >= totalPages}>
                                Next
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
