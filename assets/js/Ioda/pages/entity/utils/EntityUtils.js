import {registerAnalyticsEvent} from "../../../utils/analytics";
import {secondsToUTC} from "../../../utils/timeUtils";
import T from "i18n-react";
import iodaWatermark from "../../../../../images/ioda-canvas-watermark.svg";

export function handleCSVDownload(timeSeriesChartRef, isNormalized){
    if (!timeSeriesChartRef.current) {
        return;
    }

    const csvString = timeSeriesChartRef.current.chart.getCSV();

    // The first column is the timestamp, and each following column is
    // duplicated because we duplicate each series for the navigator to always
    // show the normalized data. As such, we need to remove the duplicates.
    const parsedCSV = csvString
        .split("\n")
        .map((line) => {
            return line.split(",").filter((val, index) => {
                // Always keep the timestamp column
                if (index === 0) return true;
                // Duplicates are located at the even indices
                if (index % 2 === 1) return true;
                return false;
            });
        })
        .join("\n");

    const fileName =
        getChartExportFileName() + (isNormalized ? "-normalized" : "-raw");

    const blob = new Blob([parsedCSV], { type: "text/csv;charset=utf-8," });
    const objUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", objUrl);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    registerAnalyticsEvent("Entity", "DownloadDataCSV");
}

export function getChartExportFileName(from, entityName) {
    const fromDayjs = secondsToUTC(from);

    const formatCompact = "YY-MM-DD-HH-mm";

    const exportFileNameBase =
        `ioda-${entityName}-${fromDayjs.format(formatCompact)}`;
    return exportFileNameBase.replace(/\s+/g, "-").toLowerCase();
}

export const getChartExportTitle = (entityName)  => {
    return `${T.translate(
        "entity.xyChartTitle"
    )} ${entityName?.trim()}`;
}

export const getChartExportSubtitle = (from, until) => {
    const fromDayjs = secondsToUTC(from);
    const untilDayjs = secondsToUTC(until);

    const formatExpanded = "MMMM D, YYYY h:mma";

    return `${fromDayjs.format(formatExpanded)} - ${untilDayjs.format(
        formatExpanded
    )} UTC`;
}

export const tooltipContentFormatter = (isNormalized, ctx) => {
    const seriesName = ctx.series.name;
    const yValue = ctx.y;
    const formattedYValue = formatLocaleNumber(yValue, 2);
    if (isNormalized) {
        return `${seriesName}: ${formattedYValue}%`;
    } else {
        return `${seriesName}: ${formattedYValue}`;
    }
};

export const formatLocaleNumber = (value, precision) => {
    return Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: precision,
    }).format(value);
};

export const manuallyDownloadChart = (timeSeriesChartRef, imageType) => {
    if (!timeSeriesChartRef.current?.chart) {
        return;
    }

    // Append watermark to image on download:
    // https://www.highcharts.com/forum/viewtopic.php?t=47368
    timeSeriesChartRef.current.chart.exportChartLocal(
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
