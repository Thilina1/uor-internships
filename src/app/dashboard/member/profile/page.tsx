import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MemberProfileForm from "./MemberProfileForm";

export default async function MemberProfilePage() {
    const session = await getSession();
    const user = session?.user;

    if (!user || user.role === "student" || user.role === "admin") {
        redirect("/auth/login");
    }

    const supabase = await createClient();

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (!profile) {
        redirect("/auth/login");
    }

    return (
        <div className="container max-w-2xl py-10 px-4 md:px-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
                <p className="text-muted-foreground mt-1">
                    Update your personal details and manage your password.
                </p>
            </div>

            <div className="bg-card border rounded-2xl p-6 shadow-sm">
                <MemberProfileForm profile={profile} />
            </div>
        </div>
    );
}
