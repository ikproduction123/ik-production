import { supabaseClient } from "./supabase.js";

/* =========================================================
   IK-Pro.My.Id
   AUTH GUARD
========================================================= */

export async function requireAuth() {
    try {
        const {
            data: { session },
            error
        } = await supabaseClient.auth.getSession();

        /* =============================================
           SESSION ERROR
        ============================================= */

        if (error) {
            console.error("Auth guard error:", error);

            window.location.replace("/login.html");

            return null;
        }

        /* =============================================
           BELUM LOGIN
        ============================================= */

        if (!session?.user) {
            window.location.replace("/login.html");

            return null;
        }

        /* =============================================
           AMBIL PROFILE
        ============================================= */

        const { data: profile, error: profileError } = await supabaseClient
            .from("profiles")
            .select("id, name, phone, role")
            .eq("id", session.user.id)
            .single();

        if (profileError) {
            console.error("Profile guard error:", profileError);

            await supabaseClient.auth.signOut();

            window.location.replace("/login.html");

            return null;
        }

        /* =============================================
           RETURN USER
        ============================================= */

        return {
            session,
            user: session.user,
            profile
        };
    } catch (error) {
        console.error("Require auth error:", error);

        window.location.replace("/login.html");

        return null;
    }
}

/* =====================================================
   LOGOUT
========================================================= */

export async function logout() {
    try {
        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            throw error;
        }

        window.location.replace("/login.html");
    } catch (error) {
        console.error("Logout error:", error);

        throw error;
    }
}

/* =========================================================
   AUTH STATE LISTENER
========================================================= */

export function onAuthStateChange(callback) {

    return supabaseClient.auth.onAuthStateChange(
        (event, session) => {

            callback({
                event,
                session
            });

        }
    );
}