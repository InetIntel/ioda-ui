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
    ENTITIES_SEARCH,
    ENTITY_METADATA,
    GET_RELATED_ENTITIES,
    fetchData,
    GET_REGIONAL_SIGNALS_TABLE_SUMMARY_DATA,
    GET_ASN_SIGNALS_TABLE_SUMMARY_DATA,
    SET_REGIONAL_SIGNALS_TABLE_SUMMARY_DATA,
    SET_ASN_SIGNALS_TABLE_SUMMARY_DATA
} from "./ActionCommons";

const buildSearchConfig = (searchQueryText, limit) => {
    return {
        method: "get",
        url: `/entities/query?limit=${limit}&search=${searchQueryText}`
    }
};

export const searchEntities = (dispatch, searchQuery, limit=15) => {
    let searchConfig = buildSearchConfig(searchQuery, limit);
    fetchData(searchConfig).then(data => {
        dispatch({
            type: ENTITIES_SEARCH,
            payload: data.data.data,
        })
    });
}

export const buildSearchRelatedEntitiesConfig = (from, until, entityType, relatedToEntityType, relatedToEntityCode) => {
    return {
        method: "get",
        url: `/entities/query?entityType=${entityType}&relatedTo=${relatedToEntityType}/${relatedToEntityCode}`
    }
}

// Getting outage information to use for populating topoJSON data
export const searchRelatedEntities = (dispatch, from, until, entityType, relatedToEntityType, relatedToEntityCode) => {
    let config = buildSearchRelatedEntitiesConfig(from, until, entityType, relatedToEntityType, relatedToEntityCode);
    fetchData(config).then(data => {
        dispatch({
            type: GET_RELATED_ENTITIES,
            payload: data.data.data,
        })
    });
}


const buildEntityMetadataConfig = (entityType, entityCode) => {
    return {
        method: "get",
        url: `/entities/query?entityType=${entityType}&entityCode=${entityCode}`
    }
};

export const getEntityMetadata = ( entityType, entityCode) => {
    let config = buildEntityMetadataConfig(entityType, entityCode);
    return fetchData(config).then(data => data.data.data);
}

const summaryDataForSignalsTableConfig = (entityType, relatedToEntityType, relatedToEntityCode) => {
    return {
        method: "get",
        url: `/entities/query?entityType=${entityType}&relatedTo=${relatedToEntityType}/${relatedToEntityCode}`
    }
}

// Action for getting data used on signals table in map modal on entities page
export const regionalSignalsTableSummaryDataAction = (dispatch, entityType, relatedToEntityType, relatedToEntityCode) => {
    let config = summaryDataForSignalsTableConfig(entityType, relatedToEntityType, relatedToEntityCode);
    fetchData(config).then(data => {
        dispatch({
            type: GET_REGIONAL_SIGNALS_TABLE_SUMMARY_DATA,
            payload: data.data.data,
        })
    });
}

// Action for setting data used on signals table in map modal on entities page
export const setRegionalSignalsTableSummaryDataAction = (dispatch) => {
    dispatch({
        type: SET_REGIONAL_SIGNALS_TABLE_SUMMARY_DATA,
        payload: null,
    })
}

// Action for getting data used on signals table in map modal on entities page
export const asnSignalsTableSummaryDataAction = (dispatch, entityType, relatedToEntityType, relatedToEntityCode) => {
    let config = summaryDataForSignalsTableConfig(entityType, relatedToEntityType, relatedToEntityCode);
    fetchData(config).then(data => {
        dispatch({
            type: GET_ASN_SIGNALS_TABLE_SUMMARY_DATA,
            payload: data.data.data,
        })
    });
}

// Action for getting data used on signals table in map modal on entities page
export const setAsnSignalsTableSummaryDataAction = (dispatch) => {
    dispatch({
        type: SET_ASN_SIGNALS_TABLE_SUMMARY_DATA,
        payload: null,
    })
}
