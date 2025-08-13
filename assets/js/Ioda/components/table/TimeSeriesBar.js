// components/TimeSeriesBar.js
import React from "react";

const TimeSeriesBar = ({ data, width = 100, height = 30 }) => {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.val));
  const minTime = Math.min(...data.map((d) => new Date(d.ts).getTime()));
  const maxTime = Math.max(...data.map((d) => new Date(d.ts).getTime()));

  const getX = (ts) => {
    const t = new Date(ts).getTime();
    return ((t - minTime) / (maxTime - minTime)) * width;
  };

  const getY = (val) => height - (val / maxVal) * height;

  return (
    <svg width={width} height={height} style={{ background: "#f9f9f9" }}>
      {data.map((point, i) => (
        <circle
          key={i}
          cx={getX(point.ts)}
          cy={getY(point.val)}
          r={5}
          fill="steelblue"
        >
          <title>
            {new Date(point.ts).toLocaleString()} — {point.val}
          </title>
        </circle>
      ))}
    </svg>
  );
};

export default TimeSeriesBar;
