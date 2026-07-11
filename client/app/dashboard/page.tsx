"use client";

import { useAuth } from "@/lib/useAuth";
import Nav from "@/components/Nav";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (!user) return null; // useAuth already redirected to /login

  return (
    <div>
      <Nav userName={user.name} />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold mb-1 text-gray-900">Welcome, {user.name}</h1>
        <p className="text-gray-500 mb-8">{user.email}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/config"
            className="block bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <h2 className="font-medium text-lg mb-1 text-gray-900">SMTP Configuration</h2>
            <p className="text-sm text-gray-500">
              Add or manage the email accounts you send campaigns from.
            </p>
          </Link>

          <Link
            href="/send"
            className="block bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <h2 className="font-medium text-lg mb-1 text-gray-900">Send Email</h2>
            <p className="text-sm text-gray-500">
              Upload a contact list and send a bulk email campaign.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
