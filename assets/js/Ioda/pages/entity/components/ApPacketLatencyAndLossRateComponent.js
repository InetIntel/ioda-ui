import React, {useEffect, useRef, useState} from "react";

import highchartsMore from "highcharts/highcharts-more";
import iodaWatermark from "../../../../../images/ioda-canvas-watermark.svg";
// Internationalization
import T from "i18n-react";

// Chart Libraries
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
require("highcharts/modules/exporting")(Highcharts);
require("highcharts/modules/export-data")(Highcharts);
require("highcharts/modules/offline-exporting")(Highcharts);
// import exportingInit from "highcharts/modules/exporting";
// import offlineExportingInit from "highcharts/modules/offline-exporting";


import Loading from "../../../components/loading/Loading";

import {Button, Checkbox, Popover, Tooltip} from "antd";
import {DownloadOutlined, ShareAltOutlined} from "@ant-design/icons";
import ShareLinkModal from "../../../components/modal/ShareLinkModal";
import {getApLatencyChartExportFileName} from "../utils/EntityUtils";
import {secondsToUTC} from "../../../utils/timeUtils";

if (typeof Highcharts === "object") {
    highchartsMore(Highcharts);
}

// exportingInit(Highcharts);
// offlineExportingInit(Highcharts);

const ApPacketLatencyAndLossRateComponent = ({
                                    from,
                                    until,
                                   rawAsnSignalsApPacketLoss, rawAsnSignalsApPacketDelay,
                                    entityName,
                               }) => {

    console.log(rawAsnSignalsApPacketLoss)
    console.log(rawAsnSignalsApPacketDelay)

    const [lossData, setLossData] = useState(null);
    const [latencyData, setLatencyData] = useState(null);
    const [displayLatency, setDisplayLatency] = useState(true);
    const [displayPctLoss, setDisplayPctLoss] = useState(false);
    const [showShareLinkModal, setShowShareLinkModal] = useState(false);
    const rightYAxisTitleRef = useRef(null);
    const leftYAxisTitleRef = useRef(null);
    const chartRef = useRef(null);

    const [displayChartSharePopover, setDisplayChartSharePopover] = useState(false);


    useEffect(() => {
        if (!rawAsnSignalsApPacketLoss?.[0]?.[0]) {
            console.log("null rawAsnSignalsApPacketLoss")
            return;
        }
        const { values, ...rest } = rawAsnSignalsApPacketLoss[0][0];

        const newValues = values?.map(item => {

            if (item && typeof item.slice === 'function') {
                return item.slice(0, 5);
            }
            return null;
        }).filter(item => item !== null) || [];

        console.log(newValues)

        setLossData({
            ...rest,
            values: newValues
        });
    }, [rawAsnSignalsApPacketLoss]);

    useEffect(() => {
        if (!rawAsnSignalsApPacketDelay?.[0]?.[0]){
            return;
        }
        const { values, ...rest } = rawAsnSignalsApPacketDelay[0][0];
        const newValues = values?.map(item => {

            if (item && typeof item.slice === 'function') {
                return item.slice(0, 5);
            }
            return null;
        }).filter(item => item !== null) || [];
        console.log(newValues)
        setLatencyData({
            ...rest,
            values: newValues
        });
    }, [rawAsnSignalsApPacketDelay]);



    const asnListFull = [
        {
            name:"Median Latency",
            color: "#0000FF"
        },
        {
            name: "90th and 10th Percentile",
            color: "#7cb5ec"
        },
        {
            name: "Packet Loss",
            color: "#52c41a"
        }
    ]
    const CUSTOM_FONT_FAMILY = "Inter, sans-serif";

    const [asnList, setAsnList] = useState([]);
    useEffect(() => {
        let newAsnList = [];
        if(displayLatency) {
            newAsnList = newAsnList.concat(asnListFull[0]);
            newAsnList = newAsnList.concat(asnListFull[1]);
        }
        if(displayPctLoss) {
            newAsnList = newAsnList.concat(asnListFull[2]);
        }
        setAsnList(newAsnList);
    }, [displayPctLoss, displayLatency]);

    useEffect(() => {
        const chart = chartRef.current?.chart;
        const leftText = leftYAxisTitleRef.current;
        if (chart && leftText) {
            if(displayLatency){
                leftText.attr({ text: "<strong>Latency</strong> <span style='opacity: 0.8;'>Round Trip Time (ms)</span>" });
            }
            else {
                leftText.attr({ text: "" });
            }
        }
    }, [displayLatency, leftYAxisTitleRef]);

    useEffect(() => {
        const chart = chartRef.current?.chart;
        const rightText = rightYAxisTitleRef.current;
        if (chart && rightText) {
            if(displayPctLoss){
                rightText.attr({ text: "<strong> Packet Loss </strong> <span style='opacity: 0.8;'>(%)</span>" });
            }
            else {
                rightText.attr({ text: "" });
            }
            const bbox = rightText.getBBox();
            rightText.attr({
                x: chart.chartWidth - chart.marginRight - bbox.width
            });
        }
    }, [displayPctLoss, rightYAxisTitleRef]);

    const activeProbingChartTitle = T.translate("entity.activeProbingChartTitle");
    const activeProbingChartSubTitle = T.translate("entity.activeProbingChartSubTitle");

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

    const lossPackage = lossData?.values?.map(obj => {
        return obj && obj[0]?.agg_values.loss_pct
    }) || [];

    console.log(lossPackage)

    const lossRanges = latencyData?.values?.map(obj => {
        return obj && obj[0]?.agg_values ? {
            low: obj[0].agg_values.p10_latency,
            high: obj[0].agg_values.p90_latency
        } : null;
    }).filter(range => range !== null) || [];
    console.log(lossRanges)

    const lossMedians = latencyData?.values?.map(obj => {
        return obj && obj[0].agg_values.median_latency;
    }) || [];

    console.log(lossMedians)

    // const rightPartitionMin = lossPackage?.length > 0 ? Math.min(...lossPackage) : null;
    // console.log(rightPartitionMin)
    const rightPartitionMax = lossPackage?.length > 0 ? Math.max(...lossPackage) : null;

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
        title: {
            text: "",
            useHTML: true
        },
        chart: {
            type: "arearange",
            height: 210,
            backgroundColor: "#ffffff",
            events: {
                load: function () {
                    const chart = this;

                    // Left-aligned title
                    leftYAxisTitleRef.current = chart.renderer
                        .text(
                            "<strong>Latency</strong> <span style='opacity: 0.8;'>Round Trip Time (ms)</span>",
                            chart.plotLeft,
                            chart.plotTop - 20,
                            true
                        )
                        .css({
                            color: '#333',
                            fontSize: '12px'
                        })
                        .add();

                    // Right-aligned title
                    // if(displayPctLoss) {

                        const rightText = chart.renderer
                            .text(
                                "",
                                0,
                                chart.plotTop - 20,
                                true
                            )
                            .css({
                                color: '#333',
                                fontSize: '12px',
                                textAlign: 'right'
                            })
                            .add();

                        // Align it to the right
                        const textBBox = rightText.getBBox();
                        // rightText.attr({
                        //     x: chart.chartWidth - chart.marginRight - textBBox.width - 20
                        // });
                        rightText.attr({
                            x: chart.plotLeft + chart.plotWidth - textBBox.width - 20
                        });

                    rightYAxisTitleRef.current = rightText;
                    // }
                }
            },
            spacingBottom: 0,
            spacingLeft: 5,
            spacingRight: 5,
            spacingTop: 50,
        },
        exporting: {
            enabled: true,
            buttons: {
                contextButton: {
                    enabled: false
                }
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
                },
                spacing: [50, 10, 15, 10],
            },
            // Maintain a 16:9 aspect ratio: https://calculateaspectratio.com/
            sourceWidth: 960,
            sourceHeight: 540,
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: dateFormats,
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
            lineColor: "#eeeeee",
            tickColor: "#eeeeee",
            gridLineWidth: 1,
            gridLineColor: "#eeeeee",
            gridLineDashStyle: "dash",
            title: {
                text: "Time (UTC)",
                style: {
                    fontSize: "12px",
                    fontFamily: CUSTOM_FONT_FAMILY,
                },
            },
        },
        yAxis: [
            {
                title: {
                    text: null
                },
                tickAmount: 5,
                lineColor: "#eeeeee",
                tickColor: "#eeeeee",
                gridLineColor: "#eeeeee",
                gridLineDashStyle: "dash",
                labels: {
                    style: {
                        fontSize: '10px',
                    },
                    formatter: function () {
                        return (this.value);
                    }
                },
                min: 0
            },
            {
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
                    text: null,
                },
                labels: {
                    x: 5,
                    style: {
                        colors: "#111",
                        fontSize: '10px',
                        fontFamily: CUSTOM_FONT_FAMILY,
                    },
                    formatter: function () {
                        return (this.value) + '%';
                    }
                },
                visible: displayPctLoss
            }
        ],
        // legend: {
        //     enabled: false
        // },
        legend: {
            margin: 10,
            className: "ap-latency-loss-legend",
            itemStyle: {
                fontSize:  "10px",
                fontFamily: CUSTOM_FONT_FAMILY,
            },
            alignColumns: true,
        },
        credits: {
            enabled: false
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
        plotOptions: {
            series: {
                marker: {
                    enabled: false
                },
                pointStart: latencyData?.from * 1000,
                pointInterval: latencyData?.step  * 1000
            },
        },
        accessibility: {
            enabled: false,
        },
        series: [
            {
                name: "Range",
                data: lossRanges?.map((range) => [range.low, range.high]),
                type: "arearange",
                color: "#7cb5ec",
                zIndex: 0,
                visible: displayLatency
            },
            {
                name: "Median",
                data: lossMedians,
                type: "line",
                color: "#0000FF",
                zIndex: 0,
                visible: displayLatency,
                lineWidth: 2,
                marker: {
                    enabled: true,
                    radius: 0.05,
                    symbol: 'circle',
                    fillColor: 'rgba(67, 67, 72, 0.9)',
                    lineWidth: 1,
                    lineColor: '#FFFFFF'
                }
            },
            {
                name: "Loss",
                data: lossPackage,
                type: "line",
                color: "#52c41a",
                zIndex: 0,
                lineWidth: 2,
                yAxis: 1,
                marker: {
                    // enabled: true,
                    // radius: 3,
                    // symbol: 'circle',
                    enabled: false
                },
                visible: displayPctLoss
            }
        ]
    };

    function displayShareLinkModal() {
        setShowShareLinkModal(true);
    }

    function hideShareLinkModal(){
        setShowShareLinkModal(false);
    }


    function handleDisplayLatencyBands(show) {
        setDisplayLatency(show);
    }

    function handleDisplayPctLoss(show) {
        console.log(show)
        setDisplayPctLoss(show);
    }

    function handleDisplayChartSharePopover(val){
        setDisplayChartSharePopover(val);
    }
    /**
     * Trigger a download of the chart from outside the chart context. Used in the
     * ShareLinkModal to trigger a direct download
     */
    function manuallyDownloadChart(imageType){
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

                            // if(displayLatency) {
                            //     const titleBBox = chart.title?.getBBox?.();
                            //     console.log(titleBBox)
                            //     const yOffset = titleBBox ? titleBBox.y + titleBBox.height - 10 : chart.spacingTop;
                            //
                            //     leftYAxisTitleRef.current = chart.renderer
                            //         .text(
                            //             "<strong>Latency</strong> <span style='opacity: 0.8;'>Round Trip Time (ms)</span>",
                            //             chart.plotLeft,
                            //             yOffset,
                            //             true
                            //         )
                            //         .css({
                            //             color: '#333',
                            //             fontSize: '12px'
                            //         })
                            //         .add();
                            // }
                            //
                            // if(displayPctLoss) {
                            //     const titleBBox = chart.title?.getBBox?.();
                            //     console.log(titleBBox)
                            //     const yOffset =  titleBBox ? titleBBox.y + titleBBox.height + 30 : chart.spacingTop;
                            //
                            //     const rightText = chart.renderer
                            //         .text(
                            //             "<strong>Packet Loss</strong> <span style='opacity: 0.8;'>%</span>",
                            //             0,
                            //             yOffset,
                            //             true
                            //         )
                            //         .css({
                            //             color: '#333',
                            //             fontSize: '12px',
                            //             textAlign: 'right'
                            //         })
                            //         .add();
                            //
                            //     // Align it to the right
                            //     const textBBox = rightText.getBBox();
                            //     rightText.attr({
                            //         x: chart.plotLeft + chart.plotWidth - textBBox.width - 20
                            //     });
                            // }
                        },
                    },
                },
            }
        );
    }


    const apChartLatencyLabel = T.translate("entity.apChartLatencyLabel");
    const apChartPctLossLabel = T.translate("entity.apChartPctLossLabel");
    const ASNLegend = () => (
        <div style={{display: "flex", justifyContent: "flex-end"}}>
            <div style={{display: "flex", flexWrap: "wrap"}}>
                {asnList.map(item => (
                    <div
                        key={item.name}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            marginRight: "18px",
                            marginBottom: "6px"
                        }}
                    >
                        <div
                            style={{
                                width: "14px",
                                height: "14px",
                                backgroundColor: Highcharts.color(item.color).setOpacity(0.4).get(),
                                borderRadius: "50%",
                                borderColor: item.color,
                                borderStyle: 'solid',
                                borderWidth: '1.5px'
                            }}
                        />
                        <span style={{color: "#333", fontSize: "14px"}}>
            {item.name}
          </span>
                    </div>
                ))}
            </div>
        </div>
    );
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

            <div className="gap-0 mb-6 card">
                <div className="p-4">
                    <div className="flex items-center mb-1">
                        <h3 className="text-2xl mr-1">
                            {activeProbingChartTitle}
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
                                        onClick={() =>
                                            handleDisplayChartSharePopover(false)
                                        }
                                    >
                                        <Button
                                            className="w-full mb-2"
                                            size="small"
                                            onClick={() =>
                                                manuallyDownloadChart( "image/jpeg")
                                            }
                                        >
                                            Chart JPEG
                                        </Button>
                                        <Button
                                            className="w-full mb-2"
                                            size="small"
                                            onClick={() =>
                                                manuallyDownloadChart( "image/png")
                                            }
                                        >
                                            Chart PNG
                                        </Button>
                                        <Button
                                            className="w-full"
                                            size="small"
                                            onClick={() =>
                                                manuallyDownloadChart( "image/svg+xml")
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
                    <div>
                        <h4 className="text-xl mr-1 mt-0">
                            {activeProbingChartSubTitle}
                        </h4>
                    </div>
                </div>

                {lossPackage?.length > 0 && <div className="flex entity__chart-layout card">
                    <div className="flex-grow p-4" style={{width: "85%"}}>
                        {
                            lossPackage &&
                            <div>
                                <ASNLegend/>
                                <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef}/>
                            </div>
                        }
                    </div>
                    <div className="p-4" style={{width: "15%", minWidth: '150px', marginTop: '15px'}}>
                        <div>
                            <Checkbox
                                checked={!!displayLatency}
                                onChange={(e) =>
                                    handleDisplayLatencyBands(e.target.checked)
                                }
                            >
                                {apChartLatencyLabel}
                            </Checkbox>
                        </div>
                        <div className="mt-2">
                            <Checkbox
                                checked={!!displayPctLoss}
                                onChange={(e) =>
                                    handleDisplayPctLoss(e.target.checked)
                                }
                            >
                                {apChartPctLossLabel}
                            </Checkbox>
                        </div>
                    </div>
                </div> }
                {!latencyData && <Loading/>}
            </div>
          </React.Fragment>
    );
};

export default ApPacketLatencyAndLossRateComponent;