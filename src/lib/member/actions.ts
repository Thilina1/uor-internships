"use server";

import bcrypt from "bcryptjs";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function updateMemberProfile(formData: { name: string; mobile_number: string }) {
    const session = await getSession();
    if (!session?.user) {
        return { error: "Not authenticated" };
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from("profiles")
        .update({
            name: formData.name,
            mobile_number: formData.mobile_number,
            updated_at: new Date().toISOString(),
        })
        .eq("id", session.user.id);

    if (error) {
        console.error("Error updating member profile:", error);
        return { error: error.message };
    }

    revalidatePath("/dashboard/member");
    revalidatePath("/dashboard/member/profile");
    return { success: true };
}

export async function changeMemberPassword(formData: { oldPassword: string; newPassword: string }) {
    const session = await getSession();
    if (!session?.user) {
        return { error: "Not authenticated" };
    }

    const supabase = await createClient();

    // 1. Fetch current password hash
    const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("password_hash")
        .eq("id", session.user.id)
        .single();

    if (fetchError || !profile) {
        return { error: "Could not fetch user data" };
    }

    // 2. Verify old password
    const isMatch = bcrypt.compareSync(formData.oldPassword, profile.password_hash);
    if (!isMatch) {
        return { error: "Old password is incorrect" };
    }

    // 3. Update with new password (Supabase trigger will hash it)
    const { error: updateError } = await supabase
        .from("profiles")
        .update({ password_hash: formData.newPassword })
        .eq("id", session.user.id);

    if (updateError) {
        console.error("Error changing member password:", updateError);
        return { error: updateError.message };
    }

    return { success: true };
}
