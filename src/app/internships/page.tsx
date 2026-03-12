import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "./SearchInput";

function truncateWords(text: string, maxWords: number) {
    if (!text) return "";
    const words = text.split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
}

export default async function InternshipsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await getSession();
    if (!session?.user) {
        redirect("/auth/login");
    }

    const resolvedSearchParams = await searchParams;
    const page = typeof resolvedSearchParams?.page === "string" ? parseInt(resolvedSearchParams.page) : 1;
    const q = typeof resolvedSearchParams?.q === "string" ? resolvedSearchParams.q : "";

    const ITEMS_PER_PAGE = 20;
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const supabase = await createClient();

    const now = new Date().toISOString();
    let query = supabase
        .from("internships")
        .select("*", { count: "exact" })
        .eq("status", "open")
        .or(`expires_at.gt.${now},expires_at.is.null`)
        .order("created_at", { ascending: false });

    if (q) {
        // Find matching profiles first to allow searching by member
        const { data: matchingProfiles } = await supabase
            .from("profiles")
            .select("id")
            .ilike("name", `%${q}%`);

        const matchingCompanyIds = matchingProfiles?.map(p => p.id) || [];

        const searchFields = `title.ilike.%${q}%,description.ilike.%${q}%,requirements.ilike.%${q}%`;

        if (matchingCompanyIds.length > 0) {
            query = query.or(`${searchFields},company_id.in.(${matchingCompanyIds.join(',')})`);
        } else {
            query = query.or(searchFields);
        }
    }

    const { data: internshipsData, count } = await query.range(from, to);

    const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1;

    // Since join is failing due to missing FK, fetch profiles manually
    let internships = [];
    if (internshipsData && internshipsData.length > 0) {
        const companyIds = Array.from(new Set(internshipsData.map(i => i.company_id)));
        const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, name, avatar_url")
            .in("id", companyIds);

        const profileMap = new Map(profilesData?.map(p => [p.id, p]) || []);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        internships = internshipsData.map(job => ({
            ...job,
            profiles: profileMap.get(job.company_id) || null,
            isNew: new Date(job.created_at) >= sevenDaysAgo
        }));
    }

    return (
        <div className="container max-w-3xl py-12 px-4 md:px-6 mx-auto">
            <div className="flex flex-col space-y-4 mb-10">
                <h1 className="text-4xl font-bold tracking-tight">Browse Internships</h1>
                <p className="text-muted-foreground text-lg">
                    Discover the latest opportunities from our industry partners for Ruhuna FOT students.
                </p>

                <div className="flex gap-2 w-full mt-4">
                    <SearchInput />
                </div>
            </div>

            <div className="flex flex-col gap-8">
                {internships && internships.length > 0 ? (
                    internships.map((job) => (
                        <div key={job.id} className="group relative flex flex-col rounded-2xl border bg-card shadow-sm overflow-hidden">
                            {/* Header: Company Info & Time */}
                            <div className="flex items-center gap-3 p-4">
                                <Link href={`/internships/${job.id}`} className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden border shrink-0">
                                    {job.image_url ? (
                                        <img src={job.image_url} alt={job.profiles?.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <Building2 className="h-6 w-6 text-muted-foreground" />
                                    )}
                                </Link>
                                <div className="flex flex-col flex-1">
                                    <h3 className="font-bold text-base leading-tight">
                                        {job.profiles?.name || "Anonymous Member"}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Posted {new Date(job.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                {job.isNew && (
                                    <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-500">
                                        New
                                    </span>
                                )}
                            </div>

                            {/* Job Title */}
                            <div className="px-4 pb-2">
                                <h4 className="font-bold text-lg">{job.title}</h4>
                            </div>

                            {/* Main Image (if any) */}
                            {job.image_url && (
                                <div className="w-full aspect-video sm:aspect-[16/9] bg-muted overflow-hidden border-y">
                                    <img src={job.image_url} alt={job.title} className="w-full h-full object-cover" />
                                </div>
                            )}

                            {/* Description (Truncated to 50 words) */}
                            <div className="px-4 py-3">
                                <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                                    {truncateWords(job.description, 50)}
                                </p>
                            </div>

                            {/* Footer: Action */}
                            <div className="px-4 pb-4 flex items-center justify-end border-t pt-4 mt-auto">
                                <Link href={`/internships/${job.id}`} className="w-full sm:w-auto">
                                    <Button className="w-full sm:w-auto font-semibold rounded-full" size="sm">
                                        View & Apply
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-32 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center space-y-4">
                        <Briefcase className="h-12 w-12 text-muted-foreground" />
                        <div className="space-y-1">
                            <p className="text-xl font-bold">No active internships found</p>
                            <p className="text-muted-foreground">Check back later for new opportunities.</p>
                        </div>
                    </div>
                )}
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-8 border-t pt-6">
                        <Link
                            href={`/internships?page=${Math.max(1, page - 1)}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                            className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                        >
                            <Button variant="outline" size="sm" disabled={page <= 1}>
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Previous
                            </Button>
                        </Link>
                        <span className="text-sm font-medium text-muted-foreground">
                            Page {page} of {totalPages}
                        </span>
                        <Link
                            href={`/internships?page=${Math.min(totalPages, page + 1)}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                            className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                        >
                            <Button variant="outline" size="sm" disabled={page >= totalPages}>
                                Next
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
