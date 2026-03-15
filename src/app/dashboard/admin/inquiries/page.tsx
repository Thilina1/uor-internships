import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MessageSquare, CheckCircle, Clock } from "lucide-react";

export default async function AdminInquiriesPage() {
    const session = await getSession();
    if (!session?.user || session.user.role !== "admin") {
        redirect("/auth/login");
    }

    const supabase = await createClient();

    // Fetch inquiries with student profile info
    const { data: inquiries } = await supabase
        .from("inquiries")
        .select(`
            *,
            profiles:student_id(name, email)
        `)
        .order("created_at", { ascending: false });

    return (
        <div className="container py-10 px-4 md:px-6">
            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight">Student Inquiries</h1>
                <p className="text-muted-foreground mt-1">
                    Review and manage questions and support tickets submitted by students.
                </p>
            </div>

            <div className="space-y-4 max-w-4xl">
                {(!inquiries || inquiries.length === 0) ? (
                    <div className="text-center py-20 rounded-3xl border border-dashed text-muted-foreground">
                        No inquiries have been submitted yet.
                    </div>
                ) : (
                    inquiries.map((inq: any) => (
                        <div key={inq.id} className="bg-card border rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{inq.subject}</h3>
                                        <p className="text-sm text-primary font-medium mt-0.5">
                                            From: {inq.profiles?.name || "Unknown Student"}
                                            <span className="text-muted-foreground font-normal ml-2">({inq.profiles?.email})</span>
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5 whitespace-nowrap ${inq.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {inq.status === 'resolved' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                        {inq.status}
                                    </span>
                                </div>

                                <div className="bg-muted/30 p-4 rounded-lg text-sm text-foreground/80 whitespace-pre-wrap border border-muted">
                                    {inq.message}
                                </div>

                                <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-2">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Submitted on {new Date(inq.created_at).toLocaleString()}
                                </div>
                            </div>

                            {/* Actions placeholder if needed later (e.g. resolve toggle) */}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
