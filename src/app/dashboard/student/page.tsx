import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase, Clock, CheckCircle, XCircle, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

import { getSession } from "@/lib/auth/session";

export default async function StudentDashboard() {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
        redirect("/auth/login");
    }

    if (user.role !== "student") {
        redirect("/");
    }

    const supabase = await createClient();

    // 1. Fetch student's applications
    const { data: applicationsRaw } = await supabase
        .from("applications")
        .select(`
            *,
            internships (
                id,
                title,
                image_url,
                company_id
            )
        `)
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

    const { data: savedJobsRaw } = await supabase
        .from("saved_jobs")
        .select(`
            *,
            internships (
                id,
                title,
                image_url,
                company_id
            )
        `)
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

    // Since join is failing due to missing FK, fetch profiles manually for all relevant company IDs
    const allCompanyIds = new Set<string>();
    applicationsRaw?.forEach((app: any) => { if (app.internships?.company_id) allCompanyIds.add(app.internships.company_id); });
    savedJobsRaw?.forEach((job: any) => { if (job.internships?.company_id) allCompanyIds.add(job.internships.company_id); });

    let profileMap = new Map();
    if (allCompanyIds.size > 0) {
        const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, name")
            .in("id", Array.from(allCompanyIds));
        profileMap = new Map(profilesData?.map((p: any) => [p.id, p]) || []);
    }

    // Combine data
    const applications = applicationsRaw?.map((app: any) => ({
        ...app,
        internships: {
            ...app.internships,
            profiles: profileMap.get(app.internships?.company_id) || null
        }
    })) || [];

    const savedJobs = savedJobsRaw?.map((job: any) => ({
        ...job,
        internships: {
            ...job.internships,
            profiles: profileMap.get(job.internships?.company_id) || null
        }
    })) || [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "accepted": return "text-green-500 bg-green-500/10";
            case "rejected": return "text-destructive bg-destructive/10";
            default: return "text-blue-500 bg-blue-500/10";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "accepted": return <CheckCircle className="h-4 w-4" />;
            case "rejected": return <XCircle className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    return (
        <div className="container py-10 px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, <span className="text-primary font-medium">{user.name}</span>. Track your applications and find new opportunities.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/student/inquiries">
                        <Button variant="outline"><MessageSquare className="h-4 w-4 mr-2" /> My Inquiries</Button>
                    </Link>
                    <Link href="/dashboard/student/profile">
                        <Button><User className="h-4 w-4 mr-2" /> Edit Profile</Button>
                    </Link>
                </div>
            </div>

            <div className="space-y-12">
                {/* Applications Section */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold">Your Applications</h2>
                    {applications && applications.length > 0 ? (
                        <div className="grid gap-4">
                            {applications.map((app: any) => (
                                <div key={app.id} className="p-6 rounded-2xl border bg-card/50 hover:bg-card hover:border-primary/30 transition-all flex flex-col md:flex-row md:items-center justify-between shadow-sm gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 border">
                                            {app.internships.image_url ? (
                                                <img src={app.internships.image_url} alt={app.internships.title} className="h-full w-full object-cover" />
                                            ) : (
                                                <Briefcase className="h-6 w-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{app.internships.title}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {app.internships.profiles?.name} &bull; Applied on {new Date(app.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 justify-between md:justify-end">
                                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(app.status)}`}>
                                            {getStatusIcon(app.status)}
                                            {app.status}
                                        </div>
                                        <Link href={`/internships/${app.internships.id}`}>
                                            <Button variant="secondary" size="sm">View Post</Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 rounded-3xl border border-dashed flex flex-col items-center justify-center space-y-4">
                            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center cursor-default">
                                <Clock className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="max-w-xs mx-auto">
                                <p className="font-medium">No applications yet</p>
                                <p className="text-sm text-muted-foreground mt-1">Ready to start your career? Browse internships and submit your first application!</p>
                            </div>
                        </div>
                    )}
                </section>

                {/* Saved Jobs Section */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold">Saved Job Posts</h2>
                    {savedJobs && savedJobs.length > 0 ? (
                        <div className="grid gap-4">
                            {savedJobs.map((saved: any) => (
                                <div key={saved.id} className="p-6 rounded-2xl border bg-card/50 hover:bg-card hover:border-primary/30 transition-all flex flex-col md:flex-row md:items-center justify-between shadow-sm gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 border">
                                            {saved.internships.image_url ? (
                                                <img src={saved.internships.image_url} alt={saved.internships.title} className="h-full w-full object-cover" />
                                            ) : (
                                                <Briefcase className="h-6 w-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{saved.internships.title}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {saved.internships.profiles?.name} &bull; Saved on {new Date(saved.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Link href={`/internships/${saved.internships.id}`}>
                                            <Button variant="secondary" size="sm">View Details</Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 rounded-3xl border border-dashed flex flex-col items-center justify-center space-y-4">
                            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center cursor-default">
                                <Briefcase className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="max-w-xs mx-auto">
                                <p className="font-medium">No saved jobs yet</p>
                                <p className="text-sm text-muted-foreground mt-1">Found an interesting position but not ready to apply? Save it for later!</p>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
