"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, UploadCloud } from "lucide-react";

export function ApplyButton({
    internshipId,
    isLoggedIn
}: {
    internshipId: string;
    isLoggedIn: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [coverLetter, setCoverLetter] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isLoggedIn) {
            router.push("/auth/login");
            return;
        }

        if (!cvFile) {
            setError("Please upload your CV before applying.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { getUser } = await import("@/lib/auth/actions");
            const user = await getUser();
            if (!user) throw new Error("Not authenticated");

            // 1. Upload CV
            const fileExt = cvFile.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(filePath, cvFile);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('resumes')
                .getPublicUrl(filePath);

            // 2. Insert application record
            const { error: applyError } = await supabase
                .from("applications")
                .insert({
                    internship_id: internshipId,
                    student_id: user.id,
                    status: "pending",
                    cv_url: publicUrl,
                    cover_letter: coverLetter,
                });

            if (applyError) throw applyError;

            setIsOpen(false);
            router.refresh(); // Refresh page to show "Already Applied"
        } catch (err: any) {
            setError(err.message || "Failed to apply");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <Button
                onClick={() => router.push("/auth/login")}
                className="w-full py-6 text-lg font-bold"
            >
                Log in to Apply
            </Button>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full py-6 text-lg font-bold">
                    Apply Now
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Submit Your Application</DialogTitle>
                    <DialogDescription>
                        Please provide your CV and a brief cover letter for this internship.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleApply} className="space-y-6 mt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">
                            Resume / CV (PDF, DOC, DOCX) <span className="text-destructive">*</span>
                        </label>
                        <div className="flex items-center gap-4">
                            <Input
                                type="file"
                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCvFile(e.target.files?.[0] || null)}
                                className="cursor-pointer file:text-primary file:font-semibold flex-1"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Cover Letter</label>
                        <Textarea
                            placeholder="Why are you a good fit for this role?"
                            rows={5}
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                            {error}
                        </p>
                    )}

                    <Button
                        type="submit"
                        className="w-full font-bold"
                        disabled={isLoading || !cvFile}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Application"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
