"use client";

import { useEffect, useState, useCallback } from "react";
import { useI18n } from "../../I18nProvider";
import Select from "../../Select";

type Stats = {
  userCount: number;
  accountCount: number;
  templateCount: number;
  totalSent: number;
  totalFailed: number;
  sent24h: number;
  sent7d: number;
  sent30d: number;
};

type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  isBanned: boolean;
  sendDisabled: boolean;
  sendLimitCount: number | null;
  sendLimitPeriod: string | null;
  sendLimitUsed: number;
  accountsCount: number;
  templatesCount: number;
  sentTotal: number;
  sentLast24h: number;
  isAdmin: boolean;
};

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { dict } = useI18n();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[] | null>(null);

  const load = useCallback(async () => {
    const [statsRes, usersRes] = await Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/users").then((r) => r.json()),
    ]);
    setStats(statsRes.stats ?? null);
    setUsers(usersRes.users ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const d = dict.admin.dashboard;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats ? (
          <>
            <StatCard label={d.statUsers} value={stats.userCount} />
            <StatCard label={d.statAccounts} value={stats.accountCount} />
            <StatCard label={d.statTemplates} value={stats.templateCount} />
            <StatCard label={d.statSentTotal} value={stats.totalSent} />
            <StatCard label={d.statFailedTotal} value={stats.totalFailed} />
            <StatCard label={d.statSent24h} value={stats.sent24h} />
            <StatCard label={d.statSent7d} value={stats.sent7d} />
            <StatCard label={d.statSent30d} value={stats.sent30d} />
          </>
        ) : (
          <p className="text-sm text-zinc-500">{d.loading}</p>
        )}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-foreground">{d.usersTitle}</h2>
        {users === null ? (
          <p className="text-sm text-zinc-500">{d.loading}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map((u) => (
              <UserRow key={u.id} user={u} onChanged={load} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function UserRow({ user, onChanged }: { user: AdminUser; onChanged: () => void }) {
  const { dict } = useI18n();
  const d = dict.admin.dashboard;
  const [limitCount, setLimitCount] = useState(user.sendLimitCount ? String(user.sendLimitCount) : "");
  const [limitPeriod, setLimitPeriod] = useState(user.sendLimitPeriod ?? "day");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function postJson(url: string, body: unknown) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error ?? `${res.status} ${res.statusText}`);
    }
  }

  async function deletePermanently() {
    const typed = prompt(`${d.deleteWarning}\n${user.email}`);
    if (typed === null) return;
    if (typed.trim().toLowerCase() !== user.email.toLowerCase()) {
      setError(d.deleteConfirmMismatch);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `${res.status} ${res.statusText}`);
      }
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function toggleBan() {
    const confirmMsg = user.isBanned ? d.confirmUnban : d.confirmBan;
    if (!confirm(confirmMsg)) return;
    setBusy(true);
    setError(null);
    try {
      await postJson(`/api/admin/users/${user.id}/ban`, { banned: !user.isBanned });
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function toggleSendDisabled() {
    setBusy(true);
    setError(null);
    try {
      await postJson(`/api/admin/users/${user.id}/send-status`, { disabled: !user.sendDisabled });
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function saveLimit() {
    setBusy(true);
    setError(null);
    try {
      const count = limitCount.trim() ? Number(limitCount) : null;
      await postJson(`/api/admin/users/${user.id}/limit`, { count, period: count ? limitPeriod : null });
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function removeLimit() {
    setBusy(true);
    setError(null);
    try {
      await postJson(`/api/admin/users/${user.id}/limit`, { count: null, period: null });
      setLimitCount("");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const periodLabel =
    user.sendLimitPeriod === "week" ? d.limitPeriodWeek : user.sendLimitPeriod === "month" ? d.limitPeriodMonth : d.limitPeriodDay;

  return (
    <div className="card flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium text-foreground">{user.name || user.email}</p>
          <p className="text-xs text-zinc-500">
            {user.email} · {d.colJoined} {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {user.isAdmin && (
            <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent">
              {d.adminBadge}
            </span>
          )}
          {user.isBanned && (
            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-400">
              {d.statusBanned}
            </span>
          )}
          {user.sendDisabled && !user.isBanned && (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
              {d.statusSendDisabled}
            </span>
          )}
          {!user.isBanned && !user.sendDisabled && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
              {d.statusActive}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <p className="text-lg font-semibold text-foreground">{user.accountsCount}</p>
          <p className="text-xs text-zinc-500">{d.colAccounts}</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">{user.templatesCount}</p>
          <p className="text-xs text-zinc-500">{d.colTemplates}</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">{user.sentTotal}</p>
          <p className="text-xs text-zinc-500">{d.colSent}</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">{user.sentLast24h}</p>
          <p className="text-xs text-zinc-500">{d.colSent24h}</p>
        </div>
      </div>

      {!user.isAdmin && (
        <div className="flex flex-col gap-3 border-t border-border pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-500">{d.colLimit} :</span>
            <input
              type="number"
              min={1}
              value={limitCount}
              onChange={(e) => setLimitCount(e.target.value)}
              placeholder={d.limitCountPlaceholder}
              className="input w-24"
            />
            <Select
              value={limitPeriod}
              onChange={setLimitPeriod}
              className="w-36"
              options={[
                { value: "day", label: d.limitPeriodDay },
                { value: "week", label: d.limitPeriodWeek },
                { value: "month", label: d.limitPeriodMonth },
              ]}
            />
            <button
              type="button"
              onClick={saveLimit}
              disabled={busy}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-900"
            >
              {d.limitSave}
            </button>
            {user.sendLimitCount != null && (
              <button
                type="button"
                onClick={removeLimit}
                disabled={busy}
                className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                {d.limitRemove}
              </button>
            )}
            {user.sendLimitCount == null && <span className="text-xs text-zinc-500">{d.limitNone}</span>}
          </div>

          {/* hauteur réservée en permanence : évite que les boutons du dessous ne se
              déplacent (et ne récupèrent un clic non voulu) quand la limite change. */}
          <div className="flex min-h-11 flex-col gap-1">
            {user.sendLimitCount != null && (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={
                      user.sendLimitUsed >= user.sendLimitCount
                        ? "font-medium text-red-600 dark:text-red-400"
                        : "text-zinc-500"
                    }
                  >
                    {user.sendLimitUsed} / {user.sendLimitCount} {periodLabel}
                  </span>
                </div>
                <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className={`h-full rounded-full ${
                      user.sendLimitUsed >= user.sendLimitCount ? "bg-red-500" : "bg-accent"
                    }`}
                    style={{ width: `${Math.min(100, (user.sendLimitUsed / user.sendLimitCount) * 100)}%` }}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={toggleSendDisabled}
              disabled={busy}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-900"
            >
              {user.sendDisabled ? d.enableSend : d.disableSend}
            </button>
            <button
              type="button"
              onClick={toggleBan}
              disabled={busy}
              className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              {user.isBanned ? d.unban : d.ban}
            </button>
            <button
              type="button"
              onClick={deletePermanently}
              disabled={busy}
              className="ml-auto rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-800"
            >
              {d.deletePermanently}
            </button>
          </div>

          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
}
