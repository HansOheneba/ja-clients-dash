import { Line, Path, Polygon, Polyline, Svg, Text, View } from "@react-pdf/renderer";

import type { InvestmentReportData } from "@/lib/reports/types";
import { colors, fonts, reportStyles } from "@/lib/reports/pdf/report-theme";

function formatCompactUsd(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1000)}k`;
  return `$${Math.round(value)}`;
}

function formatMonthLabel(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
    month: "short",
    year: "2-digit",
  });
}

export function ValueChart({ points }: { points: InvestmentReportData["historyPoints"] }) {
  if (points.length < 2) {
    return <Text style={reportStyles.emptyRow}>No history available for this period.</Text>;
  }

  const chartHeight = 100;
  const yAxisWidth = 48;
  const values = points.map((p) => p.valueUsd);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const yTicks = [max, min + range / 2, min];

  const coords = points.map((p, i) => {
    const xRatio = i / (points.length - 1);
    const yRatio = (p.valueUsd - min) / range;
    return { xRatio, yRatio, date: p.date };
  });

  const svgWidth = 467;
  const svgHeight = chartHeight;
  const padX = 6;
  const padY = 8;
  const plotW = svgWidth - padX * 2;
  const plotH = svgHeight - padY * 2;

  const plotCoords = coords.map((c) => ({
    x: padX + c.xRatio * plotW,
    y: padY + plotH - c.yRatio * plotH,
  }));

  const linePoints = plotCoords.map((c) => `${c.x},${c.y}`).join(" ");
  const areaPoints = [
    `${plotCoords[0].x},${padY + plotH}`,
    ...plotCoords.map((c) => `${c.x},${c.y}`),
    `${plotCoords[plotCoords.length - 1].x},${padY + plotH}`,
  ].join(" ");

  const xLabelIdx = [0, Math.floor((points.length - 1) / 2), points.length - 1];

  return (
    <View>
      <Text style={reportStyles.chartCaption}>Portfolio value (USD) by statement date</Text>
      <View style={{ flexDirection: "row", alignItems: "stretch" }}>
        <View
          style={{
            width: yAxisWidth,
            height: chartHeight,
            justifyContent: "space-between",
            paddingVertical: 4,
            paddingRight: 4,
          }}
        >
          {yTicks.map((tick) => (
            <Text key={tick} style={[reportStyles.chartAxisLabel, { textAlign: "right" }]}>
              {formatCompactUsd(tick)}
            </Text>
          ))}
        </View>
        <Svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          {[0, 0.5, 1].map((t) => {
            const y = padY + plotH * (1 - t);
            return (
              <Line
                key={t}
                x1={padX}
                y1={y}
                x2={padX + plotW}
                y2={y}
                stroke={colors.rule}
                strokeWidth={0.75}
              />
            );
          })}
          <Polygon points={areaPoints} fill={colors.navy} fillOpacity={0.08} />
          <Polyline
            points={linePoints}
            fill="none"
            stroke={colors.navy}
            strokeWidth={1.75}
          />
        </Svg>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 4,
          paddingLeft: yAxisWidth + 4,
          paddingRight: 8,
        }}
      >
        {xLabelIdx.map((idx) => (
          <Text key={idx} style={reportStyles.chartAxisLabel}>
            {formatMonthLabel(points[idx].date)}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function AllocationChart({
  slices,
}: {
  slices: InvestmentReportData["allocationSlices"];
}) {
  const cx = 56;
  const cy = 56;
  const r = 44;
  let cumulative = 0;

  const paths = slices.map((slice) => {
    const start = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    cumulative += slice.allocationPct;
    const end = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = slice.allocationPct > 50 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    return <Path key={slice.bucket} d={d} fill={slice.color} />;
  });

  const leftCol = slices.filter((_, i) => i % 2 === 0);
  const rightCol = slices.filter((_, i) => i % 2 === 1);

  return (
    <View>
      <View style={{ alignItems: "center", marginBottom: 10 }}>
        <Svg width={112} height={112} viewBox="0 0 112 112">
          {paths}
        </Svg>
      </View>
      <View style={{ flexDirection: "row", gap: 16 }}>
        <View style={{ flex: 1 }}>
          {leftCol.map((s) => (
            <Text key={s.bucket} style={{ fontSize: 8, marginBottom: 5, fontFamily: fonts.body }}>
              <Text style={{ color: colors.gold, fontWeight: 500 }}>{s.label}: </Text>
              <Text style={{ fontWeight: 600 }}>{s.allocationPct.toFixed(1)}%</Text>
            </Text>
          ))}
        </View>
        <View style={{ flex: 1 }}>
          {rightCol.map((s) => (
            <Text key={s.bucket} style={{ fontSize: 8, marginBottom: 5, fontFamily: fonts.body }}>
              <Text style={{ color: colors.gold, fontWeight: 500 }}>{s.label}: </Text>
              <Text style={{ fontWeight: 600 }}>{s.allocationPct.toFixed(1)}%</Text>
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}
