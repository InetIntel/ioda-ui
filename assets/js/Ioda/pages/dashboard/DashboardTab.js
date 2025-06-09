import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import T from "i18n-react";
import {
  dashboardTimeRangeLimit,
  horizonChartSeriesColor,
  humanizeNumber,
} from "../../utils";
import TimeStamp from "../../components/timeStamp/TimeStamp";
import Tooltip from "../../components/tooltip/Tooltip";
import Table from "../../components/table/Table";
import HorizonTSChart from "horizon-timeseries-chart";
import * as d3 from "d3-shape";
import TopoMap from "../../components/map/Map";
import { Button } from "antd";
import {
  AreaChartOutlined,
  GlobalOutlined,
  EnvironmentFilled,
  ClockCircleFilled,
} from "@ant-design/icons";
import { getSecondsAsErrorDurationString } from "../../utils/timeUtils";
import SummaryWithTSChart from "../../components/table/SummaryWithTSChart";
import { country, region, asn } from "./DashboardConstants";
import BlueskyIodaFeed from "../../components/widget/BlueskyIodaFeed";
import iconBsky from "images/icons/icon-bsky.png";
const DashboardTab = (props) => {
  const {
    eventDataProcessed,
    topoData,
    topoScores,
    handleEntityShapeClick,
    activeTabType,
    until,
    from,
    totalOutages,
    type,
    tabCurrentView,
    handleTabChangeViewButton,
    summaryDataRaw,
    genSummaryTableDataProcessed,
    summaryDataProcessed,
    summaryDataWithTS,
  } = props;

  const config = React.createRef();
  // const mastodonInitializedRef = useRef(false);

  useEffect(() => {
    if (eventDataProcessed != null && config.current) {
      genChart();
    }
  }, [eventDataProcessed]);

  function genChart() {
    const chart = HorizonTSChart()(document.getElementById(`horizon-chart`));
    if (eventDataProcessed) {
      chart
        .data(eventDataProcessed)
        .series("entityName")
        .yNormalize(false)
        .useUtc(true)
        .use24h(false)
        // Will need to detect column width to populate height
        .width(config.current.offsetWidth)
        .height(570)
        .enableZoom(false)
        .showRuler(true)
        .interpolationCurve(d3.curveStepAfter)
        .positiveColors(["white", horizonChartSeriesColor]).toolTipContent = ({
        series,
        ts,
        val,
      }) => `${series}<br>${ts}: ${humanizeNumber(val)}`;
    }
  }

  const countryOutages = T.translate("dashboard.countryOutages");
  const regionalOutages = T.translate("dashboard.regionalOutages");
  const asnOutages = T.translate("dashboard.asnOutages");
  const viewChangeIconAltTextHts = T.translate(
    "dashboard.viewChangeIconAltTextHts"
  );
  const viewChangeIconAltTextMap = T.translate(
    "dashboard.viewChangeIconAltTextMap"
  );
  const viewTitleMap = T.translate("dashboard.viewTitleMap");
  const viewTitleChart = T.translate("dashboard.viewTitleChart");
  const timeDurationTooHighErrorMessage = T.translate(
    "dashboard.dashDurationTooHighErrorMessage"
  );

  const tooltipDashboardHeadingTitle = T.translate(
    "tooltip.dashboardHeading.title"
  );
  const tooltipDashboardHeadingText = T.translate(
    "tooltip.dashboardHeading.text"
  );

  const mapCardRef = useRef(null);
  const [mapHeight, setMapHeight] = useState(null);
  // useEffect(() => {
  useLayoutEffect(() => {
    if (!mapCardRef.current) return;
    if (mapCardRef.current) {
      if (activeTabType !== "asn") {
        setMapHeight(mapCardRef.current.offsetHeight);
      }
      if (activeTabType === "asn" && summaryDataWithTS) {
        setMapHeight(mapCardRef.current.offsetHeight);
      }
    }
  }, [tabCurrentView, topoData, summaryDataWithTS, activeTabType]); // re-measure if layout can change

  // useEffect(() => {
  //   if (!mapCardRef.current) return;

  //   const resizeObserver = new ResizeObserver((entries) => {
  //     const entry = entries[0];
  //     setMapHeight(entry.contentRect.height);
  //   });

  //   resizeObserver.observe(mapCardRef.current);
  //   return () => resizeObserver.disconnect();
  // }, []);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (mapCardRef.current) {
  //       setMapHeight(mapCardRef.current.offsetHeight);
  //       console.log("chart frame height:", mapHeight);
  //     }
  //   }, 1000); // Small delay to allow rendering
  //   return () => clearTimeout(timer);
  // }, [tabCurrentView, topoData, summaryDataRaw]);

  return (
    // <div className="card p-8 dashboard__tab">
    <div className="w-full max-cont dashboard__tab">
      {until - from < dashboardTimeRangeLimit ? (
        <div className="flex items-stretch gap-4 dashboard__tab-layout">
          {totalOutages === 0 ? (
            <div className="col-1-of-1 tab__error tab__error--noOutagesFound">
              No {activeTabType} Outages found
            </div>
          ) : (
            <React.Fragment>
              {/* ───────────────────────── 1st ROW ───────────────────────── */}
              <div className="flex items-stretch gap-6 mb-6">
                {/* LEFT 2 / 3 – Map (or Timeseries) */}
                <div
                  ref={mapCardRef}
                  className="col-2 p-4 pt-6 card flex flex-col "
                >
                  <div className="col-2 mw-0">
                    <div className="flex items-center mb-4" ref={config}>
                      {/* <div className="font-medium text-3xl">
                        {type === "country"
                          ? countryOutages
                          : type === "region"
                            ? regionalOutages
                            : type === "asn"
                              ? asnOutages
                              : null}
                      </div> */}
                      <div className="font-medium text-3xl flex items-center gap-2">
                        <EnvironmentFilled style={{ color: "#8c8c8c" }} />
                        <span className="text-black">
                          {type === "country"
                            ? countryOutages
                            : type === "region"
                              ? regionalOutages
                              : type === "asn"
                                ? asnOutages
                                : null}
                        </span>
                      </div>

                      <Tooltip
                        title={tooltipDashboardHeadingTitle}
                        text={tooltipDashboardHeadingText}
                      />
                    </div>
                    {/* <div
                      className="dashboard__tab-map"
                      style={
                        tabCurrentView === "map"
                          ? { display: "block" }
                          : { display: "none" }
                      }
                    > */}
                    {activeTabType === asn.type ? (
                      summaryDataWithTS && (
                        <SummaryWithTSChart
                          data={summaryDataWithTS}
                          from={from}
                          until={until}
                          tabType={activeTabType}
                        />
                      )
                    ) : (
                      <div
                        className="dashboard__tab-map"
                        style={
                          tabCurrentView === "map"
                            ? { display: "block" }
                            : { display: "none" }
                        }
                      >
                        {topoData &&
                          summaryDataRaw &&
                          totalOutages &&
                          topoScores && (
                            <TopoMap
                              topoData={topoData}
                              scores={topoScores}
                              handleEntityShapeClick={handleEntityShapeClick}
                              entityType={activeTabType?.toLowerCase()}
                            />
                          )}
                        {/* <TimeStamp className="mt-4" from={from} until={until} /> */}
                      </div>
                    )}
                    <div className="flex mt-4 justify-end">
                      <TimeStamp from={from} until={until} />
                    </div>
                  </div>
                </div>
                <div
                  className="col-1 card p-4 pt-6 flex flex-col"
                  style={{
                    height: mapHeight || "60rem",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div className="font-medium text-3xl flex items-center gap-2 mb-4">
                    <img
                      src={iconBsky}
                      alt="Bluesky icon"
                      style={{
                        width: 20,
                        height: 20,
                        filter: "grayscale(1)",
                        opacity: 0.8, // tweak until it visually matches #8c8c8c
                      }}
                    />
                    <span className="text-black">News</span>
                  </div>
                  <div style={{ overflowY: "auto", flex: 1 }}>
                    <BlueskyIodaFeed did="did:plc:3xessr3vu336mxean6zvfyjq" />
                  </div>
                </div>
              </div>

              {/* <div className="col-1 mw-0">
                <div className="dashboard__tab-table">
                  {activeTabType &&
                  totalOutages &&
                  genSummaryTableDataProcessed ? (
                    <Table
                      type={"summary"}
                      data={summaryDataProcessed}
                      totalCount={totalOutages}
                      entityType={activeTabType}
                    />
                  ) : // <></>
                  null}
                </div>
              </div> */}
              {activeTabType !== asn.type && (
                <div className="card p-4 pt-6">
                  <div className="flex items-center mb-4" ref={config}>
                    {/* <div className="font-medium text-3xl">
                      {type === "country"
                        ? "All " + countryOutages + " Timeline"
                        : type === "region"
                          ? "All " + regionalOutages + " Timeline"
                          : type === "asn"
                            ? "All " + asnOutages + " Timeline"
                            : null}
                    </div> */}
                    <div className="font-medium text-3xl flex items-center gap-2">
                      <ClockCircleFilled style={{ color: "#8c8c8c" }} />
                      <span className="text-black">
                        {type === "country"
                          ? "All " + countryOutages + " Timeline"
                          : type === "region"
                            ? "All " + regionalOutages + " Timeline"
                            : type === "asn"
                              ? "All " + asnOutages + " Timeline"
                              : null}
                      </span>
                    </div>
                  </div>
                  {summaryDataWithTS && (
                    <SummaryWithTSChart
                      data={summaryDataWithTS}
                      from={from}
                      until={until}
                      tabType={activeTabType}
                    />
                  )}
                </div>
              )}
            </React.Fragment>
          )}
        </div>
      ) : (
        // <div className="w-full">
        //   <p className="dashboard__tab-error">
        //     {timeDurationTooHighErrorMessage}
        //     {getSecondsAsErrorDurationString(until - from)}.
        //   </p>
        // </div>
        <div className="p-6 text-lg card">
          {timeDurationTooHighErrorMessage}
          {getSecondsAsErrorDurationString(until - from)}.
        </div>
      )}
    </div>
  );
};

export default DashboardTab;
