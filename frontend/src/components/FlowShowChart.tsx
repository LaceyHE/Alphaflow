"use client";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

interface Item { name: string; ticker: string; change: number; cat: string }

const CAT_LABELS: Record<string, string> = {
  Asset: "Asset Class",
  Region: "Region",
  Sector: "Sector",
};

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  const pos = d.change >= 0;
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: 5,
      padding: "9px 13px",
      fontSize: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    }}>
      <div style={{ fontWeight: 600, color: "#0f172a", marginBottom: 3 }}>{d.name}</div>
      <div style={{ color: "#94a3b8", fontSize: 10, marginBottom: 5 }}>
        {d.ticker} · {CAT_LABELS[d.cat] || d.cat}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: pos ? "#16a34a" : "#dc2626" }}>
        {pos ? "+" : ""}{d.change.toFixed(2)}%
      </div>
    </div>
  );
}

export default function FlowShowChart({ items }: { items: Item[] }) {
  const sorted = useMemo(() => [...items].sort((a, b) => b.change - a.change), [items]);
  const max = Math.max(...sorted.map(i => Math.abs(i.change)), 1);

  return (
    <div style={{ height: Math.max(sorted.length * 22 + 40, 200) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ left: 130, right: 90, top: 4, bottom: 4 }}
          barSize={11}
        >
          <XAxis
            type="number"
            domain={[-max * 1.1, max * 1.1]}
            tickFormatter={v => `${v > 0 ? "+" : ""}${v.toFixed(0)}%`}
            tick={{ fill: "#94a3b8", fontSize: 10 }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ fill: "#475569", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
          <ReferenceLine x={0} stroke="#cbd5e1" strokeWidth={1} />
          <Bar dataKey="change" radius={[0, 2, 2, 0]}>
            {sorted.map((item, i) => (
              <Cell
                key={i}
                fill={item.change >= 0 ? "#16a34a" : "#dc2626"}
                fillOpacity={0.6 + Math.min(Math.abs(item.change) / max, 1) * 0.4}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
