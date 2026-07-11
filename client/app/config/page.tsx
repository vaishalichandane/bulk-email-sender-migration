"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import Nav from "@/components/Nav";
import { api } from "@/lib/api";

interface SmtpConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  fromEmail: string;
  fromName: string;
  isDefault: boolean;
  createdAt: string;
}

const emptyForm = {
  name: "",
  host: "",
  port: 587,
  secure: false,
  user: "",
  pass: "",
  fromEmail: "",
  fromName: "",
  isDefault: false,
};

export default function ConfigPage() {
  const { user, loading: authLoading } = useAuth();
  const [configs, setConfigs] = useState<SmtpConfig[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  const loadConfigs = async () => {
    try {
      const res: any = await api.getSmtpConfigs();
      if (res.success) setConfigs(res.userConfigs || []);
    } catch {
      setLoadError("Couldn't load SMTP configs. Is the backend running?");
    }
  };

  useEffect(() => {
    if (user) loadConfigs();
  }, [user]);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res: any = await api.testSmtpConfig({
        host: form.host,
        port: Number(form.port),
        secure: form.secure,
        user: form.user,
        pass: form.pass,
      });
      setTestResult({ success: res.success, message: res.message });
    } catch {
      setTestResult({ success: false, message: "Test request failed" });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res: any = await api.createSmtpConfig({
        ...form,
        port: Number(form.port),
      });
      if (res.success) {
        setForm(emptyForm);
        setShowForm(false);
        setTestResult(null);
        await loadConfigs();
      } else {
        setTestResult({ success: false, message: res.message || "Save failed" });
      }
    } catch {
      setTestResult({ success: false, message: "Save request failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this SMTP configuration?")) return;
    await api.deleteSmtpConfig(id);
    await loadConfigs();
  };

  const handleSetDefault = async (id: string) => {
    await api.setDefaultSmtpConfig(id);
    await loadConfigs();
  };

  if (authLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!user) return null;

  return (
    <div>
      <Nav userName={user.name} />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">SMTP Configurations</h1>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "+ Add Configuration"}
          </button>
        </div>

        {loadError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
            {loadError}
          </p>
        )}

        {showForm && (
          <form
            onSubmit={handleSave}
            className="bg-white border border-gray-200 rounded-xl p-6 mb-6 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Config Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. My Gmail Account"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">SMTP Host</label>
                <input
                  required
                  value={form.host}
                  onChange={(e) => setForm({ ...form, host: e.target.value })}
                  placeholder="smtp.gmail.com"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Port</label>
                <input
                  required
                  type="number"
                  value={form.port}
                  onChange={(e) => setForm({ ...form, port: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  id="secure"
                  checked={form.secure}
                  onChange={(e) => setForm({ ...form, secure: e.target.checked })}
                />
                <label htmlFor="secure" className="text-sm">Use SSL/TLS (secure)</label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">SMTP Username</label>
                <input
                  required
                  value={form.user}
                  onChange={(e) => setForm({ ...form, user: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">SMTP Password</label>
                <input
                  required
                  type="password"
                  value={form.pass}
                  onChange={(e) => setForm({ ...form, pass: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">From Email</label>
                <input
                  required
                  type="email"
                  value={form.fromEmail}
                  onChange={(e) => setForm({ ...form, fromEmail: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">From Name</label>
                <input
                  value={form.fromName}
                  onChange={(e) => setForm({ ...form, fromName: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              />
              <label htmlFor="isDefault" className="text-sm">Set as default configuration</label>
            </div>

            {testResult && (
              <p
                className={`text-sm rounded-md px-3 py-2 border ${
                  testResult.success
                    ? "text-green-700 bg-green-50 border-green-200"
                    : "text-red-600 bg-red-50 border-red-200"
                }`}
              >
                {testResult.message}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleTest}
                disabled={testing || !form.host || !form.user || !form.pass}
                className="text-sm px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                {testing ? "Testing..." : "Test Connection"}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="text-sm px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {configs.length === 0 && !showForm && (
            <p className="text-gray-500 text-sm">
              No SMTP configurations yet. Add one to start sending emails.
            </p>
          )}
          {configs.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{c.name}</span>
                  {c.isDefault && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {c.host}:{c.port} · {c.fromEmail}
                </p>
              </div>
              <div className="flex gap-2">
                {!c.isDefault && (
                  <button
                    onClick={() => handleSetDefault(c.id)}
                    className="text-xs px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-xs px-3 py-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
