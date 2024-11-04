import {registerAnalyticsEvent} from "../../../utils/analytics";
import {secondsToUTC} from "../../../utils/timeUtils";

export function handleCSVDownload(timeSeriesChartRef){
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

    const isNormalized = !!tsDataNormalized;
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
