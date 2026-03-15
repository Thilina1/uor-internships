"use client";

import { useState } from "react";
import { submitInquiry } from "@/lib/student/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";

export default function InquiryForm() {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "success" | "error", text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFeedback(null);

        const result = await submitInquiry({ subject, message });

        if (result.error) {
            setFeedback({ type: "error", text: result.error });
        } else {
            setFeedback({ type: "success", text: "Inquiry submitted successfully!" });
            setSubject("");
            setMessage("");
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {feedback && (
                <div className={`p-3 rounded-xl text-sm font-medium ${feedback.type === "success" ? "bg-green-500/10 text-green-700" : "bg-destructive/10 text-destructive"}`}>
                    {feedback.text}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    readOnly={isLoading}
                    placeholder="Brief description"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    readOnly={isLoading}
                    className="min-h-[120px]"
                    placeholder="Type your question or concern here..."
                />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Sending..." : <><Send className="h-4 w-4 mr-2" /> Submit Inquiry</>}
            </Button>
        </form>
    );
}
