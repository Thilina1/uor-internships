import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StudentDirectory from "@/components/StudentDirectory";

export default async function AdminStudentsDirectoryPage() {
    const session = await getSession();
    const user = session?.user;

    if (!user || user.role !== "admin") {
        redirect("/auth/login");
    }

    const supabase = await createClient();

    // Fetch all students
    const { data: students } = await supabase
        .from("profiles")
        .select("id, name, email, role")
        .eq("role", "student")
        .order("name", { ascending: true });

    // Fetch all employment histories
    const { data: employmentHistory } = await supabase
        .from("employment_history")
        .select("*")
        .order("start_date", { ascending: false });

    // Fetch all applications with job titles
    const { data: applicationsRaw } = await supabase
        .from("applications")
        .select("id, student_id, status, internships(title)");

    const applications = applicationsRaw?.map((app: any) => ({
        id: app.id,
        student_id: app.student_id,
        status: app.status,
        internships: app.internships
    })) || [];

    // Fetch all inquiries
    const { data: inquiries } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <div className="container py-10 px-4 md:px-6">
            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight">Student Directory</h1>
                <p className="text-muted-foreground mt-1">
                    View detailed profiles, job applications, and inquiries for all registered students.
                </p>
            </div>

            <StudentDirectory
                students={students || []}
                applications={applications}
                inquiries={inquiries || []}
                employmentHistory={employmentHistory || []}
            />
        </div>
    );
}
