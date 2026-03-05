import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, Calendar, CheckCircle, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplyButton } from "@/app/internships/[id]/ApplyButton";
import { JobImage } from "@/app/internships/[id]/JobImage";
import { SaveJobButton } from "@/app/internships/[id]/SaveJobButton";

export default async function InternshipDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch internship details
    const { data: jobRaw } = await supabase
        .from("internships")
        .select("*")
        .eq("id", id)
        .single();

    if (!jobRaw) {
        notFound();
    }

    // Fetch profile manually
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .eq("id", jobRaw.company_id)
        .single();

    const job = {
        ...jobRaw,
        profiles: profileData
    };

    // Check if user is logged in
    const session = await getSession();
    if (!session?.user) {
        redirect("/auth/login");
    }

    const user = session.user;
    let hasApplied = false;
    let hasSaved = false;
    let userRole = user?.role || "";

    if (user) {
        const { data: application } = await supabase
            .from("applications")
            .select("id")
            .eq("internship_id", id)
            .eq("student_id", user.id)
            .single();

        if (application) hasApplied = true;

        if (userRole === "student") {
            const { data: savedJob } = await supabase
                .from("saved_jobs")
                .select("id")
                .eq("internship_id", id)
                .eq("student_id", user.id)
                .single();

            if (savedJob) hasSaved = true;
        }
    }

    // Helper logic for abstract time
    const isExpired = job.expires_at && new Date() > new Date(job.expires_at);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background pb-20">
            {/* Themed Header Banner */}
            <div className="relative w-full h-[35vh] md:h-[40vh] bg-blue-50 dark:bg-zinc-950 overflow-hidden border-b border-blue-100/50 dark:border-border">
                <div className="absolute inset-0 opacity-10 dark:opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #01a9e0 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

                <Link
                    href="/internships"
                    className="absolute top-6 left-6 md:top-10 md:left-10 z-10 flex items-center justify-center w-12 h-12 bg-white/80 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 backdrop-blur-md rounded-full text-slate-900 dark:text-white border border-slate-200 dark:border-transparent transition-colors shadow-sm"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 md:px-8 -translate-y-[4vh]">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 text-slate-900 dark:text-white">{job.title}</h1>
                        <p className="text-lg md:text-2xl font-bold text-primary dark:text-primary/90">{job.profiles?.name}</p>
                    </div>
                </div>
            </div>

            {/* Main Content Floating Card container */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-[8vh] relative z-10">
                <div className="bg-white dark:bg-card rounded-[2rem] shadow-xl shadow-black/5 p-6 md:p-10">

                    {/* Header Region inside Card */}
                    <div className="mb-6">
                        {/* Title and tags for Mobile/Desktop inner */}
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 md:pt-0">
                                <div className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400">
                                    <Clock className="w-4 h-4 mr-1.5" />
                                    Posted {new Date(job.created_at).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400">
                                    <Navigation className="w-4 h-4 mr-1.5 text-primary" />
                                    {job.job_type || "Full Time / Internship"}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-border my-6"></div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {/* Left Content Area */}
                        <div className="md:col-span-2 space-y-8">

                            {/* Custom Summary Box */}
                            <div className="bg-slate-50 dark:bg-muted/50 rounded-2xl p-6 md:p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Summary</h3>
                                    {job.summary && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 italic">
                                            "{job.summary}"
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    {job.requirements && (
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Education/Skills</p>
                                            <p className="font-semibold text-slate-900 dark:text-white border-l-2 border-primary pl-3">
                                                {job.education_skills || "Based on requirements"}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Experience</p>
                                        <p className="font-semibold text-slate-900 dark:text-white border-l-2 border-primary pl-3">
                                            {job.experience_level || "Internship / Entry Level"}
                                        </p>
                                    </div>
                                    {job.expires_at && (
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Closes On</p>
                                            <p className={`font-semibold border-l-2 border-primary pl-3 ${isExpired ? "text-destructive" : "text-red-600 dark:text-red-500"}`}>
                                                {isExpired ? "Expired" : new Date(job.expires_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {job.image_url && (
                                <JobImage imageUrl={job.image_url} title={job.title} />
                            )}

                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Job Description</h3>
                                <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-base">
                                    {job.description}
                                </div>
                            </div>

                            {job.requirements && (
                                <div className="space-y-4 mt-8">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-[#81cb20]" />
                                        Requirements
                                    </h3>
                                    <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-base p-6 bg-slate-50 dark:bg-muted/30 rounded-2xl">
                                        {job.requirements}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Right Sidebar Action Area */}
                        <div className="md:col-span-1 space-y-6">

                            <div className="sticky top-24 space-y-4">
                                <div className="bg-white dark:bg-card border dark:border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                                    {(user.role === "admin" || job.company_id === user.id) && (
                                        <Link href={`/dashboard/member/edit/${job.id}`} className="w-full">
                                            <Button variant="outline" className="w-full h-12 text-md border-primary text-primary hover:bg-primary/10 rounded-xl font-bold mb-2">
                                                Edit Internship
                                            </Button>
                                        </Link>
                                    )}
                                    {job.external_url ? (
                                        <Link href={job.external_url} target="_blank" rel="noopener noreferrer" className="w-full">
                                            <Button className="w-full h-14 text-lg bg-[#01a9e0] hover:bg-[#008fbf] text-white rounded-xl shadow-lg shadow-[#01a9e0]/20 font-bold">
                                                View Original Post
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button className="w-full h-14 text-lg bg-slate-100 text-slate-400 border-none pointer-events-none rounded-xl dark:bg-muted/50 font-bold">
                                            No External Link
                                        </Button>
                                    )}
                                    <SaveJobButton
                                        internshipId={job.id}
                                        initialIsSaved={hasSaved} // True if they previously saved this job
                                        isLoggedIn={!!user}
                                    />
                                </div>

                                <div className="bg-slate-50 dark:bg-muted/30 rounded-2xl p-6 border border-slate-100 dark:border-border">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4 text-center">
                                        Share this job and help your fellow undergraduates find the perfect opportunity!
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
