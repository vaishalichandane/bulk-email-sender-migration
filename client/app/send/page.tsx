"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import Nav from "@/components/Nav";
import { api } from "@/lib/api";

interface SmtpConfig {
  id: string;
  name: string;
  isDefault: boolean;
}

export default function SendPage() {
  const { user, loading: authLoading } = useAuth();
  const [configs, setConfigs] = useState<SmtpConfig[]>([]);
  const [configId, setConfigId] = useState("");
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    api.getSmtpConfigs().then((res: any) => {
      if (res.success) {
        setConfigs(res.userConfigs || []);
        const def = res.userConfigs?.find((c: SmtpConfig) => c.isDefault);
        if (def) setConfigId(def.id);
      }
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (!excelFile) {
      setResult({ success: false, message: "Please upload a contact list (Excel file)." });
      return;
    }

    setSending(true);
    try {
      const formData = new FormData();
      if (configId) formData.append("configId", configId);
      formData.append("subject", subject);
      formData.append("htmlContent", htmlContent);
      formData.append("excelFile", excelFile);
      // Explicitly keep this a plain immediate send — batch/schedule are
      // deliberately out of scope for this migration (see README).

      const res: any = await api.sendEmail(formData);
      setResult({ success: res.success, message: res.message || (res.success ? "Emails sent." : "Send failed.") });
    } catch {
      setResult({ success: false, message: "Send request failed. Check your connection." });
    } finally {
      setSending(false);
    }
  };

  if (authLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!user) return null;

  return (
    <div>
      <Nav userName={user.name} />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900">Send Email</h1>

        {configs.length === 0 ? (
          <p className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-md px-4 py-3">
            You need to add an SMTP configuration before you can send emails.
            Go to the SMTP Config page first.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Send using</label>
              <select
                value={configId}
                onChange={(e) => setConfigId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                {configs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.isDefault ? "(default)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Subject</label>
              <input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Email Content (HTML)</label>
              <textarea
                required
                rows={8}
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="<p>Hello {{name}}, ...</p>"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">
                Contact List (Excel file)
              </label>
              <input
                required
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                className="w-full text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Should contain a column with recipient email addresses.
              </p>
            </div>

            {result && (
              <p
                className={`text-sm rounded-md px-3 py-2 border ${
                  result.success
                    ? "text-green-700 bg-green-50 border-green-200"
                    : "text-red-600 bg-red-50 border-red-200"
                }`}
              >
                {result.message}
              </p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send Email"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
