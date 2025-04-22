// SummaryWithTSChart.jsx
import React, { useRef, useEffect, useState } from "react";
import { select } from "d3-selection";
import { scaleTime, scaleBand } from "d3-scale";
import { extent, ascending, descending } from "d3-array";
import { axisTop, axisLeft } from "d3-axis";
import { format } from "d3-format";
import { timeFormat, utcFormat } from "d3-time-format";
import { scaleOrdinal } from "d3-scale";
import countryData from "../../constants/countries.json";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
// import { Button } from "antd";
import { getEntityScaleColor } from "../../utils/mapColors";
import { Link } from "react-router-dom";
import { getDateRangeFromUrl, hasDateRangeInUrl } from "../../utils/urlUtils";
//helper: emoji flag map
const countryFlagMap = countryData.reduce((acc, country) => {
  acc[country.code] = country.emoji;
  return acc;
}, {});
//helper: color conversion
function convertHexToRgba(hex, alpha = 1) {
  let r = 0,
    g = 0,
    b = 0;
  hex = hex.replace("#", "");

  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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
    fontSize: "10px",
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
  scoreTooltipStyles: {
    position: "absolute",
    pointerEvents: "none",
    backgroundColor: "white",
    border: "1px solid #ccc",
    padding: "8px 12px",
    fontSize: "12px",
    borderRadius: "4px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    visibility: "hidden",
    zIndex: 999,
    maxWidth: "300px",
    whiteSpace: "pre-wrap", // Preserve formatting
  },
};

function humanizeNumber(value, precisionDigits = 2) {
  return format(
    (isNaN(precisionDigits) ? "" : "." + precisionDigits) +
      (Math.abs(value) < 1 ? "r" : "s")
  )(value);
}

const SummaryWithTSChart = ({
  data,
  width: containerWidth = 1000,
  from,
  until,
}) => {
  const { urlFromDate, urlUntilDate } = getDateRangeFromUrl();
  const dateRangeInUrl = hasDateRangeInUrl();
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
  // Add near your existing tooltipRef
  const scoreTooltipRef = useRef(null);

  // Add these styles to your styles object
  const tooltipStyles = {
    timeseries: {
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
    },
    score: {
      position: "absolute",
      pointerEvents: "none",
      backgroundColor: "white",
      border: "1px solid #ccc",
      padding: "8px 12px",
      fontSize: "12px",
      borderRadius: "4px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      visibility: "hidden",
      zIndex: 999,
      maxWidth: "300px",
      whiteSpace: "pre-wrap",
    },
  };

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
    // const xExtent = extent(allTimestamps);
    const xExtent = [
      new Date(from * 1000).setUTCHours(0, 0, 0, 0),
      new Date(until * 1000).setUTCHours(23, 59, 59, 999),
    ];
    const totalRangeDays = (xExtent[1] - xExtent[0]) / (1000 * 60 * 60 * 24);
    const xScale = scaleTime().domain(xExtent).range([0, width]);
    // Create separate x-axis SVG
    const xAxisSvg = select(xAxisRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", "30px")
      .style("overflow", "visible") // Change to visible
      .append("g")
      .attr("transform", `translate(${margin.left}, 30)`); // Changed y position to 0

    const yScale = scaleBand()
      .domain(sortedData.map((d) => d.name))
      .range([0, height])
      .padding(0.2);

    // const formatTime = (date) => {
    //   const utcDate = new Date(date.getTime());
    //   const hours = utcDate.getUTCHours();
    //   console.log("hours:", hours);
    //   if (totalRangeDays > 4) {
    //     // Only label 12 AM
    //     if (hours === 0) {
    //       return timeFormat.utc("%a %-m/%-d")(utcDate); // e.g., "Mon 4/15"
    //     }
    //     return null;
    //   }
    //   // Midnight gets date format
    //   if (hours === 0) {
    //     return timeFormat.utc("%a %-m/%-d")(utcDate); // "Mon 4/15"
    //   }
    //   // 6AM/6PM get simple time format
    //   else if (hours === 6 || hours === 18) {
    //     return timeFormat.utc("6 %p")(utcDate); // "6 AM" or "6 PM"
    //   }
    //   // Noon gets special format
    //   else if (hours === 12) {
    //     return "12 PM";
    //   }

    //   return null; // All other hours get no label
    // };
    const formatTime = (date) => {
      // Create UTC formatters
      const utcDayFormat = utcFormat("%a %-m/%-d"); // For day labels
      const utcTimeFormat = utcFormat("%-I %p"); // For time labels

      const hours = date.getUTCHours();

      if (totalRangeDays > 4) {
        // Only label 12 AM UTC
        if (hours === 0) {
          return utcDayFormat(date);
        }
        return null;
      }
      // Midnight gets date format
      if (hours === 0) {
        return utcDayFormat(date);
      }
      // 6AM/6PM get simple time format
      else if (hours === 6 || hours === 18) {
        return utcTimeFormat(date);
      }
      // Noon gets special format
      else if (hours === 12) {
        return "12 PM";
      }
      return null;
    };

    // Custom function to generate ticks at reasonable intervals
    // const generateTicks = (scale) => {
    //   const [start, end] = scale.domain();
    //   const ticks = [];

    //   // Round to nearest 6-hour interval
    //   let current = new Date(start);
    //   current.setUTCHours(Math.ceil(current.getUTCHours() / 6) * 6, 0, 0, 0);

    //   while (current <= end) {
    //     ticks.push(new Date(current));
    //     current = new Date(current.getTime() + 6 * 60 * 60 * 1000);
    //   }

    //   return ticks;
    // };
    const generateTicks = (scale) => {
      const [start, end] = scale.domain();
      const ticks = [];

      let current = new Date(start);
      if (totalRangeDays > 4) {
        // Align to next 12AM UTC
        current.setUTCHours(0, 0, 0, 0);
        while (current <= end) {
          ticks.push(new Date(current));
          current.setUTCDate(current.getUTCDate() + 1); // 1-day steps
        }
      } else {
        // 6-hour intervals for shorter ranges
        current.setUTCHours(Math.ceil(current.getUTCHours() / 6) * 6, 0, 0, 0);
        while (current <= end) {
          ticks.push(new Date(current));
          current = new Date(current.getTime() + 6 * 60 * 60 * 1000);
        }
      }

      return ticks;
    };

    const xAxis = axisTop(xScale)
      .tickFormat((d) => {
        console.log("unformatted time:", d);
        const formatted = formatTime(d);
        console.log("formatted time:", formatted);
        return formatted === null ? "" : formatted;
      })
      .tickValues(generateTicks(xScale)) // Use our custom ticks
      .tickSizeOuter(0)
      .tickSize(4);

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
      .style("text-anchor", "middle")
      .filter((d) => formatTime(d) !== null) // Only keep ticks we want to show
      .call(wrap, tickSpacing * 0.95); // Wrap labels

    // Remove y-axis ticks
    svg
      .append("g")
      .attr("class", "y-axis")
      .call(axisLeft(yScale).tickSizeOuter(0).tickSize(0).tickFormat(""));

    // const color = scaleOrdinal(schemeCategory10);

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

    // svg
    //   .selectAll(".score-label")
    //   .data(sortedData)
    //   .enter()
    //   .append("text")
    //   .attr("class", "score-label")
    //   .attr("x", -30)
    //   .attr("y", (d) => yScale(d.name) + yScale.bandwidth() / 2)
    //   .attr("dy", "0.35em")
    //   .attr("text-anchor", "right")
    //   .text((d) => humanizeNumber(d.score, 2));
    svg
      .selectAll(".score-label")
      .data(sortedData)
      .enter()
      .append("g")
      .attr(
        "transform",
        (d) => `translate(-30,${yScale(d.name) + yScale.bandwidth() / 2})`
      )
      .each(function (d) {
        const group = select(this);
        const color = getEntityScaleColor(d.score, "country") || "#d0d0d0";

        // Add rectangle background
        group
          .append("rect")
          .attr("width", 50)
          .attr("height", 20)
          .attr("x", -25)
          .attr("y", -10)
          .attr("rx", 4)
          .attr("fill", color)
          .attr("opacity", 0.5)
          .attr("stroke", color)
          .attr("stroke-width", 0.7)
          .attr("stroke-opacity", 1)
          .on("mouseover", function (event) {
            const tooltip = scoreTooltipRef.current;
            tooltip.style.visibility = "visible";

            const scoresDetails = d.scores
              .map(
                (score) => `${score.source}: ${humanizeNumber(score.score, 2)}`
              )
              .join("\n");

            tooltip.innerHTML = `
            <strong>${d.name}</strong><br/>
            <strong>Overall score:</strong> ${humanizeNumber(d.score, 2)}<br/>
            <strong>Score components:</strong><br/>
            ${scoresDetails}
          `;
            tooltip.style.left = `${event.pageX + 10}px`;
            tooltip.style.top = `${event.pageY + 10}px`;
          })
          .on("mousemove", function (event) {
            const tooltip = scoreTooltipRef.current;
            tooltip.style.left = `${event.pageX + 10}px`;
            tooltip.style.top = `${event.pageY + 10}px`;
          })
          .on("mouseout", function () {
            const tooltip = scoreTooltipRef.current;
            tooltip.style.visibility = "hidden";
          });

        // Add text on top
        group
          .append("text")
          .attr("dy", "0.35em")
          .attr("text-anchor", "middle")
          .style("font-size", "10px")
          .style("fill", "#000")
          .text(humanizeNumber(d.score, 2));
      });

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
        // .attr("x", (d) => xScale(new Date(d.ts * 1000)) - 3)
        .attr("y", () => yScale(country.name))
        .attr("width", 6)
        .attr("height", yScale.bandwidth() / 1.5)
        .attr(
          "fill",
          getEntityScaleColor(country.score, "country") || "#d0d0d0"
        )
        .on("mouseover", function (event, d) {
          select(this).attr("fill", "#e8e9eb");
          const tooltip = tooltipRef.current;
          tooltip.style.visibility = "visible";
          // Use UTC date formatting here too
          const utcTooltipFormat = utcFormat("%b %d, %H:%M UTC");
          tooltip.innerHTML = `
            <strong> ${country.name}</strong><br/>
            Score: ${country.score}<br/>
            Time: ${utcTooltipFormat(new Date(d.ts))}
          `;
        })
        .on("mousemove", function (event) {
          const tooltip = tooltipRef.current;
          tooltip.style.left = event.pageX + 10 + "px";
          tooltip.style.top = event.pageY + 10 + "px";
        })
        .on("mouseout", function () {
          select(this).attr(
            "fill",
            getEntityScaleColor(country.score, "country") || "#d0d0d0"
          ); // Restore original color
          const tooltip = tooltipRef.current;
          tooltip.style.visibility = "hidden";
        });
    });
  }, [sortedData, containerWidth]);

  return (
    <div>
      <h3
        style={{
          fontSize: "20px",
          fontWeight: "600",
          marginBottom: "8px",
          marginTop: "16px",
          paddingLeft: "4px",
        }}
      >
        All Countries Outage Timeline
      </h3>
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
                  fontSize: "10px",
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
                  fontSize: "10px",
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
        <div ref={tooltipRef} style={tooltipStyles.timeseries} />
        <div ref={scoreTooltipRef} style={tooltipStyles.score} />

        {/* Scrollable content - both sections scroll together */}
        <div style={styles.scrollContainer} ref={scrollContainerRef}>
          {/* Left column - Country & Score */}
          <div style={styles.countryScoreList}>
            {sortedData.map((d) => (
              <div key={d.entityCode} style={styles.countryScoreRow}>
                {/*     const linkPath = dateRangeInUrl
      ? `/${d.entityType}/${d.entityCode}?from=${urlFromDate}&until=${urlUntilDate}`
      : `/${d.entityType}/${d.entityCode}`; */}
                <Link
                  to={`/${d.entityType}/${d.entityCode}${
                    dateRangeInUrl
                      ? `?from=${urlFromDate}&until=${urlUntilDate}`
                      : ""
                  }`}
                >
                  <div style={{ width: "140px", fontSize: "11px" }}>
                    {d.entityType === "country"
                      ? countryFlagMap[d.entityCode] || ""
                      : ""}{" "}
                    {d.name}
                  </div>
                </Link>
                {/* <div style={{ width: "50px", textAlign: "right" }}>
                  {humanizeNumber(d.score, 2)}
                </div> */}
                <div style={{ width: "50px", textAlign: "right" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "50px",
                      height: "20px",
                      position: "relative",
                    }}
                    onMouseOver={(e) => {
                      const tooltip = scoreTooltipRef.current;
                      tooltip.style.visibility = "visible";

                      const scoresDetails = d.scores
                        .map(
                          (score) =>
                            `${score.source}: ${humanizeNumber(score.score, 2)}`
                        )
                        .join("\n");

                      tooltip.innerHTML = `
                        <strong>Overall score: </strong> ${humanizeNumber(
                          d.score,
                          2
                        )}<br/>
                        ${scoresDetails}
                      `;
                      tooltip.style.left = `${e.pageX + 10}px`;
                      tooltip.style.top = `${e.pageY + 10}px`;
                    }}
                    onMouseMove={(e) => {
                      const tooltip = scoreTooltipRef.current;
                      tooltip.style.left = `${e.pageX + 10}px`;
                      tooltip.style.top = `${e.pageY + 10}px`;
                    }}
                    onMouseOut={() => {
                      const tooltip = scoreTooltipRef.current;
                      tooltip.style.visibility = "hidden";
                    }}
                  >
                    {/* Background rectangle with opacity */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: convertHexToRgba(
                          getEntityScaleColor(d.score, "country") || "#d0d0d0",
                          0.5
                        ),
                        borderRadius: "2px",
                        zIndex: 1,
                        border: "1.5px solid", // Thin opaque black border
                        borderColor:
                          getEntityScaleColor(d.score, "country") || "#d0d0d0",
                        //   getEntityScaleColor(d.score, "country") || "#d0d0d0",
                        boxSizing: "border-box", // Ensures border is drawn inside
                      }}
                    ></div>

                    {/* Text (fully opaque) */}
                    <span
                      style={{
                        position: "relative",
                        display: "inline-block",
                        padding: "2px 6px",
                        fontSize: "10px",
                        color: "#000",
                        zIndex: 2,
                        textAlign: "center",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {humanizeNumber(d.score, 2)}
                    </span>
                  </div>
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
