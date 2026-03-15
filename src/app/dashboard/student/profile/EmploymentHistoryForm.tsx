"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { startEmployment, endEmployment } from "@/lib/student/employment";
import { Plus, Briefcase, Calendar, CheckSquare } from "lucide-react";

export default function EmploymentHistoryForm({ employmentHistory }: { employmentHistory: any[] }) {
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form states
    const [companyName, setCompanyName] = useState("");
    const [jobRole, setJobRole] = useState("");
    const [jobResponsibilities, setJobResponsibilities] = useState("");
    const [startDate, setStartDate] = useState("");

    const activeJob = employmentHistory.find(job => job.is_current);

    const handleAddJob = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setIsLoading(true);

        const result = await startEmployment({
            company_name: companyName,
            job_role: jobRole,
            job_responsibilities: jobResponsibilities,
            start_date: startDate
        });

        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            setMessage({ type: 'success', text: "Job added successfully!" });
            setIsAdding(false);
            setCompanyName("");
            setJobRole("");
            setJobResponsibilities("");
            setStartDate("");
        }

        setIsLoading(false);
    };

    const handleEndJob = async (id: string) => {
        const endDate = new Date().toISOString().split('T')[0]; // Current date as end date
        setIsLoading(true);
        setMessage(null);

        const result = await endEmployment(id, endDate);

        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            setMessage({ type: 'success', text: "Job marked as ended." });
        }

        setIsLoading(false);
    };

    return (
        <div className="space-y-6 max-w-2xl mt-8">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-xl font-bold">Employment Details</h2>
                    <p className="text-sm text-muted-foreground">Manage your current and past work experience manually.</p>
                </div>
                {!isAdding && !activeJob && (
                    <Button onClick={() => setIsAdding(true)} variant="outline" size="sm" className="gap-2">
                        <Plus className="w-4 h-4" /> Add Current Job
                    </Button>
                )}
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-destructive/10 text-destructive'}`}>
                    {message.text}
                </div>
            )}

            {/* Active Job Section */}
            {activeJob && !isAdding && (
                <div className="border border-primary/20 bg-primary/5 rounded-2xl p-6 relative">
                    <div className="absolute top-4 right-4">
                        <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Currently Employed</span>
                    </div>
                    <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{activeJob.job_role}</h3>
                            <p className="text-lg text-foreground/80">{activeJob.company_name}</p>
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>Started: {new Date(activeJob.start_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    {activeJob.job_responsibilities && (
                        <div className="mb-6 space-y-2">
                            <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">Responsibilities</Label>
                            <p className="text-sm border-l-2 border-primary/30 pl-4">{activeJob.job_responsibilities}</p>
                        </div>
                    )}
                    <div className="pt-4 border-t border-primary/10 flex justify-end">
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (confirm("Are you sure you want to end this job? It will be moved to your past history.")) {
                                    handleEndJob(activeJob.id);
                                }
                            }}
                            disabled={isLoading}
                        >
                            Mark Job as Ended
                        </Button>
                    </div>
                </div>
            )}

            {/* Add Job Form */}
            {isAdding && (
                <form onSubmit={handleAddJob} className="space-y-4 border rounded-2xl p-6 bg-card">
                    <h3 className="font-bold text-lg mb-4">Add Employment Details</h3>

                    <div className="grid gap-2">
                        <Label htmlFor="companyName">Company / Employer Name</Label>
                        <Input
                            id="companyName"
                            placeholder="e.g. Google, Sri Lanka Telecom..."
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="jobRole">Job Title / Role</Label>
                        <Input
                            id="jobRole"
                            placeholder="e.g. Software Engineer Intern"
                            value={jobRole}
                            onChange={(e) => setJobRole(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="jobResponsibilities">Responsibilities / Description (Optional)</Label>
                        <Textarea
                            id="jobResponsibilities"
                            placeholder="Briefly describe what you do..."
                            value={jobResponsibilities}
                            onChange={(e) => setJobResponsibilities(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                        <Button type="submit" disabled={isLoading} className="gap-2">
                            <CheckSquare className="w-4 h-4" /> Save Job Details
                        </Button>
                    </div>
                </form>
            )}

            {/* Past Jobs List */}
            {employmentHistory.filter(j => !j.is_current).length > 0 && (
                <div className="mt-10">
                    <h3 className="font-bold text-lg mb-4">Past Employment History</h3>
                    <div className="space-y-3">
                        {employmentHistory.filter(j => !j.is_current).map(job => (
                            <div key={job.id} className="p-4 border rounded-xl bg-muted/20 opacity-80 hover:opacity-100 transition-opacity">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold">{job.job_role}</h4>
                                        <p className="text-sm font-medium">{job.company_name}</p>
                                    </div>
                                    <div className="text-right text-xs text-muted-foreground">
                                        <div>{new Date(job.start_date).toLocaleDateString()} - <br />{new Date(job.end_date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
