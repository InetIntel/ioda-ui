import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Tabs } from "antd";
import dayjs from "dayjs";
import rawData from "../1299_upstream_delay_penult_asns.json";
import rawLatencyData from "../1299_upstream_delay_penult_e2e_latency.json";
import LatencyChart from "../components/LatencyComponent";

const rawUpstreamData = rawData.data[0][0].values;

const categories = rawUpstreamData.map((_, index) =>
    dayjs(1727740800 * 1000).add(index  * 3, "day").format("YYYY-MM-DD HH:mm")
);

const seriesData = {};
rawUpstreamData.forEach((timeSlice) => {
    timeSlice.forEach((entry) => {
        const { penultimate_as, agg_values } = entry;
        const count = agg_values.penultimate_as_count || 0;
        if (!seriesData[penultimate_as]) {
            seriesData[penultimate_as] = [];
        }
        seriesData[penultimate_as].push(count);
    });
});


const series = Object.entries(seriesData).map(([key, values]) => ({
    name: `AS ${key}`,
    data: values,
}));

const { TabPane } = Tabs;

const UpstreamComponent = () => {

    const options = {
        chart: {
            type: "area",
        },
        title: {
            text: "Upstream Delay Penultimate ASNs",
        },
        xAxis: {
            categories: categories,
            title: {
                text: "Time",
            },
        },
        yAxis: {
            title: {
                text: "Penultimate AS Count",
            },
        },
        tooltip: {
            shared: true,
        },
        plotOptions: {
            area: {
                stacking: "normal",
                marker: {
                    enabled: false,
                },
            },
        },
        series: series,
    };

    // Highcharts configuration for individual charts
    const latencyOptions = {
        chart: {
            type: "line",
        },
        title: {
            text: "Latency Over Time",
        },
        xAxis: {
            categories: categories,
        },
        yAxis: {
            title: {
                text: "Latency (ms)",
            },
        },
        series: [
            {
                name: "Latency",
                data: [],
                color: "#1979C9",
            },
        ],
    };



    return (
        <Tabs defaultActiveKey="1" style={{ padding: "20px" }}>
             {/*Combined Chart */}
            <TabPane tab="Combined View" key="1">
                <LatencyChart data={rawLatencyData} />
            </TabPane>



            {/* Individual Charts */}
            <TabPane tab="Individual Views" key="2">
                <div style={{ marginBottom: "20px" }}>
                    <HighchartsReact highcharts={Highcharts} options={options} />
                </div>


            </TabPane>
        </Tabs>
    );
};

export default UpstreamComponent;
