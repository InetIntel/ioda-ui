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
import { NavLink } from "react-router-dom";
import { getDateRangeFromUrl, hasDateRangeInUrl } from "../../utils/urlUtils";
import iconAsc from "images/icons/icon-asc.png";
import iconDesc from "images/icons/icon-desc.png";
import iconSortUnsort from "images/icons/icon-sortUnsort.png";
const FONT_SIZE = 14; // default text
const SCORE_FONT_SIZE = 12; // the little score badge
const HEADER_HEIGHT = 50; // same height you get from 10 px + 14 px + 10 px
const HEADER_BASELINE = 24; // the 14-px font sits on this baseline
const ROW_HEIGHT = 58;
//helper: emoji flag map
const countryFlagMap = countryData.reduce((acc, country) => {
  acc[country.code] = country.emoji;
  return acc;
}, {});
const getFlagEmoji = (d) => {
  if (d.entityType === "country") return countryFlagMap[d.entityCode] ?? "";
  if (d.entityType === "region") return countryFlagMap[d.countryCode] ?? "";
  return "";
};
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
    border: "2px solid #ddd",
    maxHeight: "500px",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    position: "sticky",
    top: 0,
    backgroundColor: "white",
    zIndex: 100,
    borderBottom: "2px solid #ddd",
  },
  countryScoreHeader: {
    width: "240px",
    // padding: "10px",
    padding: `${HEADER_BASELINE - FONT_SIZE}px 10px 0 10px`,
    borderRight: "2px solid #ddd",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    // justifyContent: "space-between",
    justifyContent: "flex-end", // Vertically center content
  },
  timeseriesHeader: {
    padding: "10px 20px",
    textAlign: "center",
    // fontWeight: "bold",
    // fontSize: "10px",
  },
  scrollContainer: {
    display: "flex",
    overflow: "auto",
    flex: 1,
  },
  countryScoreList: {
    width: "240px",
    // borderRight: "2px solid #ddd",
    flexShrink: 0,
  },
  countryScoreRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px",
    height: `${ROW_HEIGHT}px`,
    alignItems: "center",
    borderBottom: "2px solid #eee",
    borderRight: "2px solid #ddd",
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
    padding: 2,
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

/** Returns the right icon element for a column */
const getSortIcon = (column, sortConfig) => {
  const isActive = sortConfig.criterion === column;
  const dir = sortConfig.directions[column]; // "asc" | "desc"
  let src,
    alt,
    extraStyle = {};

  if (isActive) {
    src = dir === "asc" ? iconAsc : iconDesc;
    alt = dir === "asc" ? "ascending" : "descending";
  } else {
    src = iconSortUnsort;
    alt = "unsorted";
    extraStyle.opacity = 0.35;
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{ width: 22, height: 22, pointerEvents: "none", ...extraStyle }}
    />
  );
};

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
      padding: "4px 4px",
      fontSize: "12px",
      borderRadius: "4px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      visibility: "hidden",
      zIndex: 999,
      maxWidth: "300px",
      whiteSpace: "normal",
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
    const timeseriesWidth = scrollContainerRef.current.offsetWidth - 240; // minus left column
    const rowHeight = ROW_HEIGHT;
    const height = sortedData.length * rowHeight;

    const margin = { top: 0, right: 10, bottom: 10, left: 40 };
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
      // new Date(from * 1000).setUTCHours(0, 0, 0, 0),
      // new Date(until * 1000).setUTCHours(23, 59, 59, 999),
      new Date(from * 1000),
      new Date(until * 1000),
    ];
    const totalRangeDays = (xExtent[1] - xExtent[0]) / (1000 * 60 * 60 * 24);
    const xScale = scaleTime()
      .domain(xExtent)
      .range([FONT_SIZE * 2, width - FONT_SIZE * 2]);
    // Create separate x-axis SVG
    const xAxisSvg = select(xAxisRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      // .attr("height", "30px")
      .attr("height", HEADER_HEIGHT)
      .style("overflow", "visible") // Change to visible
      .append("g")
      // .attr("transform", `translate(${margin.left}, 30)`); // Changed y position to 0
      .attr("transform", `translate(${margin.left}, ${HEADER_BASELINE})`);

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
      // .tickSize(4);
      .tickSize(0);

    // Calculate approximate tick spacing for wrapping
    const tickPositions = generateTicks(xScale);
    const tickSpacing =
      tickPositions.length > 1
        ? xScale(tickPositions[1]) - xScale(tickPositions[0])
        : width;

    // xAxisSvg
    //   .append("g")
    //   .attr("class", "x-axis")
    //   .call(xAxis)
    //   .selectAll(".tick text")
    //   .style("font-size", "10px")
    //   .style("text-anchor", "middle")
    //   .filter((d) => formatTime(d) !== null) // Only keep ticks we want to show
    //   .call(wrap, tickSpacing * 0.95); // Wrap labels
    xAxisSvg
      .append("g")
      .attr("class", "x-axis")
      .call(xAxis.tickSize(0).tickSizeOuter(0))
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll(".tick line").remove())
      .call(
        (g) =>
          g
            .selectAll(".tick text")
            .attr("dy", "0") // baseline-align text
            .style("font-size", `${FONT_SIZE}px`) // keep the 14 px size
      )
      .attr("font-size", `${FONT_SIZE}px`)
      .call((g) =>
        g.selectAll(".tick").each(function (d) {
          const isDay = d.getUTCHours() === 0; // midnight UTC
          select(this)
            .selectAll("text")
            .style("font-size", `${FONT_SIZE}px`)
            .style("fill", isDay ? "#000000" : "#8c8c8c");
        })
      );

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
        .attr("height", yScale.bandwidth() / 2)
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
                                  <div style="font-size: ${FONT_SIZE}px;">
            <strong> ${country.name}</strong><br/>
            Score: ${country.score}<br/>
            Time: ${utcTooltipFormat(new Date(d.ts))}
                                    </div>
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
    <div style={{ fontSize: `${FONT_SIZE}px` }}>
      {/* all existing markup stays the same */}
      {/* <h3
        style={{
          fontSize: "20px",
          fontWeight: "600",
          marginBottom: "8px",
          marginTop: "16px",
          paddingLeft: "4px",
        }}
      >
        All Countries Outage Timeline
      </h3> */}
      <div style={styles.container}>
        {/* Header row - stays fixed during scrolling */}
        <div style={styles.header}>
          {/* Left column header */}
          <div style={styles.countryScoreHeader}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div
                style={{
                  width: "160px",
                  // fontWeight: "bold",
                  // fontSize: "10px",
                  fontSize: `${FONT_SIZE}px`,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span>NAME</span>
                {/* <button
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
                </button> */}
                <button
                  onClick={() =>
                    setSortConfig((prev) => {
                      // If we clicked the column that is already active, just flip the direction
                      if (prev.criterion === "name") {
                        const newDir =
                          prev.directions.name === "asc" ? "desc" : "asc";
                        return {
                          ...prev,
                          directions: { ...prev.directions, name: newDir },
                        };
                      }
                      // Otherwise activate this column, keep its last direction or default to asc
                      return { ...prev, criterion: "name" };
                    })
                  }
                  style={styles.iconButtonStyle}
                >
                  {getSortIcon("name", sortConfig)}
                </button>
              </div>
              <div
                style={{
                  width: "80px",
                  // fontWeight: "bold",
                  // fontSize: "10px",
                  fontSize: `${FONT_SIZE}px`,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span>SCORE</span>
                {/* <button
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
                </button> */}
                <button
                  onClick={() =>
                    setSortConfig((prev) => {
                      // If we clicked the column that is already active, just flip the direction
                      if (prev.criterion === "score") {
                        const newDir =
                          prev.directions.score === "asc" ? "desc" : "asc";
                        return {
                          ...prev,
                          directions: { ...prev.directions, score: newDir },
                        };
                      }
                      // Otherwise activate this column, keep its last direction or default to asc
                      return { ...prev, criterion: "score" };
                    })
                  }
                  style={styles.iconButtonStyle}
                >
                  {getSortIcon("score", sortConfig)}
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
                <div style={{ width: "140px" }}>
                  <Link
                    to={`/${d.entityType}/${d.entityCode}${
                      dateRangeInUrl
                        ? `?from=${urlFromDate}&until=${urlUntilDate}`
                        : ""
                    }`}
                    style={{ textDecoration: "none" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.textDecoration = "underline")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.textDecoration = "none")
                    }
                  >
                    {/* {d.entityType === "country"
                      ? countryFlagMap[d.entityCode] || ""
                      : ""}{" "}
                    {d.name} */}
                    {getFlagEmoji(d)} {d.name}
                  </Link>
                </div>
                {/* <div style={{ width: "50px", textAlign: "right" }}>
                  {humanizeNumber(d.score, 2)}
                </div> */}
                <div style={{ width: "70px", textAlign: "center" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "50px",
                      height: "30px",
                      // padding: "6px 8px",
                      position: "relative",
                    }}
                    onMouseOver={(e) => {
                      const tooltip = scoreTooltipRef.current;
                      tooltip.style.visibility = "visible";

                      // Create table rows for score components
                      const scoresDetails = d.scores
                        .map(
                          (score) => `
                          <tr>
                            <td style="text-align: left; padding-right: 10px;">${
                              score.source
                            }</td>
                            <td style="text-align: right;">${humanizeNumber(
                              score.score,
                              2
                            )}</td>
                          </tr>
                        `
                        )
                        .join("");

                      tooltip.innerHTML = `
                        <div style="font-size: ${FONT_SIZE}px; margin: 0; padding: 0;">
                          <table style="width: auto; border-collapse: collapse; margin: 0; padding: 0;">
                            <tbody>
                              <tr>
                                <td style="text-align: left; padding: 0 6px 0 0;"><strong>Overall score</strong></td>
                                <td style="text-align: right; padding: 0;">${humanizeNumber(
                                  d.score,
                                  2
                                )}</td>
                              </tr>
                              ${d.scores
                                .map(
                                  (score) => `
                                <tr>
                                  <td style="text-align: left; padding: 0 6px 0 0;">${
                                    score.source
                                  }</td>
                                  <td style="text-align: right; padding: 0;">${humanizeNumber(
                                    score.score,
                                    2
                                  )}</td>
                                </tr>
                              `
                                )
                                .join("")}
                            </tbody>
                          </table>
                        </div>
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
                        // width: "55px",
                        // height: "16px",
                        // top: "2px",
                        // left: "7px",
                        inset: 0,
                        backgroundColor: convertHexToRgba(
                          getEntityScaleColor(d.score, "country") || "#d0d0d0",
                          0.2
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
                        // padding: "4px 8px",
                        // fontSize: "10px",
                        fontSize: `${SCORE_FONT_SIZE}px`,
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
              style={{ height: `${sortedData.length * ROW_HEIGHT}px` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryWithTSChart;
