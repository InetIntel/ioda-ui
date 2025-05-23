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

/*
 * Portions of this source code are Copyright (c) 2021 Georgia Tech Research
 * Corporation. All Rights Reserved. Permission to copy, modify, and distribute
 * this software and its documentation for academic research and education
 * purposes, without fee, and without a written agreement is hereby granted,
 * provided that the above copyright notice, this paragraph and the following
 * three paragraphs appear in all copies. Permission to make use of this
 * software for other than academic research and education purposes may be
 * obtained by contacting:
*
 *  Office of Technology Licensing
 *  Georgia Institute of Technology
 *  926 Dalney Street, NW
 *  Atlanta, GA 30318
 *  404.385.8066
 *  techlicensing@gtrc.gatech.edu
 *
 * This software program and documentation are copyrighted by Georgia Tech
 * Research Corporation (GTRC). The software program and documentation are
 * supplied "as is", without any accompanying services from GTRC. GTRC does
 * not warrant that the operation of the program will be uninterrupted or
 * error-free. The end-user understands that the program was developed for
 * research purposes and is advised not to rely exclusively on the program for
 * any reason.
 *
 * IN NO EVENT SHALL GEORGIA TECH RESEARCH CORPORATION BE LIABLE TO ANY PARTY FOR
 * DIRECT, INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING
 * LOST PROFITS, ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION,
 * EVEN IF GEORGIA TECH RESEARCH CORPORATION HAS BEEN ADVISED OF THE POSSIBILITY
 * OF SUCH DAMAGE. GEORGIA TECH RESEARCH CORPORATION SPECIFICALLY DISCLAIMS ANY
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE SOFTWARE PROVIDED
 * HEREUNDER IS ON AN "AS IS" BASIS, AND  GEORGIA TECH RESEARCH CORPORATION HAS
 * NO OBLIGATIONS TO PROVIDE MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR
 * MODIFICATIONS.
*/

import {
    fetchData,
    OUTAGE_ALERTS_SEARCH,
    OUTAGE_EVENTS_SEARCH,
    OUTAGE_OVERALL_EVENTS_SEARCH,
    OUTAGE_SUMMARY_SEARCH,
    OUTAGE_RELATED_TO_MAP_SUMMARY_SEARCH,
    OUTAGE_RELATED_TO_TABLE_SUMMARY_SEARCH,
    OUTAGE_TOTAL_COUNT, SET_OUTAGE_RELATED_TO_MAP_SUMMARY_SEARCH
} from "./ActionCommons";

/*
BUILDING CONNECTION CONFIGS
 */

const buildAlertsConfig = (from, until, entityType=null, entityCode=null, datasource=null, limit=null, page=null) => {
    let url = "/outages/alerts";
    url += `?from=${from}&until=${until}`;

    url += entityType!==null ? `&entityType=${entityType}`: "";
    url += entityCode!==null ? `&entityCode=${entityCode}`: "";
    url += datasource!==null ? `&datasource=${datasource}`: "";
    url += limit!==null ? `&limit=${limit}`: "";
    url += page!==null ? `&page=${page}`: "";

    /* TEMPORARY -- ask API to discard all SARIMA alerts */
    url += "&ignoreMethods=*.sarima"

    return {
        method: "get",
        url: url
    }
};

const buildEventsConfig = (from, until, entityType=null, entityCode=null, attr, order, datasource=null,
                           includeAlerts=null, format=null,
                           limit=null, page=null, ) => {
    let url = "/outages/events";
    url += `?from=${from}&until=${until}`;

    url += entityType!==null ? `&entityType=${entityType}`: "";
    url += entityCode!==null ? `&entityCode=${entityCode}`: "";
    url += datasource!==null ? `&datasource=${datasource}`: "";
    url += format!==null ? `&format=${format}`: "";
    url += includeAlerts!==null ? `&includeAlerts=${includeAlerts}`: "";
    url += limit!==null ? `&limit=${limit}`: "";
    url += page!==null ? `&page=${page}`: "";
    url += attr!==null && order!==null ? `&orderBy=${attr}/${order}`: "";

    /* TEMPORARY -- ask API to discard all SARIMA alerts */
    url += "&ignoreMethods=*.sarima"
    return {
        method: "get",
        url: url
    }
};

const buildSummaryConfig = (from, until, entityType=null, entityCode=null, limit=null, page=null) => {
    let url = "/outages/summary";
    url += `?from=${from}&until=${until}`;

    url += entityType!==null ? `&entityType=${entityType}`: "";
    url += entityCode!==null ? `&entityCode=${entityCode}`: "";
    url += limit!==null ? `&limit=${limit}`: "";
    url += page!==null ? `&page=${page}`: "";

    /* TEMPORARY -- ask API to discard all SARIMA alerts */
    url += "&ignoreMethods=*.sarima"
    return {
        method: "get",
        url: url
    }
};

const buildRelatedToSummaryConfig = (from, until, entityType, relatedToEntityType, relatedToEntityCode, entityCode=null, limit=null, page=null) => {
    let url = "/outages/summary";
    url += `?from=${from}&until=${until}`;

    url += entityType!==null ? `&entityType=${entityType}`: "";
    url += limit!==null ? `&limit=${limit}`: "";
    url += page!==null ? `&page=${page}`: "";
    url += relatedToEntityType!==null ? `&relatedTo=${relatedToEntityType}/${relatedToEntityCode}` : "";

    /* TEMPORARY -- ask API to discard all SARIMA alerts */
    url += "&ignoreMethods=*.sarima"
    return {
        method: "get",
        url: url
    }
};

/*
PUBLIC ACTION FUNCTIONS
 */

export const searchAlerts = (dispatch, from, until, entityType=null, entityCode=null, datasource=null, limit=null, page=null) => {
    let config = buildAlertsConfig(from, until, entityType, entityCode, datasource, limit, page);
    fetchData(config).then(data => {
        dispatch({
            type: OUTAGE_ALERTS_SEARCH,
            payload: data.data.data,
        })
    });
}

// Endpoint to get events that populate in table component
export const searchEvents = (dispatch, from, until, entityType=null, entityCode=null, datasource=null,
                             includeAlerts=null, format=null, limit=null, page=null, attr=null, order=null) => {
    let config = buildEventsConfig(from, until, entityType, entityCode, datasource, includeAlerts, format, limit, page, attr, order);
    fetchData(config).then(data => {
        dispatch({
            type: OUTAGE_EVENTS_SEARCH,
            payload: data.data.data,
        })
    });
}

// Endpoint to get events that populate in stacked horizon component
export const searchOverallEvents = (dispatch, from, until, entityType=null, entityCode=null, datasource=null,
                             includeAlerts=null, format=null, limit=null, page=null, attr=null, order=null) => {
    let config = buildEventsConfig(from, until, entityType, entityCode, datasource, includeAlerts, format, limit, page, attr, order);
    config.url += "&format=ioda&overall";
    fetchData(config).then(data => {
        dispatch({
            type: OUTAGE_OVERALL_EVENTS_SEARCH,
            payload: data.data.data,
        })
    });
}

// Getting outage information to use for populating topoJSON data
export const searchSummary = (dispatch, from, until, entityType, entityCode, limit, page, includeMetadata) => {
    let config = buildSummaryConfig(from, until, entityType, entityCode, limit, page, includeMetadata);
    includeMetadata
        ? config.url = config.url + "&includeMetadata=true"
        : config.url;
    fetchData(config).then(data => {
        dispatch({
            type: OUTAGE_SUMMARY_SEARCH,
            payload: data.data.data,
        })
    });
}

// Getting outage information to use for populating topoJSON data
export const searchRelatedToMapSummary = (dispatch, from, until, entityType, relatedToEntityType, relatedToEntityCode, entityCode, limit, page, includeMetadata) => {
    let config = buildRelatedToSummaryConfig(from, until, entityType, relatedToEntityType, relatedToEntityCode, entityCode, limit, page, includeMetadata);
    includeMetadata
        ? config.url = config.url + "&includeMetadata=true"
        : config.url;
    fetchData(config).then(data => {
        dispatch({
            type: OUTAGE_RELATED_TO_MAP_SUMMARY_SEARCH,
            payload: data.data.data,
        })
    });
}

// Getting outage information to use for populating topoJSON data
export const setRelatedToMapSummary = (dispatch) => {
    dispatch({
        type: SET_OUTAGE_RELATED_TO_MAP_SUMMARY_SEARCH,
        payload: null,
    })
}

// Getting outage information to use for populating related to summary table
export const searchRelatedToTableSummary = (dispatch, from, until, entityType, relatedToEntityType, relatedToEntityCode, entityCode, limit, page, includeMetadata) => {
    let config = buildRelatedToSummaryConfig(from, until, entityType, relatedToEntityType, relatedToEntityCode, entityCode, limit, page, includeMetadata);
    includeMetadata
        ? config.url = config.url + "&includeMetadata=true"
        : config.url;
    fetchData(config).then(data => {
        dispatch({
            type: OUTAGE_RELATED_TO_TABLE_SUMMARY_SEARCH,
            payload: data.data.data,
        })
    });
}

// Getting outage information to use for populating topoJSON data
export const totalOutages = (dispatch, from, until, entityType=null, limit=null, page=null, includeMetadata=null) => {
    let config = buildSummaryConfig(from, until, entityType, limit, page, includeMetadata);
    fetchData(config).then(data => {
        dispatch({
            type: OUTAGE_TOTAL_COUNT,
            payload: data.data.data,
        })
    });
}
