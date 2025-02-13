// import React from "react";
// import Highcharts from "highcharts";
// import HighchartsReact from "highcharts-react-official";
// import dayjs from "dayjs";
// import { Checkbox } from "antd";
// import { useState} from "react";
//
// const LatencyChart = ({ data }) => {
//     // // Extract raw data from the API response
//     // const rawValues = data.data[0][0].values; // Adjust path if different
//     //
//     // // Convert timestamps to readable format
//     // const fromTime = data.requestParameters.from * 1000;
//     // const step = data.data[0][0].step * 1000;
//     // const categories = rawValues.map((_, index) =>
//     //     dayjs(fromTime).add(index * step, "millisecond").format("YYYY-MM-DD HH:mm")
//     // );
//     //
//     // // Prepare series data
//     // const seriesData = {};
//     // console.log(rawValues)
//     // rawValues.forEach((timeSlice) => {
//     //     timeSlice.forEach((entry) => {
//     //         const penultimate_as = entry.penultimate_as;
//     //         const meanLatency = entry.agg_values.mean_e2e_latency || 0;
//     //
//     //         if (!seriesData[penultimate_as]) {
//     //             seriesData[penultimate_as] = [];
//     //         }
//     //         seriesData[penultimate_as].push(meanLatency);
//     //     });
//     // });
//
//
//
//     // const series = Object.entries(seriesData).map(([key, values]) => ({
//     //     name: `AS ${key}`,
//     //     data: values,
//     // }));
//
//     const [selectedASNs, setSelectedASNs] = useState([]);
//
//     const processLatencyData = (rawData) => {
//         const series = [];
//         const categories = [];
//         const asnLatencyMap = new Map(); // Stores latencies for each ASN
//
//         const dataEntries = rawData?.data?.[0]?.[0]; // Extract relevant data
//         if (!dataEntries) return { categories, series, asnLatencyMap };
//
//         const timeStart = dataEntries.from; // Start timestamp
//         const timeStep = dataEntries.step; // Interval (hourly in this case)
//
//         // Extract time categories
//         for (let i = 0; i < dataEntries.values.length; i++) {
//             const timestamp = new Date((timeStart + i * timeStep) * 1000).toISOString();
//             categories.push(timestamp);
//         }
//
//         // Process latency values
//         dataEntries.values.forEach((timePoint, index) => {
//             timePoint.forEach(({ penultimate_as, agg_values }) => {
//                 const asn = `AS${penultimate_as}`;
//                 const latency = agg_values.geometric_mean_e2e_latency;
//
//                 if (latency !== null) {
//                     if (!asnLatencyMap.has(asn)) {
//                         asnLatencyMap.set(asn, Array(categories.length).fill(null)); // Ensure alignment
//                     }
//                     asnLatencyMap.get(asn)[index] = latency;
//                 }
//             });
//         });
//
//         // Compute Geometric Mean for Combined Latency
//         const combinedLatency = categories.map((_, index) => {
//             const valuesAtTime = Array.from(asnLatencyMap.values()).map((asnData) => asnData[index]);
//             const validValues = valuesAtTime.filter((v) => v !== null);
//
//             if (validValues.length === 0) return null; // Avoid empty values
//
//             const product = validValues.reduce((acc, val) => acc * val, 1);
//             return Math.pow(product, 1 / validValues.length);
//         });
//
//         // Store ASN series
//         asnLatencyMap.forEach((values, asn) => {
//             series.push({
//                 name: asn,
//                 data: values,
//                 type: "line",
//                 visible: false, // Initially hidden
//                 marker: { enabled: true, symbol: "circle" },
//             });
//         });
//
//         // Add Combined Latency as a default visible series
//         series.push({
//             name: "Combined Latency (Geometric Mean)",
//             data: combinedLatency,
//             type: "line",
//             dashStyle: "Dash",
//             color: "#000000",
//             visible: true, // Always visible
//             marker: { enabled: true, symbol: "circle" },
//         });
//
//         return { categories, series, asnLatencyMap };
//     };
//
//     const { categories, series, asnLatencyMap } = processLatencyData(data);
//     console.log(series)
//     console.log(categories)
//
//
//     const filteredSeries = series.map((s) => ({
//         ...s,
//         visible: s.name === "Combined Latency (Geometric Mean)" || selectedASNs.includes(s.name),
//     }));
//
//
//     // Toggle ASN visibility based on selection
//     const handleCheckboxChange = (asn, checked) => {
//         setSelectedASNs((prev) =>
//             checked ? [...prev, asn] : prev.filter((item) => item !== asn)
//         );
//     };
//
//     const latencyOptions = {
//         chart: {
//             type: "line",
//             height: 300,
//         },
//         title: {
//             text: "Latency (#24s Up)",
//         },
//         xAxis: {
//             categories: categories,
//         },
//         yAxis: {
//             title: {
//                 text: "Latency (ms)",
//             },
//         },
//         tooltip: {
//             shared: true,
//             valueSuffix: "ms"
//         },
//         legend: {
//             enabled: false,
//         },
//         plotOptions: {
//             series: {
//                 events: {
//                     legendItemClick: function () {
//                         const isVisible = this.visible;
//                         this.chart.series.forEach((s) => s.setVisible(false, false));
//                         this.setVisible(!isVisible, true);
//                         return false; // Prevent default behavior
//                     },
//                 },
//             },
//         },
//         series: filteredSeries
//     };
//
//
//     // // Highcharts configuration
//     // const options = {
//     //     chart: {
//     //         type: "line", // Change to "area" for a stacked area chart
//     //     },
//     //     title: {
//     //         text: "Upstream Delay End-to-End Latency",
//     //     },
//     //     xAxis: {
//     //         categories: categories,
//     //         title: {
//     //             text: "Time",
//     //         },
//     //     },
//     //     yAxis: {
//     //         title: {
//     //             text: "Mean E2E Latency (ms)",
//     //         },
//     //     },
//     //     tooltip: {
//     //         shared: true,
//     //     },
//     //     series: series,
//     // };
//
//     return (
//         <>
//         <Checkbox.Group
//             style={{ marginBottom: "10px" }}
//             onChange={(checkedValues) => setSelectedASNs(checkedValues)}
//         >
//             {Array.from(asnLatencyMap.keys()).map((asn) => (
//                 <Checkbox key={asn} value={asn} onChange={(e) => handleCheckboxChange(asn, e.target.checked)}>
//                     {asn}
//                 </Checkbox>
//             ))}
//         </Checkbox.Group>
//         <HighchartsReact highcharts={Highcharts} options={latencyOptions} />
//     </>)
// };
//
// export default LatencyChart;
// import React, { useState } from "react";
// import { Layout, Card, Checkbox, List, Tabs } from "antd";
// import Highcharts from "highcharts";
// import HighchartsReact from "highcharts-react-official";
//
// const { Content } = Layout;
// const { TabPane } = Tabs;
//
// const sharedXAxis = {
//     categories: ["8/25", "8/26", "8/27", "8/28", "8/29", "8/30", "8/31", "9/1"],
//     title: { text: "Time (UTC)" }
// };
//
// const latencyCombined = {
//     title: { text: "Latency (#/24s Up)" },
//     yAxis: { title: { text: "ms" } },
//     xAxis: sharedXAxis,
//     series: [{ name: "Combined Latency", data: [50, 55, 53, 52, 51, 54, 52, 50], color: "#007bff" }]
// };
//
// const latencyIndividual = {
//     title: { text: "Latency (#/24s Up)" },
//     yAxis: { title: { text: "ms" } },
//     xAxis: sharedXAxis,
//     series: [
//         { name: "AS36924", data: [50, 55, 53, 52, 51, 54, 52, 50], color: "#f4a261" },
//         { name: "AS16058", data: [48, 53, 50, 49, 47, 52, 50, 48], color: "#e9c46a" },
//         { name: "AS528124", data: [60, 62, 61, 59, 58, 63, 61, 60], color: "#2a9d8f" },
//         { name: "AS37390", data: [40, 42, 41, 39, 38, 43, 41, 40], color: "#264653" },
//         { name: "AS37582", data: [55, 57, 56, 54, 53, 58, 56, 55], color: "#e76f51" }
//     ]
// };
//
// const traceRouteOptions = {
//     chart: { type: "area" },
//     title: { text: "Traceroute" },
//     yAxis: { title: { text: "Count" } },
//     xAxis: sharedXAxis,
//     series: [
//         { name: "AS36924", data: [30000, 28000, 29000, 31000, 30000, 30500, 31000, 32000], color: "#f4a261" },
//         { name: "AS16058", data: [20000, 21000, 22000, 21500, 22500, 23000, 22000, 24000], color: "#e9c46a" },
//         { name: "AS528124", data: [15000, 16000, 17000, 16500, 17500, 18000, 18500, 19000], color: "#2a9d8f" }
//     ]
// };
//
// const asnList = [
//     { name: "AS36924 (GVA)", color: "#f4a261" },
//     { name: "AS16058 (Gab)", color: "#e9c46a" },
//     { name: "AS528124 (DIG)", color: "#2a9d8f" },
//     { name: "AS37390 (iPi9)", color: "#264653" },
//     { name: "AS37582 (ANI)", color: "#e76f51" },
// ];
//
// const LatencyChart = () => {
//     const [visibleASNs, setVisibleASNs] = useState(asnList.map(asn => asn.name));
//
//     const toggleASN = (asnName) => {
//         setVisibleASNs(prev => prev.includes(asnName) ? prev.filter(asn => asn !== asnName) : [...prev, asnName]);
//     };
//
//     return (
//         <Layout>
//             <Content style={{ padding: "20px", display: "flex" }}>
//                 <div style={{ flex: 3, marginRight: "20px" }}>
//                     <Card title="Upstream Delay Connectivity">
//                         <Tabs defaultActiveKey="1">
//                             <TabPane tab="Combined" key="1">
//                                 <HighchartsReact highcharts={Highcharts} options={latencyCombined} />
//                             </TabPane>
//                             <TabPane tab="Individual" key="2">
//                                 <HighchartsReact highcharts={Highcharts} options={latencyIndividual} />
//                             </TabPane>
//                         </Tabs>
//                         <HighchartsReact highcharts={Highcharts} options={traceRouteOptions} style={{ marginTop: 20 }} />
//                     </Card>
//                 </div>
//
//                 <div style={{ flex: 1 }}>
//                     <Card title="Networks">
//                         <List
//                             dataSource={asnList}
//                             renderItem={item => (
//                                 <List.Item>
//                                     <Checkbox
//                                         checked={visibleASNs.includes(item.name)}
//                                         onChange={() => toggleASN(item.name)}
//                                         style={{ color: item.color }}
//                                     >
//                                         {item.name}
//                                     </Checkbox>
//                                 </List.Item>
//                             )}
//                         />
//                     </Card>
//                 </div>
//             </Content>
//         </Layout>
//     );
// };
//
// export default LatencyChart;
import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {Tabs, Input, List, Tooltip, Button, Popover, Checkbox} from 'antd';
import {DownloadOutlined, EditOutlined, SettingOutlined, ShareAltOutlined,} from "@ant-design/icons";
// Internationalization
import T from "i18n-react";

const { TabPane } = Tabs;
const { Search } = Input;

// Sample Data (REPLACE WITH YOUR ACTUAL DATA)
const latencyData = {
    combined: {
        '2024-08-25': 50, '2024-08-26': 60, '2024-08-27': 55, '2024-08-28': 70,
        '2024-08-29': 65, '2024-08-30': 75, '2024-08-31': 70, '2024-09-01': 80
    },
    individual: {
        'AS36924': {
            '2024-08-25': 45, '2024-08-26': 55, '2024-08-27': 50, '2024-08-28': 65,
            '2024-08-29': 60, '2024-08-30': 70, '2024-08-31': 65, '2024-09-01': 75
        },
        'AS16058': {
            '2024-08-25': 55, '2024-08-26': 65, '2024-08-27': 60, '2024-08-28': 75,
            '2024-08-29': 70, '2024-08-30': 80, '2024-08-31': 75, '2024-09-01': 85
        },
    }
};


const tracerouteData = {
    'AS36183': { '2024-08-25': 20000, '2024-08-26': 22000, /* ... */ },
    'AS63293': { '2024-08-25': 15000, '2024-08-26': 17000, /* ... */ },
    // ... more ASNs
};

const dates = Object.keys(latencyData.combined); // Shared x-axis dates

const LatencyChart = () => {
    const entityName = "AS7018 (ATT-INTERNET4)"
    const [activeTab, setActiveTab] = useState('combined');
    const [selectedASNs, setSelectedASNs] = useState(['AS36924', 'AS16058']);
    const [searchText, setSearchText] = useState('');
    const [displayedASNs, setDisplayedASNs] = useState(Object.keys(latencyData.individual)); // Initially show all ASNs

    const [displaySettingsPopOver, setDisplaySettingsPopOver] = useState(false);
    const handleTabChange = (key) => setActiveTab(key);
    const [setting, setSetting] = useState(null)
    const handleASNSelect = (asn) => {
        const isSelected = selectedASNs.includes(asn);
        setSelectedASNs(isSelected ? selectedASNs.filter(item => item !== asn) : [...selectedASNs, asn]);
    };

    const handleSearch = (e) => setSearchText(e.target.value);
    useEffect(() => {
        setDisplayedASNs(Object.keys(latencyData.individual).filter(asn =>
            asn.toLowerCase().includes(searchText.toLowerCase())
        ));
    }, [searchText]);

    const renderLatencyChart = () => {
        const options = {
            title: { text: '' },
            xAxis: { categories: dates }, // Shared x-axis
            yAxis: { title: { text: 'Latency (ms)' } },
            tooltip: {
                formatter: function () {
                    return `Time: ${this.x}, Latency: ${this.y}ms`;
                },
            },
            series: [],
        };

        if (activeTab === 'combined') {
            const avgLatency = dates.map(date => {
                let sum = 0;
                let count = 0;
                selectedASNs.forEach(asn => {
                    if (latencyData.individual[asn] && latencyData.individual[asn][date]) {
                        sum += latencyData.individual[asn][date];
                        count++;
                    }
                });
                return count > 0 ? sum / count : null; // Handle cases where data might be missing
            });

            options.series.push({
                name: 'Average Latency',
                data: avgLatency,
            });

        } else {
            selectedASNs.forEach(asn => {
                options.series.push({
                    name: asn,
                    data: dates.map(date => latencyData.individual[asn] ? latencyData.individual[asn][date] : null), // Handle missing data
                });
            });
        }

        return <HighchartsReact highcharts={Highcharts} options={options} />;
    };

    const upstreamChartTitle = T.translate("entity.upstreamChartTitle");
    const sharedXAxis = {
        categories: ["8/25", "8/26", "8/27", "8/28", "8/29", "8/30", "8/31", "9/1"],
        title: {
            useHTML: true,
            text: "Time (UTC)",
            style: {
                fontSize: '13px',
                fontWeight: 'bold'
            }
        }
    };

    const latencyCombined = {
        chart: {
            type: 'line',
            height: 180
        },
        title: {
            text: "Latency (#/24s Up)",
            align: "left",
            x: 10
        },
        yAxis: {
            tickPositions: [0, 25, 50, 75, 100],
            title: { text: "" },
            labels: {
                style: {
                    fontSize: '10px',
                },
                formatter: function () {
                    return this.value + 'ms';
                }
            },
        },
        xAxis: {
            visible: false
        },
        series: [{ name: "Combined Latency", data: [50, 55, 53, 52, 51, 54, 52, 50], color: "#1890ff" }],
        legend: false,
        plotOptions: {
            series: {
                marker: {
                    enabled: false
                }
            }
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
        }
        };

        const latencyIndividual = {
            chart: {
                type: 'line',
                height: 180
            },
            title: {
                text: "Latency (#/24s Up)",
                align: "left",
                x: 10
            },
            yAxis: {
                tickPositions: [0, 25, 50, 75, 100],
                title: { text: "" },
                labels: {
                    style: {
                        fontSize: '10px',
                    },
                    formatter: function () {
                        return this.value + 'ms';
                    }
                },
            },
            xAxis: {
                visible: false,
            },
            series: [
                { name: "AS36924", data: [50, 55, 53, 52, 51, 54, 52, 50], color: "#f4a261" },
                { name: "AS16058", data: [48, 53, 50, 49, 47, 52, 50, 48], color: "#e9c46a" },
                { name: "AS528124", data: [60, 62, 61, 59, 58, 63, 61, 60], color: "#2a9d8f" },
                { name: "AS37390", data: [40, 42, 41, 39, 38, 43, 41, 40], color: "#264653" },
                { name: "AS37582", data: [55, 57, 56, 54, 53, 58, 56, 55], color: "#e76f51" }
            ],
            legend: false,
            plotOptions: {
                series: {
                    marker: {
                        enabled: false
                    }
                }
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
            }
        };

        const traceRouteOptions = {
            chart: {
                type: 'area',
                height: 220
            },
            title: {
                text: "Traceroute",
                align: "left",
                x: 10
            },
            yAxis: {
                tickPositions: [0, 10000, 20000, 30000, 40000],
                title: { text: "" },
                labels: {
                    style: {
                        fontSize: '10px',
                    },
                    formatter: function () {
                        return (this.value)/1000 + 'k';
                    }
                },
            },
            xAxis: sharedXAxis,
            series: [
                { name: "AS36924", data: [4000, 8000, 8000, 7100, 4000, 3500, 2000, 5000], color: Highcharts.color("#f4a261").setOpacity(0.4).get() },
                { name: "AS16058 (Gabon - Telecom)", data: [7000, 6000, 2000, 7500, 8500, 9000, 3000, 7000], color: Highcharts.color("#52c41a").setOpacity(0.4).get(), lineColor: '#52c41a'},
                { name: "AS528124 (DIGICOM - AS)", data: [5000, 6000, 7000, 4500, 6500, 9000, 3500, 8000], color: Highcharts.color("#eb2f96").setOpacity(0.4).get(), lineColor: '#eb2f96' },
                { name: "AS37390 (iPi9 - AS)", data: [7000, 6000, 7000, 6500, 7500, 8000, 8500, 9000], color: Highcharts.color("#722ed1").setOpacity(0.4).get(), lineColor: '#722ed1' },
                { name: "AS37582 (ANINF)", data: [5000, 6000, 5500, 8000, 9000, 7500, 8500, 7000], color: Highcharts.color("#ee9d1a").setOpacity(0.4).get(), lineColor: '#ee9d1a' },
            ],
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
                        enabled: false
                    }
                },
                area: {
                    stacking: 'normal',
                    lineWidth: 2,
                    marker: {
                        enabled: false
                    }
                }
            }

        };

    const asnList = [
        { name: "AS36924 (GVA - Canalbox)", color: "#52c41a" },
        { name: "AS16058 (Gabon - Telecom)", color: "#eb2f96" },
        { name: "AS328124 (DIGICOM - AS)", color: "#722ed1" },
        { name: "AS37582 (ANINF)", color: "#e76f51" },
        { name: "AS37390 (iPi9 - AS)", color: "#b5f5ec" },
        { name: "Other", color: "#ee9d1a" },
    ];
    const [visibleASNs, setVisibleASNs] = useState(asnList.map(asn => asn.name));
    const toggleASN = (asnName) => {
        setVisibleASNs(prev => prev.includes(asnName) ? prev.filter(asn => asn !== asnName) : [...prev, asnName]);
    };
    return (
        <div>
            <div className="flex items-stretch gap-0 mb-6 entity__chart-layout">
                <div className="col-3 p-4 card">
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
                                icon={<ShareAltOutlined />}
                                onClick={() => {alert("Share Graph work in progress")}}
                            > Share Graph
                            </Button>
                            </Tooltip>
                        </div>
                    </div>
                    <div className="upstream__chart">
                        <Tabs defaultActiveKey="1" style={{ marginLeft: '15px' }}>
                            <TabPane tab="Combined" key="1">
                             <HighchartsReact highcharts={Highcharts} options={latencyCombined} />
                            </TabPane>
                            <TabPane tab="Individual" key="2" >
                               <HighchartsReact highcharts={Highcharts} options={latencyIndividual} />
                            </TabPane>
                        </Tabs>
                        <div style={{ marginLeft: '25px' }}>
                            <HighchartsReact highcharts={Highcharts} options={traceRouteOptions} />
                        </div>
                    </div>
                </div>
                <div className="col-1 p-4 card">
                    <div className="overview__table-config flex-column">
                        <Search placeholder="Search Networks" onChange={handleSearch}
                                style={{width: '100%'}}/> {/* Fill width */}
                    </div>
                    <List
                        dataSource={asnList}
                        renderItem={item => (
                            <List.Item
                                style={{
                                    borderBottom: '1px solid #ccc',
                                    paddingBottom: '5px'
                                }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    {/* Small Colored Box */}
                                    <div
                                        style={{
                                            width: "14px",
                                            height: "14px",
                                            backgroundColor: Highcharts.color(item.color).setOpacity(0.4).get(),
                                            borderRadius: "3px",
                                            borderColor: item.color,
                                            borderStyle: 'solid',
                                            borderWidth: '1.5px'
                                        }}
                                    />
                                    {/* ASN Name */}
                                    <span style={{ color: "#333", fontSize: "14px" }}>
                                    {item.name}
                                    </span>
                                </div>
                            </List.Item>
                        )}
                    />
                </div>
            </div>
        </div>
)
    ;
};

export default LatencyChart;
