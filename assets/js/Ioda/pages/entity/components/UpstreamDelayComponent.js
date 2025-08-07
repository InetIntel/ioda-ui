import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";

// Chart Libraries
import Highcharts, { chart } from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
require("highcharts/modules/exporting")(Highcharts);
require("highcharts/modules/export-data")(Highcharts);
require("highcharts/modules/offline-exporting")(Highcharts);
import highchartsMore from "highcharts/highcharts-more";
import exportingInit from "highcharts/modules/exporting";
import offlineExportingInit from "highcharts/modules/offline-exporting";
import MarkupStudioModal from "./MarkupStudioModal";
import {
  getChartExportFileName,
  handleCSVDownload,
} from "../utils/EntityUtils";
import {
  millisecondsToSeconds,
  secondsToMilliseconds,
} from "../../../utils/timeUtils";
import MagnifyExpandIcon from "@2fd/ant-design-icons/lib/MagnifyExpand";
// exportingInit(Highcharts);
// offlineExportingInit(Highcharts);

import { Tabs, Tooltip, Button, Popover, Checkbox, Table } from "antd";
import {
  DownloadOutlined,
  ShareAltOutlined,
  EditOutlined,
} from "@ant-design/icons";
// Internationalization
import T from "i18n-react";
import HighchartsNoData from "highcharts/modules/no-data-to-display";
import TimeStamp from "../../../components/timeStamp/TimeStamp";
import { fetchData } from "../../../data/ActionCommons";
// Initialize the module
if (typeof Highcharts === "object") {
  highchartsMore(Highcharts);
}
import Loading from "../../../components/loading/Loading";
import ShareLinkModal from "../../../components/modal/ShareLinkModal";
import iodaWatermark from "../../../../../images/ioda-canvas-watermark.svg";
import { getUpstreamChartExportFileName } from "../utils/EntityUtils";
import { secondsToUTC } from "../../../utils/timeUtils";
import { handleTooltipPointClick } from "../../../utils/chartUtils";
import { active } from "d3";

HighchartsNoData(Highcharts);

const UpstreamDelayComponent = ({
  from,
  until,
  rawAsnSignalsUpstreamDelayLatency,
  rawAsnSignalsUpstreamDelayPenultAsnCount,
  entityName,
  loading,
}) => {
  const [activeTab, setActiveTab] = useState("1");
  const [displayChartSharePopover, setDisplayChartSharePopover] =
    useState(false);
  const [tsDataLegendRangeFrom, setTsDataLegendRangeFrom] = useState(from);
  const [tsDataLegendRangeUntil, setTsDataLegendRangeUntil] = useState(until);
  const [showResetZoomButton, setShowResetZoomButton] = useState(false);

  const CUSTOM_FONT_FAMILY = "Inter, sans-serif";

  const colorsArray = [
    "#52c41a",
    "#eb2f96",
    "#722ed1",
    "#b5f5ec",
    "#ee9d1a",
    "#1890ff",
    "#f5222d",
    "#13c2c2",
    "#fa8c16",
    "#2f54eb",
    "#a0d911",
    "#fa541c",
    "#531dab",
    "#73d13d",
    "#9e1068",
    "#3e8e41",
    "#ffc53d",
    "#40a9ff",
    "#d46b08",
    "#597ef7",
  ];

  const upstreamChartTitle = T.translate("entity.upstreamChartTitle");
  const upstreamChartSubTitle = T.translate("entity.upstreamChartSubTitle");

  const [showShareLinkModal, setShowShareLinkModal] = useState(false);

  const [jsonData, setJsonData] = useState(null);
  const [traceData, setTraceData] = useState(null);

  const chartCombinedRef = useRef(null);
  const chartIndividualRef = useRef(null);
  const chartTraceRouteRef = useRef(null);
  const [showMarkupStudioModal, setShowMarkupStudioModal] = useState(false);
  const [markupStudioSvgBaseString, setMarkupStudioSvgBaseString] =
    useState("");
  // const [selectedAsns, setSelectedAsns] = useState("");
  // const asnListName =
  //   jsonData?.values?.[0]?.map((item) => `AS${item.penultimate_as}`) || [];
  // const asnList = asnListName.map((name, i) => ({
  //   name,
  //   color: colorsArray[i],
  //   // fullName:getASNFullName(name[2:]),
  // }));

  // Initialize selectedAsns with all ASNs by default
  // const [selectedAsns, setSelectedAsns] = useState(asnList.map((a) => a.name));
  const [selectedAsns, setSelectedAsns] = useState([]);
  const [asnList, setAsnList] = useState([]);
  const initialLoad = useRef(true);
  const tooltipEnabledRef = useRef(true);

  // useEffect(() => {
  //   setSelectedAsns(asnList.map((a) => a.name));
  // }, [asnList]);
  // useEffect(() => {
  //   if (asnList.length > 0 && selectedAsns.length === 0) {
  //     setSelectedAsns(asnList.map((a) => a.name));
  //   }
  // }, [asnList]);
  const asnNameCacheRef = useRef({});

  const getASNFullName = useCallback(
    async (asnCode) => {
      if (asnNameCacheRef.current[asnCode]) {
        return asnNameCacheRef.current[asnCode];
      }
      try {
        const url = `/entities/query?entityType=asn&entityCode=${asnCode}`;
        const fetched = await fetchData({ url });
        const asnInfo = fetched?.data?.data ?? [];
        if (asnInfo.length > 0) {
          const asnName = asnInfo[0].name;
          asnNameCacheRef.current[asnCode] = asnName;
          return asnName;
        }
      } catch (error) {
        console.log("Error getting asn name");
        return "";
      }
      return "";
    },
    [fetchData]
  );
  useEffect(() => {
    if (!jsonData?.values?.[0]) return;

    const base = jsonData.values[0].map((item, i) => ({
      name: `AS${item.penultimate_as}`,
      color: colorsArray[i],
    }));
    Promise.all(
      base.map(async (row) => {
        const code = row.name.slice(2);
        const fullName = await getASNFullName(code);
        return { ...row, fullName };
      })
    ).then((withNames) => {
      setAsnList(withNames);
    });
  }, [jsonData, getASNFullName]);

  useEffect(() => {
    if (asnList.length > 0 && initialLoad.current) {
      setSelectedAsns(asnList.map((a) => a.name));
      initialLoad.current = false;
    }
  }, [asnList]);

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

  // const allAsns = asnList.map((a) => a.name);
  // const [selectedAsns, setSelectedAsns] = useState(allAsns);
  // useEffect(() => {
  //   setSelectedAsns(asnList.map((a) => a.name));
  // }, [asnList]);
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

  useEffect(() => {
    if (!chartCombinedRef.current) return;
    const chart = chartCombinedRef.current.chart;
    const fromMs = secondsToMilliseconds(tsDataLegendRangeFrom);
    const toMs = secondsToMilliseconds(tsDataLegendRangeUntil);
    chart.xAxis[0].setExtremes(fromMs, toMs, true);
  }, [tsDataLegendRangeFrom, tsDataLegendRangeUntil]);

  useEffect(() => {
    if (!chartIndividualRef.current) return;
    const chart = chartIndividualRef.current.chart;
    const fromMs = secondsToMilliseconds(tsDataLegendRangeFrom);
    const toMs = secondsToMilliseconds(tsDataLegendRangeUntil);
    chart.xAxis[0].setExtremes(fromMs, toMs, true);
  }, [tsDataLegendRangeFrom, tsDataLegendRangeUntil]);

  const tableData = useMemo(() => {
    if (!traceData?.values?.length) {
      return asnList.map((item) => ({ ...item, avgTraceroute: null }));
    }
    const countsMap = {};
    traceData.values.forEach((slice) =>
      slice.forEach((entry) => {
        const asn = `AS${entry.penultimate_as}`;
        const count = entry.agg_values.penultimate_as_count;
        if (count != null) {
          countsMap[asn] = countsMap[asn] || [];
          countsMap[asn].push(count);
        }
      })
    );
    const avgMap = {};
    Object.entries(countsMap).forEach(([asn, arr]) => {
      avgMap[asn] = arr.length
        ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
        : null;
    });
    return asnList.map((item) => ({
      ...item,
      avgTraceroute: avgMap[item.name] ?? null,
    }));
  }, [asnList, traceData]);
  const sortedTableData = useMemo(() => {
    return [...tableData].sort(
      (a, b) => (b.avgTraceroute ?? 0) - (a.avgTraceroute ?? 0)
    );
  }, [tableData]);
  const initialTop5 = useRef(true);
  useEffect(() => {
    if (
      initialTop5.current &&
      sortedTableData.length &&
      sortedTableData[0].avgTraceroute != null
    ) {
      const top5Names = sortedTableData.slice(0, 5).map((r) => r.name);
      setSelectedAsns(top5Names);
      initialTop5.current = false;
    }
  }, [sortedTableData]);

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
  function setDefaultNavigatorTimeRange() {
    const navigatorLowerBound = secondsToMilliseconds(from);
    const navigatorUpperBound = secondsToMilliseconds(until);
    setTsDataLegendRangeFrom(from);
    setTsDataLegendRangeUntil(until);

    setChartNavigatorTimeRange(navigatorLowerBound, navigatorUpperBound);
  }
  function setChartNavigatorTimeRange(fromMs, untilMs) {
    if (!chartCombinedRef || !chartCombinedRef.current) {
      return;
    }
    if (!chartIndividualRef || !chartIndividualRef.current) {
      return;
    }
    chartCombinedRef.current.chart.xAxis[0].setExtremes(fromMs, untilMs);
    chartIndividualRef.current.chart.xAxis[0].setExtremes(fromMs, untilMs);
  }
  function getChartSvg() {
    if (chartCombinedRef.current) {
      return chartCombinedRef.current.chart.getSVG();
    }
    if (chartIndividualRef.current) {
      return chartIndividualRef.current.chart.getSVG();
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
  // const filteredLatencySeries = latencyAsnSeries.filter((s) =>
  //   selectedAsns.includes(s.name)
  // );
  function geometricMean(values) {
    const valid = values.filter((v) => v != null);
    if (valid.length === 0) return null; // Handle empty array case
    const product = valid.reduce((a, b) => a * b, 1);
    return Math.pow(product, 1 / valid.length);
  }
  const asnColumns = [
    {
      // title: `Penultimate ASes to ${entityName}`,
      title: `ASN/ISPs`,
      dataIndex: "name",
      key: "name",
      width: 70,
      render: (_text, record) => (
        <span style={{ display: "flex", alignItems: "center" }}>
          {/* <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: record.color,
              marginRight: 8,
            }}
          /> */}
          <div
            style={{
              width: "14px",
              height: "14px",
              backgroundColor: Highcharts.color(record.color)
                .setOpacity(0.2)
                .get(),
              // fillOpacity: 0.2,
              borderRadius: "50%",
              borderColor: record.color,
              borderStyle: "solid",
              borderWidth: "1.5px",
              marginRight: "5px",
            }}
          />
          {record.fullName}
        </span>
      ),
    },
    // {
    //   title: "Avg#Traceroutes",
    //   dataIndex: "avgTraceroute",
    //   key: "avgTraceroute",
    //   // sorter: (a, b) => a.avgTraceroute - b.avgTraceroute,
    //   // defaultSortOrder: "descend",
    //   // render: (v) => v.toLocaleString(),
    //   // width: 120,
    //   sorter: (a, b) => (a.avgTraceroute || 0) - (b.avgTraceroute || 0),
    //   defaultSortOrder: "descend",
    //   render: (v) => (v != null ? v.toLocaleString() : "—"),
    //   width: 120,
    // },
  ];
  // const displayColumns = asnColumns.filter(
  //   (col) => col.dataIndex !== "avgTraceroute"
  // );

  // const asnLatencyData =
  //   jsonData?.values?.map((obj) => {
  //     const geometric_mean_e2e_latency_array = obj.map(
  //       (item) => item?.agg_values?.geometric_mean_e2e_latency
  //     );
  //     return geometricMean(geometric_mean_e2e_latency_array) === null
  //       ? null
  //       : Math.round(geometricMean(geometric_mean_e2e_latency_array));
  //   }) || [];
  const asnLatencyDataFiltered =
    jsonData?.values?.map((timeSlice) => {
      const filtered = timeSlice.filter((item) =>
        selectedAsns.includes(`AS${item.penultimate_as}`)
      );
      const latencies = filtered
        .map((item) => item.agg_values.geometric_mean_e2e_latency)
        .filter((v) => v != null);
      const gm = geometricMean(latencies);
      return gm == null ? null : Math.round(gm);
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
  jsonData?.values?.forEach((obj, timeIndex) => {
    const x = secondsToMilliseconds(jsonData.from + jsonData.step * timeIndex);
    obj.forEach((entry) => {
      const asName = `AS${entry.penultimate_as}`;
      if (!latencyAsnDict[asName]) {
        latencyAsnDict[asName] = [];
      }
      // Convert null to 0 for penultimate_as_count
      const latency = (entry.agg_values.geometric_mean_e2e_latency =
        entry.agg_values.geometric_mean_e2e_latency);
      latencyAsnDict[asName].push([x, latency]);
    });
  });

  const latencyAsnSeries = Object.keys(latencyAsnDict).map((name, i) => ({
    name,
    data: latencyAsnDict[name],
    color: Highcharts.color(colorsArray[i]).get(),
    lineColor: colorsArray[i],
    yAxis: 0,
    type: "line",
    tooltip: {
      pointFormatter: function () {
        const val = (this.y / 1000).toFixed(3);
        return `<b>RTT</b> = ${val} ms`;
      },
    },
    showInNavigator: false,
    showInLegend: false,
  }));

  const traceAsnDict = {};
  // Process each entry in the values array
  traceData?.values?.forEach((timepoint, timeIndex) => {
    const x = secondsToMilliseconds(
      traceData.from + traceData.step * timeIndex
    );
    timepoint.forEach((entry) => {
      const asName = `AS${entry.penultimate_as}`;
      if (!traceAsnDict[asName]) {
        traceAsnDict[asName] = [];
      }
      const count = entry.agg_values.penultimate_as_count;
      traceAsnDict[asName].push([x, count]);
    });
  });

  // Format the result as required
  const traceAsnSeries =
    Object.keys(traceAsnDict).map((name, i) => ({
      name,
      data: traceAsnDict[name],
      //   color: Highcharts.color(colorsArray[i]).setOpacity(0.4).get(),
      color: colorsArray[i],
      fillOpacity: 0.2,

      lineColor: colorsArray[i],
      type: "area",
      yAxis: 1,
      showInNavigator: false,
      showInLegend: true,
      tooltip: {
        pointFormatter: function () {
          return `<b>${name}</b>: ${this.y}`;
        },
      },
    })) || [];
  const filteredLatencySeries = latencyAsnSeries.filter((s) =>
    selectedAsns.includes(s.name)
  );
  const filteredTraceSeries = traceAsnSeries.filter((s) =>
    selectedAsns.includes(s.name)
  );
  // const navigatorLowerBound = secondsToMilliseconds(tsDataLegendRangeFrom);
  // const navigatorUpperBound = secondsToMilliseconds(tsDataLegendRangeUntil);
  // setChartNavigatorTimeRange(navigatorLowerBound, navigatorUpperBound);
  // useEffect(() => {
  //   console.log("SET Inital Navigator Range");
  //   // Rerender chart and set navigator bounds
  //   if (chartCombinedRef.current || chartIndividualRef.current) {
  //     const navigatorLowerBound = secondsToMilliseconds(tsDataLegendRangeFrom);
  //     const navigatorUpperBound = secondsToMilliseconds(tsDataLegendRangeUntil);
  //     setChartNavigatorTimeRange(navigatorLowerBound, navigatorUpperBound);
  //     console.log("SET Inital Navigator Range", navigatorLowerBound);
  //   }
  // }, [chartCombinedRef, chartIndividualRef]);
  //   console.log("traceAsnSeries data for traceroute chart", traceAsnSeries);

  //   const latencyCombined = {
  //     chart: {
  //       type: "line",
  //       height: 180,
  //       animation: false,
  //     },
  //     title: {
  //       text: "<strong>Average Latency</strong> <span style='font-weight: normal; opacity: 0.8;'>Round Trip Time (s)</span>",
  //       align: "left",
  //       x: 10,
  //     },
  //     exporting: {
  //       enabled: true,
  //       buttons: {
  //         contextButton: {
  //           enabled: false,
  //         },
  //       },
  //       fallbackToExportServer: false,
  //       filename: exportFileName,
  //       chartOptions: {
  //         title: {
  //           align: "left",
  //           text: exportChartTitle,
  //           style: {
  //             fontWeight: "bold",
  //           },
  //         },
  //         subtitle: {
  //           align: "left",
  //           text: exportChartSubtitle,
  //         },
  //         legend: {
  //           itemDistance: 40,
  //           enabled: true,
  //         },
  //         spacing: [50, 10, 15, 10],
  //       },
  //       // Maintain a 16:9 aspect ratio: https://calculateaspectratio.com/
  //       sourceWidth: 960,
  //       sourceHeight: 240,
  //     },
  //     yAxis: {
  //       min: 0,
  //       endOnTick: false,
  //       maxPadding: 0.25,
  //       tickAmount: 5,
  //       title: { text: "" },
  //       labels: {
  //         style: {
  //           fontSize: "10px",
  //         },
  //         formatter: function () {
  //           return Math.round(this.value / 1000).toLocaleString();
  //         },
  //       },
  //     },
  //     xAxis: {
  //       visible: false,
  //       type: "datetime",
  //     },
  //     series: [
  //       {
  //         name: "TTL ",
  //         data: asnLatencyData,
  //         color: "#1890ff",
  //         lineColor: "#1890ff",
  //       },
  //     ], // TODO - done
  //     legend: {
  //       enabled: false,
  //     },
  //     plotOptions: {
  //       series: {
  //         animation: false,
  //         marker: {
  //           enabled: true,
  //           radius: 2,
  //         },
  //         lineWidth: 0.9,
  //         pointStart: jsonData?.from * 1000,
  //         pointInterval: jsonData?.step * 1000,
  //       },
  //     },
  //     tooltip: {
  //       xDateFormat: "%a, %b %e %l:%M%p",
  //       borderWidth: 1,
  //       borderRadius: 0,
  //       style: {
  //         fontSize: "14px",
  //         fontFamily: CUSTOM_FONT_FAMILY,
  //       },
  //       headerFormat: "{point.key}<br>",
  //       pointFormatter: function () {
  //         return `<b>Mean TTL</b> = ${this.y} ms`;
  //       },
  //     },
  //     responsive: {
  //       rules: [
  //         {
  //           condition: {
  //             maxWidth: 600,
  //           },
  //           chartOptions: {
  //             chart: {
  //               width: 400,
  //               height: 300,
  //             },
  //           },
  //         },
  //       ],
  //     },
  //     lang: {
  //       noData: "No Latency data available for selected time range",
  //     },
  //     noData: {
  //       style: {
  //         fontWeight: "bold",
  //         fontSize: "14px",
  //         color: "#666",
  //       },
  //     },
  //     credits: {
  //       enabled: false,
  //     },
  //   };

  //   const latencyIndividual = {
  //     chart: {
  //       type: "line",
  //       height: 180,
  //       animation: false,
  //     },
  //     title: {
  //       text: "<strong>Latency</strong> <span style='font-weight: normal; opacity: 0.8;'>Round Trip Time (s)</span>",
  //       align: "left",
  //       x: 10,
  //       // useHTML: true
  //     },
  //     exporting: {
  //       enabled: true,
  //       buttons: {
  //         contextButton: {
  //           enabled: false,
  //         },
  //       },
  //       fallbackToExportServer: false,
  //       filename: exportFileName,
  //       chartOptions: {
  //         title: {
  //           align: "left",
  //           text: exportChartTitle,
  //           style: {
  //             fontWeight: "bold",
  //           },
  //         },
  //         subtitle: {
  //           align: "left",
  //           text: exportChartSubtitle,
  //         },
  //         legend: {
  //           itemDistance: 40,
  //           enabled: true,
  //         },
  //         spacing: [50, 10, 15, 10],
  //       },
  //       // Maintain a 16:9 aspect ratio: https://calculateaspectratio.com/
  //       sourceWidth: 960,
  //       sourceHeight: 240,
  //     },
  //     yAxis: {
  //       endOnTick: false,
  //       maxPadding: 0.25,
  //       tickAmount: 5,
  //       title: { text: "" },
  //       labels: {
  //         style: {
  //           fontSize: "10px",
  //         },
  //         formatter: function () {
  //           return Math.round(this.value / 1000).toLocaleString();
  //         },
  //       },
  //     },
  //     xAxis: {
  //       visible: false,
  //       type: "datetime",
  //     },
  //     series: latencyAsnSeries,
  //     legend: {
  //       enabled: false,
  //     },

  //     plotOptions: {
  //       series: {
  //         animation: false,
  //         marker: {
  //           enabled: true,
  //           radius: 2,
  //         },
  //         lineWidth: 0.9,
  //         pointStart: jsonData?.from * 1000,
  //         pointInterval: jsonData?.step * 1000,
  //       },
  //     },
  //     tooltip: {
  //       xDateFormat: "%a, %b %e %l:%M%p",
  //       borderWidth: 1,
  //       borderRadius: 0,
  //       style: {
  //         fontSize: "14px",
  //         fontFamily: CUSTOM_FONT_FAMILY,
  //       },
  //       headerFormat: "{point.key}<br>",
  //       pointFormatter: function () {
  //         return `<b>TTL</b> = ${this.y} ms`;
  //       },
  //     },
  //     responsive: {
  //       rules: [
  //         {
  //           condition: {
  //             maxWidth: 600,
  //           },
  //           chartOptions: {
  //             chart: {
  //               width: 400,
  //               height: 300,
  //             },
  //           },
  //         },
  //       ],
  //     },
  //     lang: {
  //       noData: "No Latency data available for selected time range",
  //     },
  //     noData: {
  //       style: {
  //         fontWeight: "bold",
  //         fontSize: "14px",
  //         color: "#666",
  //       },
  //     },
  //     credits: {
  //       enabled: false,
  //     },
  //   };

  //   const traceRouteOptions = {
  //     chart: {
  //       type: "area",
  //       height: 220,
  //       animation: false,
  //     },
  //     title: {
  //       text: "<strong>Traceroute</strong> <span style='font-weight: normal; opacity: 0.8;'># of observations of penultimate ASes</span>",
  //       align: "left",
  //       x: 0,
  //       useHTML: true,
  //     },
  //     exporting: {
  //       enabled: true,
  //       buttons: {
  //         contextButton: {
  //           enabled: false,
  //         },
  //       },
  //       fallbackToExportServer: false,
  //       filename: exportFileName,
  //       chartOptions: {
  //         title: {
  //           align: "left",
  //           text: exportChartTitle,
  //           style: {
  //             fontWeight: "bold",
  //           },
  //         },
  //         subtitle: {
  //           align: "left",
  //           text: exportChartSubtitle,
  //         },
  //         legend: {
  //           itemDistance: 40,
  //           enabled: true,
  //         },
  //         spacing: [50, 10, 15, 10],
  //       },
  //       // Maintain a 16:9 aspect ratio: https://calculateaspectratio.com/
  //       sourceWidth: 960,
  //       sourceHeight: 240,
  //     },
  //     yAxis: {
  //       tickAmount: 5,
  //       title: { text: "" },
  //       labels: {
  //         style: {
  //           fontSize: "10px",
  //         },
  //         formatter: function () {
  //           return this.value;
  //         },
  //       },
  //     },
  //     xAxis: {
  //       type: "datetime",
  //       gridLineColor: "#666",
  //       gridLineDashStyle: "Dash",
  //       tickPixelInterval: 100,
  //       dateTimeLabelFormats: dateFormats,
  //       labels: {
  //         // format: '{value:%H:%M}',
  //         zIndex: 100,
  //         align: "center",
  //         y: 24,
  //         style: {
  //           //textOutline: "2px solid #fff",
  //           color: "#666",
  //           fontSize: "10px",
  //           fontFamily: CUSTOM_FONT_FAMILY,
  //         },
  //       },
  //       title: {
  //         text: "Time (UTC)",
  //         style: {
  //           fontSize: "12px",
  //           fontFamily: CUSTOM_FONT_FAMILY,
  //         },
  //       },
  //     },
  //     series: traceAsnSeries,
  //     legend: {
  //       enabled: false,
  //     },
  //     responsive: {
  //       rules: [
  //         {
  //           condition: {
  //             maxWidth: 600,
  //           },
  //           chartOptions: {
  //             chart: {
  //               width: 400,
  //               height: 300,
  //             },
  //           },
  //         },
  //       ],
  //     },
  //     lang: {
  //       noData: "No trace data available for selected time range",
  //     },
  //     noData: {
  //       style: {
  //         fontWeight: "bold",
  //         fontSize: "14px",
  //         color: "#666",
  //       },
  //     },
  //     plotOptions: {
  //       // series: {
  //       //     marker: {
  //       //         enabled: true
  //       //     },
  //       //     pointStart: traceData?.from * 1000,
  //       //     pointInterval: traceData?.step * 1000
  //       // },
  //       area: {
  //         stacking: "normal",
  //         lineWidth: 1,
  //         marker: {
  //           enabled: false,
  //         },
  //       },
  //     },
  //     tooltip: {
  //       xDateFormat: "%a, %b %e %l:%M%p",
  //       borderWidth: 1.5,
  //       borderRadius: 0,
  //       style: {
  //         fontSize: "14px",
  //         fontFamily: CUSTOM_FONT_FAMILY,
  //       },
  //     },
  //     credits: {
  //       enabled: false,
  //     },
  //   };
  const combineTrace = {
    chart: {
      //   type: "line",
      height: 400,
      animation: false,
      spacingLeft: 5,
      spacingTop: 25,
      zoomType: "x",
      resetZoomButton: {
        theme: { style: { display: "none" } },
      },
      panning: true,
      panKey: "shift",
    },
    // title: {
    //   text: "<strong>Average Latency</strong> <span style='font-weight: normal; opacity: 0.8;'>Round Trip Time (s)</span>",
    //   align: "left",
    //   x: 10,
    // },
    title: { text: "" },
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
            whiteSpace: "nowrap",
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
        chart: { spacing: [50, 10, 15, 10], marginTop: 100 },
      },
      // Maintain a 16:9 aspect ratio: https://calculateaspectratio.com/
      sourceWidth: 960,
      sourceHeight: 540,
    },
    yAxis: [
      {
        showEmpty: false,
        offset: 0,
        opposite: false,
        alignTicks: true,
        top: "2%",
        height: "35%",
        min: 0,
        endOnTick: false,
        maxPadding: 0.25,
        tickAmount: 5,
        // title: { text: "" },
        title: {
          reserveSpace: false,
          text: "<strong>Average Latency</strong> <span style='font-weight: normal; opacity: 0.8;'>Round Trip Time (ms)</span>",
          textAlign: "low",
          align: "high",
          x: 0,
          //   useHTML: true,
          style: {
            fontSize: "12px",
            color: "#333",
            whiteSpace: "nowrap",
          },
          y: -10,
          rotation: 0,
        },
        labels: {
          x: -3,
          style: {
            fontSize: "10px",
          },
          formatter: function () {
            return Math.round(this.value / 1000).toLocaleString();
          },
        },
      },
      {
        showEmpty: false,
        offset: 0,
        opposite: false,
        alignTicks: true,
        top: "65%",
        height: "35%",
        tickAmount: 5,
        // title: { text: "" },
        title: {
          reserveSpace: false,
          text: "<strong>Penultimate AS Count</strong> <span style='font-weight: normal; opacity: 0.8;'># of observations</span>",
          x: 0,
          textAlign: "low",
          align: "high",
          rotation: 0,
          style: {
            fontSize: "12px",
            color: "#333",
            whiteSpace: "nowrap",
          },
          y: -10,
        },
        labels: {
          x: -3,
          style: {
            fontSize: "10px",
          },
          formatter: function () {
            return this.value;
          },
        },
      },
    ],
    xAxis: {
      min: secondsToMilliseconds(from),
      max: secondsToMilliseconds(until),
      showEmpty: false,
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
      events: {
        afterSetExtremes: (e) => {
          xyPlotRangeChanged(e);
        },
      },
    },
    series: [
      {
        showInNavigator: false,
        showInLegend: true,
        name: "Mean RTT",
        data: asnLatencyDataFiltered,
        type: "line",
        color: "#1890ff",
        lineColor: "#1890ff",
        tooltip: {
          pointFormatter: function () {
            const val = (this.y / 1000).toFixed(3);
            return `<b>Mean RTT</b> = ${val} ms`;
          },
        },
        yAxis: 0,
        // tooltip: {
        //   xDateFormat: "%a, %b %e %l:%M%p",
        //   borderWidth: 1,
        //   borderRadius: 0,
        //   style: {
        //     fontSize: "14px",
        //     fontFamily: CUSTOM_FONT_FAMILY,
        //   },
        //   headerFormat: "{point.key}<br>",
        //   pointFormatter: function () {
        //     return `<b>Mean TTL</b> = ${this.y} ms`;
        //   },
        // },
      },
      // ...traceAsnSeries,
      ...filteredTraceSeries,
    ], // TODO - done
    legend: {
      enabled: false,
    },
    navigator: {
      enabled: jsonData,
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
      },
      //   series: [{}], 0711
      // series: traceAsnSeries.map((s) => ({
      series: filteredTraceSeries.map((s) => ({
        name: s.name,
        data: s.data,
        type: "area",
        stacking: "normal",
        fillOpacity: 0.2,
        color: s.color,
        lineColor: Highcharts.color(s.color).brighten(-0.2).get(),
      })),
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
          enabled: true,
          radius: 2,
        },
        lineWidth: 0.9,
        pointStart: jsonData?.from * 1000,
        pointInterval: jsonData?.step * 1000,
      },
      line: {
        marker: {
          enabled: true,
          radius: 2,
        },
        lineWidth: 1,
        animation: false,
      },
      area: {
        stacking: "normal",
        marker: {
          enabled: false,
        },
        fillOpacity: 0.2,
        animation: false,
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
      //   headerFormat: "{point.key}<br>",
      //   pointFormatter: function () {
      //     return `<b>Mean TTL</b> = ${this.y} ms`;
      //   },
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
      noData: "No data available for selected time range",
    },
    noData: {
      style: {
        fontWeight: "normal",
        fontSize: "14px",
        color: "#666",
      },
    },
    credits: {
      enabled: false,
    },
  };
  const indivTrace = {
    chart: {
      //   type: "line",
      height: 400,
      animation: false,
      zoomType: "x",
      resetZoomButton: {
        theme: { style: { display: "none" } },
      },
      panning: true,
      panKey: "shift",
    },
    title: { text: "" },
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
        chart: { spacing: [50, 10, 15, 10], marginTop: 100 },
      },
      // Maintain a 16:9 aspect ratio: https://calculateaspectratio.com/
      sourceWidth: 960,
      sourceHeight: 540,
    },
    yAxis: [
      {
        showEmpty: false,
        offset: 0,
        opposite: false,
        alignTicks: true,
        top: "2%",
        height: "35%",
        min: 0,
        endOnTick: false,
        maxPadding: 0.25,
        tickAmount: 5,
        // title: { text: "" },
        title: {
          reserveSpace: false,
          text: "<strong>Average Latency</strong> <span style='font-weight: normal; opacity: 0.8;'>Round Trip Time (ms)</span>",
          x: 0,
          //   useHTML: true,
          textAlign: "low",
          align: "high",
          rotation: 0,
          style: {
            fontSize: "12px",
            color: "#333",
            whiteSpace: "nowrap",
          },
          y: -10,
        },
        labels: {
          x: -3,
          style: {
            fontSize: "10px",
          },
          formatter: function () {
            return Math.round(this.value / 1000).toLocaleString();
          },
        },
      },
      {
        showEmpty: false,
        offset: 0,
        opposite: false,
        alignTicks: true,
        top: "65%",
        height: "35%",
        tickAmount: 5,
        // title: { text: "" },
        title: {
          reserveSpace: false,
          text: "<strong>Penultimate AS Count</strong> <span style='font-weight: normal; opacity: 0.8;'># of observations</span>",
          textAlign: "low",
          align: "high",
          rotation: 0,
          x: 0,
          //   useHTML: true,
          style: {
            fontSize: "12px",
            color: "#333",
            whiteSpace: "nowrap",
          },
          y: -10,
        },
        labels: {
          x: -3,
          style: {
            fontSize: "10px",
          },
          formatter: function () {
            return this.value;
          },
        },
      },
    ],
    xAxis: {
      min: secondsToMilliseconds(from),
      max: secondsToMilliseconds(until),
      showEmpty: false,
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
      events: {
        afterSetExtremes: (e) => {
          xyPlotRangeChanged(e);
        },
      },
    },
    // series: [...latencyAsnSeries, ...traceAsnSeries],
    series: [...filteredLatencySeries, ...filteredTraceSeries],
    legend: {
      enabled: false,
    },
    navigator: {
      enabled: jsonData,
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
      },
      //   series: [{}], 0711
      // series: traceAsnSeries.map((s) => ({
      series: filteredTraceSeries.map((s) => ({
        name: s.name,
        data: s.data,
        type: "area",
        stacking: "normal",
        fillOpacity: 0.2,
        color: s.color,
        lineColor: Highcharts.color(s.color).brighten(-0.2).get(),
      })),
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
          enabled: true,
          radius: 2,
        },
        lineWidth: 0.9,
        pointStart: jsonData?.from * 1000,
        pointInterval: jsonData?.step * 1000,
      },
      line: {
        marker: {
          enabled: true,
          radius: 2,
        },
        lineWidth: 1,
        animation: false,
      },
      area: {
        stacking: "normal",
        marker: {
          enabled: false,
        },
        fillOpacity: 0.2,
        animation: false,
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
      //   headerFormat: "{point.key}<br>",
      //   pointFormatter: function () {
      //     return `<b>Mean TTL</b> = ${this.y} ms`;
      //   },
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
      noData: "No data available for selected time range",
    },
    noData: {
      style: {
        fontWeight: "normal",
        fontSize: "14px",
        color: "#666",
      },
    },
    credits: {
      enabled: false,
    },
  };

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
              marginBottom: "3px",
            }}
          >
            <div
              style={{
                width: "14px",
                height: "14px",
                backgroundColor: Highcharts.color(item.color)
                  .setOpacity(0.2)
                  .get(),
                // fillOpacity: 0.2,
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
    const chartRef = activeTab === "1" ? chartCombinedRef : chartIndividualRef;
    // console.log("chartref", chartRef);
    // if (chartRef.current?.chart) {
    //   chartRef.current.chart.redraw();
    // }
    // const chartRef = chartCombinedRef.current
    //   ? chartCombinedRef
    //   : chartIndividualRef;
    // const chartRef2 = chartTraceRouteRef;
    // if (!chartRef1.current?.chart || !chartRef2.current?.chart) {
    //   return;
    // }
    // Debug: Log current state before export
    console.group("Chart Export Debug");
    console.log("Active Tab:", activeTab);
    console.log("Selected ASNs:", selectedAsns);

    if (chartRef.current?.chart) {
      // Log chart series data
      console.log(
        "Chart Series:",
        chartRef.current.chart.series.map((s) => ({
          name: s.name,
          type: s.type,
          visible: s.visible,
          dataLength: s.data.length,
          firstPoint: s.data[0]?.y,
          lastPoint: s.data[s.data.length - 1]?.y,
          processedData: s.data.map((point) => ({
            x: point.x,
            y: point.y,
            timestamp: new Date(point.x).toISOString(),
          })),
        }))
      );

      // Log the data we're about to use for export
      if (activeTab === "1") {
        console.log("Combined Chart Data - Average Latency:", {
          length: asnLatencyDataFiltered?.length,
          firstPoint: asnLatencyDataFiltered?.[0],
          lastPoint:
            asnLatencyDataFiltered?.[asnLatencyDataFiltered.length - 1],
        });
        console.log(
          "Combined Chart Data - Trace Series:",
          filteredTraceSeries.map((s) => ({
            name: s.name,
            dataLength: s.data.length,
          }))
        );
      } else {
        console.log(
          "Individual Chart Data - Latency Series:",
          filteredLatencySeries.map((s) => ({
            name: s.name,
            dataLength: s.data.length,
          }))
        );
        console.log(
          "Individual Chart Data - Trace Series:",
          filteredTraceSeries.map((s) => ({
            name: s.name,
            dataLength: s.data.length,
          }))
        );
      }
    } else {
      console.warn("Chart reference not available");
    }
    console.groupEnd();

    // Append watermark to image on download:
    // https://www.highcharts.com/forum/viewtopic.php?t=47368
    chartRef.current.chart.exportChartLocal(
      {
        type: imageType,
        filename: exportFileName,
        chartOptions: {
          chart: {
            // spacingTop: 70,
            events: {
              load: function () {
                const chart = this;
                // Ensure all series are properly rendered
                chart.series.forEach((series) => {
                  if (series.visible) series.redraw();
                });

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
        },
      }
      // {
      //   // chart: {}
      //   chart: {
      //     // spacingTop: 70,
      //     events: {
      //       load: function () {
      //         const chart = this;
      //         const watermarkAspectRatio = 0.184615;
      //         const watermarkWidth = Math.floor(chart.chartWidth / 6);
      //         const watermarkHeight = Math.floor(
      //           watermarkWidth * watermarkAspectRatio
      //         );
      //         const padding = 12;

      //         chart.watermarkImage = chart.renderer
      //           .image(
      //             iodaWatermark,
      //             chart.chartWidth - watermarkWidth - padding,
      //             padding,
      //             watermarkWidth,
      //             watermarkHeight
      //           )
      //           .add()
      //           .toFront();
      //       },
      //     },
      //   },
      // }
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
      <MarkupStudioModal
        open={showMarkupStudioModal}
        svgString={markupStudioSvgBaseString}
        hideModal={handleHideMarkupStudioModal}
        chartTitle={getChartExportTitle()}
        chartSubtitle={getChartExportSubtitle()}
        exportFileName={() => getChartExportFileName(from, entityName)}
        shareLink={window.location.href}
        entityName={entityName}
        extraTopMargin
      />
      <div>
        <div className="flex items-stretch gap-6  entity__chart-layout">
          <div className="col-2">
            <div className="p-4 card ">
              <div className="col-3">
                {/* <div className="p-4"> */}
                <div className="flex items-center mb-3">
                  <h3 className="text-2xl mr-1">
                    {upstreamChartTitle}
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
                        disabled={!jsonData}
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
                            onClick={() =>
                              manuallyDownloadChart("image/svg+xml")
                            }
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
                {/* <div>
                    <h4 className="text-xl mr-1 mt-0 mb-1">
                      {upstreamChartSubTitle}
                    </h4>
                  </div> */}
                <div>
                  <h4
                    className="text-xl mr-1 mt-2"
                    style={{ color: "#8c8c8c" }}
                  >
                    This graph shows the latency and penultimate network used to
                    reach {entityName.split(" ")[0]} as observed in traceroute
                    measurements, making it easier pinpoint network delays.
                  </h4>
                </div>
                {/* </div> */}
                {/* {jsonData && ( */}
                <div
                  className="upstream__chart"
                  style={{ position: "relative" }}
                >
                  <div
                    className="header-row"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingLeft: 10,
                      paddingTop: 6,
                    }}
                  >
                    <ASNLegend
                      asnList={asnList.filter((a) =>
                        selectedAsns.includes(a.name)
                      )}
                    />
                    {/* <Tabs
                      defaultActiveKey="1"
                      animated={false}
                      // style={{ marginBottom: 0 }}
                      tabBarStyle={{ marginBottom: 0 }}
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
                    /> */}

                    <div className="ml-auto">
                      <Button.Group style={{ marginBottom: 4, marginLeft: 4 }}>
                        <Button
                          type={activeTab === "1" ? "primary" : "default"}
                          onClick={() => setActiveTab("1")}
                          style={
                            activeTab === "1"
                              ? {
                                  backgroundColor: "#1570EF33",
                                  color: "#1570EF",
                                  borderColor: "#1570EF33",
                                  fontSize: 12,
                                }
                              : { fontSize: 12 }
                          }
                        >
                          Combined
                        </Button>
                        <Button
                          type={activeTab === "2" ? "primary" : "default"}
                          onClick={() => setActiveTab("2")}
                          style={
                            activeTab === "2"
                              ? {
                                  backgroundColor: "#1570EF33",
                                  color: "#1570EF",
                                  borderColor: "#1570EF33",
                                  fontSize: 12,
                                }
                              : { fontSize: 12 }
                          }
                        >
                          Individual
                        </Button>
                      </Button.Group>
                    </div>
                  </div>
                  {/* <Button.Group
                      style={{
                        position: "absolute",
                        left: "250px",
                        top: "10%",
                        transform: "translateY(-50%)",
                        zIndex: 8,
                      }}
                    >
                      <Button
                        type={activeTab === "1" ? "primary" : "default"}
                        onClick={() => setActiveTab("1")}
                      >
                        Combined
                      </Button>
                      <Button
                        type={activeTab === "2" ? "primary" : "default"}
                        onClick={() => setActiveTab("2")}
                      >
                        Individual
                      </Button>
                    </Button.Group> */}
                  <div className="content-area px-0">
                    {loading ? (
                      <Loading />
                    ) : selectedAsns.length === 0 && jsonData ? (
                      <div
                        style={{
                          padding: "2rem",
                          textAlign: "center",
                          color: "#666",
                          // fontStyle: "italic",
                        }}
                      >
                        No ASes selected.
                      </div>
                    ) : activeTab === "1" ? (
                      <div>
                        <div
                          style={{
                            position: "absolute",
                            top: "41%",
                            left: "10px",
                            width: "40%",
                            borderTop: "1px dashed #ccc",
                            zIndex: 2,
                          }}
                        />

                        <div style={{ marginLeft: "10px" }}>
                          <HighchartsReact
                            highcharts={Highcharts}
                            // options={latencyCombined}
                            options={combineTrace}
                            ref={chartCombinedRef}
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div
                          style={{
                            position: "absolute",
                            top: "41%",
                            left: "10px",
                            width: "40%",
                            borderTop: "1px dashed #ccc",
                            zIndex: 2,
                          }}
                        />

                        <div style={{ marginLeft: "10px" }}>
                          <HighchartsReact
                            highcharts={Highcharts}
                            // options={latencyIndividual}
                            options={indivTrace}
                            ref={chartIndividualRef}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {/* <div className="px-4 card">
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={traceRouteOptions}
                    ref={chartTraceRouteRef}
                  />
                </div> */}
                  <TimeStamp
                    className="mt-4"
                    from={tsDataLegendRangeFrom}
                    until={tsDataLegendRangeUntil}
                  />
                </div>
              </div>
            </div>
            {/* )}
        {!jsonData && <Loading />} */}
          </div>
          <div className="col-1">
            <div className="p-4 card h-full mb-6">
              {/* <div style={{ padding: 12 }}> */}
              <div className="p-4">
                <div className="mb-3">
                  {/* <h3 className="text-2xl mr-1 mb-6">Select AS Signals</h3> */}
                  <h3 className="text-2xl mr-1 mb-6">
                    Penultimate ASes to {entityName}
                  </h3>
                  {/* <Checkbox.Group
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                    options={asnList.map((a) => ({
                      label: (
                        <span style={{ fontSize: 14 }}>
                          <span
                            style={{
                              display: "inline-block",
                              width: 8,
                              height: 8,
                              backgroundColor: a.color,
                              borderRadius: 4,
                              marginRight: 4,
                            }}
                          />
                          {a.name}
                        </span>
                      ),
                      value: a.name,
                    }))}
                    value={selectedAsns}
                    onChange={(vals) => setSelectedAsns(vals)}
                  /> */}
                  <div className="modal__table-container rounded card p-3 mb-6">
                    <Table
                      className="no-selected-bg custom-checkbox-table"
                      rowKey="name"
                      pagination={false}
                      columns={asnColumns}
                      // columns={displayColumns}
                      // dataSource={asnList}
                      dataSource={sortedTableData}
                      rowSelection={{
                        selectedRowKeys: selectedAsns,
                        onChange: (keys) => setSelectedAsns(keys),
                        columnTitle: "",
                        // renderCell: (checked, record, index, node) => ({
                        //   props: { style: { backgroundColor: "transparent" } },
                        //   children: node,
                        // }),
                      }}
                      // onRow={(record) => ({
                      //   style: { backgroundColor: "transparent !important" },
                      // })}
                    />
                  </div>
                </div>
              </div>
              {/* </div> */}
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default UpstreamDelayComponent;
