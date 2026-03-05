"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Bookmark } from "lucide-react";

export function SaveJobButton({
    internshipId,
    initialIsSaved,
    isLoggedIn
}: {
    internshipId: string;
    initialIsSaved: boolean;
    isLoggedIn: boolean;
}) {
    const [isSaved, setIsSaved] = useState(initialIsSaved);
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const handleSaveToggle = async () => {
        if (!isLoggedIn) {
            window.location.href = "/auth/login";
            return;
        }

        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Since this uses custom auth, auth.getUser might fail or return nothing if relying on cookies exclusively in client
                // Let's rely on server-side session checks for the real user ID or handle it via an API route.
                // For simplicity in this structure we will use a server action or API route.

                // Falling back to a standard fetch to our custom session if needed:
                const res = await fetch('/api/auth/session');
                const sessionStr = await res.json();

                if (!sessionStr.user) throw new Error("Not logged in");

                const currentUser = sessionStr.user;

                if (isSaved) {
                    // Unsave
                    await supabase
                        .from('saved_jobs')
                        .delete()
                        .match({ student_id: currentUser.id, internship_id: internshipId });
                    setIsSaved(false);
                } else {
                    // Save
                    await supabase
                        .from('saved_jobs')
                        .insert({ student_id: currentUser.id, internship_id: internshipId });
                    setIsSaved(true);
                }
            }
        } catch (error) {
            console.error("Error toggling save status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant={isSaved ? "default" : "outline"}
            className={`w-full h-14 text-lg rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${!isSaved ? 'border-2 border-[#01a9e0] text-[#01a9e0] hover:bg-[#01a9e0]/10' : 'bg-[#01a9e0] hover:bg-[#008fbf] text-white shadow-lg shadow-[#01a9e0]/20'}`}
            onClick={handleSaveToggle}
            disabled={isLoading}
        >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? "JOB SAVED" : "SAVE JOB"}
        </Button>
    );
}
