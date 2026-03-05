"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchInput() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        const current = new URLSearchParams(Array.from(searchParams.entries()));

        if (searchTerm.trim()) {
            current.set("q", searchTerm.trim());
            current.delete("page"); // Reset page on new search
        } else {
            current.delete("q");
        }

        const search = current.toString();
        const query = search ? `?${search}` : "";

        // Push the new URL which will trigger a server-side re-render
        router.push(`/internships${query}`);
    };

    return (
        <form onSubmit={handleSearch} className="relative flex-1 flex gap-2 w-full">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    className="pl-10 h-12 rounded-full"
                    placeholder="Search by title or member..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button type="submit" className="h-12 rounded-full px-6 bg-primary text-primary-foreground hover:bg-primary/90">
                Search
            </Button>
        </form>
    );
}
