import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import Link from "next/link";
import { ArrowLeft, User, Mail, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/app/dashboard/member/applicants/StatusBadgeComponent";

export default async function ApplicantsPage({
    searchParams,
}: {
    searchParams: Promise<{ id: string }>;
}) {
    const { id } = await searchParams;
    const supabase = await createClient();
    const session = await getSession();
    const user = session?.user;

    if (!user) {
        redirect("/auth/login");
    }

    // Fetch internship details to verify ownership
    const { data: job } = await supabase
        .from("internships")
        .select("*")
        .eq("id", id)
        .eq("company_id", user.id)
        .single();

    if (!job) {
        redirect("/dashboard/member");
    }

    // Fetch applicants
    const { data: rawApplicants, error: applyFetchError } = await supabase
        .from("applications")
        .select("*")
        .eq("internship_id", id)
        .order("created_at", { ascending: false });

    console.log("RAW APPLICANTS:", rawApplicants);
    console.log("APPLICANTS ERROR:", applyFetchError);

    let applicants: any[] = [];

    if (rawApplicants && rawApplicants.length > 0) {
        const studentIds = Array.from(new Set(rawApplicants.map((app: any) => app.student_id)));
        const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, name")
            .in("id", studentIds);

        const profileMap = new Map(profilesData?.map((p: any) => [p.id, p]) || []);

        applicants = rawApplicants.map((app: any) => ({
            ...app,
            profiles: profileMap.get(app.student_id) || { name: "Unknown Student", id: app.student_id }
        }));
    }

    return (
        <div className="container py-10 px-4 md:px-6">
            <Link
                href="/dashboard/member"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mb-8"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>

            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight">Applicants</h1>
                <p className="text-muted-foreground mt-1">
                    Review matching undergraduates for <span className="text-foreground font-bold">{job.title}</span>
                </p>
                <div className="mt-4 p-4 bg-muted text-xs border rounded-md font-mono">
                    <p>DEBUG INFO:</p>
                    <p>rawApplicants length: {rawApplicants?.length || 0}</p>
                    <p>error: {JSON.stringify(applyFetchError)}</p>
                    <p>profile fetch returned coords?: {applicants?.length || 0}</p>
                </div>
            </div>

            <div className="space-y-6">
                {applicants && applicants.length > 0 ? (
                    <div className="grid gap-6">
                        {applicants.map((app: any) => (
                            <div key={app.id} className="p-8 rounded-3xl border bg-card shadow-sm flex flex-col justify-between gap-6">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                                            <User className="h-8 w-8" />
                                        </div>
                                        <div className="space-y-3 w-full">
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-xl">{app.profiles.name}</h3>
                                                <div className="flex flex-col text-sm text-muted-foreground space-y-1">
                                                    <p className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4" /> Student ID: {app.profiles.name.toLowerCase().replace(' ', '.')}@fot.ruh.ac.lk
                                                    </p>
                                                    <p className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" /> Applied on {new Date(app.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {app.cover_letter && (
                                                <div className="mt-4 p-4 rounded-xl bg-muted/50 border">
                                                    <h4 className="text-sm font-semibold mb-2">Cover Letter</h4>
                                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                                        {app.cover_letter}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start md:items-center gap-4 shrink-0">
                                        <StatusBadge appId={app.id} currentStatus={app.status} />
                                        {app.cv_url ? (
                                            <a href={app.cv_url} target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline" className="w-full sm:w-auto gap-2">
                                                    <ExternalLink className="h-4 w-4" /> View Resume
                                                </Button>
                                            </a>
                                        ) : (
                                            <Button variant="outline" className="w-full sm:w-auto gap-2" disabled>
                                                <ExternalLink className="h-4 w-4" /> No Resume
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 rounded-3xl border border-dashed flex flex-col items-center justify-center space-y-4">
                        <User className="h-12 w-12 text-muted-foreground" />
                        <div className="max-w-xs mx-auto">
                            <p className="font-medium text-lg">No applicants yet</p>
                            <p className="text-sm text-muted-foreground mt-1">When students apply to this internship, they will appear here.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
