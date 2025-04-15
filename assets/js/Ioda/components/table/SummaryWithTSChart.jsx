// SummaryWithTSChart.jsx
import React, { useRef, useEffect, useState } from "react";
import { select } from "d3-selection";
import { scaleTime, scaleBand } from "d3-scale";
import { extent, ascending, descending } from "d3-array";
import { axisTop, axisLeft } from "d3-axis";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import { scaleOrdinal } from "d3-scale";

const schemeCategory10 = [
  "#1f77b4", // blue
  "#ff7f0e", // orange
  "#2ca02c", // green
  "#d62728", // red
  "#9467bd", // purple
  "#8c564b", // brown
  "#e377c2", // pink
  "#7f7f7f", // gray
  "#bcbd22", // olive
  "#17becf", // cyan
];
const styles = {
  chartContainer: {
    maxHeight: "500px",
    overflowY: "auto",
    border: "1px solid #ddd",
    position: "relative", // Needed for sticky header positioning
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    backgroundColor: "white",
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 220px 10px 20px", // Adjust padding to match your chart's layout
    borderBottom: "1px solid #ddd",
    //marginLeft: "200px", // Match your left margin
    marginRight: "20px", // Match your right margin
    width: "calc(100% - 220px)", // Adjust width to account for margins
  },
  headerItem: {
    fontWeight: "bold",
  },
};

function humanizeNumber(value, precisionDigits = 2) {
  return format(
    (isNaN(precisionDigits) ? "" : "." + precisionDigits) +
      (Math.abs(value) < 1 ? "r" : "s")
  )(value);
}

const SummaryWithTSChart = ({ data, width: containerWidth = 1000 }) => {
  const chartRef = useRef(null);
  const [sortCriterion, setSortCriterion] = useState("name");

  const sortedData = [...data].sort((a, b) =>
    sortCriterion === "name"
      ? ascending(a.name, b.name)
      : descending(a.score, b.score)
  );

  useEffect(() => {
    select(chartRef.current).select("svg").remove();
    if (!sortedData?.length) return;

    const margin = { top: 40, right: 20, bottom: 10, left: 200 };
    const width = containerWidth - margin.left - margin.right;
    const rowHeight = 40;
    const height = sortedData.length * rowHeight;

    const svg = select(chartRef.current)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const allTimestamps = sortedData.flatMap((d) =>
      d.timeSeries.map((ts) => ts.ts)
    );
    const xExtent = extent(allTimestamps);
    const xScale = scaleTime().domain(xExtent).range([0, width]);

    const yScale = scaleBand()
      .domain(sortedData.map((d) => d.name))
      .range([0, height])
      .padding(0.2);

    // Custom axis formatter - show day at midnight, time otherwise
    const formatTime = (date) => {
      const isMidnight = date.getHours() === 0 && date.getMinutes() === 0;
      return isMidnight
        ? timeFormat("%a %-m/%-d")(date)
        : timeFormat("%-I %p")(date);
    };

    // Custom function to generate ticks at reasonable intervals
    const generateTicks = (scale) => {
      const [start, end] = scale.domain();
      const range = end - start;
      const dayInMs = 24 * 60 * 60 * 1000;

      // If time range is less than 2 days, show every 6 hours
      if (range <= 2 * dayInMs) {
        return scale.ticks(8); // Approximately every 6 hours
      }
      // If time range is less than 7 days, show daily
      else if (range <= 7 * dayInMs) {
        return scale.ticks(7); // Daily ticks
      }
      // For longer ranges, show every other day
      else {
        return scale.ticks(Math.ceil(range / (2 * dayInMs)));
      }
    };

    const xAxis = axisTop(xScale)
      .tickFormat(formatTime)
      .tickValues(generateTicks(xScale));

    svg
      .append("g")
      .attr("class", "x-axis")
      // .attr("transform", `translate(0, ${height})`)
      .call(xAxis)
      .selectAll(".tick text")
      .style("font-size", "10px");

    // Remove y-axis ticks
    svg
      .append("g")
      .attr("class", "y-axis")
      .call(axisLeft(yScale).tickSizeOuter(0).tickSize(0).tickFormat(""));

    const color = scaleOrdinal(schemeCategory10);

    // Add name and score labels
    svg
      .selectAll(".name-label")
      .data(sortedData)
      .enter()
      .append("text")
      .attr("class", "name-label")
      .attr("x", -180)
      .attr("y", (d) => yScale(d.name) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "left")
      .text((d) => d.name);

    svg
      .selectAll(".score-label")
      .data(sortedData)
      .enter()
      .append("text")
      .attr("class", "score-label")
      .attr("x", -30)
      .attr("y", (d) => yScale(d.name) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "right")
      .text((d) => humanizeNumber(d.score, 2));

    // Add bars
    sortedData.forEach((country) => {
      svg
        .selectAll(`.bar-${country.entityCode}`)
        .data(country.timeSeries)
        .enter()
        .append("rect")
        .attr("class", `bar bar-${country.entityCode}`)
        .attr("x", (d) => xScale(d.ts) - 3)
        .attr("y", () => yScale(country.name))
        .attr("width", 6)
        .attr("height", yScale.bandwidth())
        .attr("fill", color(country.name));
    });
  }, [sortedData, containerWidth]);

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => setSortCriterion("name")}>
          Sort by Country Name
        </button>
        <button onClick={() => setSortCriterion("score")}>
          Sort by Score Value
        </button>
      </div>
      <div ref={chartRef} style={styles.chartContainer}>
        {/* Add the sticky header */}
        <div style={styles.header}>
          <div style={styles.headerItem}>Country</div>
          <div
            style={{ ...styles.headerItem, width: "150px", textAlign: "right" }}
          >
            Score
          </div>
          <div
            style={{ ...styles.headerItem, flexGrow: 1, textAlign: "center" }}
          >
            Time Series
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryWithTSChart;
