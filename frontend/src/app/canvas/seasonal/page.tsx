"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from "recharts";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// S&P 500 avg monthly returns (historical approximation)
const SPX_SEASONAL = [1.1, -0.2, 1.3, 1.5, 0.2, 0.8, 1.8, -0.3, -0.8, 1.2, 2.1, 1.4];
// Election year pattern (presidential)
const ELECTION_YR = [0.8, 0.3, 1.2, 2.1, 1.8, 1.1, 2.3, 0.9, -0.2, 0.8, 3.2, 2.5];
// Non-election
const NON_ELECTION = [1.3, -0.6, 1.4, 0.9, -0.4, 0.5, 1.2, -0.8, -1.3, 1.6, 1.0, 0.3];

const data = MONTHS.map((m, i) => ({
  month: m,
  spx: SPX_SEASONAL[i],
  election: ELECTION_YR[i],
  nonElection: NON_ELECTION[i],
}));

export default function SeasonalPage() {
  return (
    <div style={{ padding: "24px 28px", maxWidth: 1300, margin: "0 auto", marginLeft: 192 }}>
      <div className="section-label mb-1">CANVAS · SEASONAL PATTERNS</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Historical Seasonal Analysis</h1>
      <p style={{ color: "#64748b", fontSize: 12, marginBottom: 24 }}>
        Average monthly returns &amp; presidential election year pattern (S&amp;P 500)
      </p>

      <div className="glass p-5 mb-5">
        <div className="section-label mb-4">S&P 500 AVERAGE MONTHLY RETURN (LAST 12 YEARS)</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ left: 10, right: 10 }}>
            <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`}
              tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: any) => [`${Number(v).toFixed(2)}%`, "Avg Return"]}
              contentStyle={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
            <Bar dataKey="spx" radius={[3, 3, 0, 0]}>
              {data.map((d, i) => <Cell key={i} fill={d.spx >= 0 ? "#10b981" : "#ef4444"} fillOpacity={0.8} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass p-5">
        <div className="section-label mb-4">ELECTION YEAR vs NON-ELECTION YEAR PATTERN</div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {["Best Month (Election)", "Worst Month (Non-Elec)", "Year-End Rally"].map((l, i) => {
            const vals = [["Nov +3.2%", "#10b981"], ["Sep -1.3%", "#ef4444"], ["Nov-Dec avg +2.8%", "#f59e0b"]];
            return (
              <div key={l} className="glass2 rounded-xl p-3">
                <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase" }}>{l}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: vals[i][1] as string, marginTop: 4 }}>{vals[i][0]}</div>
              </div>
            );
          })}
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data}>
            <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`}
              tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: any, name: any) => [`${Number(v).toFixed(2)}%`, name === "election" ? "Election Year" : "Non-Election Year"]}
              contentStyle={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
            <Legend formatter={v => v === "election" ? "Election Year" : "Non-Election Year"} />
            <Line type="monotone" dataKey="election" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} name="election" />
            <Line type="monotone" dataKey="nonElection" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} name="nonElection" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
