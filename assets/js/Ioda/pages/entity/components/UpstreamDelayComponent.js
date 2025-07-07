import React, { useState, useEffect, useRef } from "react";

// Chart Libraries
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
require("highcharts/modules/exporting")(Highcharts);
require("highcharts/modules/export-data")(Highcharts);
require("highcharts/modules/offline-exporting")(Highcharts);
import highchartsMore from "highcharts/highcharts-more";
import exportingInit from "highcharts/modules/exporting";
import offlineExportingInit from "highcharts/modules/offline-exporting";

exportingInit(Highcharts);
offlineExportingInit(Highcharts);

import { Tabs, Tooltip, Button, Popover } from "antd";
import { DownloadOutlined, ShareAltOutlined } from "@ant-design/icons";
// Internationalization
import T from "i18n-react";
import HighchartsNoData from "highcharts/modules/no-data-to-display";

// Initialize the module
if (typeof Highcharts === "object") {
  highchartsMore(Highcharts);
}
import Loading from "../../../components/loading/Loading";
import ShareLinkModal from "../../../components/modal/ShareLinkModal";
import iodaWatermark from "../../../../../images/ioda-canvas-watermark.svg";
import { getUpstreamChartExportFileName } from "../utils/EntityUtils";
import { secondsToUTC } from "../../../utils/timeUtils";

const UpstreamDelayComponent = ({
  from,
  until,
  rawAsnSignalsUpstreamDelayLatency,
  rawAsnSignalsUpstreamDelayPenultAsnCount,
  entityName,
}) => {
  console.log(rawAsnSignalsUpstreamDelayLatency);
  console.log(rawAsnSignalsUpstreamDelayPenultAsnCount);

  const [activeTab, setActiveTab] = useState("1");
  const [displayChartSharePopover, setDisplayChartSharePopover] =
    useState(false);

  const CUSTOM_FONT_FAMILY = "Inter, sans-serif";

  const colorsArray = [
    "#52c41a",
    "#eb2f96",
    "#722ed1",
    "#722ed1",
    "#b5f5ec",
    "#ee9d1a",
  ];

  const upstreamChartTitle = T.translate("entity.upstreamChartTitle");
  const upstreamChartSubTitle = T.translate("entity.upstreamChartSubTitle");

  const [showShareLinkModal, setShowShareLinkModal] = useState(false);

  const [jsonData, setJsonData] = useState(null);
  const [traceData, setTraceData] = useState(null);

  const chartCombinedRef = useRef(null);
  const chartIndividualRef = useRef(null);
  const chartTraceRouteRef = useRef(null);

  useEffect(() => {
    if (!rawAsnSignalsUpstreamDelayLatency?.[0]?.[0]) return;
    const { values, ...rest } = rawAsnSignalsUpstreamDelayLatency[0][0];
    const newValues =
      values
        ?.map((item) => {
          if (item && typeof item.slice === "function") {
            return item.slice(0, 5);
          }
          return null;
        })
        .filter((item) => item !== null) || [];
    setJsonData({
      ...rest,
      values: newValues,
    });
  }, [rawAsnSignalsUpstreamDelayLatency]);

  useEffect(() => {
    if (!rawAsnSignalsUpstreamDelayPenultAsnCount?.[0]?.[0]) return;
    const { values, ...rest } = rawAsnSignalsUpstreamDelayPenultAsnCount[0][0];
    const newValues =
      values
        ?.map((item) => {
          if (item && typeof item.slice === "function") {
            return item.slice(0, 5);
          }
          return null;
        })
        .filter((item) => item !== null) || [];
    setTraceData({
      ...rest,
      values: newValues,
    });
  }, [rawAsnSignalsUpstreamDelayPenultAsnCount]);

  function geometricMean(values) {
    const valid = values.filter((v) => v != null);
    if (valid.length === 0) return null; // Handle empty array case
    const product = valid.reduce((a, b) => a * b, 1);
    return Math.pow(product, 1 / valid.length);
  }

  const asnLatencyData =
    jsonData?.values?.map((obj) => {
      const geometric_mean_e2e_latency_array = obj.map(
        (item) => item?.agg_values?.geometric_mean_e2e_latency
      );
      return geometricMean(geometric_mean_e2e_latency_array) === null
        ? null
        : Math.round(geometricMean(geometric_mean_e2e_latency_array));
    }) || [];

  const exportChartTitle = getChartExportTitle();

  const exportChartSubtitle = getChartExportSubtitle();

  const exportFileName = getUpstreamChartExportFileName(from, entityName);

  function getChartExportTitle() {
    return `${T.translate("entity.upstreamChartTitle")} ${entityName?.trim()}`;
  }

  function getChartExportSubtitle() {
    const fromDayjs = secondsToUTC(from);
    const untilDayjs = secondsToUTC(until);

    const formatExpanded = "MMMM D, YYYY h:mma";

    return `${fromDayjs.format(formatExpanded)} - ${untilDayjs.format(
      formatExpanded
    )} UTC`;
  }

  const dateFormats = {
    millisecond: "%l:%M:%S%p",
    second: "%l:%M:%S%p",
    minute: "%l:%M%p",
    hour: "%l:%M%p",
    day: "%b %e",
    week: "%b %e",
    month: "%b %Y",
    year: "%Y",
  };

  const latencyAsnDict = {};

  // Process each entry in the values array
  jsonData?.values?.forEach((obj) => {
    obj.forEach((entry) => {
      const asName = `AS${entry.penultimate_as}`;
      if (!latencyAsnDict[asName]) {
        latencyAsnDict[asName] = [];
      }
      // Convert null to 0 for penultimate_as_count
      const latency = (entry.agg_values.geometric_mean_e2e_latency =
        entry.agg_values.geometric_mean_e2e_latency);
      latencyAsnDict[asName].push(latency);
    });
  });

  const latencyAsnSeries = Object.keys(latencyAsnDict).map((name, i) => ({
    name,
    data: latencyAsnDict[name],
    color: Highcharts.color(colorsArray[i]).get(),
    lineColor: colorsArray[i],
  }));

  const traceAsnDict = {};

  // Process each entry in the values array
  traceData?.values?.forEach((timepoint) => {
    timepoint.forEach((entry) => {
      const asName = `AS${entry.penultimate_as}`;
      if (!traceAsnDict[asName]) {
        traceAsnDict[asName] = [];
      }
      const count = entry.agg_values.penultimate_as_count;
      traceAsnDict[asName].push(count);
    });
  });

  console.log(traceAsnDict);

  // Format the result as required
  const traceAsnSeries =
    Object.keys(traceAsnDict).map((name, i) => ({
      name,
      data: traceAsnDict[name],
      color: Highcharts.color(colorsArray[i]).setOpacity(0.4).get(),
      lineColor: colorsArray[i],
    })) || [];

  console.log(traceAsnSeries);

  const latencyCombined = {
    chart: {
      type: "line",
      height: 180,
      animation: false,
    },
    title: {
      text: "<strong>Average Latency</strong> <span style='font-weight: normal; opacity: 0.8;'>Round Trip Time (s)</span>",
      align: "left",
      x: 10,
    },
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          enabled: false,
        },
      },
      fallbackToExportServer: false,
      filename: exportFileName,
      chartOptions: {
        title: {
          align: "left",
          text: exportChartTitle,
          style: {
            fontWeight: "bold",
          },
        },
        subtitle: {
          align: "left",
          text: exportChartSubtitle,
        },
        legend: {
          itemDistance: 40,
          enabled: true,
        },
        spacing: [50, 10, 15, 10],
      },
      // Maintain a 16:9 aspect ratio: https://calculateaspectratio.com/
      sourceWidth: 960,
      sourceHeight: 240,
    },
    yAxis: {
      min: 0,
      endOnTick: false,
      maxPadding: 0.25,
      tickAmount: 5,
      title: { text: "" },
      labels: {
        style: {
          fontSize: "10px",
        },
        formatter: function () {
          return Math.round(this.value / 1000).toLocaleString();
        },
      },
    },
    xAxis: {
      visible: false,
      type: "datetime",
    },
    series: [
      {
        name: "TTL ",
        data: asnLatencyData,
        color: "#1890ff",
        lineColor: "#1890ff",
      },
    ], // TODO - done
    legend: {
      enabled: false,
    },
    plotOptions: {
      series: {
        animation: false,
        marker: {
          enabled: true,
          radius: 2,
        },
        lineWidth: 0.9,
        pointStart: jsonData?.from * 1000,
        pointInterval: jsonData?.step * 1000,
      },
    },
    tooltip: {
      xDateFormat: "%a, %b %e %l:%M%p",
      borderWidth: 1,
      borderRadius: 0,
      style: {
        fontSize: "14px",
        fontFamily: CUSTOM_FONT_FAMILY,
      },
      headerFormat: "{point.key}<br>",
      pointFormatter: function () {
        return `<b>Mean TTL</b> = ${this.y} ms`;
      },
    },
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 600,
          },
          chartOptions: {
            chart: {
              width: 400,
              height: 300,
            },
          },
        },
      ],
    },
    lang: {
      noData: "No Latency data available for selected time range",
    },
    noData: {
      style: {
        fontWeight: "bold",
        fontSize: "14px",
        color: "#666",
      },
    },
    credits: {
      enabled: false,
    },
  };

  const latencyIndividual = {
    chart: {
      type: "line",
      height: 180,
      animation: false,
    },
    title: {
      text: "<strong>Latency</strong> <span style='font-weight: normal; opacity: 0.8;'>Round Trip Time (s)</span>",
      align: "left",
      x: 10,
      // useHTML: true
    },
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          enabled: false,
        },
      },
      fallbackToExportServer: false,
      filename: exportFileName,
      chartOptions: {
        title: {
          align: "left",
          text: exportChartTitle,
          style: {
            fontWeight: "bold",
          },
        },
        subtitle: {
          align: "left",
          text: exportChartSubtitle,
        },
        legend: {
          itemDistance: 40,
          enabled: true,
        },
        spacing: [50, 10, 15, 10],
      },
      // Maintain a 16:9 aspect ratio: https://calculateaspectratio.com/
      sourceWidth: 960,
      sourceHeight: 240,
    },
    yAxis: {
      endOnTick: false,
      maxPadding: 0.25,
      tickAmount: 5,
      title: { text: "" },
      labels: {
        style: {
          fontSize: "10px",
        },
        formatter: function () {
          return Math.round(this.value / 1000).toLocaleString();
        },
      },
    },
    xAxis: {
      visible: false,
      type: "datetime",
    },
    series: latencyAsnSeries,
    legend: {
      enabled: false,
    },

    plotOptions: {
      series: {
        animation: false,
        marker: {
          enabled: true,
          radius: 2,
        },
        lineWidth: 0.9,
        pointStart: jsonData?.from * 1000,
        pointInterval: jsonData?.step * 1000,
      },
    },
    tooltip: {
      xDateFormat: "%a, %b %e %l:%M%p",
      borderWidth: 1,
      borderRadius: 0,
      style: {
        fontSize: "14px",
        fontFamily: CUSTOM_FONT_FAMILY,
      },
      headerFormat: "{point.key}<br>",
      pointFormatter: function () {
        return `<b>TTL</b> = ${this.y} ms`;
      },
    },
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 600,
          },
          chartOptions: {
            chart: {
              width: 400,
              height: 300,
            },
          },
        },
      ],
    },
    lang: {
      noData: "No Latency data available for selected time range",
    },
    noData: {
      style: {
        fontWeight: "bold",
        fontSize: "14px",
        color: "#666",
      },
    },
    credits: {
      enabled: false,
    },
  };

  const traceRouteOptions = {
    chart: {
      type: "area",
      height: 220,
      animation: false,
    },
    title: {
      text: "<strong>Traceroute</strong> <span style='font-weight: normal; opacity: 0.8;'># of observations of penultimate ASes</span>",
      align: "left",
      x: 0,
      useHTML: true,
    },
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          enabled: false,
        },
      },
      fallbackToExportServer: false,
      filename: exportFileName,
      chartOptions: {
        title: {
          align: "left",
          text: exportChartTitle,
          style: {
            fontWeight: "bold",
          },
        },
        subtitle: {
          align: "left",
          text: exportChartSubtitle,
        },
        legend: {
          itemDistance: 40,
          enabled: true,
        },
        spacing: [50, 10, 15, 10],
      },
      // Maintain a 16:9 aspect ratio: https://calculateaspectratio.com/
      sourceWidth: 960,
      sourceHeight: 240,
    },
    yAxis: {
      tickAmount: 5,
      title: { text: "" },
      labels: {
        style: {
          fontSize: "10px",
        },
        formatter: function () {
          return this.value;
        },
      },
    },
    xAxis: {
      type: "datetime",
      gridLineColor: "#666",
      gridLineDashStyle: "Dash",
      tickPixelInterval: 100,
      dateTimeLabelFormats: dateFormats,
      labels: {
        // format: '{value:%H:%M}',
        zIndex: 100,
        align: "center",
        y: 24,
        style: {
          //textOutline: "2px solid #fff",
          color: "#666",
          fontSize: "10px",
          fontFamily: CUSTOM_FONT_FAMILY,
        },
      },
      title: {
        text: "Time (UTC)",
        style: {
          fontSize: "12px",
          fontFamily: CUSTOM_FONT_FAMILY,
        },
      },
    },
    series: traceAsnSeries,
    legend: {
      enabled: false,
    },
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 600,
          },
          chartOptions: {
            chart: {
              width: 400,
              height: 300,
            },
          },
        },
      ],
    },
    lang: {
      noData: "No trace data available for selected time range",
    },
    noData: {
      style: {
        fontWeight: "bold",
        fontSize: "14px",
        color: "#666",
      },
    },
    plotOptions: {
      // series: {
      //     marker: {
      //         enabled: true
      //     },
      //     pointStart: traceData?.from * 1000,
      //     pointInterval: traceData?.step * 1000
      // },
      area: {
        stacking: "normal",
        lineWidth: 1,
        marker: {
          enabled: false,
        },
      },
    },
    tooltip: {
      xDateFormat: "%a, %b %e %l:%M%p",
      borderWidth: 1.5,
      borderRadius: 0,
      style: {
        fontSize: "14px",
        fontFamily: CUSTOM_FONT_FAMILY,
      },
    },
    credits: {
      enabled: false,
    },
  };

  const asnListName =
    jsonData?.values?.[0]?.map((item) => `AS${item.penultimate_as}`) || [];
  const asnList = asnListName.map((name, i) => ({
    name,
    color: colorsArray[i],
  }));
  const ASNLegend = ({ asnList }) => (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {asnList.map((item) => (
          <div
            key={item.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              marginRight: "18px",
              marginBottom: "6px",
            }}
          >
            <div
              style={{
                width: "14px",
                height: "14px",
                backgroundColor: Highcharts.color(item.color)
                  .setOpacity(0.4)
                  .get(),
                borderRadius: "50%",
                borderColor: item.color,
                borderStyle: "solid",
                borderWidth: "1.5px",
              }}
            />
            <span style={{ color: "#333", fontSize: "14px" }}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );

  function displayShareLinkModal() {
    setShowShareLinkModal(true);
  }

  function hideShareLinkModal() {
    setShowShareLinkModal(false);
  }

  function handleDisplayChartSharePopover(val) {
    setDisplayChartSharePopover(val);
  }

  /**
   * Trigger a download of the chart from outside the chart context. Used in the
   * ShareLinkModal to trigger a direct download
   */
  function manuallyDownloadChart(imageType) {
    const chartRef1 = activeTab === "1" ? chartCombinedRef : chartIndividualRef;

    const chartRef2 = chartTraceRouteRef;
    if (!chartRef1.current?.chart || !chartRef2.current?.chart) {
      return;
    }

    console.log(chartRef2);

    // Append watermark to image on download:
    // https://www.highcharts.com/forum/viewtopic.php?t=47368
    chartRef1.current.chart.exportChartLocal(
      {
        type: imageType,
        filename: exportFileName,
      },
      {
        // chart: {}
        chart: {
          // spacingTop: 70,
          events: {
            load: function () {
              const chart = this;
              const watermarkAspectRatio = 0.184615;
              const watermarkWidth = Math.floor(chart.chartWidth / 6);
              const watermarkHeight = Math.floor(
                watermarkWidth * watermarkAspectRatio
              );
              const padding = 12;

              chart.watermarkImage = chart.renderer
                .image(
                  iodaWatermark,
                  chart.chartWidth - watermarkWidth - padding,
                  padding,
                  watermarkWidth,
                  watermarkHeight
                )
                .add()
                .toFront();
            },
          },
        },
      }
    );
  }

  return (
    <React.Fragment>
      <ShareLinkModal
        open={showShareLinkModal}
        link={window.location.href}
        hideModal={hideShareLinkModal}
        showModal={displayShareLinkModal}
        entityName={entityName}
        handleDownload={() => manuallyDownloadChart("image/jpeg")}
      />
      <div>
        <div className="flex items-stretch gap-0 mb-6 entity__chart-layout">
          <div className="col-3">
            <div className="p-4">
              <div className="flex items-center mb-3">
                <h3 className="text-2xl mr-1">
                  {upstreamChartTitle}
                  {entityName}
                </h3>
                <div className="flex ml-auto">
                  <Tooltip title="Share Link">
                    <Button
                      className="mr-3"
                      icon={<ShareAltOutlined />}
                      onClick={displayShareLinkModal}
                    />
                  </Tooltip>

                  <Popover
                    open={displayChartSharePopover}
                    onOpenChange={handleDisplayChartSharePopover}
                    trigger="click"
                    placement="bottomRight"
                    overlayStyle={{
                      maxWidth: 180,
                    }}
                    content={
                      <div
                        onClick={() => handleDisplayChartSharePopover(false)}
                      >
                        <Button
                          className="w-full mb-2"
                          size="small"
                          onClick={() => manuallyDownloadChart("image/jpeg")}
                        >
                          Chart JPEG
                        </Button>
                        <Button
                          className="w-full mb-2"
                          size="small"
                          onClick={() => manuallyDownloadChart("image/png")}
                        >
                          Chart PNG
                        </Button>
                        <Button
                          className="w-full"
                          size="small"
                          onClick={() => manuallyDownloadChart("image/svg+xml")}
                        >
                          Chart SVG
                        </Button>
                      </div>
                    }
                  >
                    <Tooltip
                      title="Download"
                      mouseEnterDelay={0}
                      mouseLeaveDelay={0}
                    >
                      <Button icon={<DownloadOutlined />} />
                    </Tooltip>
                  </Popover>
                </div>
              </div>
              <div>
                <h4 className="text-xl mr-1 mt-0 mb-1">
                  {upstreamChartSubTitle}
                </h4>
              </div>
            </div>
            {jsonData && (
              <div className="upstream__chart">
                <div className="card">
                  <div
                    className="header-row"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Tabs
                      defaultActiveKey="1"
                      animated={false}
                      style={{ marginBottom: 0 }}
                      items={[
                        {
                          key: "1",
                          label: (
                            <span style={{ padding: "0 10px" }}>
                              {" "}
                              Combined{" "}
                            </span>
                          ),
                        },
                        {
                          key: "2",
                          label: (
                            <span style={{ padding: "0 10px" }}>
                              {" "}
                              Individual{" "}
                            </span>
                          ),
                        },
                      ]}
                      onChange={(key) => setActiveTab(key)}
                    />
                    <ASNLegend asnList={asnList} />
                  </div>

                  <div className="content-area px-0">
                    {activeTab === "1" ? (
                      <HighchartsReact
                        highcharts={Highcharts}
                        options={latencyCombined}
                        ref={chartCombinedRef}
                      />
                    ) : (
                      <HighchartsReact
                        highcharts={Highcharts}
                        options={latencyIndividual}
                        ref={chartIndividualRef}
                      />
                    )}
                  </div>
                </div>
                <div className="px-4 card">
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={traceRouteOptions}
                    ref={chartTraceRouteRef}
                  />
                </div>
              </div>
            )}
            {!jsonData && <Loading />}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default UpstreamDelayComponent;
