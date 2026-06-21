"use client";
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, type SankeyNodeMinimal, type SankeyLinkMinimal } from "d3-sankey";

interface SNode extends SankeyNodeMinimal<SNode, SLink> {
  id: string; layer: number; change: number;
}
interface SLink extends SankeyLinkMinimal<SNode, SLink> {
  change: number;
}
interface Props {
  nodes: { id: string; layer: number; change: number }[];
  links: { source: string; target: string; value: number; change: number }[];
}

export default function SankeyFlow({ nodes, links }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string; change: number } | null>(null);

  useEffect(() => {
    if (!ref.current || nodes.length === 0) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const W = ref.current.clientWidth || 760;
    const H = 320;
    const margin = { top: 20, right: 150, bottom: 20, left: 150 };

    const gen = sankey<SNode, SLink>()
      .nodeId(d => d.id)
      .nodeWidth(10)
      .nodePadding(20)
      .extent([[margin.left, margin.top], [W - margin.right, H - margin.bottom]]);

    const sankeyNodes: SNode[] = nodes.map(n => ({ ...n }));
    const sankeyLinks: SLink[] = links.map(l => ({
      source: l.source, target: l.target, value: l.value, change: l.change,
    }));

    let graph: { nodes: SNode[]; links: SLink[] };
    try { graph = gen({ nodes: sankeyNodes, links: sankeyLinks }); }
    catch { return; }

    const g = svg.append("g");

    // Links
    g.selectAll("path.link")
      .data(graph.links)
      .join("path")
      .attr("class", "link")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", (d: any) => d.change >= 0 ? "#16a34a" : "#dc2626")
      .attr("stroke-width", d => Math.max(2, d.width ?? 2))
      .attr("fill", "none")
      .attr("opacity", 0.25)
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d: any) {
        d3.select(this).attr("opacity", 0.5);
        const src = typeof d.source === "object" ? d.source.id : d.source;
        const tgt = typeof d.target === "object" ? d.target.id : d.target;
        const rect = ref.current!.getBoundingClientRect();
        setTooltip({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          text: `${src} → ${tgt}`,
          change: d.change,
        });
      })
      .on("mouseleave", function () {
        d3.select(this).attr("opacity", 0.25);
        setTooltip(null);
      });

    // Nodes
    const nodeG = g.selectAll("g.node")
      .data(graph.nodes)
      .join("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

    nodeG.append("rect")
      .attr("width", d => (d.x1 ?? 0) - (d.x0 ?? 0))
      .attr("height", d => Math.max(2, (d.y1 ?? 0) - (d.y0 ?? 0)))
      .attr("rx", 2)
      .attr("fill", "#1e3a5f")
      .attr("opacity", 0.85);

    // LEFT labels (layer 0)
    g.selectAll("text.lbl-left")
      .data(graph.nodes.filter(d => d.layer === 0))
      .join("text")
      .attr("class", "lbl-left")
      .attr("x", d => (d.x0 ?? 0) - 8)
      .attr("y", d => ((d.y0 ?? 0) + (d.y1 ?? 0)) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("font-size", 11)
      .attr("font-weight", "500")
      .attr("fill", "#475569")
      .text(d => d.id);

    // RIGHT labels (layer 2) — with change %
    g.selectAll("text.lbl-right")
      .data(graph.nodes.filter(d => d.layer === 2))
      .join("text")
      .attr("class", "lbl-right")
      .attr("x", d => (d.x1 ?? 0) + 8)
      .attr("y", d => ((d.y0 ?? 0) + (d.y1 ?? 0)) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .attr("font-size", 11)
      .attr("font-weight", "600")
      .attr("fill", d => d.change >= 0 ? "#16a34a" : "#dc2626")
      .text(d => `${d.id} ${d.change >= 0 ? "+" : ""}${d.change.toFixed(1)}%`);

    // MIDDLE labels (layer 1)
    g.selectAll("text.lbl-mid")
      .data(graph.nodes.filter(d => d.layer === 1))
      .join("text")
      .attr("class", "lbl-mid")
      .attr("x", d => ((d.x0 ?? 0) + (d.x1 ?? 0)) / 2)
      .attr("y", d => (d.y0 ?? 0) - 8)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("fill", "#64748b")
      .text(d => d.id);

  }, [nodes, links]);

  return (
    <div style={{ position: "relative", background: "#fff", borderRadius: 4 }}>
      <svg ref={ref} width="100%" height={320} style={{ overflow: "visible" }} />
      {tooltip && (
        <div style={{
          position: "absolute",
          left: tooltip.x + 12,
          top: tooltip.y - 10,
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 5,
          padding: "8px 12px",
          fontSize: 12,
          pointerEvents: "none",
          zIndex: 10,
          whiteSpace: "nowrap",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}>
          <div style={{ color: "#0f172a", fontWeight: 600 }}>{tooltip.text}</div>
          <div style={{ color: tooltip.change >= 0 ? "#16a34a" : "#dc2626", fontWeight: 700, marginTop: 2 }}>
            {tooltip.change >= 0 ? "+" : ""}{tooltip.change.toFixed(2)}%
          </div>
        </div>
      )}
    </div>
  );
}
