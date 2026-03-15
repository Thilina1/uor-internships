"use client";

import { useState } from "react";
import { updateMemberProfile, changeMemberPassword } from "@/lib/member/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Save, KeyRound } from "lucide-react";

export default function MemberProfileForm({ profile }: { profile: any }) {
    const [name, setName] = useState(profile.name || "");
    const [mobile, setMobile] = useState(profile.mobile_number || "");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const result = await updateMemberProfile({ name, mobile_number: mobile });

        if (result.error) {
            setMessage({ type: "error", text: result.error });
        } else {
            setMessage({ type: "success", text: "Profile updated successfully!" });
            router.refresh();
        }

        setIsLoading(false);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage(null);

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: "error", text: "New passwords do not match." });
            return;
        }
        if (newPassword.length < 6) {
            setPasswordMessage({ type: "error", text: "New password must be at least 6 characters." });
            return;
        }

        setIsChangingPassword(true);
        const result = await changeMemberPassword({ oldPassword, newPassword });

        if (result.error) {
            setPasswordMessage({ type: "error", text: result.error });
        } else {
            setPasswordMessage({ type: "success", text: "Password changed successfully!" });
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }

        setIsChangingPassword(false);
    };

    return (
        <div className="space-y-10">
            {/* Profile Info Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {message && (
                    <div className={`p-4 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-500/10 text-green-700" : "bg-destructive/10 text-destructive"}`}>
                        {message.text}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={profile.email} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">Email addresses cannot be changed.</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="John Doe"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                        id="mobile"
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="e.g. +94 77 123 4567"
                    />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? "Saving..." : <><Save className="h-4 w-4 mr-2" />Save Changes</>}
                </Button>
            </form>

            <br />
            {/* Divider */}
            <div className="border-t pt-4" />

            {/* Change Password Form */}
            <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <KeyRound className="h-5 w-5" /> Change Password
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Enter your current password to set a new one.</p>
                </div>

                {passwordMessage && (
                    <div className={`p-4 rounded-xl text-sm font-medium ${passwordMessage.type === "success" ? "bg-green-500/10 text-green-700" : "bg-destructive/10 text-destructive"}`}>
                        {passwordMessage.text}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="old-password">Current Password</Label>
                    <Input
                        id="old-password"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />
                </div>

                <Button type="submit" disabled={isChangingPassword} variant="outline" className="w-full sm:w-auto">
                    {isChangingPassword ? "Updating..." : <><KeyRound className="h-4 w-4 mr-2" />Update Password</>}
                </Button>
            </form>
        </div>
    );
}
