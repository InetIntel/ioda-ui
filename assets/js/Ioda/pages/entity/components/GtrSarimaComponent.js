import React, { useEffect, useRef, useState, useMemo } from "react";

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
import {
  getApLatencyChartExportFileName,
  getSarimaChartExportFileName,
} from "../utils/EntityUtils";
import {
  millisecondsToSeconds,
  secondsToMilliseconds,
  secondsToUTC,
} from "../../../utils/timeUtils";
import { handleTooltipPointClick } from "../../../utils/chartUtils";
import TimeStamp from "../../../components/timeStamp/TimeStamp";
import HighchartsNoData from "highcharts/modules/no-data-to-display";

if (typeof Highcharts === "object") {
  highchartsMore(Highcharts);
}

HighchartsNoData(Highcharts);

const GtrSarimaComponent = ({
  from,
  until,
  rawAsnSignalsGtrSarima,
  entityName,
  loading,
}) => {
  const [sarimaData, setSarimaData] = useState(null);
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
  const [seriesBySubtype, setSeriesBySubtype] = useState({});
  const [availableSubtypes, setAvailableSubtypes] = useState([]);
  const [selectedMetricPaths, setSelectedMetricPaths] = useState([]);
  useEffect(() => {
    const initial = [];
    initial.push(["WEB_SEARCH"]);
    setSelectedMetricPaths(initial);
  }, []);

  const tooltipEnabledRef = useRef(true);

  useEffect(() => {
    const groups = rawAsnSignalsGtrSarima?.[0] || [];
    if (!Array.isArray(groups) || groups.length === 0) {
      setSeriesBySubtype({});
      setAvailableSubtypes([]);
      return;
    }

    const bucket = {};
    const subtypeSet = new Set();

    groups.forEach((group) => {
      const subtype = group?.subtype || group?.product || "UNKNOWN";
      subtypeSet.add(subtype);

      const from = group?.from;
      const step = group?.step;
      const arr = group?.values || [];

      const relErr = arr
        .map((item, idx) => {
          const row = item?.[0];
          const observed = row?.agg_values?.observed;
          const predicted = row?.agg_values?.predicted;

          if (observed == null || predicted == null) return null;
          const denom = observed === 0 ? 1 : observed; // avoid /0
          const y = (observed - predicted) / denom;
          if (!Number.isFinite(y)) return null;

          const x = secondsToMilliseconds(from + step * idx);
          return [x, y];
        })
        .filter(Boolean);

      bucket[subtype] = relErr;
    });
    setSeriesBySubtype(bucket);
    setAvailableSubtypes([...subtypeSet]);
  }, [rawAsnSignalsGtrSarima]);

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

  const CUSTOM_FONT_FAMILY = "Inter, sans-serif";

  const navigatorLowerBound = secondsToMilliseconds(tsDataLegendRangeFrom);
  const navigatorUpperBound = secondsToMilliseconds(tsDataLegendRangeUntil);
  setChartNavigatorTimeRange(navigatorLowerBound, navigatorUpperBound);

  const gtrSarimaChartTitle = T.translate("entity.gtrSarimaChartTitle");
  const gtrSarimaChartSubTitle = T.translate("entity.gtrSarimaChartSubTitle");

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

  const relErrSeries =
    sarimaData?.values
      ?.map((obj, index) => {
        const x = secondsToMilliseconds(
          sarimaData?.from + sarimaData?.step * index
        );

        const observed = obj?.[0]?.agg_values?.observed;

        const predicted = obj?.[0]?.agg_values?.predicted;

        if (observed == null || predicted == null) return null;

        const denom = observed === 0 ? 1 : observed;
        const val = (observed - predicted) / denom;

        if (!Number.isFinite(val)) return null;

        return [x, val];
      })
      .filter((point) => point != null) || [];

  if (relErrSeries.length > 0) {
    navRel = relErrSeries.map(([t, v]) => [t, v]);
  }

  const relValsOnly = relErrSeries.map(([, v]) => v);
  // const rightPartitionMax =
  //   gtrSarima?.length > 0 ? Math.max(...gtrSarima) : null;

  function getChartExportTitle() {
    return `${T.translate("entity.gtrSarimaChartTitle")} ${entityName?.trim()}`;
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

  const exportFileName = getSarimaChartExportFileName(from, entityName);
  const selectedSubtypes = selectedMetricPaths.map((p) => p[p.length - 1]);

  const palette = Highcharts.getOptions().colors;

  const subtypeColorMap = useMemo(() => {
    const sorted = [...availableSubtypes].sort();
    const map = {};
    sorted.forEach((s, i) => {
      map[s] = palette[i % palette.length];
    });
    return map;
  }, [availableSubtypes]);

  const getSubtypeColor = (s) => subtypeColorMap[s] || "#999";
  const seriesToPlot = selectedSubtypes.map((s, i) => ({
    name: `GTR-Sarima (${s})`,
    data: seriesBySubtype[s] || [],
    type: "line",
    lineWidth: 1,
    marker: { enabled: false },
    color: getSubtypeColor(s),
    showInNavigator: false,
    zIndex: 0,
    tooltip: { valueDecimals: 4 },
  }));

  const navigatorData = selectedSubtypes.length
    ? seriesBySubtype[selectedSubtypes[0]] || []
    : [];

  const allVals = selectedSubtypes.flatMap((s) =>
    (seriesBySubtype[s] || []).map(([, v]) => v)
  );
  const relMin = allVals.length ? Math.min(...allVals) : 0;
  const yMin = Math.min(-1, relMin * 1.1);
  const yMax = 1;

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
      enabled: true,
      margin: 10,
      className: "ap-latency-loss-legend",
      itemStyle: {
        fontSize: "10px",
        fontFamily: CUSTOM_FONT_FAMILY,
      },
      alignColumns: true,
    },
    navigator: {
      enabled: true,

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
        min: yMin,
        max: yMax,
      },
      series: [
        {
          data: navigatorData,
          type: "line",
          color: getSubtypeColor(selectedSubtypes[0] || ""),
          name: selectedSubtypes.length
            ? `Navigator — ${selectedSubtypes[0]}`
            : "Navigator",
          index: 0,
          visible: true,
        },
      ],
    },
    time: {
      useUTC: true,
    },
    plotOptions: {
      series: {
        point: {
          events: {
            click: handleTooltipPointClick(tooltipEnabledRef),
          },
        },
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
        showEmpty: false,
        title: {
          text: "<strong>Relative Error</strong> ",
          useHTML: true,
          align: "high",
          textAlign: "left",
          rotation: 0,
          x: 0,
          y: -15,
          style: { fontSize: "12px", color: "#333", whiteSpace: "nowrap" },
        },
        tickAmount: 5,
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
        min: yMin,
        max: yMax,
        visible: true,
      },
    ],
    series: seriesToPlot,
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

  // const sarimaChartLabel = T.translate("entity.sarimaChartLabel");

  const cascaderOptions = availableSubtypes.map((s) => ({
    value: s,
    label: s,
  }));

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = chartRef.current.chart;
    const fromMs = secondsToMilliseconds(tsDataLegendRangeFrom);
    const toMs = secondsToMilliseconds(tsDataLegendRangeUntil);
    chart.xAxis[0].setExtremes(fromMs, toMs, true);
    // }, [viewMode, tsDataLegendRangeFrom, tsDataLegendRangeUntil]);
  }, [tsDataLegendRangeFrom, tsDataLegendRangeUntil]);

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
        exportFileName={() => getSarimaChartExportFileName(from, entityName)}
        shareLink={window.location.href}
        entityName={entityName}
      />

      {/* <div className="gap-0 mb-6 card"> */}
      {/* <div className="p-4"> */}
      <div className="flex items-center mb-1">
        <h3 className="text-2xl mr-1">
          {gtrSarimaChartTitle}
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
              disabled={!relErrSeries}
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
          {gtrSarimaChartSubTitle}
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
              options={cascaderOptions}
              value={selectedMetricPaths}
              onChange={(paths) => setSelectedMetricPaths(paths)}
              multiple
              placeholder="Select subtypes…"
              style={{ width: "100%" }}
              tagRender={({ label, value, closable, onClose }) => {
                const c = getSubtypeColor(value);
                return (
                  <Tag
                    closable={closable}
                    onClose={onClose}
                    style={{
                      backgroundColor: `${c}33`,
                      borderColor: c,
                      color: "#000",
                      fontWeight: 500,
                    }}
                  >
                    GTR-Sarima ({label})
                  </Tag>
                );
              }}
            />
          </div>
        </div>
        <div className=" w-full">
          {loading ? (
            <Loading />
          ) : (
            relErrSeries && (
              <div>
                <HighchartsReact
                  highcharts={Highcharts}
                  options={overlayOptions}
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

export default GtrSarimaComponent;
