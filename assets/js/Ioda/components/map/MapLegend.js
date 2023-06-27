import React, { Component } from "react";
import clsx from "clsx";

const MapLegend = ({ lowThreshold, highThreshold, className, ...rest }) => {
  const formatLocaleNumber = (value, precision = 0) => {
    return Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: precision,
    }).format(value);
  };

  const getRangeFromBounds = (low = 0, high = 0, intervals = 4) => {
    const res = [];
    const step = (high - low) / intervals;
    for (let i = 1; i < intervals - 1; i++) {
      res.push(low + step * i);
    }
    return res;
  };

  const intervals = 4;
  const range = getRangeFromBounds(lowThreshold, highThreshold, intervals);

  return (
    <div className={clsx("card p-4 map-legend", className)} {...rest}>
      <div className="flex items-end gap-4">
        <div className="text-lg font-bold map-legend__title">
          Outage Severity Score:
        </div>
        <div className="col">
          <div className="flex items-center map-legend__labels">
            <div className="text-md col font-med text-left">
              {lowThreshold && formatLocaleNumber(lowThreshold)}
            </div>
            {range.map(
              (value, idx) =>
                value && (
                  <div
                    key={value}
                    className={clsx(
                      "text-md col font-med text-center",
                      idx === range.length - 1 && "text-right"
                    )}
                  >
                    {value && formatLocaleNumber(value)}
                  </div>
                )
            )}
            <div className="text-md col font-med text-right">
              {highThreshold && formatLocaleNumber(highThreshold)}
            </div>
            <div className="map-legend__labels-extreme">
              <div className="text-md font-med text-right">Max</div>
            </div>
          </div>
          <div className="flex items-center h-3 map-legend__bar-background">
            <div className="flex items-center map-legend__bar-wrapper">
              <div className="col map-legend__bar-gradient"></div>
              <div className="map-legend__bar-extreme"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;
