import { Line, Path, Polygon, Polyline, Svg, Text as SvgText, Text, View } from "@react-pdf/renderer";

import type { InvestmentReportData } from "@/lib/reports/types";
import type { PortfolioBucket } from "@/lib/wealth/types";
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

function allocationLegendLabel(bucket: PortfolioBucket, label: string) {
  if (bucket === "coa") return "COA";
  return label;
}

function sliceLabelColor(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
    return colors.white;
  }
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? colors.navy : colors.white;
}

function finiteCoord(value: number) {
  return Number.isFinite(value) ? value : 0;
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
  size = 220,
}: {
  slices: InvestmentReportData["allocationSlices"];
  size?: number;
}) {
  const activeSlices = slices.filter(
    (slice) => Number.isFinite(slice.allocationPct) && slice.allocationPct > 0.05,
  );

  if (activeSlices.length === 0) {
    return <Text style={reportStyles.emptyRow}>No allocation data for this statement.</Text>;
  }

  const pctTotal = activeSlices.reduce((sum, slice) => sum + slice.allocationPct, 0);
  const normalizedSlices = activeSlices.map((slice) => ({
    ...slice,
    allocationPct: pctTotal > 0 ? (slice.allocationPct / pctTotal) * 100 : 0,
  }));

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  let cumulative = 0;

  const segments = normalizedSlices.flatMap((slice) => {
    const pct = slice.allocationPct;
    if (pct <= 0) return [];

    const startPct = cumulative;
    cumulative += pct;
    const endPct = cumulative;
    const start = (startPct / 100) * 2 * Math.PI - Math.PI / 2;
    const end = (endPct / 100) * 2 * Math.PI - Math.PI / 2;
    if (!Number.isFinite(start) || !Number.isFinite(end) || end - start <= 0) return [];

    const mid = (start + end) / 2;
    const x1 = finiteCoord(cx + r * Math.cos(start));
    const y1 = finiteCoord(cy + r * Math.sin(start));
    const x2 = finiteCoord(cx + r * Math.cos(end));
    const y2 = finiteCoord(cy + r * Math.sin(end));
    const large = pct > 50 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    const labelR = r * 0.62;
    const labelX = finiteCoord(cx + labelR * Math.cos(mid));
    const labelY = finiteCoord(cy + labelR * Math.sin(mid) + 3);
    return [
      {
        slice,
        d,
        labelX,
        labelY,
        showLabel: pct >= 4,
      },
    ];
  });

  return (
    <View style={reportStyles.allocationPage}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map(({ slice, d }) => (
          <Path key={slice.bucket} d={d} fill={slice.color} />
        ))}
        {segments.map(({ slice, labelX, labelY, showLabel }) =>
          showLabel ? (
            <SvgText
              key={`${slice.bucket}-label`}
              x={labelX}
              y={labelY}
              fill={sliceLabelColor(slice.color)}
              textAnchor="middle"
              style={{
                fontFamily: fonts.body,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {`${Math.round(slice.allocationPct)}%`}
            </SvgText>
          ) : null,
        )}
      </Svg>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 20,
          marginTop: 28,
          maxWidth: 640,
        }}
      >
        {normalizedSlices.map((slice) => (
          <View
            key={slice.bucket}
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: slice.color,
              }}
            />
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 9,
                color: colors.ink,
              }}
            >
              {allocationLegendLabel(slice.bucket, slice.label)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
