import React, { useEffect, useRef } from "react";
import { BodyPartMetrics } from "@shared/types";
import { axisBottom, axisLeft, max, scaleBand, scaleLinear, select } from "d3";
import { useResizeObserver } from "../hooks/useResizeObserver";

interface LoadBarChartProps {
  data: BodyPartMetrics;
}

interface Metric {
  part: keyof BodyPartMetrics;
  load: number;
}

const LoadBarChart: React.FC<LoadBarChartProps> = ({ data }) => {
  const chartRef = useRef<SVGSVGElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const dimensions = useResizeObserver(wrapperRef, { width: 200, height: 200 });

  const metricsArray: Metric[] = Object.entries(data).map(([part, load]) => ({
    part: part as keyof BodyPartMetrics,
    load,
  }));

  useEffect(() => {
    if (!chartRef.current || !dimensions) return;

    const colors: Record<keyof BodyPartMetrics, string> = {
      fingers: "#2E96FF",
      upperBody: "#B800D8",
      lowerBody: "#02B2AF",
    };

    const labels: Record<keyof BodyPartMetrics, string> = {
      fingers: "Fingers",
      upperBody: "Upper Body",
      lowerBody: "Lower Body",
    };

    const barChart = select(chartRef.current).style("overflow", "visible");

    const xScale = scaleLinear()
      .domain([0, max(metricsArray, (d) => d.load) || 0])
      .range([0, dimensions.width - 10]);

    const xAxis = axisBottom(xScale).ticks(3);
    barChart
      .select<SVGGElement>(".x-axis")
      .call(xAxis)
      .style("transform", `translate(10px, ${dimensions.height - 10}px)`);

    const yScale = scaleBand<keyof BodyPartMetrics>()
      .domain(metricsArray.map((d) => d.part))
      .range([0, dimensions.height - 10])
      .padding(0.3);

    const yAxis = axisLeft(yScale).tickFormat(() => "");
    barChart
      .select<SVGGElement>(".y-axis")
      .call(yAxis)
      .style("transform", `translateX(10px)`)
      .selectAll(".tick line")
      .attr("stroke-width", 0);

    barChart
      .selectAll<SVGPathElement, Metric>(".bar")
      .data(metricsArray)
      .join("path")
      .attr("class", "bar")
      .attr("d", (d) => {
        const y = yScale(d.part);
        const height = yScale.bandwidth();
        const width = xScale(d.load);
        const ry = 5; // Radius for the y corners

        if (y === undefined || height === 0 || width === 0) return null;

        return `M ${10},${y} 
                h ${width - ry}
                a ${ry},${ry} 0 0 1 ${ry},${ry} 
                v ${height - 2 * ry}
                a ${ry},${ry} 0 0 1 -${ry},${ry} 
                h -${width - ry}
                z`;
      })
      .attr("fill", (d) => colors[d.part]);

    barChart
      .selectAll<SVGTextElement, Metric>(".label")
      .data(metricsArray)
      .join("text")
      .attr("class", "label")
      .attr("y", (d) => yScale(d.part)! + yScale.bandwidth() / 2)
      .attr("x", 15) // slight offset from the start of the bar
      .attr("dy", "0.35em") // vertically center
      .style("font-size", "12px")
      .text((d) => `${labels[d.part]}: ${d.load.toFixed(2)}`);
  }, [dimensions, metricsArray]);

  return (
    <div ref={wrapperRef} style={{ width: "100%", height: "100%" }}>
      <svg ref={chartRef}>
        <g className="x-axis" />
        <g className="y-axis" />
      </svg>
    </div>
  );
};

export default LoadBarChart;
