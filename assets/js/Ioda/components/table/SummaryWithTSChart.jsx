// SummaryWithTSChart.jsx
import React, { useRef, useEffect, useState } from "react";
import { select } from "d3-selection";
import { scaleTime, scaleBand } from "d3-scale";
import { extent, ascending, descending } from "d3-array";
import { axisTop, axisLeft } from "d3-axis";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import { scaleOrdinal } from "d3-scale";
import countryData from "../../constants/countries.json";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
// import { Button } from "antd";

//helper: emoji flag map
const countryFlagMap = countryData.reduce((acc, country) => {
  acc[country.code] = country.emoji;
  return acc;
}, {});
function wrap(text, width) {
  text.each(function () {
    const textElement = select(this);
    const words = textElement.text().split(/\s+/).reverse();
    let line = [];
    let lineNumber = 0;
    const lineHeight = 1.1;
    const y = textElement.attr("y") || 0;
    const dy = parseFloat(textElement.attr("dy")) || 0;

    // Clear existing text
    textElement.text(null);

    // Create first tspan
    let tspan = textElement
      .append("tspan")
      .attr("x", 0)
      .attr("y", y)
      .attr("dy", dy + "em");

    while (words.length) {
      const word = words.pop();
      line.push(word);
      tspan.text(line.join(" "));

      if (tspan.node().getComputedTextLength() > width && line.length > 1) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = textElement
          .append("tspan")
          .attr("x", 0)
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
  });
}
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
  container: {
    display: "flex",
    flexDirection: "column",
    border: "1px solid #ddd",
    maxHeight: "500px",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    position: "sticky",
    top: 0,
    backgroundColor: "white",
    zIndex: 100,
    borderBottom: "1px solid #ddd",
  },
  countryScoreHeader: {
    width: "220px",
    padding: "10px",
    borderRight: "1px solid #ddd",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    // justifyContent: "space-between",
    justifyContent: "flex-end", // Vertically center content
  },
  timeseriesHeaderContainer: {
    flex: 1,
    minWidth: "600px",
    display: "flex",
    flexDirection: "column",
  },
  timeseriesHeader: {
    padding: "10px 20px",
    textAlign: "center",
    fontWeight: "bold",
  },
  xAxisContainer: {
    height: "30px",
    overflow: "visible",
    backgroundColor: "white",
    paddingBottom: 0, // Remove any padding
  },
  scrollContainer: {
    display: "flex",
    overflow: "auto",
    flex: 1,
  },
  countryScoreList: {
    width: "220px",
    borderRight: "1px solid #ddd",
    flexShrink: 0,
  },
  countryScoreRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px",
    height: "40px",
    alignItems: "center",
    borderBottom: "1px solid #eee",
  },
  timeseriesWrapper: {
    flex: 1,
    position: "relative",
    minWidth: "600px",
  },
  timeseriesHeaderContainer: {
    flex: 1,
    minWidth: "600px",
    display: "flex",
    flexDirection: "column",
    position: "relative", // Add this
  },
  xAxisContainer: {
    height: "30px",
    overflow: "hidden", // Change from 'visible' to 'hidden'
    backgroundColor: "white",
    position: "relative",
    marginTop: "auto", // This pushes it to bottom
  },
  xAxisSvg: {
    display: "block",
    overflow: "visible",
    position: "absolute",
    bottom: 0, // Position at bottom of container
    left: 0,
  },
  iconButtonStyle: {
    background: "none",
    border: "none",
    padding: 0,
    marginLeft: "4px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
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
  const scrollContainerRef = useRef(null); // Add this line
  // const [sortCriterion, setSortCriterion] = useState("score");
  const [sortConfig, setSortConfig] = useState({
    criterion: "score",
    directions: {
      name: "asc",
      score: "desc",
    },
  });
  const tooltipRef = useRef(null);

  const xAxisRef = useRef(null);

  // const sortedData = [...data].sort((a, b) =>
  //   sortCriterion === "name"
  //     ? ascending(a.name, b.name)
  //     : descending(a.score, b.score)
  // );
  // const sortedData = [...data].sort((a, b) => {
  //   const { criterion, direction } = sortConfig;
  //   const valA = criterion === "name" ? a.name : a.score;
  //   const valB = criterion === "name" ? b.name : b.score;
  //   return direction === "asc" ? ascending(valA, valB) : descending(valA, valB);
  // });
  const sortedData = [...data].sort((a, b) => {
    const { criterion, directions } = sortConfig;
    const valA = criterion === "name" ? a.name : a.score;
    const valB = criterion === "name" ? b.name : b.score;
    return directions[criterion] === "asc"
      ? ascending(valA, valB)
      : descending(valA, valB);
  });

  useEffect(() => {
    select(chartRef.current).select("svg").remove();
    select(xAxisRef.current).select("svg").remove();
    if (!sortedData?.length || !scrollContainerRef.current) return;

    // Calculate available width for timeseries
    const timeseriesWidth = scrollContainerRef.current.offsetWidth - 220; // minus left column
    const rowHeight = 40;
    const height = sortedData.length * rowHeight;

    const margin = { top: 0, right: 20, bottom: 10, left: 0 };
    const width = timeseriesWidth - margin.left - margin.right;

    const svg = select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const allTimestamps = sortedData.flatMap((d) =>
      d.timeSeries.map((ts) => ts.ts)
    );
    const xExtent = extent(allTimestamps);
    const xScale = scaleTime().domain(xExtent).range([0, width]);
    // Create separate x-axis SVG
    const xAxisSvg = select(xAxisRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", "30px")
      .style("overflow", "hidden") // Prevent container scrolling
      .style("bottom", "0") // Stick to bottom
      .append("g")
      .attr("transform", `translate(${margin.left}, 30)`); // Adjust vertical position

    const yScale = scaleBand()
      .domain(sortedData.map((d) => d.name))
      .range([0, height])
      .padding(0.2);

    // Custom axis formatter - show day at midnight, time otherwise
    const formatTime = (date) => {
      const utcDate = new Date(
        date.getTime() + date.getTimezoneOffset() * 60000
      );
      const isMidnight =
        utcDate.getUTCHours() === 0 && utcDate.getUTCMinutes() === 0;
      return isMidnight
        ? timeFormat("%a %-m/%-d")(utcDate)
        : timeFormat("%-I %p")(utcDate);
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
      .tickValues(generateTicks(xScale))
      .tickSizeOuter(0)
      .tickSize(4); // Shorten tick lines
    // Calculate approximate tick spacing for wrapping
    const tickPositions = generateTicks(xScale);
    const tickSpacing =
      tickPositions.length > 1
        ? xScale(tickPositions[1]) - xScale(tickPositions[0])
        : width;
    xAxisSvg
      .append("g")
      .attr("class", "x-axis")
      .call(xAxis)
      .selectAll(".tick text")
      .style("font-size", "10px")
      .style("text-anchor", "middle") // Center labels
      .call(wrap, tickSpacing * 0.8); // Use 80% of tick spacing for wrapping

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
    svg
      .selectAll("line.grid-line")
      .data(tickPositions)
      .enter()
      .append("line")
      .attr("class", "grid-line")
      .attr("x1", (d) => xScale(d))
      .attr("x2", (d) => xScale(d))
      .attr("y1", 0)
      .attr("y2", height) // height of the timeseries area
      .attr("stroke", "#f0f0f0")
      .attr("stroke-width", 1);

    // Add bars only (remove axis and labels)
    sortedData.forEach((country) => {
      svg
        .selectAll(`.bar-${country.entityCode}`)
        .data(country.timeSeries)
        .enter()
        .append("rect")
        .attr("class", `bar bar-${country.entityCode}`)
        .attr("x", (d) => xScale(d.ts) - 3)
        .attr("y", () => yScale(country.name))
        .attr("width", 4)
        .attr("height", yScale.bandwidth() / 1.5)
        .attr("fill", color(country.name))
        .on("mouseover", function (event, d) {
          select(this).attr("fill", "#d6d6d6");
          const tooltip = tooltipRef.current;
          tooltip.style.visibility = "visible";
          tooltip.innerHTML = `
            <strong> ${country.name}</strong><br/>
            Score: ${country.score}<br/>
            Time: ${new Date(d.ts).toUTCString()}
          `;
        })
        .on("mousemove", function (event) {
          const tooltip = tooltipRef.current;
          tooltip.style.left = event.pageX + 10 + "px";
          tooltip.style.top = event.pageY + 10 + "px";
        })
        .on("mouseout", function () {
          select(this).attr("fill", color(country.name)); // Restore original color
          const tooltip = tooltipRef.current;
          tooltip.style.visibility = "hidden";
        });
    });
  }, [sortedData, containerWidth]);

  return (
    <div>
      <div style={styles.container}>
        {/* Header row - stays fixed during scrolling */}
        <div style={styles.header}>
          {/* Left column header */}
          <div style={styles.countryScoreHeader}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div
                style={{
                  width: "160px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span>NAME</span>
                <button
                  onClick={() =>
                    setSortConfig((prev) => {
                      const newDirection =
                        prev.directions.name === "asc" ? "desc" : "asc";
                      return {
                        criterion: "name",
                        directions: {
                          ...prev.directions,
                          name: newDirection,
                        },
                      };
                    })
                  }
                  style={styles.iconButtonStyle}
                >
                  {sortConfig.directions.name === "asc" ? (
                    <UpOutlined
                      style={{
                        ...styles.iconStyle,
                        color:
                          sortConfig.criterion === "name"
                            ? "#1890ff"
                            : "#d9d9d9",
                      }}
                    />
                  ) : (
                    <DownOutlined
                      style={{
                        ...styles.iconStyle,
                        color:
                          sortConfig.criterion === "name"
                            ? "#1890ff"
                            : "#d9d9d9",
                      }}
                    />
                  )}
                </button>
              </div>
              <div
                style={{
                  width: "50px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "right",
                }}
              >
                <span>SCORE</span>
                <button
                  onClick={() =>
                    setSortConfig((prev) => {
                      const newDirection =
                        prev.directions.score === "asc" ? "desc" : "asc";
                      return {
                        criterion: "score",
                        directions: {
                          ...prev.directions,
                          score: newDirection,
                        },
                      };
                    })
                  }
                  style={styles.iconButtonStyle}
                >
                  {sortConfig.directions.score === "asc" ? (
                    <UpOutlined
                      style={{
                        ...styles.iconStyle,
                        color:
                          sortConfig.criterion === "score"
                            ? "#1890ff"
                            : "#d9d9d9",
                      }}
                    />
                  ) : (
                    <DownOutlined
                      style={{
                        ...styles.iconStyle,
                        color:
                          sortConfig.criterion === "score"
                            ? "#1890ff"
                            : "#d9d9d9",
                      }}
                    />
                  )}
                </button>
              </div>
            </div>
            {/* Empty space to match height */}
            {/* <div style={{ height: "30px" }}></div> */}
          </div>

          {/* Right column header with timeseries title and x-axis */}
          <div style={styles.timeseriesHeaderContainer}>
            <div style={styles.timeseriesHeader}>TIME (UTC)</div>
            <div
              style={{ ...styles.xAxisContainer, marginTop: 0 }}
              ref={xAxisRef}
            ></div>
          </div>
        </div>
        <div
          ref={tooltipRef}
          style={{
            position: "absolute",
            pointerEvents: "none",
            backgroundColor: "white",
            border: "1px solid #ccc",
            padding: "5px 8px",
            fontSize: "12px",
            borderRadius: "4px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            visibility: "hidden",
            zIndex: 999,
          }}
        />

        {/* Scrollable content - both sections scroll together */}
        <div style={styles.scrollContainer} ref={scrollContainerRef}>
          {/* Left column - Country & Score */}
          <div style={styles.countryScoreList}>
            {sortedData.map((d) => (
              <div key={d.entityCode} style={styles.countryScoreRow}>
                <div style={{ width: "160px" }}>
                  {d.entityType === "country"
                    ? countryFlagMap[d.entityCode] || ""
                    : ""}{" "}
                  {d.name}
                </div>
                <div style={{ width: "50px", textAlign: "right" }}>
                  {humanizeNumber(d.score, 2)}
                </div>
              </div>
            ))}
          </div>

          {/* Right column - Timeseries */}
          <div style={styles.timeseriesWrapper}>
            <div
              ref={chartRef}
              style={{ height: `${sortedData.length * 40}px` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryWithTSChart;
