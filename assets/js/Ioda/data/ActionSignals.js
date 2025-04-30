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

/*
BUILDING CONNECTION CONFIGS
 */

import {
    fetchData,
    GET_EVENT_SIGNALS,
    GET_SIGNALS,
    GET_RAW_REGIONAL_SIGNALS_PINGSLASH24,
    GET_RAW_REGIONAL_SIGNALS_BGP,
    GET_RAW_REGIONAL_SIGNALS_MERITNT,
    GET_RAW_REGIONAL_SIGNALS_UCSDNT,
    GET_RAW_ASN_SIGNALS_PINGSLASH24,
    GET_RAW_ASN_SIGNALS_BGP,
    GET_RAW_ASN_SIGNALS_MERITNT,
    GET_RAW_ASN_SIGNALS_UCSDNT,
    GET_ADDITIONAL_RAW_SIGNAL,
    GET_RAW_ASN_SIGNALS_UPSTREAM_DELAY_LATENCY,
    GET_RAW_ASN_SIGNALS_UPSTREAM_DELAY_PENULT_ASN_COUNT,
    GET_RAW_ASN_SIGNALS_AP_PACKET_LOSS,
    GET_RAW_ASN_SIGNALS_AP_PACKET_DELAY,
    SET_RAW_ASN_SIGNALS_MERITNT,
    SET_RAW_ASN_SIGNALS_BGP,
    SET_RAW_ASN_SIGNALS_PINGSLASH24
} from "./ActionCommons";

const buildSignalsConfig = (entityType, entityCode, from, until, datasource, maxPoints, sourceParams) => {
    let url = `/signals/raw/${entityType}/${entityCode}?from=${from}&until=${until}&maxPoints=${maxPoints}`;
    url += datasource!==null ? `&datasource=${datasource}`: "";
    url += sourceParams ? `&sourceParams=${sourceParams.join(",")}`: "";
    return {
        method: "get",
        url: url
    }
};

const buildEventSignalsConfig = (entityType, entityCode, from, until, datasource=null, maxPoints=null) => {
    let url = `/signals/events/${entityType}/${entityCode}?from=${from}&until=${until}`;
    url += datasource!==null ? `&datasource=${datasource}`: "";
    return {
        method: "get",
        url: url
    }
};

/*
PUBLIC ACTION FUNCTIONS
 */

export const getSignalsAction = (dispatch, entityType, entityCode, from, until, datasource=null, maxPoints,sourceParams) => {
    let config = buildSignalsConfig(entityType, entityCode, from, until, datasource, maxPoints, sourceParams);
    fetchData(config).then(data => {
        dispatch({
            type: GET_SIGNALS,
            payload: data.data.data,
        })
    });
};

export const getEventSignalsAction = (dispatch, entityType, entityCode, from, until, datasource=null, maxPoints=null) => {
    let config = buildEventSignalsConfig(entityType, entityCode, from, until, datasource, maxPoints);
    fetchData(config).then(data => {
        dispatch({
            type: GET_EVENT_SIGNALS,
            payload: data.data.data,
        })
    });
};

export const getRawRegionalSignalsPingSlash24Action = (dispatch, entityType, entityCode, from, until, attr=null, order=null, dataSource, maxPoints=null) => {
    let config = buildSignalsConfig(entityType, entityCode, from, until, dataSource, maxPoints);
    fetchData(config).then(data => {
        dispatch({
            type: GET_RAW_REGIONAL_SIGNALS_PINGSLASH24,
            payload: data.data.data,
        })
    });
};

export const getRawRegionalSignalsBgpAction = (dispatch, entityType, entityCode, from, until, attr=null, order=null, dataSource, maxPoints=null) => {
    let config = buildSignalsConfig(entityType, entityCode, from, until, dataSource, maxPoints);
    fetchData(config).then(data => {
        dispatch({
            type: GET_RAW_REGIONAL_SIGNALS_BGP,
            payload: data.data.data,
        })
    });
};

export const getRawRegionalSignalsMeritNtAction = (dispatch, entityType, entityCode, from, until, attr=null, order=null, dataSource, maxPoints=null) => {
    let config = buildSignalsConfig(entityType, entityCode, from, until, dataSource, maxPoints);
    fetchData(config).then(data => {
        dispatch({
            type: GET_RAW_REGIONAL_SIGNALS_MERITNT,
            payload: data.data.data,
        })
    });
};

export const getRawRegionalSignalsUcsdNtAction = (dispatch, entityType, entityCode, from, until, attr=null, order=null, dataSource, maxPoints=null) => {
    let config = buildSignalsConfig(entityType, entityCode, from, until, dataSource, maxPoints);
    fetchData(config).then(data => {
        dispatch({
            type: GET_RAW_REGIONAL_SIGNALS_UCSDNT,
            payload: data.data.data,
        })
    });
};

export const getRawAsnSignalsPingSlash24Action = (dispatch, entityType, entityCode, from, until, attr=null, order=null, dataSource, maxPoints=null) => {
    let config = buildSignalsConfig(entityType, entityCode, from, until, dataSource, maxPoints);
    fetchData(config).then(data => {
        dispatch({
            type: GET_RAW_ASN_SIGNALS_PINGSLASH24,
            payload: data.data.data,
        })
    });
};

export const setRawAsnSignalsPingSlash24Action = (dispatch) => {
    // let config = buildSignalsConfig(entityType, entityCode, from, until, dataSource, maxPoints);
    dispatch({
        type: SET_RAW_ASN_SIGNALS_PINGSLASH24,
        payload: null,
    });
};

export const getRawAsnSignalsBgpAction = (dispatch, entityType, entityCode, from, until, attr=null, order=null, dataSource, maxPoints=null) => {
    let config = buildSignalsConfig(entityType, entityCode, from, until, dataSource, maxPoints);
    fetchData(config).then(data => {
        dispatch({
            type: GET_RAW_ASN_SIGNALS_BGP,
            payload: data.data.data,
        })
    });
};

export const setRawAsnSignalsBgpAction = (dispatch) => {
    // let config = buildSignalsConfig(entityType, entityCode, from, until, dataSource, maxPoints);
    dispatch({
        type: SET_RAW_ASN_SIGNALS_BGP,
        payload: null,
    });
};

export const getRawAsnSignalsMeritNtAction = (dispatch, entityType, entityCode, from, until, attr=null, order=null, dataSource, maxPoints=null) => {
    let config = buildSignalsConfig(entityType, entityCode, from, until, dataSource, maxPoints);
    fetchData(config).then(data => {
        dispatch({
            type: GET_RAW_ASN_SIGNALS_MERITNT,
            payload: data.data.data,
        })
    });
};

export const setRawAsnSignalsMeritNtAction = (dispatch) => {
    // let config = buildSignalsConfig(entityType, entityCode, from, until, dataSource, maxPoints);
    dispatch({
        type: SET_RAW_ASN_SIGNALS_MERITNT,
        payload: null,
    });
};

export const getRawAsnSignalsUcsdNtAction = (dispatch, entityType, entityCode, from, until, attr=null, order=null, dataSource, maxPoints=null) => {
    let config = buildSignalsConfig(entityType, entityCode, from, until, dataSource, maxPoints);
    fetchData(config).then(data => {
        dispatch({
            type: GET_RAW_ASN_SIGNALS_UCSDNT,
            payload: data.data.data,
        })
    });
};

export const getAdditionalRawSignalAction = (dispatch, entityType, entityCode, from, until, attr=null, order=null, dataSource, maxPoints=null) => {
    let config = buildSignalsConfig(entityType, entityCode, from, until, dataSource, maxPoints);
    fetchData(config).then(data => {
        dispatch({
            type: GET_ADDITIONAL_RAW_SIGNAL,
            payload: data.data.data,
        })
    });
};

export const getRawAsnSignalsUpstreamDelayLatency = (dispatch, entityType, entityCode, from, until, attr=null, order=null, dataSource, maxPoints=null) => {
    let config = buildSignalsConfig(entityType, entityCode, from, until, dataSource, maxPoints);
    fetchData(config).then(data => {
        dispatch({
            type: GET_RAW_ASN_SIGNALS_UPSTREAM_DELAY_LATENCY,
            payload: data.data.data,
        })
    });
};

export const getRawAsnSignalsUpstreamDelayPenultAsnCount = (dispatch, entityType, entityCode, from, until, attr=null, order=null, dataSource, maxPoints=null) => {
    let config = buildSignalsConfig(entityType, entityCode, from, until, dataSource, maxPoints);
    fetchData(config).then(data => {
        dispatch({
            type: GET_RAW_ASN_SIGNALS_UPSTREAM_DELAY_PENULT_ASN_COUNT,
            payload: data.data.data,
        })
    });
};

export const getRawAsnSignalsApPacketLoss = (dispatch, entityType, entityCode, from, until, attr=null, order=null, dataSource, maxPoints=null) => {
    let config = buildSignalsConfig(entityType, entityCode, from, until, dataSource, maxPoints);
    fetchData(config).then(data => {
        dispatch({
            type: GET_RAW_ASN_SIGNALS_AP_PACKET_LOSS,
            payload: data.data.data,
        })
    });
};

export const getRawAsnSignalsApPacketDelay = (dispatch, entityType, entityCode, from, until, attr=null, order=null, dataSource, maxPoints=null) => {
    let config = buildSignalsConfig(entityType, entityCode, from, until, dataSource, maxPoints);
    fetchData(config).then(data => {
        dispatch({
            type: GET_RAW_ASN_SIGNALS_AP_PACKET_DELAY,
            payload: data.data.data,
        })
    });
};

