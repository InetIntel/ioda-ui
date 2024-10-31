import React, { useState, useEffect } from "react";
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
    summaryDataProcessed
  } = props;


  const config = React.createRef();

  useEffect(() => {
    if(eventDataProcessed != null && config.current) {
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

  return (
      <div className="card p-8 dashboard__tab">
        {until - from < dashboardTimeRangeLimit ? (
          <div className="flex items-stretch gap-4 dashboard__tab-layout">
            {totalOutages === 0 ? (
              <div className="col-1-of-1 tab__error tab__error--noOutagesFound">
                No {activeTabType} Outages found
              </div>
            ) : (
              <React.Fragment>
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
                          {tabCurrentView === "timeSeries"
                            ? viewTitleChart
                            : viewTitleMap}
                        </div>
                        <Button
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
                        />
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
                      topoScores
                        ? <TopoMap
                            topoData={topoData}
                            scores={topoScores}
                            handleEntityShapeClick={(entity) => handleEntityShapeClick(entity)}
                            entityType={activeTabType?.toLowerCase()}
                          />
                        : null}
                    </div>
                  ) : null}
                  <div
                    id="horizon-chart"
                    style={
                      tabCurrentView === "timeSeries" ||
                      type === "asn"
                        ? { display: "block" }
                        : { display: "none" }
                    }
                  >
                    {config.current &&
                    eventDataProcessed &&
                    eventDataProcessed.length > 0
                      ? genChart()
                      : null}
                  </div>
                  <TimeStamp
                    className="mt-4"
                    from={from}
                    until={until}
                  />
                </div>
                <div className="col-1 mw-0">
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
                        // <></>
                    ) : null}
                  </div>
                </div>
              </React.Fragment>
            )}
          </div>
        ) : (
          <div className="w-full">
            <p className="dashboard__tab-error">
              {timeDurationTooHighErrorMessage}
              {getSecondsAsErrorDurationString(
                until - from
              )}
              .
            </p>
          </div>
        )}
      </div>

    );
}

export default DashboardTab;
