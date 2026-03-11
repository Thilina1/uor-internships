"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    isLoggedIn,
    driveFolderId
}: {
    internshipId: string;
    isLoggedIn: boolean;
    driveFolderId?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [cvFile, setCvFile] = useState<File | null>(null);
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
            const { uploadFileToGoogleDrive } = await import("@/lib/google-drive/actions");
            const user = await getUser();
            if (!user) throw new Error("Not authenticated");

            // 1. Upload CV to Supabase Storage
            const fileExt = cvFile.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(filePath, cvFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('resumes')
                .getPublicUrl(filePath);

            // 2. Upload to Google Drive if driveFolderId is provided
            if (driveFolderId) {
                console.log("Found Drive Folder ID for internship:", driveFolderId);
                const formData = new FormData();
                formData.append('file', cvFile);
                const driveResult = await uploadFileToGoogleDrive(
                    formData,
                    driveFolderId,
                    `${user.name || user.id} - CV.${fileExt}`
                );
                if (driveResult.success) {
                    console.log("Successfully mirrored CV to Google Drive:", driveResult.fileId);
                } else {
                    console.error("Mirror to Google Drive Failed:", driveResult.error);
                    // We don't throw here to avoid blocking the main application if Drive fails
                    // but we could notify the user or log it for admin review.
                }
            } else {
                console.log("No specific Google Drive folder ID found for this internship. Skipping Mirror.");
            }

            // 3. Insert application record
            const { error: applyError } = await supabase
                .from("applications")
                .insert({
                    internship_id: internshipId,
                    student_id: user.id,
                    status: "pending",
                    cv_url: publicUrl,
                });

            if (applyError) throw applyError;

            setIsOpen(false);
            router.refresh();
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
                className="w-full h-16 text-xl bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl shadow-primary/20 font-black"
            >
                Log in to Apply
            </Button>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full h-16 text-xl bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl shadow-primary/20 font-black transition-all hover:scale-[1.02] active:scale-[0.98]">
                    Apply Now
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Submit Your Application</DialogTitle>
                    <DialogDescription>
                        Please provide your CV for this internship. It will be uploaded for the employer to review.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleApply} className="space-y-6 mt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">
                            Resume / CV (PDF, DOC, DOCX) <span className="text-destructive">*</span>
                        </label>
                        <div className="relative border-2 border-dashed border-muted-foreground/20 rounded-2xl p-6 hover:bg-accent/50 hover:border-primary/50 transition-all text-center group">
                            <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground group-hover:text-primary mb-2" />
                            <p className="text-sm text-balance mb-2 font-medium">Click to select or drag and drop your CV</p>
                            <Input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCvFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                required
                            />
                            {cvFile && (
                                <div className="mt-2 text-primary font-bold text-sm bg-primary/10 py-2 rounded-lg">
                                    Selected: {cvFile.name}
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                            {error}
                        </p>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg font-bold transition-all"
                        disabled={isLoading || !cvFile}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Processing Application...
                            </>
                        ) : (
                            "Submit my Application"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
