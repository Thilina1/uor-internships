import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import EmploymentHistoryForm from "./EmploymentHistoryForm";

export default async function StudentProfilePage() {
    const session = await getSession();
    const user = session?.user;

    if (!user || user.role !== "student") {
        redirect("/auth/login");
    }

    const supabase = await createClient();

    // Fetch full profile to get mobile_number
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (!profile) {
        redirect("/auth/login");
    }

    const { data: employmentHistory } = await supabase
        .from("employment_history")
        .select("*")
        .eq("student_id", user.id)
        .order("start_date", { ascending: false });

    return (
        <div className="container max-w-2xl py-10 px-4 md:px-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
                <p className="text-muted-foreground mt-1">
                    Update your personal details which will be visible to lecturers and admins.
                </p>
            </div>

            <div className="bg-card border rounded-2xl p-6 shadow-sm">
                <ProfileForm profile={profile} />
            </div>

            <EmploymentHistoryForm employmentHistory={employmentHistory || []} />
        </div>
    );
}
