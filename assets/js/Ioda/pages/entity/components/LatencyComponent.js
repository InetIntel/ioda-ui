import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {Tabs, Input, List, Tooltip, Button, Popover, Checkbox} from 'antd';
import {DownloadOutlined, EditOutlined, SettingOutlined, ShareAltOutlined,} from "@ant-design/icons";
// Internationalization
import T from "i18n-react";

import Loading from "../../../components/loading/Loading";

const LatencyChart = ( { rawAsnSignalsUpstreamDelayLatency, rawAsnSignalsUpstreamDelayPenultAsnCount, entityName } ) => {

    const [activeTab, setActiveTab] = useState('1');
    const [displaySettingsPopOver, setDisplaySettingsPopOver] = useState(false);
    const handleTabChange = (key) => setActiveTab(key);
    const [setting, setSetting] = useState(null)
    const CUSTOM_FONT_FAMILY = "Inter, sans-serif";

    const colorsArray = ["#52c41a", "#eb2f96", "#722ed1", "#722ed1", "#b5f5ec", "#ee9d1a"];

    const upstreamChartTitle = T.translate("entity.upstreamChartTitle");
    const upstreamChartSubTitle = T.translate("entity.upstreamChartSubTitle");


    const [jsonData, setJsonData] = useState(null);
    const [traceData, setTraceData] = useState(null);

    useEffect(() => {
        if (!rawAsnSignalsUpstreamDelayLatency?.[0]?.[0]) return;
        const { values, ...rest } = rawAsnSignalsUpstreamDelayLatency[0][0];
        const newValues = values?.map(item => {

            if (item && typeof item.slice === 'function') {
                return item.slice(0, 5);
            }
            return null;
        }).filter(item => item !== null) || [];
        setJsonData({
            ...rest,
            values: newValues
        });
    }, [rawAsnSignalsUpstreamDelayLatency]);

    useEffect(() => {
        if (!rawAsnSignalsUpstreamDelayPenultAsnCount?.[0]?.[0]) return;
        const { values, ...rest } = rawAsnSignalsUpstreamDelayPenultAsnCount[0][0];
        const newValues = values?.map(item => {

            if (item && typeof item.slice === 'function') {
                return item.slice(0, 5);
            }
            return null;
        }).filter(item => item !== null) || [];
        setTraceData({
            ...rest,
            values: newValues
        });
    }, [rawAsnSignalsUpstreamDelayPenultAsnCount]);

    function geometricMean(values) {
        if (values.length === 0) return 0; // Handle empty array case
        const product = values.reduce((a, b) => a * b, 1);
        return Math.pow(product, 1 / values.length);
    }

    const asnLatencyData = jsonData?.values?.map(obj => {
        const geometric_mean_e2e_latency_array = obj.map(item =>
            item?.agg_values?.geometric_mean_e2e_latency ?? 0
        );
        return Math.round(geometricMean(geometric_mean_e2e_latency_array));
    }) || [];

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

    const latencyCombined = {
        chart: {
            type: 'line',
            height: 180
        },
        title: {
            text: "<strong>Average Latency</strong> <span style='font-weight: normal; opacity: 0.8;'>Round Trip Time (ms)</span>",
            align: "left",
            x: 10,
        },
        yAxis: {
            endOnTick: false,
            maxPadding: 0.25,
            tickAmount: 5,
            title: { text: "" },
            labels: {
                style: {
                    fontSize: '10px',
                },
                formatter: function () {
                    return Math.round(this.value/ 1000).toLocaleString() + ' ms';
                }
            },
        },
        xAxis: {
            visible: false,
            type: 'datetime'
        },
        series: [{ name: "TTL ", data: asnLatencyData, color: "#1890ff" }], // TODO - done
        legend: false,
        plotOptions: {
            series: {
                marker: {
                    enabled: true
                },
                lineWidth: 0.9,
                pointStart: jsonData?.from * 1000,
                pointInterval: jsonData?.step * 1000
            }
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
            rules: [{
                condition: {
                    maxWidth: 600
                },
                chartOptions: {
                    chart: {
                        width: 400,
                        height: 300
                    }
                }
            }]
        },
        credits: {
            enabled: false
        },
    };

    const latencyAsnDict = {};

    // Process each entry in the values array
    jsonData?.values?.forEach(obj => {
        obj.forEach(entry => {
            const asName = `AS${entry.penultimate_as}`;
            if (!latencyAsnDict[asName]) {
                latencyAsnDict[asName] = [];
            }
            // Convert null to 0 for penultimate_as_count
            const latency = entry.agg_values.geometric_mean_e2e_latency === null ? 0 : entry.agg_values.geometric_mean_e2e_latency;
            latencyAsnDict[asName].push(latency);
        });
    });

    const latencyAsnSeries = Object.keys(latencyAsnDict).map((name, i) => ({
        name,
        data: latencyAsnDict[name],
        color: Highcharts.color(colorsArray[i]).get(),
        lineColor: colorsArray[i]
    }));
    const latencyIndividual = {
        chart: {
            type: 'line',
            height: 180
        },
        title: {
            text: "<strong>Latency</strong> <span style='font-weight: normal; opacity: 0.8;'>Round Trip Time (ms)</span>",
            align: "left",
            x: 10,
            // useHTML: true
        },
        yAxis: {
            endOnTick: false,
            maxPadding: 0.25,
            tickAmount: 5,
            title: { text: "" },
            labels: {
                style: {
                    fontSize: '10px',
                },
                formatter: function () {
                    return Math.round(this.value / 1000).toLocaleString() + ' ms';
                }
            },
        },
        xAxis: {
            visible: false,
            type: 'datetime'
        },
        series: latencyAsnSeries,
        legend: false,
        plotOptions: {
            series: {
                marker: {
                    enabled: true
                },
                lineWidth: 0.9,
                pointStart: jsonData?.from * 1000,
                pointInterval: jsonData?.step * 1000
            }
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
            rules: [{
                condition: {
                    maxWidth: 600
                },
                chartOptions: {
                    chart: {
                        width: 400,
                        height: 300
                    }
                }
            }]
        },
        credits: {
            enabled: false
        },
    };

    const traceAsnDict = {};

    // Process each entry in the values array
    traceData?.values?.forEach(timepoint => {
        timepoint.forEach(entry => {
            const asName = `AS${entry.penultimate_as}`;
            if (!traceAsnDict[asName]) {
                traceAsnDict[asName] = [];
            }
            // Convert null to 0 for penultimate_as_count
            const count = entry.agg_values.penultimate_as_count === null ? 0 : entry.agg_values.penultimate_as_count;
            traceAsnDict[asName].push(count);
        });
    });

    // Format the result as required
    const traceAsnSeries = Object.keys(traceAsnDict).map((name, i) => ({
        name,
        data: traceAsnDict[name],
        color: Highcharts.color(colorsArray[i]).setOpacity(0.4).get(),
        lineColor: colorsArray[i]
    }));

    // console.log(traceAsnSeries)

    const traceRouteOptions = {
            chart: {
                type: 'area',
                height: 220
            },
            title: {
                text: "<strong>Traceroute</strong> <span style='font-weight: normal; opacity: 0.8;'># of observations of penultimate ASes</span>",
                align: "left",
                x: 0,
                useHTML: true
            },
            yAxis: {
                tickAmount: 5,
                title: { text: "" },
                labels: {
                    style: {
                        fontSize: '10px',
                    },
                    formatter: function () {
                        return (this.value);
                    }
                },
            },
            xAxis: {
                type: 'datetime',
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
            legend: false,
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 600
                    },
                    chartOptions: {
                        chart: {
                            width: 400,
                            height: 300
                        }
                    }
                }]
            },
            plotOptions: {
                series: {
                    marker: {
                        enabled: true
                    },
                    pointStart: traceData?.from * 1000,
                    pointInterval: traceData?.step * 1000
                },
                area: {
                    stacking: 'normal',
                    lineWidth: 2,
                    marker: {
                        enabled: false
                    }
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
                enabled: false
            },
        };

    // TODO - 1 - DONE
    // const asnList = [
    //     { name: "AS36924 (GV..", color: "#52c41a" },
    //     { name: "AS16058 (Ga..", color: "#eb2f96" },
    //     { name: "AS328124 (DIG..", color: "#722ed1" },
    //     { name: "AS37582 (AN..", color: "#722ed1" },
    //     { name: "AS37390 (iP..", color: "#b5f5ec" },
    //     { name: "Other", color: "#ee9d1a" },
    // ];

    // const colorsArray = ["#52c41a", "#eb2f96", "#722ed1", "#722ed1", "#b5f5ec", "#ee9d1a"];
    const asnListName = (jsonData?.values?.[0]?.map(item => `AS${item.penultimate_as}`) || [])
        // .sort((a, b) => parseInt(a.substring(2)) - parseInt(b.substring(2)));
    const asnList = asnListName.map((name, i) => ({ name, color: colorsArray[i] }));
    const ASNLegend = ({ asnList }) => (
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
        <div>
            <div className="flex items-stretch gap-0 mb-6 entity__chart-layout">
                <div className="col-3 p-4 card">
                    <div className="p-4">
                        <div className="flex items-center mb-3">
                            <h3 className="text-2xl mr-1">
                                {upstreamChartTitle}
                                {entityName}
                            </h3>
                            <div className="flex ml-auto">
                                <Popover
                                    open={displaySettingsPopOver}
                                    onOpenChange={(val) => setDisplaySettingsPopOver(val)}
                                    trigger="click"
                                    placement="bottomRight"
                                    overlayStyle={{
                                        width: 180,
                                    }}
                                    content={
                                        <div onClick={() =>
                                            setDisplaySettingsPopOver(false)
                                        }>
                                            <>
                                                <Checkbox
                                                    checked={setting}
                                                    onChange={(e) =>
                                                        setSetting(e.target)
                                                    }
                                                >
                                                    "Setting 1"
                                                </Checkbox>
                                            </>
                                        </div>
                                    }
                                >
                                    <Tooltip title="Chart Settings">
                                        <Button className="mr-3" icon={<SettingOutlined/>}/>
                                    </Tooltip>
                                </Popover>
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
                            <h4 className="text-xl mr-1 mt-0 mb-1">
                                {upstreamChartSubTitle}
                            </h4>
                        </div>
                    </div>
                    {jsonData &&
                        <div className="upstream__chart">

                                <div className="card">
                                    <div className="header-row" style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <Tabs
                                            defaultActiveKey="1"
                                            animated={false}
                                            style={{marginBottom: 0}} // Remove bottom margin from tabs
                                            items={[
                                                {key: "1", label: <span style={{ padding: '0 10px' }}> Combined </span>},
                                                {key: "2", label: <span style={{ padding: '0 10px' }}> Individual </span>}
                                            ]}
                                            onChange={(key) => setActiveTab(key)} // You'll need to implement this state handler
                                        />
                                        <ASNLegend asnList={asnList}/>
                                    </div>

                                    <div className="content-area px-0">
                                        {activeTab === "1" ? (
                                            <HighchartsReact highcharts={Highcharts} options={latencyCombined}/>
                                        ) : (
                                            <HighchartsReact highcharts={Highcharts} options={latencyIndividual}/>
                                        )}
                                    </div>
                                </div>
                                <div className="px-4 card">
                                    <HighchartsReact highcharts={Highcharts} options={traceRouteOptions}/>
                                </div>
                            </div>}
                    {!jsonData &&
                        <Loading/>}
                </div>
            </div>
        </div>
    )
        ;
};

export default LatencyChart;
