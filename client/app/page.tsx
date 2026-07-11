"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    api
      .me()
      .then((res: any) => {
        router.replace(res.success ? "/dashboard" : "/login");
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  return <div className="p-8 text-center text-gray-500">Loading...</div>;
}
