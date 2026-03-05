"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Upload, Image as ImageIcon, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { getUser } from "@/lib/auth/actions";

export default function EditInternshipPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [requirements, setRequirements] = useState("");
    const [externalUrl, setExternalUrl] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [jobType, setJobType] = useState("");
    const [experienceLevel, setExperienceLevel] = useState("");
    const [educationSkills, setEducationSkills] = useState("");
    const [summary, setSummary] = useState("");

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchInternship = async () => {
            try {
                const user = await getUser();
                if (!user) {
                    router.push("/auth/login");
                    return;
                }

                const { data, error } = await supabase
                    .from("internships")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (error) throw error;
                if (!data) throw new Error("Internship not found");

                // Check permissions
                if (user.role !== "admin" && data.company_id !== user.id) {
                    throw new Error("You don't have permission to edit this internship");
                }

                setTitle(data.title);
                setDescription(data.description);
                setRequirements(data.requirements || "");
                setExternalUrl(data.external_url || "");
                setCurrentImageUrl(data.image_url);
                setImagePreview(data.image_url);
                setJobType(data.job_type || "Internship");
                setExperienceLevel(data.experience_level || "Internship / Entry Level");
                setEducationSkills(data.education_skills || "");
                setSummary(data.summary || "");
                if (data.expires_at) {
                    setExpiresAt(new Date(data.expires_at).toISOString().split("T")[0]);
                }
            } catch (err: any) {
                setError(err.message || "Failed to fetch internship");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInternship();
    }, [id, router, supabase]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        setCurrentImageUrl(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const user = await getUser();
            if (!user) throw new Error("Not authenticated");

            let imageUrl = currentImageUrl;

            // 1. Upload new image if provided
            if (image) {
                const fileExt = image.name.split('.').pop();
                const fileName = `${user.id}-${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('internships')
                    .upload(filePath, image);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('internships')
                    .getPublicUrl(filePath);

                imageUrl = publicUrl;
            }

            // 2. Build update object
            const updateData: any = {
                title,
                description,
                requirements,
                image_url: imageUrl,
                expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
                job_type: jobType,
                experience_level: experienceLevel,
                education_skills: educationSkills,
                summary: summary,
            };

            // Only include external_url if we want to support it
            // This won't fix the "missing column" error if Supabase expects it based on cached schema,
            // but it prevents sending 'null' if the user hasn't run the SQL yet and the column might be missing.
            if (externalUrl) {
                updateData.external_url = externalUrl;
            }

            const { error: updateError } = await supabase
                .from("internships")
                .update(updateData)
                .eq("id", id);

            if (updateError) throw updateError;

            router.push("/dashboard/member");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Failed to update internship");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container py-20 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container py-10 px-4 md:px-6 max-w-3xl">
            <Link
                href="/dashboard/member"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mb-6"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>

            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight">Edit Internship</h1>
                <p className="text-muted-foreground mt-1">
                    Update the details of this internship opportunity.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-card p-8 rounded-3xl border shadow-sm">
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <label htmlFor="title" className="text-sm font-semibold">
                            Internship Title
                        </label>
                        <Input
                            id="title"
                            placeholder="e.g. Software Engineering Intern"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="description" className="text-sm font-semibold">
                            Description
                        </label>
                        <textarea
                            id="description"
                            rows={5}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Describe the role, responsibilities, and learning outcomes..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="requirements" className="text-sm font-semibold">
                            Requirements (Optional)
                        </label>
                        <textarea
                            id="requirements"
                            rows={3}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="e.g. Knowledge of React, Java, or SQL..."
                            value={requirements}
                            onChange={(e) => setRequirements(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="externalUrl" className="text-sm font-semibold">
                            Original Post URL (Optional)
                        </label>
                        <Input
                            id="externalUrl"
                            type="url"
                            placeholder="e.g. https://www.linkedin.com/jobs/view/12345"
                            value={externalUrl}
                            onChange={(e) => setExternalUrl(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="jobType" className="text-sm font-semibold">
                                Job Type
                            </label>
                            <select
                                id="jobType"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={jobType}
                                onChange={(e) => setJobType(e.target.value)}
                            >
                                <option value="Internship">Internship</option>
                                <option value="Full Time">Full Time</option>
                                <option value="Part Time">Part Time</option>
                                <option value="Contract">Contract</option>
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="experienceLevel" className="text-sm font-semibold">
                                Experience Level
                            </label>
                            <Input
                                id="experienceLevel"
                                placeholder="e.g. Internship / Entry Level"
                                value={experienceLevel}
                                onChange={(e) => setExperienceLevel(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="summary" className="text-sm font-semibold">
                            Summary (Short)
                        </label>
                        <Input
                            id="summary"
                            placeholder="Briefly summarize the role in one sentence..."
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="educationSkills" className="text-sm font-semibold">
                            Education/Skills
                        </label>
                        <textarea
                            id="educationSkills"
                            rows={2}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="e.g. Undergraduate in IT/CS, Knowledge of Java..."
                            value={educationSkills}
                            onChange={(e) => setEducationSkills(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="expiresAt" className="text-sm font-semibold">
                            Expiration Date (Optional)
                        </label>
                        <Input
                            id="expiresAt"
                            type="date"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-semibold">Cover Image</label>
                        <div className="flex items-center gap-4">
                            {imagePreview ? (
                                <div className="relative h-32 w-full rounded-2xl overflow-hidden border">
                                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-1 bg-background/80 backdrop-blur-sm rounded-full border shadow-sm hover:bg-destructive hover:text-white transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/20 rounded-2xl cursor-pointer hover:bg-accent/50 hover:border-primary/50 transition-all group">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                        <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary mb-2" />
                                        <p className="text-sm text-muted-foreground group-hover:text-foreground">
                                            Click to upload cover image
                                        </p>
                                        <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG or JPEG (Max 5MB)</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg flex items-center gap-2">
                        <span className="font-bold">Error:</span> {error}
                    </p>
                )}

                <Button type="submit" className="w-full py-6 text-lg font-bold" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </form>
        </div>
    );
}
