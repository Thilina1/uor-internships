"use server";

import bcrypt from "bcryptjs";
import { createClient } from "@/lib/supabase/server";
import { encrypt, updateSession, deleteSession, getSession } from "./session";
import { redirect } from "next/navigation";

export async function registerUser(formData: any) {
    const supabase = await createClient();
    const { email, password, name, role } = formData;

    // Hash password before storing
    const hashedPassword = bcrypt.hashSync(password, 10);

    const { data, error } = await supabase
        .from("profiles")
        .insert({
            email,
            password_hash: hashedPassword,
            name,
            role,
        })
        .select()
        .single();

    if (error) {
        console.error("Register Error:", error);
        return { error: error.message };
    }

    await updateSession({ user: data });
    return { success: true, role: data.role };
}

export async function loginUser(email: string, password: string) {
    const supabase = await createClient();

    // 1. Get user by email
    const { data: user, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .single();

    if (userError || !user) {
        return { error: "User not found" };
    }

    // 2. Verify password using bcryptjs
    const isPasswordCorrect = bcrypt.compareSync(password, user.password_hash);

    if (!isPasswordCorrect) {
        return { error: "Invalid password" };
    }

    await updateSession({ user });
    return { success: true, role: user.role };
}

export async function logoutUser() {
    await deleteSession();
    // Use try/catch because redirect throws an error in Next.js
    try {
        redirect("/auth/login");
    } catch (e) {
        if ((e as Error).message === "NEXT_REDIRECT") throw e;
    }
}

export async function getUser() {
    const session = await getSession();
    return session?.user || null;
}

export async function forgotPassword(email: string) {
    const supabase = await createClient();

    // 1. Get user by email
    const { data: user, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

    if (userError || !user) {
        // Return success even if not found to prevent email enumeration
        return { success: true };
    }

    // 2. Generate reset token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

    // 3. Save token
    const { error: updateError } = await supabase
        .from("profiles")
        .update({
            reset_token: token,
            reset_token_expires_at: expiresAt.toISOString(),
        })
        .eq("id", user.id);

    if (updateError) {
        console.error("Forgot Password Error:", updateError);
        return { error: "Failed to process request" };
    }

    // Return the token to be displayed in UI (since we don't have email setup)
    return { success: true, simulatedLink: `/auth/reset-password?token=${token}` };
}

export async function resetPassword(token: string, password: string) {
    const supabase = await createClient();

    // 1. Find user by valid token
    const { data: user, error: userError } = await supabase
        .from("profiles")
        .select("id, reset_token_expires_at")
        .eq("reset_token", token)
        .single();

    if (userError || !user) {
        return { error: "Invalid or expired reset token" };
    }

    // 2. Check expiration
    if (new Date(user.reset_token_expires_at) < new Date()) {
        return { error: "Reset token has expired" };
    }

    // 3. Hash new password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // 4. Update user & clear token
    const { error: updateError } = await supabase
        .from("profiles")
        .update({
            password_hash: hashedPassword,
            reset_token: null,
            reset_token_expires_at: null,
        })
        .eq("id", user.id);

    if (updateError) {
        console.error("Reset Password Error:", updateError);
        return { error: "Failed to reset password" };
    }

    return { success: true };
}
