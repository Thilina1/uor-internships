import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import InquiryForm from "./InquiryForm";
import { MessageSquare, Clock, CheckCircle } from "lucide-react";

export default async function StudentInquiriesPage() {
    const session = await getSession();
    const user = session?.user;

    if (!user || user.role !== "student") {
        redirect("/auth/login");
    }

    const supabase = await createClient();

    const { data: inquiries } = await supabase
        .from("inquiries")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="container py-10 px-4 md:px-6">
            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight">My Inquiries</h1>
                <p className="text-muted-foreground mt-1">
                    Reach out to the administration with any questions or concerns you have.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <div className="bg-card border rounded-2xl p-6 shadow-sm sticky top-24">
                        <h2 className="text-xl font-bold mb-4">New Inquiry</h2>
                        <InquiryForm />
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold">Past Inquiries</h2>

                    {inquiries && inquiries.length > 0 ? (
                        <div className="space-y-4">
                            {inquiries.map((inq: any) => (
                                <div key={inq.id} className="p-6 rounded-2xl border bg-card shadow-sm flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg">{inq.subject}</h3>
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${inq.status === 'resolved' ? 'bg-green-500/10 text-green-700' : 'bg-amber-500/10 text-amber-700'}`}>
                                            {inq.status === 'resolved' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                            {inq.status}
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground text-sm whitespace-pre-wrap">{inq.message}</p>
                                    <div className="text-xs text-muted-foreground pt-3 border-t mt-2">
                                        Submitted on {new Date(inq.created_at).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 rounded-3xl border border-dashed flex flex-col items-center justify-center space-y-4">
                            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                <MessageSquare className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="font-medium">No inquiries yet</p>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                If you have any questions, feel free to submit a new inquiry using the form.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
