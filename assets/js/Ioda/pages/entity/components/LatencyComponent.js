import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import dayjs from "dayjs";

const LatencyChart = ({ data }) => {
    // Extract raw data from the API response
    const rawValues = data.data[0][0].values; // Adjust path if different

    // Convert timestamps to readable format
    const fromTime = data.requestParameters.from * 1000;
    const step = data.data[0][0].step * 1000;
    const categories = rawValues.map((_, index) =>
        dayjs(fromTime).add(index * step, "millisecond").format("YYYY-MM-DD HH:mm")
    );

    // Prepare series data
    const seriesData = {};
    rawValues.forEach((timeSlice) => {
        timeSlice.forEach((entry) => {
            const penultimate_as = entry.penultimate_as;
            const meanLatency = entry.agg_values.mean_e2e_latency || 0;

            if (!seriesData[penultimate_as]) {
                seriesData[penultimate_as] = [];
            }
            seriesData[penultimate_as].push(meanLatency);
        });
    });

    const series = Object.entries(seriesData).map(([key, values]) => ({
        name: `AS ${key}`,
        data: values,
    }));

    // Highcharts configuration
    const options = {
        chart: {
            type: "line", // Change to "area" for a stacked area chart
        },
        title: {
            text: "Upstream Delay End-to-End Latency",
        },
        xAxis: {
            categories: categories,
            title: {
                text: "Time",
            },
        },
        yAxis: {
            title: {
                text: "Mean E2E Latency (ms)",
            },
        },
        tooltip: {
            shared: true,
        },
        series: series,
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default LatencyChart;
