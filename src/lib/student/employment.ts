"use server";

import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function startEmployment(formData: {
    internship_id?: string;
    company_name: string;
    job_role: string;
    job_responsibilities?: string;
    start_date: string;
}) {
    const session = await getSession();
    if (!session?.user || session.user.role !== "student") {
        return { error: "Only authenticated students can start employment." };
    }

    const supabase = await createClient();
    const studentId = session.user.id;

    // Verify student doesn't already have an active job
    const { data: activeJobs } = await supabase
        .from("employment_history")
        .select("id")
        .eq("student_id", studentId)
        .eq("is_current", true);

    if (activeJobs && activeJobs.length > 0) {
        return { error: "You already have an active job. Please end it before starting a new one." };
    }

    const { error } = await supabase
        .from("employment_history")
        .insert({
            student_id: studentId,
            internship_id: formData.internship_id || null,
            company_name: formData.company_name,
            job_role: formData.job_role,
            job_responsibilities: formData.job_responsibilities || null,
            start_date: formData.start_date,
            is_current: true,
            end_date: null
        });

    if (error) {
        console.error("Error starting employment:", error);
        return { error: error.message };
    }

    revalidatePath("/dashboard/student");
    revalidatePath("/dashboard/student/profile");
    return { success: true };
}

export async function endEmployment(employmentHistoryId: string, endDate: string) {
    const session = await getSession();
    if (!session?.user || session.user.role !== "student") {
        return { error: "Not authenticated as a student" };
    }

    const supabase = await createClient();

    // Verify ownership
    const { data: record, error: fetchErr } = await supabase
        .from("employment_history")
        .select("student_id")
        .eq("id", employmentHistoryId)
        .single();

    if (fetchErr || !record || record.student_id !== session.user.id) {
        return { error: "Employment record not found or unauthorized." };
    }

    const { error } = await supabase
        .from("employment_history")
        .update({
            is_current: false,
            end_date: endDate
        })
        .eq("id", employmentHistoryId);

    if (error) {
        console.error("Error ending employment:", error);
        return { error: error.message };
    }

    revalidatePath("/dashboard/student");
    revalidatePath("/dashboard/student/profile");
    return { success: true };
}
