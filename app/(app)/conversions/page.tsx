import { getMyConversions } from "@/lib/actions/affiliate";

type Conversion = {
  id: number;
  item_type: string | null;
  item_id: number | null;
  sale_amount: number | null;
  commission_pct: number | null;
  commission_amount: number | null;
  status: string | null;
  confirmed_at: string | null;
  created_at: string | null;
  affiliate_links: {
    slug: string | null;
    item_name: string | null;
    full_url: string | null;
  } | null;
};

function StatusBadge({ status }: { status: string | null }) {
  const s = (status ?? "pending").toLowerCase();
  if (s === "confirmed") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
        Confirmed
      </span>
    );
  }
  if (s === "paid") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
        Paid
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
      Pending
    </span>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatSAR(value: number | null): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value) + " SAR";
}

export default async function ConversionsPage() {
  const { data: conversions, error } = await getMyConversions();

  const pending = (conversions as unknown as Conversion[]).reduce(
    (sum, c) => sum + (c.status?.toLowerCase() === "pending" ? (c.commission_amount ?? 0) : 0),
    0
  );
  const confirmed = (conversions as unknown as Conversion[]).reduce(
    (sum, c) => sum + (c.status?.toLowerCase() === "confirmed" ? (c.commission_amount ?? 0) : 0),
    0
  );
  const paid = (conversions as unknown as Conversion[]).reduce(
    (sum, c) => sum + (c.status?.toLowerCase() === "paid" ? (c.commission_amount ?? 0) : 0),
    0
  );
  const totalEarned = confirmed + paid;

  return (
    <div className="space-y-6 pb-10">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-white">Conversions</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Track your commission-generating referrals and earnings
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="rounded-2xl p-5"
          style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))",
            border: "1px solid rgba(245,158,11,0.2)",
          }}
        >
          <p className="text-xs font-medium text-amber-400/70 uppercase tracking-wider mb-1">
            Pending
          </p>
          <p className="text-2xl font-bold text-amber-300">{formatSAR(pending)}</p>
          <p className="text-xs text-amber-400/50 mt-0.5">Awaiting confirmation</p>
        </div>

        <div
          className="rounded-2xl p-5"
          style={{
            background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))",
            border: "1px solid rgba(16,185,129,0.2)",
          }}
        >
          <p className="text-xs font-medium text-emerald-400/70 uppercase tracking-wider mb-1">
            Confirmed
          </p>
          <p className="text-2xl font-bold text-emerald-300">{formatSAR(confirmed)}</p>
          <p className="text-xs text-emerald-400/50 mt-0.5">Ready to withdraw</p>
        </div>

        <div
          className="rounded-2xl p-5"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.04))",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          <p className="text-xs font-medium text-indigo-400/70 uppercase tracking-wider mb-1">
            Total Earned
          </p>
          <p className="text-2xl font-bold text-indigo-300">{formatSAR(totalEarned)}</p>
          <p className="text-xs text-indigo-400/50 mt-0.5">Confirmed + paid out</p>
        </div>
      </div>

      {/* Conversions table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(15,17,23,0.6)",
          border: "1px solid rgba(99,102,241,0.12)",
        }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(99,102,241,0.1)" }}>
          <h2 className="text-sm font-semibold text-white">
            All Conversions
            <span className="ml-2 text-xs font-normal text-slate-500">
              ({(conversions as unknown as Conversion[]).length} records)
            </span>
          </h2>
        </div>

        {error ? (
          <div className="px-5 py-8 text-center text-sm text-red-400">
            Failed to load conversions. Please refresh the page.
          </div>
        ) : (conversions as unknown as Conversion[]).length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-slate-400 text-sm">No conversions recorded yet.</p>
            <p className="text-slate-600 text-xs mt-1">
              Conversions appear here when someone purchases through your referral links.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(99,102,241,0.1)" }}>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Link / Product
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Sale Amount
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Comm. %
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {(conversions as unknown as Conversion[]).map((conv, idx) => (
                  <tr
                    key={conv.id}
                    style={{
                      borderBottom: idx < (conversions as unknown as Conversion[]).length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    }}
                  >
                    <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                      {formatDate(conv.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-white font-medium truncate max-w-[180px]">
                        {conv.affiliate_links?.item_name ?? conv.item_type ?? "—"}
                      </div>
                      {conv.affiliate_links?.slug && (
                        <div className="text-xs text-slate-600 font-mono mt-0.5">
                          {conv.affiliate_links.slug}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-300 whitespace-nowrap">
                      {formatSAR(conv.sale_amount)}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-300 whitespace-nowrap">
                      {conv.commission_pct != null ? `${conv.commission_pct}%` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-white whitespace-nowrap">
                      {formatSAR(conv.commission_amount)}
                    </td>
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      <StatusBadge status={conv.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals footer */}
        {(conversions as unknown as Conversion[]).length > 0 && (
          <div
            className="px-5 py-4 flex flex-wrap items-center justify-between gap-3"
            style={{ borderTop: "1px solid rgba(99,102,241,0.1)" }}
          >
            <span className="text-xs text-slate-500">
              Showing last 50 conversions
            </span>
            <div className="flex items-center gap-6 text-xs">
              <span className="text-slate-400">
                Pending:{" "}
                <span className="text-amber-300 font-semibold">{formatSAR(pending)}</span>
              </span>
              <span className="text-slate-400">
                Confirmed:{" "}
                <span className="text-emerald-300 font-semibold">{formatSAR(confirmed)}</span>
              </span>
              <span className="text-slate-400">
                Total Earned:{" "}
                <span className="text-indigo-300 font-semibold">{formatSAR(totalEarned)}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
