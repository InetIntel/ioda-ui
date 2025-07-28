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
import { EnvironmentFilled, ClockCircleFilled } from "@ant-design/icons";
import { getSecondsAsErrorDurationString } from "../../utils/timeUtils";
import SummaryWithTSChart from "../../components/table/SummaryWithTSChart";
import { country, region, asn } from "./DashboardConstants";
import BlueskyIodaFeed from "../../components/widget/BlueskyIodaFeed";
import iconBsky from "images/icons/icon-bsky.png";
import { DownloadOutlined, ShareAltOutlined } from "@ant-design/icons";
import ShareLinkModal from "../../components/modal/ShareLinkModal";
import { Button, Popover, Tooltip as ATooltip } from "antd";
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
    summaryDataRaw,
    summaryDataWithTS,
  } = props;

  const config = React.createRef();

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
  const [showShareLinkModal, setShowShareLinkModal] = useState(false);
  const [displayChartSharePopover1, setDisplayChartSharePopover1] =
    useState(false);
  const [displayChartSharePopover2, setDisplayChartSharePopover2] =
    useState(false);
  function displayShareLinkModal() {
    setShowShareLinkModal(true);
  }

  function hideShareLinkModal() {
    setShowShareLinkModal(false);
  }
  function handleDisplayChartSharePopover1(val) {
    setDisplayChartSharePopover1(val);
  }
  function handleDisplayChartSharePopover2(val) {
    setDisplayChartSharePopover2(val);
  }
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

  return (
    // <div className="card p-8 dashboard__tab">
    <div className="w-full dashboard__tab">
      {until - from < dashboardTimeRangeLimit ? (
        <div className="flex items-stretch gap-6 dashboard__tab-layout">
          {totalOutages === 0 ? (
            <div className="col-1-of-1 tab__error tab__error--noOutagesFound">
              No {activeTabType} Outages found
            </div>
          ) : (
            <React.Fragment>
              {/* ───────────────────────── 1st ROW ───────────────────────── */}
              {activeTabType !== "asn" && (
                <div className="flex items-stretch gap-6">
                  {/* LEFT 2 / 3 – Map (or Timeseries) */}
                  <div
                    ref={mapCardRef}
                    className="col-2 p-4 pt-2 card flex flex-col "
                  >
                    <div className="col-2 mw-0">
                      {/* <div className="flex items-center mb-4" ref={config}>
                      <div className="font-medium text-2xl flex items-center gap-2">
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
                    </div> */}
                      {/* 0616 added */}
                      <ShareLinkModal
                        open={showShareLinkModal}
                        link={window.location.href}
                        hideModal={hideShareLinkModal}
                        showModal={displayShareLinkModal}
                        // entityName={entityName}
                        // handleDownload={() => manuallyDownloadChart("image/jpeg")}
                      />
                      <div className="flex items-center mb-2" ref={config}>
                        <div className="font-medium text-2xl flex items-center gap-2">
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

                        <div className="flex ml-auto">
                          <ATooltip title="Share Link">
                            <Button
                              className="mr-3"
                              icon={<ShareAltOutlined />}
                              onClick={displayShareLinkModal}
                            />
                          </ATooltip>

                          <Popover
                            open={displayChartSharePopover1}
                            onOpenChange={handleDisplayChartSharePopover1}
                            trigger="click"
                            placement="bottomRight"
                            overlayStyle={{
                              maxWidth: 180,
                            }}
                            content={
                              <div
                                onClick={() =>
                                  handleDisplayChartSharePopover1(false)
                                }
                              >
                                <Button
                                  className="w-full mb-2"
                                  size="small"
                                  // onClick={() =>
                                  //   manuallyDownloadChart("image/jpeg")
                                  // }
                                >
                                  Chart JPEG
                                </Button>
                                <Button
                                  className="w-full mb-2"
                                  size="small"
                                  // onClick={() =>
                                  //   manuallyDownloadChart("image/png")
                                  // }
                                >
                                  Chart PNG
                                </Button>
                                <Button
                                  className="w-full"
                                  size="small"
                                  // onClick={() =>
                                  //   manuallyDownloadChart("image/svg+xml")
                                  // }
                                >
                                  Chart SVG
                                </Button>
                              </div>
                            }
                          >
                            <ATooltip
                              title="Download"
                              mouseEnterDelay={0}
                              mouseLeaveDelay={0}
                            >
                              <Button icon={<DownloadOutlined />} />
                            </ATooltip>
                          </Popover>
                        </div>
                      </div>

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
                            <div
                              style={{
                                height: "460px",
                              }}
                            >
                              <TopoMap
                                topoData={topoData}
                                scores={topoScores}
                                handleEntityShapeClick={handleEntityShapeClick}
                                entityType={activeTabType?.toLowerCase()}
                              />
                            </div>
                          )}
                      </div>

                      {/* <div className="flex mt-4 justify-end"> */}
                      <div className="flex mt-2 justify-end">
                        <TimeStamp from={from} until={until} />
                      </div>
                    </div>
                  </div>
                  <div
                    className="col-1 card p-4 pt-4 flex flex-col"
                    style={{
                      height: mapHeight || "40rem",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="font-medium text-2xl flex items-center gap-2 mb-4">
                      <img
                        src={iconBsky}
                        alt="Bluesky icon"
                        style={{
                          width: 15,
                          height: 15,
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
              )}

              {/* ───────────────────────── 2nd ROW ───────────────────────── */}

              <div className="card p-4 pt-2">
                {/* <div className="flex items-center mb-4" ref={config}> */}
                {/* <div className="font-medium text-3xl">
                      {type === "country"
                        ? "All " + countryOutages + " Timeline"
                        : type === "region"
                          ? "All " + regionalOutages + " Timeline"
                          : type === "asn"
                            ? "All " + asnOutages + " Timeline"
                            : null}
                    </div> */}
                {/* <div className="font-medium text-2xl flex items-center gap-2">
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
                  </div> */}
                {/* <ShareLinkModal
                      open={showShareLinkModal}
                      link={window.location.href}
                      hideModal={hideShareLinkModal}
                      showModal={displayShareLinkModal}
                      // entityName={entityName}
                      // handleDownload={() => manuallyDownloadChart("image/jpeg")}
                    /> */}
                <div className="flex items-center mb-2" ref={config}>
                  <div className="font-medium text-2xl flex items-center gap-2">
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

                  <Tooltip
                    title={tooltipDashboardHeadingTitle}
                    text={tooltipDashboardHeadingText}
                  />

                  <div className="flex ml-auto">
                    <ATooltip title="Share Link">
                      <Button
                        className="mr-3"
                        icon={<ShareAltOutlined />}
                        onClick={displayShareLinkModal}
                      />
                    </ATooltip>

                    <Popover
                      open={displayChartSharePopover2}
                      onOpenChange={handleDisplayChartSharePopover2}
                      trigger="click"
                      placement="bottomRight"
                      overlayStyle={{
                        maxWidth: 180,
                      }}
                      content={
                        <div
                          onClick={() => handleDisplayChartSharePopover2(false)}
                        >
                          <Button
                            className="w-full mb-2"
                            size="small"
                            // onClick={() =>
                            //   manuallyDownloadChart("image/jpeg")
                            // }
                          >
                            Chart JPEG
                          </Button>
                          <Button
                            className="w-full mb-2"
                            size="small"
                            // onClick={() =>
                            //   manuallyDownloadChart("image/png")
                            // }
                          >
                            Chart PNG
                          </Button>
                          <Button
                            className="w-full"
                            size="small"
                            // onClick={() =>
                            //   manuallyDownloadChart("image/svg+xml")
                            // }
                          >
                            Chart SVG
                          </Button>
                        </div>
                      }
                    >
                      <ATooltip
                        title="Download"
                        mouseEnterDelay={0}
                        mouseLeaveDelay={0}
                      >
                        <Button icon={<DownloadOutlined />} />
                      </ATooltip>
                    </Popover>
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
