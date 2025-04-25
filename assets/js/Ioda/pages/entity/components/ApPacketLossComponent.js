import React, {useEffect, useState} from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import highchartsMore from "highcharts/highcharts-more";

if (typeof Highcharts === "object") {
    highchartsMore(Highcharts);
}

// Internationalization
import T from "i18n-react";

import Loading from "../../../components/loading/Loading";

import {Button, Checkbox, Popover, Tooltip} from "antd";
import {DownloadOutlined, SettingOutlined, ShareAltOutlined} from "@ant-design/icons";

const ApPacketLossComponent = ({
                                   rawAsnSignalsApPacketLoss, rawAsnSignalsApPacketDelay,
                                    entityName,
                               }) => {

    const [lossData, setLossData] = useState(null);
    const [delayData, setDelayData] = useState(null);

    useEffect(() => {
        if (!rawAsnSignalsApPacketLoss?.[0]?.[0]) {
            return;
        }
        const { values, ...rest } = rawAsnSignalsApPacketLoss[0][0];

        const newValues = values?.map(item => {

            if (item && typeof item.slice === 'function') {
                return item.slice(0, 5);
            }
            return null;
        }).filter(item => item !== null) || [];

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
        setDelayData({
            ...rest,
            values: newValues
        });
    }, [rawAsnSignalsApPacketDelay]);


    const [displaySettingsPopOver, setDisplaySettingsPopOver] = useState(false);
    const [setting, setSetting] = useState(null)

    const [displayLatency, setDisplayLatency] = useState(true);
    const [displayPctLoss, setDisplayPctLoss] = useState(false);
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

    const [asnList, setAsnList] = useState([asnListFull[0]]);
    useEffect(() => {
        let newAsnList = [asnListFull[0]];
        if(displayLatency) {
            newAsnList = newAsnList.concat(asnListFull[1]);
        }
        if(displayPctLoss) {
            newAsnList = newAsnList.concat(asnListFull[2]);
        }
        setAsnList(newAsnList);
    }, [displayPctLoss, displayLatency]);

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


    const lossRanges = delayData?.values?.map(obj => {
        return obj && obj[0]?.agg_values ? {
            low: obj[0].agg_values.p10_latency,
            high: obj[0].agg_values.p90_latency
        } : null;
    }).filter(range => range !== null) || [];


    const lossMedians = delayData?.values?.map(obj => {
        return obj && obj[0].agg_values.median_latency;
    }) || [];

    const rightPartitionMin = lossPackage?.length > 0 ? Math.min(...lossPackage) : null;
    const rightPartitionMax = lossPackage?.length > 0 ? Math.max(...lossPackage) : null;


    const options = {
        chart: {
            type: "arearange",
            height: 180,
            backgroundColor: "#ffffff"
        },
        title: {
            text: "<strong>Latency</strong> <span style='font-weight: normal; opacity: 0.8;'>Round Trip Time (ms)</span>",
            align: "left",
            // x: 10,
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
            },
            {
                opposite: true,
                min: Math.max(0, rightPartitionMin - 10),
                max: Math.min(100, rightPartitionMax + 10),
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
        legend: {
            enabled: false
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
                pointStart: delayData?.from * 1000,
                pointInterval: delayData?.step  * 1000
            },
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
                lineWidth: 2,
                marker: {
                    enabled: true,
                    radius: 4,
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
                    radius: 1.5,
                },
                visible: displayPctLoss
            }
        ]
    };




    function handleDisplayLatencyBands(show) {
        setDisplayLatency(show);
    }

    function handleDisplayPctLoss(show) {
        setDisplayPctLoss(show);
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

            <div className="gap-0 mb-6 card">
                <div className="p-4">
                    <div className="flex items-center mb-1">
                        <h3 className="text-2xl mr-1">
                            {activeProbingChartTitle}
                        </h3>
                        <div className="flex ml-auto">
                            <Tooltip
                                title="Download"
                                mouseEnterDelay={0}
                                mouseLeaveDelay={0}
                            >
                                <Button icon={<DownloadOutlined/>}/>
                            </Tooltip>
                            <Tooltip title="Share Link">
                                <Button
                                    className="mr-3"
                                    icon={<ShareAltOutlined/>}
                                    onClick={() => {
                                        alert("Share Graph work in progress")
                                    }}
                                > Share Graph
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xl mr-1 mt-0">
                            {activeProbingChartSubTitle}
                        </h4>
                    </div>
                </div>

                {rightPartitionMin && <div className="flex entity__chart-layout card">
                    <div className="flex-grow p-4" style={{width: "85%"}}>
                        {
                            delayData &&
                            <div>
                                <ASNLegend/>
                                <HighchartsReact highcharts={Highcharts} options={options}/>
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
                {!rightPartitionMin && <Loading/>}
            </div>
            );
            };

            export default ApPacketLossComponent;