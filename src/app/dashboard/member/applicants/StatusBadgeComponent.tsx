"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Check, X, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatusBadge({
    appId,
    currentStatus
}: {
    appId: string;
    currentStatus: string;
}) {
    const [status, setStatus] = useState(currentStatus);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const updateStatus = async (newStatus: string) => {
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from("applications")
                .update({ status: newStatus })
                .eq("id", appId);

            if (error) throw error;
            setStatus(newStatus);
            router.refresh();
        } catch (err) {
            console.error("Failed to update status", err);
        } finally {
            setIsLoading(false);
        }
    };

    const statusConfigs: Record<string, { label: string; icon: any; color: string }> = {
        pending: { label: "Pending", icon: Clock, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
        accepted: { label: "Accepted", icon: Check, color: "text-green-500 bg-green-500/10 border-green-500/20" },
        rejected: { label: "Rejected", icon: X, color: "text-destructive bg-destructive/10 border-destructive/20" },
    };

    const config = statusConfigs[status] || statusConfigs.pending;
    const Icon = config.icon;

    return (
        <div className="flex items-center gap-2">
            <div className={cn(
                "px-4 py-2 rounded-full border text-sm font-bold flex items-center gap-2 min-w-[120px] justify-center",
                config.color
            )}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                <span className="capitalize">{config.label}</span>
            </div>

            <div className="flex gap-1">
                {status !== "accepted" && (
                    <button
                        onClick={() => updateStatus("accepted")}
                        disabled={isLoading}
                        className="p-2 rounded-full hover:bg-green-500/10 text-muted-foreground hover:text-green-500 transition-colors"
                        title="Accept"
                    >
                        <Check className="h-5 w-5" />
                    </button>
                )}
                {status !== "rejected" && (
                    <button
                        onClick={() => updateStatus("rejected")}
                        disabled={isLoading}
                        className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Reject"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    );
}
