import React, { useState, useEffect, useRef } from "react";
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
import { asn } from "./DashboardConstants";
import { AreaChartOutlined, GlobalOutlined } from "@ant-design/icons";
import { getSecondsAsErrorDurationString } from "../../utils/timeUtils";
import "@idotj/mastodon-embed-timeline/dist/mastodon-timeline.min.css";
import * as MastodonTimeline from "@idotj/mastodon-embed-timeline";
import SummaryWithTSChart from "../../components/table/SummaryWithTSChart";

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
  const mastodonInitializedRef = useRef(false);
  useEffect(() => {
    if (!mastodonInitializedRef.current) {
      const container = document.getElementById("mt-dashboard-container");
      if (container) {
        new MastodonTimeline.Init({
          instanceUrl: "https://mastodon.social",
          timelineType: "profile",
          userId: "110576638411461442",
          profileName: "@IODA",
          maxNbPostShow: "10",
          mtContainerId: "mt-dashboard-container", // <--- IMPORTANT!
        });
        mastodonInitializedRef.current = true;
      }
    }
  }, []);

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

  // //0414added
  // useEffect(() => {
  //   if (summaryDataWithTS != null && config.current) {
  //     genSummaryWithTS();
  //   }
  // }, [summaryDataWithTS]);

  function genSummaryWithTS() {
    return (
      <SummaryWithTSChart
        data={summaryDataWithTS}
        // width={config.current ? config.current.offsetWidth : 1000}
        from={from}
        until={until}
      />
    );
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

  useEffect(() => {
    if (mapCardRef.current) {
      setMapHeight(mapCardRef.current.offsetHeight);
    }
  }, [tabCurrentView, topoData]); // re-measure if layout can change

  return (
    <div className="w-full max-cont dashboard__tab">
      {until - from < dashboardTimeRangeLimit ? (
        <>
          {/* ───────────────────────── 1st ROW ───────────────────────── */}
          <div className="flex items-stretch gap-6 mb-6">
            {/* LEFT 2 / 3 – Map (or Horizon) */}
            <div ref={mapCardRef} className="col-2 p-4 card flex flex-col">
              <div className="col-2 mw-0">
                <div className="flex items-center mb-4" ref={config}>
                  <div className="font-medium text-3xl">
                    {type === "country"
                      ? countryOutages
                      : type === "region"
                      ? regionalOutages
                      : type === "asn"
                      ? asnOutages
                      : null}
                  </div>
                  <Tooltip
                    title={tooltipDashboardHeadingTitle}
                    text={tooltipDashboardHeadingText}
                  />
                  <div className="col" />
                  {type !== asn.type && (
                    <>
                      <div className="text-lg mr-4">
                        {/* {tabCurrentView === "timeSeries"
                            ? viewTitleChart
                            : viewTitleMap}
                      {viewTitleMap} */}
                      </div>
                      {/* <Button
                          type="primary"
                          onClick={handleTabChangeViewButton}
                          icon={
                            tabCurrentView === "timeSeries" ? (
                              <GlobalOutlined />
                            ) : (
                              <AreaChartOutlined />
                            )
                          }
                          aria-label={
                            tabCurrentView === "timeSeries"
                              ? viewChangeIconAltTextHts
                              : viewChangeIconAltTextMap
                          }
                        /> */}
                    </>
                  )}
                </div>
                {type !== "asn" ? (
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
                    topoScores ? (
                      <TopoMap
                        topoData={topoData}
                        scores={topoScores}
                        handleEntityShapeClick={(entity) =>
                          handleEntityShapeClick(entity)
                        }
                        entityType={activeTabType?.toLowerCase()}
                      />
                    ) : null}
                  </div>
                ) : null}
                {/* <div
                    id="horizon-chart"
                    style={
                      tabCurrentView === "timeSeries" ||
                      type === "asn" ||
                      type === "country" //0414added
                        ? { display: "block" }
                        : { display: "none" }
                    }
                  >
                    {config.current &&
                    eventDataProcessed &&
                    eventDataProcessed.length > 0
                      ? genChart()
                      : null}
                  </div> */}
                <TimeStamp className="mt-4" from={from} until={until} />
              </div>
            </div>

            {/* RIGHT 1 / 3 – Mastodon timeline */}
            <div
              className="col-1 card p-4 flex flex-col"
              style={{ height: mapHeight ?? 570 }}
            >
              {/* <div className="mb-2">
                <span className="font-medium text-3xl">Recent News</span>
              </div> */}
              <div
                id="mt-dashboard-container"
                className="mt-container mt-container-seamless flex-1 w-full overflow-y-auto"
              >
                <div className="mt-body" role="feed">
                  <div className="mt-loading-spinner" />
                </div>
              </div>
            </div>
          </div>

          {/* ───────────────────────── 2nd ROW ───────────────────────── */}
          <div className="card p-4">
            <div className="flex items-center mb-4" ref={config}>
              <div className="font-medium text-3xl">
                {type === "country"
                  ? "All " + countryOutages + " Timeline"
                  : type === "region"
                  ? "All " + regionalOutages + " Timeline"
                  : type === "asn"
                  ? "All " + asnOutages + " Timeline"
                  : null}
              </div>
            </div>
            {summaryDataWithTS && (
              <SummaryWithTSChart
                data={summaryDataWithTS}
                from={from}
                until={until}
              />
            )}
          </div>
        </>
      ) : (
        /* Too-much-data error */
        <div className="p-6 text-lg card">
          {timeDurationTooHighErrorMessage}
          {getSecondsAsErrorDurationString(until - from)}.
        </div>
      )}
    </div>
  );
};

export default DashboardTab;
