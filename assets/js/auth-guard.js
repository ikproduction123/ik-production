import { supabase } from "./supabase.js";

export async function requireRole(allowedRoles = []) {
    // Verifikasi pengguna dengan Supabase Auth.
    const { data: userData, error: userError } = await supabase.auth.getUser();

    const user = userData?.user;

    if (userError || !user) {
        window.location.replace("/login/");
        return null;
    }

    // Ambil role dari database, bukan dari input pengguna.
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", user.id)
        .single();

    if (profileError || !profile) {
        await supabase.auth.signOut();
        window.location.replace("/login/");
        return null;
    }

    if (!allowedRoles.includes(profile.role)) {
        if (profile.role === "admin") {
            window.location.replace("/admin/");
        } else {
            window.location.replace("/dashboard/");
        }

        return null;
    }

    return { user, profile };
}

export function setupLogout(buttonId = "logoutButton") {
    const button = document.getElementById(buttonId);

    if (!button) return;

    button.addEventListener("click", async () => {
        button.disabled = true;
        button.textContent = "Keluar...";

        const { error } = await supabase.auth.signOut();

        if (error) {
            button.disabled = false;
            button.textContent = "Keluar";
            alert("Gagal keluar. Silakan coba lagi.");
            return;
        }

        window.location.replace("/login/");
    });
}
