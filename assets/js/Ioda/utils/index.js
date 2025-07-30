/*
 * This software is Copyright (c) 2013 The Regents of the University of
 * California. All Rights Reserved. Permission to copy, modify, and distribute this
 * software and its documentation for academic research and education purposes,
 * without fee, and without a written agreement is hereby granted, provided that
 * the above copyright notice, this paragraph and the following three paragraphs
 * appear in all copies. Permission to make use of this software for other than
 * academic research and education purposes may be obtained by contacting:
 *
 * Office of Innovation and Commercialization
 * 9500 Gilman Drive, Mail Code 0910
 * University of California
 * La Jolla, CA 92093-0910
 * (858) 534-5815
 * invent@ucsd.edu
 *
 * This software program and documentation are copyrighted by The Regents of the
 * University of California. The software program and documentation are supplied
 * "as is", without any accompanying services from The Regents. The Regents does
 * not warrant that the operation of the program will be uninterrupted or
 * error-free. The end-user understands that the program was developed for research
 * purposes and is advised not to rely exclusively on the program for any reason.
 *
 * IN NO EVENT SHALL THE UNIVERSITY OF CALIFORNIA BE LIABLE TO ANY PARTY FOR
 * DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST
 * PROFITS, ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * THE UNIVERSITY OF CALIFORNIA HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH
 * DAMAGE. THE UNIVERSITY OF CALIFORNIA SPECIFICALLY DISCLAIMS ANY WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE PROVIDED HEREUNDER IS ON AN "AS
 * IS" BASIS, AND THE UNIVERSITY OF CALIFORNIA HAS NO OBLIGATIONS TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 */
import d3 from "d3";
import T from "i18n-react";
import { getColorFromLinearScale, getEntityScaleColor } from "./mapColors";
import { secondsToUTC } from "./timeUtils";

// Time limit max that a user can select in the calendar -- currently set for 90 days
export const controlPanelTimeRangeLimit = 90 * 24 * 60 * 60 + 1;
export const dashboardTimeRangeLimit = 7 * 24 * 60 * 60 + 1;

export const alertBandColor = "#BE1D2D";
export const xyChartBackgroundLineColor = "#E6E6E6";
export const secondaryColor = "#3975BB";
export const secondaryColorLight = "#598DCC";
export const secondaryColorDark = "#1A5DAE";
export const bgpColor = "#33A02C";
export const gtrColor = "#5F2CA0";
export const activeProbingColor = "#1F78B4";
export const meritNtColor = "#ED9B40";
export const ucsdNtColor = "#000000"; // XXX TODO choose a nice color
export const horizonChartSeriesColor = "#006D2D";

export const maxHtsLimit = 150;

export const legend = [
  {
    title: T.translate("entity.activeProbingLegendText"),
    key: "ping-slash24",
    color: activeProbingColor,
    tooltip: {
      title: T.translate("tooltip.tooltipActiveProbingChartLegend.title"),
      text: T.translate("tooltip.tooltipActiveProbingChartLegend.text"),
      link: "/resources?search=active+probing&tab=glossary",
    },
  },
  {
    title: T.translate("entity.bgpLegendText"),
    key: "bgp",
    color: bgpColor,
    tooltip: {
      title: T.translate("tooltip.tooltipBgpChartLegend.title"),
      text: T.translate("tooltip.tooltipBgpChartLegend.text"),
      link: "/resources?search=BGP&tab=glossary",
    },
  },
  {
    title: T.translate("entity.meritLegendText"),
    key: "merit-nt",
    color: meritNtColor,
    tooltip: {
      title: T.translate("tooltip.darknetChartLegend.title"),
      text: T.translate("tooltip.darknetChartLegend.text"),
      link: "/resources?search=telescope&tab=glossary",
    },
  },
  {
    title: T.translate("entity.googleMapText"),
    key: "gtr.MAPS",
    color: "#A02C79",
  },
  {
    title: T.translate("entity.googleMailText"),
    key: "gtr.GMAIL",
    color: "#A02C2C",
  },
  {
    title: T.translate("entity.googleSearchText"),
    key: "gtr.WEB_SEARCH",
    color: gtrColor,
  },
  {
    title: T.translate("entity.googleImagesText"),
    key: "gtr.IMAGES",
    color: "#FC5D83",
  },
  {
    title: T.translate("entity.googleYoutubeText"),
    key: "gtr.YOUTUBE",
    color: "#B65DFC",
  },
  {
    title: T.translate("entity.googleSpreadsheetText"),
    key: "gtr.SPREADSHEETS",
    color: "#637146",
  },
  {
    title: T.translate("entity.googleSitesText"),
    key: "gtr.SITES",
    color: "#426984",
  },
];

// Humanize number with rounding, abbreviations, etc.
export function humanizeNumber(value, precisionDigits) {
  precisionDigits = precisionDigits || 3;
  return d3.format(
    (isNaN(precisionDigits) ? "" : "." + precisionDigits) +
      (Math.abs(value) < 1 ? "r" : "s")
  )(value);
}

export function generateKeys(prefix) {
  var key = prefix ? prefix : "";
  return key + Math.random().toString(34).slice(2);
}

export function convertValuesForSummaryTable(summaryDataRaw) {
  let summaryData = [];
  let allScores = [];
  let min, max;
  summaryDataRaw.map((summary) => {
    allScores.push(summary.scores.overall);
  });

  min = Math.min.apply(null, allScores);
  max = Math.max.apply(null, allScores);

  summaryDataRaw.map((summary, index) => {
    let overallScore = null;
    let summaryScores = [];

    // Map through individual scores
    Object.entries(summary["scores"]).map((entry) => {
      if (entry[0] !== "overall") {
        const entryItem = {
          source: entry[0],
          score: entry[1],
        };
        summaryScores.push(entryItem);
      } else {
        overallScore = entry[1];
      }
    });

    // If entity type has ip_count/is an ASN
    let summaryItem;
    console.log(summary)
    summary.entity.type === "asn" || summary.entity.type === "geoasn"
      ? (summaryItem = {
          entityType: "asn",
          entityCode: summary["entity"].code,
          name: summary["entity"].name.replace(/--/g, "|"),
          score: overallScore,
          scores: summaryScores,
          ipCount: humanizeNumber(summary["entity"]["attrs"]["ip_count"], 2),
          color: `${getColorFromLinearScale(overallScore, min, max)}80`,
        })
      : (summaryItem = {
          entityType: summary["entity"].type,
          entityCode: summary["entity"].code,
          name: summary["entity"].name.replace(/--/g, "|"),
          score: overallScore,
          scores: summaryScores,
          color: `${getEntityScaleColor(
            overallScore,
            summary["entity"].type
          )}80`,
        });
    summaryData.push(summaryItem);
  });
  return summaryData;
}

export function combineValuesForSignalsTable(
  entitiesWithOutages,
  additionalEntities,
  initialLimit
) {
  let summaryData = [];
  let outageCount = 0;
  let duplicatesRemoved = additionalEntities;
  entitiesWithOutages.map((entity, index) => {
    let overallScore = null;
    let summaryScores = [];
    // Get each score value for score table
    Object.entries(entity["scores"]).map((entry) => {
      if (entry[0] !== "overall") {
        const entryItem = {
          source: entry[0],
          score: entry[1],
        };
        summaryScores.push(entryItem);
      } else {
        overallScore = entry[1];
      }
    });
    // Remove entity from raw entity list
    duplicatesRemoved = duplicatesRemoved.filter(
      (obj) => obj.code !== entity["entity"].code
    );

    // Display entity with outage on signal table, if asn add ip count property
    let summaryItem;
    entity.entity.type === "asn" || entity.entity.type === "geoasn"
      ? (summaryItem = {
          visibility: index < initialLimit,
          entityType: entity["entity"].type === "geoasn" ? "asn" : entity["entity"].type,
          entityCode: entity["entity"].code,
          name: entity["entity"].name.replace(/--/g, "|"),
          score: overallScore,
          scores: summaryScores,
          ipCount: humanizeNumber(entity["entity"]["attrs"]["ip_count"], 2),
          initiallyLoaded: index < 300,
        })
      : (summaryItem = {
          visibility: index < initialLimit,
          entityType: entity["entity"].type === "geoasn" ? "asn" : entity["entity"].type,
          entityCode: entity["entity"].code,
          name: entity["entity"].name.replace(/--/g, "|"),
          score: overallScore,
          scores: summaryScores,
          initiallyLoaded: index < 300,
        });
    summaryData.push(summaryItem);
  });
  outageCount = summaryData.length;


  // Display scoreless entities on signal table, if asn add ip count property
  duplicatesRemoved.map((entity, index) => {
    let entityItem;
    entity.type === "asn" || entity.type === "geoasn"
      ? (entityItem = {
          visibility: index < initialLimit - outageCount,
          entityType: entity.type === "geoasn" ? "asn" : entity.type,
          entityCode: entity.code,
          name: entity.name.replace(/--/g, "|"),
          score: 0,
          scores: [{ source: "Overall Score", score: 0 }],
          ipCount: humanizeNumber(entity.attrs.ip_count, 2),
          initiallyLoaded: index < 300,
        })
      : (entityItem = {
          visibility: index < initialLimit - outageCount,
          entityType: entity.type === "geoasn" ? "asn" : entity.type,
          entityCode: entity.code,
          name: entity.name.replace(/--/g, "|"),
          score: 0,
          scores: [{ source: "Overall Score", score: 0 }],
          initiallyLoaded: index < 300,
        });
    summaryData.push(entityItem);
  });
  return summaryData;
}

// Function for raw signals table on entity page
// Will process time series data and return in a format compatible with the Horizon-time-series visual
export function convertTsDataForHtsViz(tsData) {
  let series = [];
  tsData.map((signal) => {
    let values = [];
    signal.values.map((value, index) => {
      values.push(value);
      const plotPoint = {
        entityCode: signal.entityCode,
        entityName: signal.entityName.replace(/--/g, "|"),
        datasource: signal.datasource,
        ts: secondsToUTC(signal.from + signal.step * index).toDate(),
        val: value,
      };
      const max = Math.max.apply(null, values);
      if (max !== 0) {
        series.push(plotPoint);
      }
    });
  });
  return series;
}

// take a list of outages that will populate on a map and create a bounding box the map will use for zoom location
export function getOutageCoords(features) {
  return features
    .map(d3.geo.bounds)
    .reduce(function (prev, cur) {
      return [
        [Math.min(prev[0][0], cur[0][0]), Math.min(prev[0][1], cur[0][1])],
        [Math.max(prev[1][0], cur[1][0]), Math.max(prev[1][1], cur[1][1])],
      ];
    })
    .map(function (coords) {
      return coords.reverse();
    }); // Invert lat long coords
}

// Normalize value in XY plot of time series on entity page
export function normalize(value, max) {
  if (value && value !== 0) {
    return value !== null && !isNaN((value - 0) / (max - 0))
      ? ((value - 0) / (max - 0)) * 100
      : 100;
  } else if (value === 0) {
    return 0;
  } else {
    return null;
  }
}
