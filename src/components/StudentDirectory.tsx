"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Mail, Phone, Briefcase, MessageSquare, Building, Calendar, FileText, Search } from "lucide-react";

export default function StudentDirectory({ students, applications, inquiries, employmentHistory = [] }: { students: any[], applications: any[], inquiries: any[], employmentHistory?: any[] }) {
    const [expandedProfileId, setExpandedProfileId] = useState<string | null>(null);
    const [filterEmployed, setFilterEmployed] = useState<string>("all"); // 'all', 'employed', 'available'
    const [searchQuery, setSearchQuery] = useState("");

    const toggleProfile = (id: string) => {
        setExpandedProfileId(expandedProfileId === id ? null : id);
    };

    // Calculate employments
    const studentsWithEmployment = students.map(student => {
        const studentApps = applications.filter(app => app.student_id === student.id);
        const studentInqs = inquiries.filter(inq => inq.student_id === student.id);
        const studentJobs = employmentHistory.filter(job => job.student_id === student.id);
        const currentJob = studentJobs.find(job => job.is_current);

        return {
            ...student,
            studentApps,
            studentInqs,
            studentJobs,
            currentJob,
            isEmployed: !!currentJob
        };
    });

    const filteredStudents = studentsWithEmployment.filter(student => {
        const matchesFilter =
            filterEmployed === "employed" ? student.isEmployed :
            filterEmployed === "available" ? !student.isEmployed :
            true;
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q ||
            (student.name || "").toLowerCase().includes(q) ||
            (student.email || "").toLowerCase().includes(q);
        return matchesFilter && matchesSearch;
    });

    const totalStudents = students.length;
    const employedCount = studentsWithEmployment.filter(s => s.isEmployed).length;
    const availableCount = totalStudents - employedCount;

    return (
        <div className="space-y-6">
            {/* Dashboard Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-card border rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{totalStudents}</span>
                    <span className="text-muted-foreground text-sm">Total Registered</span>
                </div>
                <div className="bg-card border border-green-200 bg-green-50/50 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center dark:bg-green-950/20 dark:border-green-900">
                    <span className="text-3xl font-bold text-green-700 dark:text-green-500">{employedCount}</span>
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium">Currently Employed</span>
                </div>
                <div className="bg-card border border-blue-200 bg-blue-50/50 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center dark:bg-blue-950/20 dark:border-blue-900">
                    <span className="text-3xl font-bold text-blue-700 dark:text-blue-500">{availableCount}</span>
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">Available</span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilterEmployed("all")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterEmployed === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                >
                    All Students
                </button>
                <button
                    onClick={() => setFilterEmployed("employed")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterEmployed === 'employed' ? 'bg-green-600 text-white' : 'bg-muted hover:bg-muted/80'}`}
                >
                    Employed
                </button>
                <button
                    onClick={() => setFilterEmployed("available")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterEmployed === 'available' ? 'bg-blue-600 text-white' : 'bg-muted hover:bg-muted/80'}`}
                >
                    Available
                </button>
            </div>

            {filteredStudents.length === 0 && (
                <div className="text-center py-20 rounded-3xl border border-dashed text-muted-foreground">
                    No students match the selected filter.
                </div>
            )}

            {filteredStudents.map((student) => {
                const isExpanded = expandedProfileId === student.id;

                return (
                    <div key={student.id} className="border rounded-2xl bg-card overflow-hidden transition-all shadow-sm">
                        {/* Header Row */}
                        <div
                            className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors gap-4"
                            onClick={() => toggleProfile(student.id)}
                        >
                            <div className="flex-1">
                                <h3 className="font-bold text-lg">{student.name || "Unnamed Student"}</h3>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {student.email}</div>
                                    {student.mobile_number && (
                                        <div className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {student.mobile_number}</div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-6 justify-between w-full sm:w-auto text-sm text-foreground/80 font-medium">
                                <div className="flex gap-4 items-center">
                                    <div className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${student.isEmployed ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {student.isEmployed ? 'Employed' : 'Available'}
                                    </div>
                                </div>
                                <div className="pl-4 border-l">
                                    {isExpanded ? <ChevronUp className="w-6 h-6 text-muted-foreground" /> : <ChevronDown className="w-6 h-6 text-muted-foreground" />}
                                </div>
                            </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                            <div className="p-4 sm:p-6 border-t bg-muted/20 space-y-8 animate-in slide-in-from-top-2 duration-200">

                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Employment Details Section */}
                                    <div className="space-y-4">
                                        <h4 className="font-bold border-b pb-2 flex items-center gap-2"><Building className="w-4 h-4" /> Employment History</h4>

                                        {student.currentJob && (
                                            <div className="bg-green-50/50 border border-green-200 dark:bg-green-950/20 dark:border-green-900 p-4 rounded-xl shadow-sm relative overflow-hidden">
                                                <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-bl-lg">Current</div>
                                                <h5 className="font-bold text-green-900 dark:text-green-300 pr-12">{student.currentJob.job_role}</h5>
                                                <p className="text-green-800/80 dark:text-green-400/80 text-sm">{student.currentJob.company_name}</p>

                                                <div className="mt-3 flex items-center gap-2 text-xs text-green-700 dark:text-green-500">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    Started: {new Date(student.currentJob.start_date).toLocaleDateString()}
                                                    <span className="mx-1">•</span>
                                                    {Math.floor((new Date().getTime() - new Date(student.currentJob.start_date).getTime()) / (1000 * 3600 * 24))} Days
                                                </div>

                                                {student.currentJob.job_responsibilities && (
                                                    <div className="mt-3 pt-3 border-t border-green-200/50 dark:border-green-900/50">
                                                        <p className="text-xs text-green-800 dark:text-green-400">
                                                            <strong className="block mb-1 uppercase tracking-wider text-[10px] opacity-80">Responsibilities</strong>
                                                            {student.currentJob.job_responsibilities}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {student.studentJobs.filter((j: any) => !j.is_current).length > 0 && (
                                            <div className="space-y-3 mt-4">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Past Roles</p>
                                                {student.studentJobs.filter((j: any) => !j.is_current).map((job: any) => (
                                                    <div key={job.id} className="bg-background border p-3 rounded-xl text-sm shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h5 className="font-bold">{job.job_role}</h5>
                                                                <p className="text-muted-foreground text-xs">{job.company_name}</p>
                                                            </div>
                                                            <div className="text-right text-[10px] text-muted-foreground whitespace-nowrap">
                                                                {new Date(job.start_date).toLocaleDateString()} <br />to<br /> {new Date(job.end_date).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {student.studentJobs.length === 0 && (
                                            <p className="text-sm text-muted-foreground italic">No employment history recorded.</p>
                                        )}
                                    </div>

                                    {/* Jobs Section */}
                                    <div className="space-y-4">
                                        <h4 className="font-bold border-b pb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> Applications History</h4>
                                        {student.studentApps.length > 0 ? (
                                            <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                                {student.studentApps.map((app: any) => (
                                                    <li key={app.id} className="flex justify-between items-center bg-background border p-3 rounded-xl text-sm shadow-sm">
                                                        <span className="font-medium line-clamp-1 pr-4">{app.internships?.title || "Unknown Job"}</span>
                                                        <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider whitespace-nowrap ${app.status === 'accepted' ? 'bg-green-100 text-green-700' : app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {app.status}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">No jobs applied yet.</p>
                                        )}
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
