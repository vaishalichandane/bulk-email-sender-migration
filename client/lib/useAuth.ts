"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
}

/**
 * Checks session status via /auth/me (the httpOnly cookie can't be read
 * client-side, so this is the only reliable way to know if we're logged in).
 * Redirects to /login if not authenticated and `requireAuth` is true.
 */
export function useAuth(requireAuth = true) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    api
      .me()
      .then((res: any) => {
        if (cancelled) return;
        if (res.success && res.user) {
          setUser(res.user);
        } else if (requireAuth) {
          router.push("/login");
        }
      })
      .catch(() => {
        if (!cancelled && requireAuth) router.push("/login");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [requireAuth, router]);

  return { user, loading };
}
