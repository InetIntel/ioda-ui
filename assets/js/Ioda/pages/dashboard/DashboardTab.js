import React, { Component } from "react";
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

class DashboardTab extends Component {
  constructor(props) {
    super(props);
    this.config = React.createRef();

    this.state = {
      mounted: false,
    };
  }

  componentDidMount() {
    this.setState({ mounted: true });
  }

  componentWillUnmount() {
    this.setState({ mounted: false });
  }

  componentDidUpdate(prevProps) {
    if (!this.state.mounted) {
      return;
    }

    if (
      this.props.eventDataProcessed !== prevProps.eventDataProcessed &&
      this.config.current
    ) {
      this.genChart();
    }
  }

  genMap = () => {
    return (
      <TopoMap
        topoData={this.props.topoData}
        scores={this.props.topoScores}
        handleEntityShapeClick={(entity) =>
          this.props.handleEntityShapeClick(entity)
        }
        entityType={this.props.activeTabType?.toLowerCase()}
      />
    );
  };

  genChart = () => {
    const chart = HorizonTSChart()(document.getElementById(`horizon-chart`));

    if (this.props.eventDataProcessed) {
      chart
        .data(this.props.eventDataProcessed)
        .series("entityName")
        .yNormalize(false)
        .useUtc(true)
        .use24h(false)
        // Will need to detect column width to populate height
        .width(this.config.current.offsetWidth)
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
  };

  render() {
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
        {this.props.until - this.props.from < dashboardTimeRangeLimit ? (
          <div className="flex items-stretch gap-4 dashboard__tab-layout">
            {this.props.totalOutages === 0 ? (
              <div className="col-1-of-1 tab__error tab__error--noOutagesFound">
                No {this.props.activeTabType} Outages found
              </div>
            ) : (
              <React.Fragment>
                <div className="col-2 mw-0">
                  <div className="flex items-center mb-4" ref={this.config}>
                    <div className="font-medium text-3xl">
                      {this.props.type === "country"
                        ? countryOutages
                        : this.props.type === "region"
                        ? regionalOutages
                        : this.props.type === "asn"
                        ? asnOutages
                        : null}
                    </div>
                    <Tooltip
                      title={tooltipDashboardHeadingTitle}
                      text={tooltipDashboardHeadingText}
                    />
                    <div className="col" />
                    {this.props.type !== asn.type && (
                      <>
                        <div className="text-lg mr-4">
                          {this.props.tabCurrentView === "timeSeries"
                            ? viewTitleChart
                            : viewTitleMap}
                        </div>
                        <Button
                          type="primary"
                          onClick={this.props.handleTabChangeViewButton}
                          icon={
                            this.props.tabCurrentView === "timeSeries" ? (
                              <GlobalOutlined />
                            ) : (
                              <AreaChartOutlined />
                            )
                          }
                          aria-label={
                            this.props.tabCurrentView === "timeSeries"
                              ? viewChangeIconAltTextHts
                              : viewChangeIconAltTextMap
                          }
                        />
                      </>
                    )}
                  </div>
                  {this.props.type !== "asn" ? (
                    <div
                      className="dashboard__tab-map"
                      style={
                        this.props.tabCurrentView === "map"
                          ? { display: "block" }
                          : { display: "none" }
                      }
                    >
                      {this.props.topoData &&
                      this.props.summaryDataRaw &&
                      this.props.totalOutages &&
                      this.props.topoScores
                        ? this.genMap()
                        : null}
                    </div>
                  ) : null}
                  <div
                    id="horizon-chart"
                    style={
                      this.props.tabCurrentView === "timeSeries" ||
                      this.props.type === "asn"
                        ? { display: "block" }
                        : { display: "none" }
                    }
                  >
                    {this.config.current &&
                    this.props.eventDataProcessed &&
                    this.props.eventDataProcessed.length > 0
                      ? this.genChart()
                      : null}
                  </div>
                  <TimeStamp
                    className="mt-4"
                    from={this.props.from}
                    until={this.props.until}
                  />
                </div>
                <div className="col-1 mw-0">
                  <div className="dashboard__tab-table">
                    {this.props.activeTabType &&
                    this.props.totalOutages &&
                    this.props.genSummaryTableDataProcessed ? (
                      <Table
                        type={"summary"}
                        data={this.props.summaryDataProcessed}
                        totalCount={this.props.totalOutages}
                        entityType={this.props.activeTabType}
                      />
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
                this.props.until - this.props.from
              )}
              .
            </p>
          </div>
        )}
      </div>
    );
  }
}

export default DashboardTab;
