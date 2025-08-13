// SummaryWithTSChart.jsx
import React, { useRef, useEffect, useState } from "react";
import { select } from "d3-selection";
import { scaleTime, scaleBand } from "d3-scale";
import { ascending, descending } from "d3-array";
import { axisTop } from "d3-axis";
import { format } from "d3-format";
import { utcFormat } from "d3-time-format";
import countryData from "../../constants/countries.json";
import { getEntityScaleColor } from "../../utils/mapColors";
import { Link } from "react-router-dom";
import { getDateRangeFromUrl, hasDateRangeInUrl } from "../../utils/urlUtils";
import iconAsc from "images/icons/icon-asc.png";
import iconDesc from "images/icons/icon-desc.png";
import iconSortUnsort from "images/icons/icon-sortUnsort.png";
import { Popover, Divider, Typography } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

const SummaryWithTSChart = ({
  data,
  width: containerWidth = 1000,
  from,
  until,
  tabType,
}) => {
  const MOBILE_BREAKPOINT = 600;

  const { Title, Text } = Typography;
  const { urlFromDate, urlUntilDate } = getDateRangeFromUrl();
  const [winWidth, setWinWidth] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setWinWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const isMobile = winWidth <= MOBILE_BREAKPOINT;
  const isASN = tabType === "asn";
  const FONT_SIZE = isMobile ? 10 : 12;
  const AXIS_FONT_SIZE = isMobile ? 8 : 10;
  const SCORE_FONT_SIZE = isMobile ? 9 : 11;
  const HEADER_HEIGHT = isMobile ? 15 : 20;
  const HEADER_BASELINE = isMobile ? 12 : 16;
  const ROW_HEIGHT = isMobile ? 30 : 36;

  const NAME_COL_WIDTH = isMobile ? 100 : 160;
  const SCORE_COL_WIDTH = isMobile ? 50 : 70;
  const IP_COL_WIDTH = isASN ? (isMobile ? 50 : 80) : 0;
  const LEFT_COL_TOTAL_WIDTH = NAME_COL_WIDTH + SCORE_COL_WIDTH + IP_COL_WIDTH;

  const TIMESERIES_MIN_WIDTH = isMobile ? 300 : 600;
  const dateRangeInUrl = hasDateRangeInUrl();
  const chartRef = useRef(null);
  const scrollContainerRef = useRef(null);
  // const [sortCriterion, setSortCriterion] = useState("score");
  const [sortConfig, setSortConfig] = useState({
    criterion: "score",
    directions: {
      name: "asc",
      score: "desc",
      ip: "desc",
    },
  });
  const tooltipRef = useRef(null);
  const scoreTooltipRef = useRef(null);
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      border: "2px solid #ddd",
      maxHeight: "60rem",
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
      // width: "260px",
      width: `${LEFT_COL_TOTAL_WIDTH}`,
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
      padding: "5px 20px",
      textAlign: "center",
      // fontWeight: "bold",
      // fontSize: "10px",
    },
    scrollContainer: {
      display: "flex",
      overflow: "auto",
      flex: 1,
      overflowX: "auto",
      overflowY: "auto",
      position: "relative",
    },
    countryScoreList: {
      // width: "260px",
      width: `${LEFT_COL_TOTAL_WIDTH}`,
      // borderRight: "2px solid #ddd",
      flexShrink: 0,
      position: "sticky",
      left: 0,
      zIndex: 10,
    },
    countryScoreRow: {
      display: "flex",
      justifyContent: "space-between",
      padding: "10px",
      height: `${ROW_HEIGHT}px`,
      // height: `60px`,
      alignItems: "center",
      borderBottom: "2px solid #eee",
      borderRight: "2px solid #ddd",
      backgroundColor: "white",
    },
    timeseriesWrapper: {
      flex: 1,
      position: "relative",
      // minWidth: "600px",
      minWidth: `${TIMESERIES_MIN_WIDTH}px`,
    },
    timeseriesHeaderContainer: {
      flex: 1,
      // minWidth: "600px",
      minWidth: `${TIMESERIES_MIN_WIDTH}px`,
      display: "flex",
      flexDirection: "column",
      position: "relative",
    },
    xAxisContainer: {
      height: "20px",
      overflow: "hidden",
      backgroundColor: "white",
      position: "relative",
      marginTop: "auto",
    },
    xAxisSvg: {
      display: "block",
      overflow: "visible",
      position: "absolute",
      bottom: 0,
      left: 0,
    },
    iconButtonStyle: {
      background: "none",
      border: "none",
      padding: 2,
      marginLeft: "2px",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
    },
    // countryName: {
    //   overflow: "hidden",
    //   textOverflow: "ellipsis",
    // },
    countryNameContainer: {
      // width: "160px",
      width: `${NAME_COL_WIDTH}px`,
      display: "inline-block",
      verticalAlign: "middle",
    },
    countryNameLink: {
      textDecoration: "none",
      display: "block",
      // width: "100%",
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
    },
  };
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
  const boxConfig = [
    { key: "ping-slash24.median", color: "#2078B4", name: "Active Probing" },
    { key: "bgp.median", color: "#32a02d", name: "BGP" },
    { key: "merit-nt.median", color: "#ED9B40", name: "Telescope" },
  ];

  function SourceTriplet({ scores }) {
    return (
      <div
        aria-label="score sources"
        style={{
          display: "inline-flex",
          flexDirection: "column",
          gap: 2,
          // marginRight: 6,
        }}
      >
        {boxConfig.map(({ key, color }, idx) => {
          const hasIt =
            Array.isArray(scores) &&
            scores.some((s) => s.source === key && s.score != null);
          return (
            <div
              key={idx}
              style={{
                width: 6,
                height: 6,
                borderRadius: 1,
                background: hasIt ? color : "#d9d9d9",
              }}
            />
          );
        })}
      </div>
    );
  }

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

      textElement.text(null);

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

  function humanizeNumber(value, precisionDigits = 2) {
    return format(
      (isNaN(precisionDigits) ? "" : "." + precisionDigits) +
        (Math.abs(value) < 1 ? "r" : "s")
    )(value);
  }

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
  const sortedData = [...data].sort((a, b) => {
    const { criterion, directions } = sortConfig;
    // const valA = criterion === "name" ? a.name : a.score;
    // const valB = criterion === "name" ? b.name : b.score;
    const valA =
      criterion === "name"
        ? a.name
        : criterion === "ip"
          ? parseHumanReadableFloat(a.ipCount)
          : a.score;

    const valB =
      criterion === "name"
        ? b.name
        : criterion === "ip"
          ? parseHumanReadableFloat(b.ipCount)
          : b.score;

    return directions[criterion] === "asc"
      ? ascending(valA, valB)
      : descending(valA, valB);
  });

  function parseHumanReadableFloat(value) {
    let parsedValue = parseFloat(value.replace(/[A-Za-z]/g, ""));
    if (value.includes("k")) {
      parsedValue = parsedValue * 1000;
    } else if (value.includes("M")) {
      parsedValue = parsedValue * 1000000;
    } else if (value.includes("G")) {
      parsedValue = parsedValue * 1000000000;
    }
    return parsedValue;
  }

  function ScorePopoverContent({ data }) {
    const flagEmoji = getFlagEmoji(data);

    return (
      <div
        style={{
          width: 240,
          backgroundColor: "#ffffff",
          // borderRadius: 4,
          boxShadow: "0 3px 6px rgba(0,0,0,0.16)",
          overflow: "hidden",
          fontSize: `${FONT_SIZE}px`,
        }}
      >
        {/* ───────────── HEADER ───────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 12px",
            backgroundColor: "#f5f5f5",
            borderBottom: "1px solid #e8e8e8",
          }}
        >
          <span style={{ fontSize: "16px", marginRight: 8 }}>{flagEmoji}</span>
          <Title
            level={5}
            style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}
          >
            {data.name}
            {data.countryName ? `, ${data.countryName}` : null}
          </Title>
        </div>

        {/* ───────────── BODY (list of each source) ───────────── */}
        <div style={{ padding: "8px 12px" }}>
          {data.scores.map((row) => {
            const isNoData = row.score == null || row.score === 0;
            const displayValue = isNoData
              ? "No Data"
              : humanizeNumber(row.score, 2);
            const baseColor =
              getEntityScaleColor(row.score, isASN ? "region" : tabType) ||
              "#d0d0d0";

            const badgeBackground = isNoData
              ? "#f5f5f5"
              : convertHexToRgba(baseColor, 0.2);
            const badgeBorder = isNoData ? "#d9d9d9" : baseColor;
            const badgeColor = isNoData ? "#bfbfbf" : "#000000";

            return (
              <div
                key={row.source}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  // marginBottom: 6,
                  marginBottom:
                    data.scores[data.scores.length - 1] === row ? 0 : 6,
                }}
              >
                {/* Source name */}
                <Text
                  style={{
                    color: isNoData ? "#bfbfbf" : "#000000",
                    fontSize: "12px",
                  }}
                >
                  {row.source === "merit-nt.median"
                    ? "Telescope"
                    : row.source === "ping-slash24.median"
                      ? "Active Probing"
                      : row.source === "bgp.median"
                        ? "BGP"
                        : row.source}
                </Text>

                {/* “Badge” with score number  */}
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "12px",
                    minWidth: 36,
                    textAlign: "center",
                    lineHeight: "1.2",
                    padding: "2px 6px",
                    borderRadius: 2,
                    backgroundColor: badgeBackground,
                    border: `1px solid ${badgeBorder}`,
                    color: badgeColor,
                  }}
                >
                  {displayValue}
                </span>
              </div>
            );
          })}
        </div>

        {/* ───────────── DIVIDER ───────────── */}
        <Divider style={{ margin: "0" }} />

        {/* ───────────── FOOTER: Total score ───────────── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 12px",
            backgroundColor: "#fafafa",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Text strong style={{ fontSize: "12px" }}>
              Total Severity Score
            </Text>
            <InfoCircleOutlined
              style={{
                color: "rgba(0,0,0,0.45)",
                fontSize: "12px",
                marginLeft: 4,
              }}
            />
          </div>
          {(() => {
            const totalBaseColor =
              getEntityScaleColor(data.score, isASN ? "region" : tabType) ||
              "#d0d0d0";
            const totalBackground = convertHexToRgba(totalBaseColor, 0.2);
            const totalBorder = totalBaseColor;
            const totalColor = "#000000";
            return (
              <span
                style={{
                  display: "inline-block",
                  fontSize: "12px",
                  minWidth: 36,
                  textAlign: "center",
                  lineHeight: "1.2",
                  padding: "2px 6px",
                  borderRadius: 2,
                  backgroundColor: totalBackground,
                  border: `1px solid ${totalBorder}`,
                  color: totalColor,
                }}
              >
                {humanizeNumber(data.score, 2)}
              </span>
            );
          })()}
        </div>
      </div>
    );
  }

  useEffect(() => {
    select(chartRef.current).select("svg").remove();
    select(xAxisRef.current).select("svg").remove();
    if (!sortedData?.length || !scrollContainerRef.current) return;

    // Calculate available width for timeseries
    const timeseriesWidth =
      scrollContainerRef.current.offsetWidth - LEFT_COL_TOTAL_WIDTH; // minus left column
    const rowHeight = ROW_HEIGHT;
    const height = sortedData.length * rowHeight;

    const margin = { top: 0, right: 10, bottom: 10, left: 20 };
    const width = timeseriesWidth - margin.left - margin.right;

    const svg = select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
    const crosshair = svg
      .append("line")
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#1890ff")
      .attr("stroke-width", 1)
      .style("pointer-events", "none")
      .style("visibility", "hidden");
    const xExtent = [new Date(from * 1000), new Date(until * 1000)];
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
      // .padding(0.2);
      .padding(0);

    const formatTime = (date) => {
      // Create UTC formatters
      const utcDayFormat = utcFormat("%a %-m/%-d"); // For day labels
      const utcTimeFormat = utcFormat("%-I:%M %p"); // For time labels

      const hours = date.getUTCHours();

      if (totalRangeDays > 3) {
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
        return "12:00 PM";
      }
      return null;
    };

    const generateTicks = (scale) => {
      const [start, end] = scale.domain();
      const ticks = [];

      let current = new Date(start);
      if (totalRangeDays > 3) {
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
        const formatted = formatTime(d);
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
    xAxisSvg
      .append("g")
      .attr("class", "x-axis")
      .call(xAxis.tickSize(0).tickSizeOuter(0))
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll(".tick line").remove())
      .call((g) =>
        g
          .selectAll(".tick text")
          .attr("dy", "0") // baseline-align text
          .style("font-size", `${FONT_SIZE}px`)
      )
      .attr("font-size", `${FONT_SIZE}px`)
      .call((g) =>
        g.selectAll(".tick").each(function (d) {
          const isDay = d.getUTCHours() === 0; // midnight UTC
          select(this)
            .selectAll("text")
            //.style("font-size", `${FONT_SIZE}px`)
            .style("font-size", `${AXIS_FONT_SIZE}px`)
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

    const BAR_HEIGHT = yScale.bandwidth() * 0.5;
    sortedData.forEach((country) => {
      svg
        .selectAll(`.bar-${country.entityCode}`)
        .data(country.timeSeries)
        .enter()
        .append("rect")
        .attr("class", `bar bar-${country.entityCode}`)
        .attr("x", (d) => xScale(d.ts) - 3)
        .attr(
          "y",
          () => yScale(country.name) + (yScale.bandwidth() - BAR_HEIGHT) / 2
        )
        .attr("height", BAR_HEIGHT)
        .attr("width", 6)
        .attr(
          "fill",
          getEntityScaleColor(country.score, isASN ? "region" : tabType) ||
            "#d0d0d0"
        )
        .on("mouseover", function (event, d) {
          crosshair.raise();
          crosshair
            .attr("x1", xScale(d.ts))
            .attr("x2", xScale(d.ts))
            .style("visibility", "visible");
          const tooltip = tooltipRef.current;
          tooltip.style.visibility = "visible";
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
          const tooltip = tooltipRef.current;
          tooltip.style.visibility = "hidden";
          crosshair.style("visibility", "hidden");
        });
    });
  }, [sortedData, containerWidth]);

  return (
    <div style={{ fontSize: `${FONT_SIZE}px` }}>
      <div style={styles.container}>
        <div style={styles.header}>
          {/* Left column header */}
          <div style={styles.countryScoreHeader}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div
                style={{
                  // width: "180px",
                  width: `${NAME_COL_WIDTH}px`,
                  // fontWeight: "bold",
                  // fontSize: "10px",
                  fontSize: `${FONT_SIZE}px`,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span>NAME</span>
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
              {isASN && (
                <div>
                  <div
                    style={{
                      width: `${IP_COL_WIDTH}px`,
                      fontSize: `${FONT_SIZE}px`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span>IP COUNT</span>
                    <button
                      onClick={() =>
                        setSortConfig((prev) => {
                          if (prev.criterion === "ip") {
                            const newDir =
                              prev.directions.ip === "asc" ? "desc" : "asc";
                            return {
                              ...prev,
                              directions: { ...prev.directions, ip: newDir },
                            };
                          }
                          return { ...prev, criterion: "ip" };
                        })
                      }
                      style={styles.iconButtonStyle}
                    >
                      {getSortIcon("ip", sortConfig)}
                    </button>
                  </div>
                </div>
              )}
              <div
                style={{
                  // width: "80px",
                  width: `${SCORE_COL_WIDTH}px`,
                  // fontWeight: "bold",
                  // fontSize: "10px",
                  fontSize: `${FONT_SIZE}px`,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 6,
                }}
              >
                <span>SCORE</span>
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
                      return { ...prev, criterion: "score" };
                    })
                  }
                  style={styles.iconButtonStyle}
                >
                  {getSortIcon("score", sortConfig)}
                </button>
              </div>
            </div>
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
                <div style={styles.countryNameContainer}>
                  <Link
                    to={`/${d.entityType}/${d.entityCode}${
                      dateRangeInUrl
                        ? `?from=${urlFromDate}&until=${urlUntilDate}`
                        : ""
                    }`}
                    style={styles.countryNameLink}
                    title={`${getFlagEmoji(d)} ${d.name}${d.countryName ? `, ${d.countryName}` : ""}`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = "underline";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = "none";
                    }}
                  >
                    {getFlagEmoji(d)} {d.name}
                    {d.countryName ? `, ${d.countryName}` : null}
                  </Link>
                </div>
                {isASN && (
                  <div
                    style={{
                      width: `${IP_COL_WIDTH}px`,
                      textAlign: "center",
                      fontSize: `${FONT_SIZE}px`,
                    }}
                  >
                    {d.ipCount}
                  </div>
                )}

                <div
                  style={{
                    // width: "70px",
                    width: `${SCORE_COL_WIDTH}px`,
                    // textAlign: "center",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Popover
                    trigger="hover"
                    placement="right"
                    content={<ScorePopoverContent data={d} />}
                    overlayClassName="score-popover"
                    overlayInnerStyle={{
                      padding: 0,
                      boxShadow: "none",
                      border: "none",
                      borderRadius: 0,
                      background: "transparent",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 3,
                        height: "100%",
                      }}
                    >
                      <SourceTriplet scores={d.scores} />
                      <div
                        style={{
                          position: "relative",
                          width: 45,
                          height: 22,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            backgroundColor: convertHexToRgba(
                              getEntityScaleColor(
                                d.score,
                                isASN ? "region" : tabType
                              ) || "#d0d0d0",
                              0.2
                            ),
                            borderRadius: 2,
                            zIndex: 1,
                            border: "1px solid",
                            borderColor:
                              getEntityScaleColor(
                                d.score,
                                isASN ? "region" : tabType
                              ) || "#d0d0d0",
                            boxSizing: "border-box",
                          }}
                        />
                        <span
                          style={{
                            position: "relative",
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
                  </Popover>
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
      {/* Bottom row - Legend */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: 6,
          marginLeft: 6,
          fontSize: `${FONT_SIZE}px`,
        }}
      >
        {boxConfig.map(({ color, name }) => {
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  backgroundColor: `${color}`,
                  borderRadius: 1,
                }}
              />
              <span style={{ fontStyle: "italic" }} n>
                {name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SummaryWithTSChart;
