"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

// Define the shape of our user with role based on known schema
type UserWithRole = User & {
    role?: "citizen" | "provider" | "ministry";
};

interface AuthContextType {
    user: UserWithRole | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signOut: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserWithRole | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const supabase = getSupabaseBrowserClient();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    // Fetch role from profile table
                    const { data: profile } = await supabase
                        .from("users")
                        .select("role")
                        .eq("id", session.user.id)
                        .single();

                    setUser({
                        ...session.user,
                        role: profile?.role as any,
                    });
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Error fetching user session:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth Event:", event);

            if (session?.user) {
                // Set user immediately so UI updates (like nav showing dashboard)
                setUser(session.user as UserWithRole);

                // Then fetch profile in background
                const { data: profile } = await supabase
                    .from("users")
                    .select("role")
                    .eq("id", session.user.id)
                    .single();

                if (profile) {
                    setUser({ ...session.user, role: profile.role as any });
                }
            } else {
                setUser(null);
            }

            setLoading(false);

            // Revalidate server components on major auth changes
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
                router.refresh();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, router, pathname]);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
