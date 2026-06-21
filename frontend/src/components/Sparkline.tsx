"use client";
import { LineChart, Line, ResponsiveContainer } from "recharts";

export default function Sparkline({
  data,
  positive,
  height = 40,
}: {
  data: number[];
  positive?: boolean;
  height?: number;
}) {
  if (!data || data.length < 2) return null;
  const color = positive === undefined ? (data[data.length - 1] >= data[0] ? "#00ff94" : "#ff4d6d") : positive ? "#00ff94" : "#ff4d6d";
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line type="monotone" dataKey="v" stroke={color} dot={false} strokeWidth={1.5} />
      </LineChart>
    </ResponsiveContainer>
  );
}
