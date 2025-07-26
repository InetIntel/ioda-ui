import React, { useEffect, useRef, useState } from "react";

import highchartsMore from "highcharts/highcharts-more";
import iodaWatermark from "../../../../../images/ioda-canvas-watermark.svg";
// Internationalization
import T from "i18n-react";

// Chart Libraries
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
require("highcharts/modules/exporting")(Highcharts);
require("highcharts/modules/export-data")(Highcharts);
require("highcharts/modules/offline-exporting")(Highcharts);
// import exportingInit from "highcharts/modules/exporting";
// import offlineExportingInit from "highcharts/modules/offline-exporting";
import cloneDeep from "lodash/cloneDeep";
import Loading from "../../../components/loading/Loading";
import MagnifyExpandIcon from "@2fd/ant-design-icons/lib/MagnifyExpand";

import { Button, Checkbox, Popover, Tooltip, Cascader, Tag } from "antd";
import {
  DownloadOutlined,
  ShareAltOutlined,
  EditOutlined,
} from "@ant-design/icons";
import ShareLinkModal from "../../../components/modal/ShareLinkModal";
import MarkupStudioModal from "./MarkupStudioModal";
import { getApLatencyChartExportFileName } from "../utils/EntityUtils";
import {
  millisecondsToSeconds,
  secondsToMilliseconds,
  secondsToUTC,
} from "../../../utils/timeUtils";
import TimeStamp from "../../../components/timeStamp/TimeStamp";
import HighchartsNoData from "highcharts/modules/no-data-to-display";

if (typeof Highcharts === "object") {
  highchartsMore(Highcharts);
}

// exportingInit(Highcharts);
// offlineExportingInit(Highcharts);
HighchartsNoData(Highcharts);

const ApPacketLatencyAndLossRateComponent = ({
  from,
  until,
  rawAsnSignalsApPacketLoss,
  rawAsnSignalsApPacketDelay,
  entityName,
  loading,
}) => {
  const [lossData, setLossData] = useState(null);
  const [latencyData, setLatencyData] = useState(null);
  const [displayLatency, setDisplayLatency] = useState(true);
  const [displayPctLoss, setDisplayPctLoss] = useState(true);
  const [showShareLinkModal, setShowShareLinkModal] = useState(false);
  const rightYAxisTitleRef = useRef(null);
  const leftYAxisTitleRef = useRef(null);
  const chartRef = useRef(null);

  const [tsDataLegendRangeFrom, setTsDataLegendRangeFrom] = useState(from);
  const [tsDataLegendRangeUntil, setTsDataLegendRangeUntil] = useState(until);
  const [showResetZoomButton, setShowResetZoomButton] = useState(false);
  const [displayChartSharePopover, setDisplayChartSharePopover] =
    useState(false);
  const [showMarkupStudioModal, setShowMarkupStudioModal] = useState(false);
  const [markupStudioSvgBaseString, setMarkupStudioSvgBaseString] =
    useState("");
  // exportingInit(Highcharts);
  // offlineExportingInit(Highcharts);
  const [viewMode, setViewMode] = useState("overlay");
  const ViewModeToggle = () => (
    <div style={{ marginBottom: "16px" }}>
      <Button.Group>
        <Button
          type={viewMode === "overlay" ? "primary" : "default"}
          onClick={() => setViewMode("overlay")}
          //   style={{ fontSize: 12 }}
          style={
            viewMode === "overlay"
              ? {
                  backgroundColor: "#1570EF33",
                  color: "#1570EF",
                  borderColor: "#1570EF33",
                  fontSize: 12,
                }
              : { fontSize: 12 }
          }
        >
          Overlay View
        </Button>
        <Button
          type={viewMode === "stacked" ? "primary" : "default"}
          onClick={() => setViewMode("stacked")}
          style={
            viewMode === "stacked"
              ? {
                  backgroundColor: "#1570EF33",
                  color: "#1570EF",
                  borderColor: "#1570EF33",
                  fontSize: 12,
                }
              : { fontSize: 12 }
          }
        >
          Stacked View
        </Button>
      </Button.Group>
    </div>
  );
  useEffect(() => {
    console.log("loading?", loading);
  }, [loading]);
  useEffect(() => {
    if (!rawAsnSignalsApPacketLoss?.[0]?.[0]) {
      return;
    }
    const { values, ...rest } = rawAsnSignalsApPacketLoss[0][0];

    const newValues =
      values
        ?.map((item) => {
          if (item && typeof item.slice === "function") {
            return item.slice(0, 5);
          }
          return null;
        })
        .filter((item) => item !== null) || [];

    setLossData({
      ...rest,
      values: newValues,
    });
  }, [rawAsnSignalsApPacketLoss]);

  useEffect(() => {
    if (!rawAsnSignalsApPacketDelay?.[0]?.[0]) {
      return;
    }
    const { values, ...rest } = rawAsnSignalsApPacketDelay[0][0];
    const newValues =
      values
        ?.map((item) => {
          if (item && typeof item.slice === "function") {
            return item.slice(0, 5);
          }
          return null;
        })
        .filter((item) => item !== null) || [];
    setLatencyData({
      ...rest,
      values: newValues,
    });
  }, [rawAsnSignalsApPacketDelay]);

  // function for when zoom/pan is used
  function xyPlotRangeChanged(event) {
    if (!event.target.series) {
      return;
    }

    // Count the number of visible series in our chart
    const hasVisibleSeries = event.target.series.some(
      (series) => !!series.visible
    );

    // If we don't have any data on the chart, Highcharts will set an arbitrary
    // erroring data range. We prevent this by terminating early
    if (!hasVisibleSeries) {
      return;
    }

    const axisMin = millisecondsToSeconds(event.min);
    const axisMax = millisecondsToSeconds(event.max);

    const isDefaultRange = axisMin === from && axisMax === until;

    setTsDataLegendRangeFrom(axisMin);
    setTsDataLegendRangeUntil(axisMax);
    setShowResetZoomButton(!isDefaultRange);
  }
  function getChartSvg() {
    if (chartRef.current) {
      return chartRef.current.chart.getSVG();
    }
    return null;
  }
  function handleShowMarkupStudioModal() {
    setShowMarkupStudioModal(true);
    setMarkupStudioSvgBaseString(getChartSvg());
  }
  function handleHideMarkupStudioModal() {
    setShowMarkupStudioModal(false);
  }
  function setDefaultNavigatorTimeRange() {
    const navigatorLowerBound = secondsToMilliseconds(from);
    const navigatorUpperBound = secondsToMilliseconds(until);

    setChartNavigatorTimeRange(navigatorLowerBound, navigatorUpperBound);
  }
  function setChartNavigatorTimeRange(fromMs, untilMs) {
    if (!chartRef || !chartRef.current) {
      return;
    }
    chartRef.current.chart.xAxis[0].setExtremes(fromMs, untilMs);
  }

  const asnListFull = [
    {
      name: "Median Latency",
      color: "#0000FF",
    },
    {
      name: "90th and 10th Percentile",
      color: "#7cb5ec",
    },
    {
      name: "Probe/Response Loss",
      color: "#52c41a",
    },
  ];
  const CUSTOM_FONT_FAMILY = "Inter, sans-serif";

  const [asnList, setAsnList] = useState([]);
  useEffect(() => {
    let newAsnList = [];
    if (displayLatency) {
      newAsnList = newAsnList.concat(asnListFull[0]);
      newAsnList = newAsnList.concat(asnListFull[1]);
    }
    if (displayPctLoss) {
      newAsnList = newAsnList.concat(asnListFull[2]);
    }
    setAsnList(newAsnList);
  }, [displayPctLoss, displayLatency]);

  useEffect(() => {
    const chart = chartRef.current?.chart;
    const leftText = leftYAxisTitleRef.current;
    if (chart && leftText) {
      if (displayLatency) {
        leftText.attr({
          text: "<strong>RTT Latency</strong> <span style='opacity: 0.8;'> (ms)</span>",
        });
      } else {
        leftText.attr({ text: "" });
      }
    }
  }, [displayLatency, leftYAxisTitleRef]);

  useEffect(() => {
    const chart = chartRef.current?.chart;
    const rightText = rightYAxisTitleRef.current;
    if (chart && rightText) {
      if (displayPctLoss) {
        rightText.attr({
          text: "<strong> Probe/Response Loss Rate</strong> <span style='opacity: 0.8;'> (%)</span>",
        });
      } else {
        rightText.attr({ text: "" });
      }
      const bbox = rightText.getBBox();
      rightText.attr({
        x: chart.chartWidth - chart.marginRight - bbox.width,
      });
    }
  }, [displayPctLoss, rightYAxisTitleRef]);

  const navigatorLowerBound = secondsToMilliseconds(tsDataLegendRangeFrom);
  const navigatorUpperBound = secondsToMilliseconds(tsDataLegendRangeUntil);
  setChartNavigatorTimeRange(navigatorLowerBound, navigatorUpperBound);

  const activeProbingChartTitle = T.translate("entity.activeProbingChartTitle");
  const activeProbingChartSubTitle = T.translate(
    "entity.activeProbingChartSubTitle"
  );

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

  // all Data sources - lossPackage, lossRanges, lossMedians

  const lossPackage =
    lossData?.values?.map((obj, index) => {
      const x = secondsToMilliseconds(
        latencyData?.from + latencyData?.step * index
      );
      return [x, obj[0]?.agg_values.loss_pct];
    }) || [];

  const lossRanges =
    latencyData?.values
      ?.map((obj, index) => {
        const x = secondsToMilliseconds(
          latencyData?.from + latencyData?.step * index
        );
        return [
          x,
          obj[0]?.agg_values
            ? {
                low: obj[0].agg_values.p10_latency,
                high: obj[0].agg_values.p90_latency,
              }
            : null,
        ];
      })
      .filter((point) => point[1] != null) || [];

  const lossMedians =
    latencyData?.values
      ?.map((obj, index) => {
        const x = secondsToMilliseconds(
          latencyData?.from + latencyData?.step * index
        );
        return [x, obj[0].agg_values.median_latency];
      })
      .filter((point) => point[1] != null && !isNaN(point[1])) || [];

  const latencyHighs = lossRanges.map(([, range]) => range.high);
  const maxLatencyHigh =
    latencyHighs.length > 0 ? Math.max(...latencyHighs) : null;
  const latencyMax = maxLatencyHigh ? maxLatencyHigh * 1.1 : null;
  let navLatency = [],
    navLoss = [];

  if (lossMedians.length > 0 && lossPackage.length > 0) {
    const valsLat = lossMedians.map(([, v]) => v);
    const valsLoss = lossPackage.map(([, v]) => v);

    const minLat = Math.min(...valsLat),
      maxLat = Math.max(...valsLat);
    const minLoss = Math.min(...valsLoss),
      maxLoss = Math.max(...valsLoss);

    navLatency = lossMedians.map(([t, v]) => [t, v / latencyMax]);

    navLoss = lossPackage.map(([t, v]) => [
      t,
      //   (v - minLoss) / (maxLoss - minLoss),
      v / 100,
    ]);
  }

  // const rightPartitionMin = lossPackage?.length > 0 ? Math.min(...lossPackage) : null;
  const rightPartitionMax =
    lossPackage?.length > 0 ? Math.max(...lossPackage) : null;

  function getChartExportTitle() {
    return `${T.translate(
      "entity.activeProbingChartTitle"
    )} ${entityName?.trim()}`;
  }

  function getChartExportSubtitle() {
    const fromDayjs = secondsToUTC(from);
    const untilDayjs = secondsToUTC(until);

    const formatExpanded = "MMMM D, YYYY h:mma";

    return `${fromDayjs.format(formatExpanded)} - ${untilDayjs.format(
      formatExpanded
    )} UTC`;
  }

  const exportChartTitle = getChartExportTitle();

  const exportChartSubtitle = getChartExportSubtitle();

  const exportFileName = getApLatencyChartExportFileName(from, entityName);

  const options = {
    chart: {
      marginLeft: 40,
      marginRight: 50,
      type: "arearange",
      zoomType: "x",
      resetZoomButton: {
        theme: { style: { display: "none" } },
      },
      panning: true,
      panKey: "shift",
      animation: false,
      selectionMarkerFill: "rgba(50, 184, 237, 0.3)",
      height: 350,
      backgroundColor: "#ffffff",
      events: {
        load: function () {
          const chart = this;

          //   // Left-aligned title
          //   leftYAxisTitleRef.current = chart.renderer
          //     .text(
          //       "<strong>Latency</strong> <span style='opacity: 0.8;'>(Round Trip Time (ms))</span>",
          //       chart.plotLeft,
          //       chart.plotTop - 20,
          //       true
          //     )
          //     .css({
          //       color: "#333",
          //       fontSize: "12px",
          //     })
          //     .add();

          //   // Right-aligned title
          //   // if(displayPctLoss) {

          //   const rightText = chart.renderer
          //     .text(
          //       displayPctLoss
          //         ? "<strong> Packet Loss </strong> <span style='opacity: 0.8;'>(Percentage Loss Rate)</span>"
          //         : "",
          //       0,
          //       chart.plotTop - 20,
          //       true
          //     )
          //     .css({
          //       color: "#333",
          //       fontSize: "12px",
          //       textAlign: "right",
          //     })
          //     .add();

          //   // Align it to the right
          //   const textBBox = rightText.getBBox();
          //   // rightText.attr({
          //   //     x: chart.chartWidth - chart.marginRight - textBBox.width - 20
          //   // });
          //   rightText.attr({
          //     // x: chart.plotLeft + chart.plotWidth - textBBox.width,
          //     x: chart.chartWidth - chart.marginRight - textBBox.width,
          //   });

          //   rightYAxisTitleRef.current = rightText;
          //   //   // }
          //   //   const axisMax = chart.yAxis[0].getExtremes().max;

          //   //   //    (make sure lossMedians and lossPackage are in scope)
          //   //   const navLatency = lossMedians.map(([t, v]) => [
          //   //     t,
          //   //     (v * 100) / axisMax,
          //   //   ]);
          //   //   const navLoss = lossPackage.map(([t, v]) => [t, v]);

          //   //   chart.navigator.series[0].setData(navLatency, false);
          //   //   chart.navigator.series[1].setData(navLoss, false);

          //   //   chart.redraw();
        },
      },
      spacingBottom: 0,
      spacingLeft: 5,
      spacingRight: 5,
      spacingTop: 45,
      style: {
        fontFamily: CUSTOM_FONT_FAMILY,
      },
    },
    title: {
      text: "",
    },
    accessibility: {
      enabled: false,
    },
    credits: {
      enabled: false,
    },
    navigation: {
      buttonOptions: {
        enabled: false,
      },
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
          y: -10,
          x: 1,
          style: {
            fontWeight: "bold",
          },
        },
        subtitle: {
          align: "left",
          text: exportChartSubtitle,
          y: 3,
          x: 1,
        },
        legend: {
          itemDistance: 40,
        },
        spacing: [1, 1, 1, 1],
      },
      // Maintain a 16:9 aspect ratio: https://calculateaspectratio.com/
      sourceWidth: 736,
      sourceHeight: 414,
    },
    tooltip: {
      shared: true,
      xDateFormat: "%a, %b %e %l:%M%p",
      borderWidth: 1,
      borderRadius: 0,
      style: {
        fontSize: "14px",
        fontFamily: CUSTOM_FONT_FAMILY,
      },
    },
    legend: {
      enabled: latencyData,
      margin: 10,
      className: "ap-latency-loss-legend",
      itemStyle: {
        fontSize: "10px",
        fontFamily: CUSTOM_FONT_FAMILY,
      },
      alignColumns: true,
    },
    navigator: {
      enabled: latencyData,

      adaptToUpdatedData: false,

      time: {
        useUTC: true,
      },
      margin: 10,
      maskFill: "rgba(50, 184, 237, 0.3)",
      outlineColor: "#aaa",
      xAxis: {
        gridLineColor: "#666",
        gridLineDashStyle: "Dash",
        tickPixelInterval: 100,
        dateTimeLabelFormats: dateFormats,
        labels: {
          zIndex: 100,
          align: "center",
          y: 12,
          style: {
            //textOutline: "2px solid #fff",
            color: "#666",
            fontSize: "10px",
            fontFamily: CUSTOM_FONT_FAMILY,
          },
        },
      },
      yAxis: {
        min: 0,
        max: 1,
      },
      series: [
        {
          data: navLatency,
          type: "line",
          color: "#722ED1",
          name: "Latency (normalized)",
          index: 0,
          visible: displayLatency,
        },
        {
          data: navLoss,
          type: "line",
          color: "#D62782",
          name: "Probe/Response Loss",
          index: 1,
          visible: displayPctLoss,
        },
      ],
    },
    time: {
      useUTC: true,
    },
    plotOptions: {
      series: {
        animation: false,
        marker: {
          enabled: false,
        },
      },
    },
    xAxis: {
      showEmpty: false,
      type: "datetime",
      minRange: secondsToMilliseconds(3 * 60),
      dateTimeLabelFormats: dateFormats,
      min: secondsToMilliseconds(from),
      max: secondsToMilliseconds(until),
      labels: {
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
      //   lineColor: "#eeeeee",
      //   tickColor: "#eeeeee",
      //   gridLineWidth: 1,
      //   gridLineColor: "#eeeeee",
      //   gridLineDashStyle: "dash",
      // minRange: secondsToMilliseconds(5 * 60),
      title: {
        text: "Time (UTC)",
        style: {
          fontSize: "12px",
          fontFamily: CUSTOM_FONT_FAMILY,
        },
      },
      events: {
        afterSetExtremes: (e) => {
          xyPlotRangeChanged(e);
        },
      },
    },
    yAxis: [
      {
        // title: {
        //   text: null,
        // },
        showEmpty: false,
        title: {
          text: '<strong>RTT Latency</strong> <span style="opacity:0.8;">(ms)</span>',
          useHTML: true,
          align: "high",
          textAlign: "left",
          rotation: 0,
          x: 0,
          y: -15,
          style: { fontSize: "12px", color: "#333", whiteSpace: "nowrap" },
        },
        tickAmount: 5,
        // lineColor: "#eeeeee",
        // tickColor: "#eeeeee",
        // gridLineColor: "#eeeeee",
        // gridLineDashStyle: "dash",
        gridLineColor: "#E6E6E6",
        gridLineDashStyle: "ShortDash",
        labels: {
          x: -5,
          style: {
            fontSize: "10px",
          },
          formatter: function () {
            return this.value;
          },
        },
        // endOnTick: false,
        min: 0,
        // max: latencyMax,
        visible: displayLatency,
      },
      {
        showEmpty: false,
        opposite: true,
        min: 0,
        max: 100,
        tickAmount: 5,
        lineColor: "#eeeeee",
        tickColor: "#eeeeee",
        gridLineColor: "#eeeeee",
        gridLineWidth: 1,
        gridLineDashStyle: "ShortDash",
        title: {
          text: '<strong>Probe/Response Loss</strong> <span style="opacity:0.8;">(%)</span>',
          useHTML: true,
          align: "high",
          textAlign: "right",
          rotation: 0,
          x: -30,
          y: -15,
          style: { fontSize: "12px", color: "#333", whiteSpace: "nowrap" },
        },
        // title: {
        //   text: null,
        // },
        labels: {
          x: 5,
          style: {
            colors: "#111",
            fontSize: "10px",
            fontFamily: CUSTOM_FONT_FAMILY,
          },
          formatter: function () {
            return this.value + "%";
          },
        },
        visible: displayPctLoss,
      },
    ],
    series: [
      {
        name: "Range",
        data: lossRanges?.map((range) => [
          range[0],
          range[1].low,
          range[1].high,
        ]),
        type: "arearange",
        color: "#EACBED",
        zIndex: 0,
        visible: displayLatency,
        showInNavigator: false,
      },
      {
        name: "Median",
        data: lossMedians,
        type: "line",
        color: "#722ED1",
        zIndex: 0,
        visible: displayLatency,
        lineWidth: 1,
        marker: {
          enabled: true,
          radius: 0.05,
          symbol: "circle",
          fillColor: "rgba(67, 67, 72, 0.9)",
          lineWidth: 1,
          lineColor: "#FFFFFF",
        },
        // showInNavigator: true,
        showInNavigator: false,
      },
      {
        name: "Loss",
        data: lossPackage,
        type: "line",
        color: "#D62782",
        zIndex: 0,
        lineWidth: 1,
        yAxis: 1,
        marker: {
          // enabled: true,
          // radius: 3,
          // symbol: 'circle',
          enabled: false,
        },
        visible: displayPctLoss,
        // showInNavigator: true,
        showInNavigator: false,
      },
    ],
    lang: {
      noData: "No data available for selected time range",
    },
    noData: {
      style: {
        fontWeight: "normal",
        fontSize: "14px",
        color: "#666",
      },
    },
  };
  const overlayOptions = options;

  const stackedOptions = cloneDeep(options);

  stackedOptions.chart.height = displayLatency + displayPctLoss < 2 ? 350 : 400;
  stackedOptions.chart.marginRight = 10;

  //   stackedOptions.yAxis = [
  //     {
  //       ...stackedOptions.yAxis[0],
  //       top: "0%",
  //       height: "45%",
  //       offset: 0,
  //     },
  //     {
  //       ...stackedOptions.yAxis[1],
  //       top: "55%",
  //       height: "45%",
  //       offset: 0,
  //       opposite: false,
  //     },
  //   ];
  //   stackedOptions.yAxis[1].title.textAlign = "left";
  //   stackedOptions.yAxis[1].title.x = 5;

  stackedOptions.yAxis = [];
  stackedOptions.series = [];

  let yAxisIndex = 0;

  if (displayLatency) {
    stackedOptions.yAxis.push({
      ...options.yAxis[0],
      max: null,
      top: displayPctLoss ? "0%" : "0%",
      height: displayPctLoss ? "40%" : "100%",
      offset: 0,
    });

    stackedOptions.series.push(
      {
        ...options.series.find((s) => s.name === "Range"),
        yAxis: yAxisIndex,
        visible: true,
      },
      {
        ...options.series.find((s) => s.name === "Median"),
        yAxis: yAxisIndex,
        visible: true,
      }
    );

    yAxisIndex++;
  }

  if (displayPctLoss) {
    stackedOptions.yAxis.push({
      ...options.yAxis[1],
      top: displayLatency ? "60%" : "0%",
      height: displayLatency ? "40%" : "100%",
      offset: 0,
      opposite: false,
    });

    stackedOptions.series.push({
      ...options.series.find((s) => s.name === "Loss"),
      yAxis: yAxisIndex,
      visible: true,
    });
    // stackedOptions.yAxis[yAxisIndex].title.textAlign = "left";
    stackedOptions.yAxis[yAxisIndex].title = {
      ...stackedOptions.yAxis[yAxisIndex].title,
      align: "high",
      textAlign: "left",
      x: 5,
      y: -15,
    };
    stackedOptions.yAxis[yAxisIndex].labels = {
      ...stackedOptions.yAxis[yAxisIndex].labels,
      x: -5,
    };
  }

  function displayShareLinkModal() {
    setShowShareLinkModal(true);
  }

  function hideShareLinkModal() {
    setShowShareLinkModal(false);
  }

  function handleDisplayLatencyBands(show) {
    setDisplayLatency(show);
  }

  function handleDisplayPctLoss(show) {
    setDisplayPctLoss(show);
  }

  function handleDisplayChartSharePopover(val) {
    setDisplayChartSharePopover(val);
  }
  /**
   * Trigger a download of the chart from outside the chart context. Used in the
   * ShareLinkModal to trigger a direct download
   */
  function manuallyDownloadChart(imageType) {
    if (!chartRef.current?.chart) {
      return;
    }

    // Append watermark to image on download:
    // https://www.highcharts.com/forum/viewtopic.php?t=47368
    chartRef.current.chart.exportChartLocal(
      {
        type: imageType,
      },
      {
        chart: {
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

  const apChartLatencyLabel = T.translate("entity.apChartLatencyLabel");
  const apChartPctLossLabel = T.translate("entity.apChartPctLossLabel");
  const ASNLegend = () => (
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
  const [selectedMetricPaths, setSelectedMetricPaths] = useState([]);

  const metricOptions = [
    {
      value: "latency",
      label: apChartLatencyLabel,
    },
    {
      value: "loss",
      label: apChartPctLossLabel,
    },
  ];

  useEffect(() => {
    const initial = [];
    if (displayLatency) {
      initial.push(["latency"]);
    }
    if (displayPctLoss) {
      initial.push(["loss"]);
    }
    setSelectedMetricPaths(initial);
  }, []);
  const tagColors = {
    latency: "#722ED1",
    loss: "#D62782",
  };
  useEffect(() => {
    if (!chartRef.current) return;
    const chart = chartRef.current.chart;
    const fromMs = secondsToMilliseconds(tsDataLegendRangeFrom);
    const toMs = secondsToMilliseconds(tsDataLegendRangeUntil);
    chart.xAxis[0].setExtremes(fromMs, toMs, true);
  }, [viewMode, tsDataLegendRangeFrom, tsDataLegendRangeUntil]);

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
      <MarkupStudioModal
        open={showMarkupStudioModal}
        svgString={markupStudioSvgBaseString}
        hideModal={handleHideMarkupStudioModal}
        chartTitle={getChartExportTitle()}
        chartSubtitle={getChartExportSubtitle()}
        exportFileName={() => getApLatencyChartExportFileName(from, entityName)}
        shareLink={window.location.href}
        entityName={entityName}
      />

      {/* <div className="gap-0 mb-6 card"> */}
      {/* <div className="p-4"> */}
      <div className="flex items-center mb-1">
        <h3 className="text-2xl mr-1">
          {activeProbingChartTitle}
          {entityName}
        </h3>
        <div className="flex ml-auto">
          {showResetZoomButton && (
            <Tooltip title="Reset View">
              <Button
                className="mr-3"
                icon={<MagnifyExpandIcon />}
                onClick={setDefaultNavigatorTimeRange}
              />
            </Tooltip>
          )}
          <Tooltip title="Markup">
            <Button
              className="mr-3"
              icon={<EditOutlined />}
              onClick={handleShowMarkupStudioModal}
              disabled={!latencyData}
            />
          </Tooltip>
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
              <div onClick={() => handleDisplayChartSharePopover(false)}>
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
            <Tooltip title="Download" mouseEnterDelay={0} mouseLeaveDelay={0}>
              <Button icon={<DownloadOutlined />} />
            </Tooltip>
          </Popover>
        </div>
      </div>
      <div>
        <h4 className="text-xl mr-1 mt-2" style={{ color: "#8c8c8c" }}>
          {activeProbingChartSubTitle}
        </h4>
      </div>
      {/* </div> */}

      {/* {lossPackage?.length > 0 && ( */}
      <div
        className="flex flex-col entity__chart-layout"
        style={{ flexDirection: "column" }}
      >
        {/* <div
            className="p-4"
            style={{ width: "30%", minWidth: "150px", marginTop: "10px" }}
          > */}
        <div className="flex mt-4" style={{ width: "100%" }}>
          <div style={{ width: "50%" }}>
            <Cascader
              className="custom-tag-spacing"
              options={metricOptions}
              value={selectedMetricPaths}
              onChange={(paths) => {
                setSelectedMetricPaths(paths);
                const flat = paths.map((p) => p[p.length - 1]);
                handleDisplayLatencyBands(flat.includes("latency"));
                handleDisplayPctLoss(flat.includes("loss"));
              }}
              multiple
              placeholder="Show metrics…"
              // maxTagCount="responsive"
              style={{ width: "100%" }}
              tagRender={({ label, value, closable, onClose }) => {
                const color = tagColors[value] || "#999";
                return (
                  <Tag
                    closable={closable}
                    onClose={onClose}
                    style={{
                      backgroundColor: `${color}33`,
                      borderColor: color,
                      color: "#000",
                      fontWeight: 500,
                    }}
                  >
                    {label}
                  </Tag>
                );
              }}
            />
          </div>
          <div className="ml-auto">
            <ViewModeToggle />
          </div>
        </div>
        {/* 0612 */}
        {/* <div className="flex-grow" style={{ width: "100%" }}> */}
        <div className=" w-full">
          {loading ? (
            <Loading />
          ) : (
            lossPackage && (
              <div>
                <HighchartsReact
                  key={viewMode}
                  highcharts={Highcharts}
                  options={
                    viewMode === "overlay" ? overlayOptions : stackedOptions
                  }
                  ref={chartRef}
                />

                <TimeStamp
                  className="mt-4"
                  from={tsDataLegendRangeFrom}
                  until={tsDataLegendRangeUntil}
                />
              </div>
            )
          )}
        </div>
      </div>
      {/* )}
       {!latencyData && <Loading />} */}
      {/* </div> */}
    </React.Fragment>
  );
};

export default ApPacketLatencyAndLossRateComponent;
