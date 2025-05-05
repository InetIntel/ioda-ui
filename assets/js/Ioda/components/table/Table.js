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

import React, {Component, useEffect, useState} from 'react';
import T from 'i18n-react';
import {generateKeys, humanizeNumber} from "../../utils";
import SummaryTableRow from "./SummaryTableRow";
import SignalTableRow from "./SignalTableRow";
import iconSortAsc from 'images/icons/icon-asc.png';
import iconSortDesc from 'images/icons/icon-desc.png';
import iconSortUnsorted from 'images/icons/icon-sortUnsort.png';
import iconCancel from 'images/icons/icon-cancel.png';
import iconCheckmark from 'images/icons/icon-checkmark.png';


const Table = (props) => {

    const{
        type,
        entityType,
        handleEntityClick,
        toggleEntityVisibilityInHtsViz,
        handleCheckboxEventLoading,
        totalCount
    } = props;

    const [eventData, setEventData] = useState([]);
    const [alertData, setAlertData] = useState([]);
    const [summaryData, setSummaryData] = useState([]);
    const [signalData, setSignalData] = useState([]);
    const [data, setData] = useState([]);
    const [sortedColumn, setSortedColumn] = useState( {
        name: "",
        position: "",
        arrow: ""
    });

    const alertHeaders = {
        level: "",
        dateStamp: T.translate("table.alertHeaders.timeStamp"),
        dataSource: T.translate("table.alertHeaders.dataSource"),
        actualValue: T.translate("table.alertHeaders.actualValue"),
        baselineValue: T.translate("table.alertHeaders.baselineValue")
    };
    const eventHeaders = {
        fromDate: T.translate("table.eventHeaders.fromDate"),
        untilDate: T.translate("table.eventHeaders.untilDate"),
        duration: T.translate("table.eventHeaders.duration"),
        score: T.translate("table.eventHeaders.score")
    };
    const summaryHeaders = {
        name: T.translate("table.summaryHeaders.name"),
        score: T.translate("table.summaryHeaders.score")
    };
    const summaryHeadersAsn = {
        name: T.translate("table.summaryHeaders.name"),
        ipCount: T.translate("table.summaryHeaders.ipCount"),
        score: T.translate("table.summaryHeaders.score")
    };
    const signalHeaders = {
        visibility: "",
        name: T.translate("table.signalHeaders.nameRegion"),
        score: T.translate("table.signalHeaders.score")
    };
    const signalHeadersAsn = {
        visibility: "",
        name: this.props.entityType === "asn" ? T.translate("table.signalHeaders.nameAsn") : T.translate("table.signalHeaders.nameCountry"),
        ipCount: T.translate("table.signalHeaders.ipCount"),
        score: T.translate("table.signalHeaders.score")
    };


    const setTableData = (data) => {
        if (type === "alert") {
            // Alert Table default sort
            console.log(data)
            setAlertData(data);
            setSortedColumn({
                name: "dateStamp",
                position: "desc",
                arrow: iconSortDesc
            })
        }

        if (type === "event") {
            // Event Table default sort
            setAlertData(data);
            setSortedColumn({
                    name: "fromDate",
                    position: "desc",
                    arrow: iconSortDesc
                }
            );
        }

        if (type === "summary") {
            // Summary Table default sort
            setSummaryData(data);
            setSortedColumn({
                name: "score",
                position: "desc",
                arrow: iconSortDesc
            })

        }

        if (type === "signal") {
            // Signal Table default sort
            setSignalData(data);
            setSortedColumn({
                name: "score",
                position: "desc",
                arrow: iconSortDesc
            })

        }
    }

    useEffect(() => {
        setTableData(data);
    }, [data]);

    useEffect(() => {
        // Check for getting relatedTo Outage Summary data on Entity Page to populate
        if(type === "summary" && summaryData !== data) {
            setSummaryData(data);
            setSortedColumn({
                name: "score",
                position: "desc",
                arrow: iconSortDesc
            })
        }
        // Check for getting Map RawSignalsModal Signal Table data on Entity Page to populate

        if (type === "signal" && signalData !== data) {
            // Signal Table default sort
            setSignalData(data);
            setSortedColumn({
                name: "score",
                position: "desc",
                arrow: iconSortDesc
            })
        }
    }, [data]);

    const compare = (key, order) => {
        return function innerSort(a, b) {
            if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
                // property doesn't exist on either object
                return 0;
            }

            let varA = (typeof a[key] === 'string')
                ? a[key].toUpperCase() : a[key];
            let varB = (typeof b[key] === 'string')
                ? b[key].toUpperCase() : b[key];

            if(key==="ipCount"){
                varA=Table.parseHumanReadableFloat(varA);
                varB=Table.parseHumanReadableFloat(varB);
            }

            let comparison = 0;
            if (varA > varB) {
                comparison = 1;
            } else if (varA < varB) {
                comparison = -1;
            }
            return (
                (order === 'desc') ? (comparison * -1) : comparison
            );
        };
    }

    const parseHumanReadableFloat = (value) => {
        let parsedValue=parseFloat(value.replace(/[A-Za-z]/g, ''));
        if(value.includes("k")){
            parsedValue=parsedValue*1000;
        } else if(value.includes("M")){
            parsedValue=parsedValue*1000000;
        } else if(value.includes("G")){
            parsedValue=parsedValue*1000000000;
        }
        return parsedValue;
    }


    const sortByColumn = (event) => {
        let colToSort, position, data;

        // get key from respective object based on header value clicked on
        if (type === "alert") {
            if (event.target.value) {
                colToSort = Object.keys(alertHeaders).find(key => alertHeaders[key] === event.target.value);
            } else {
                colToSort = Object.keys(alertHeaders).find(key => alertHeaders[key] === event.target.parentNode.value);
            }
            position = alertHeaders[colToSort];
        }

        if (type === "event") {
            if (event.target.value) {
                colToSort = Object.keys(eventHeaders).find(key => eventHeaders[key] === event.target.value);
            } else {
                colToSort = Object.keys(eventHeaders).find(key => eventHeaders[key] === event.target.parentNode.value);
            }
            position = eventHeaders[colToSort];
        }

        if (type === "summary") {
            if (entityType === 'asn') {
                if (event.target.value) {
                    colToSort = Object.keys(this.summaryHeadersAsn).find(key => this.summaryHeadersAsn[key] === event.target.value);
                } else {
                    colToSort = Object.keys(this.summaryHeadersAsn).find(key => this.summaryHeadersAsn[key] === event.target.parentNode.value);
                }
                position = this.summaryHeadersAsn[colToSort];
            } else {
                if (event.target.value) {
                    colToSort = Object.keys(this.summaryHeaders).find(key => this.summaryHeaders[key] === event.target.value);
                } else {
                    colToSort = Object.keys(this.summaryHeaders).find(key => this.summaryHeaders[key] === event.target.parentNode.value);
                }
                position = this.summaryHeaders[colToSort];
            }
        }

        if (type === "signal") {
            if (entityType === 'asn') {
                if (event.target.value) {
                    colToSort = Object.keys(signalHeadersAsn).find(key => signalHeadersAsn[key] === event.target.value);
                } else {
                    colToSort = Object.keys(signalHeadersAsn).find(key => signalHeadersAsn[key] === event.target.parentNode.value);
                }
                position = signalHeadersAsn[colToSort];
            } else {
                if (event.target.value) {
                    colToSort = Object.keys(signalHeaders).find(key => signalHeaders[key] === event.target.value);
                } else {
                    colToSort = Object.keys(signalHeaders).find(key => signalHeaders[key] === event.target.parentNode.value);
                }
                position = signalHeaders[colToSort];
            }
        }

        // Update state of table to sort rows and add icon
        if (event.target.value) {
            setSortedColumn({
                name: colToSort,
                position: event.target.value !== position
                    ? "asc"
                    : sortedColumn.position === "asc"
                        ? "desc"
                        : "asc",
                arrow: event.target.value !== position
                    ? iconSortUnsorted
                    : sortedColumn.position === "asc"
                        ? iconSortDesc
                        : iconSortAsc
            })
            data = data.sort(compare(colToSort, sortedColumn.position));
            setData(data);
        } else {
            setSortedColumn({
                name: colToSort,
                position: event.target.parentNode.value !== position
                    ? "asc"
                    : this.state.sortedColumn.position === "asc"
                        ? "desc"
                        : "asc",
                arrow: event.target.parentNode.value !== position
                    ? iconSortUnsorted
                    : this.state.sortedColumn.position === "asc"
                        ? iconSortDesc
                        : iconSortAsc
            })
            data = this.props.data.sort(this.compare(colToSort, this.state.sortedColumn.position));
            setData(data);
        }
    }

    const unsortedIconAltText = String(T.translate("table.unsortedIconAltText"));
    const displayCountShowing = String(T.translate("table.displayCountShowing"));
    const displayCountOf = String(T.translate("table.displayCountOf"));
    const displayCountEntries = String(T.translate("table.displayCountEntries"));
    const eventNoOutagesMessage = String(T.translate("table.eventNoOutagesMessage"));
    const alertNoOutagesMessage = String(T.translate("table.alertNoOutagesMessage"));
    const summaryNoOutagesMessage = String(T.translate("table.summaryNoOutagesMessage"));
    const signalNoOutagesMessage = String(T.translate("table.signalNoOutagesMessage"));

    return (
        <div className="table__wrapper">
            <table className={`table ${
                type === "alert" ? "table--alert" :
                    type === "event" ? "table--event" :
                        type === "summary" && entityType !== "asn" ? "table--summary" :
                            type === "summary" && entityType === "asn" ? "table--summary table--summary--asn" :
                                type === "signal" && entityType === "asn" ? "table--signal table--signal--asn" :
                                    "table--signal"
            }`}>
                <thead>
                <tr className="table__header">
                    {
                        Object.values(type === "alert"
                            ? alertHeaders
                            : type === "event"
                                ? eventHeaders
                                : type === "summary" && entityType === 'asn'
                                    ? summaryHeadersAsn
                                    : type === "summary" && entityType !== 'asn'
                                        ? summaryHeaders
                                        : type === "signal" && entityType === 'asn'
                                            ? signalHeadersAsn
                                            : type === 'signal' && entityType !== 'asn'
                                                ? signalHeaders
                                                : null
                        ).map(header => {
                            return <th className="table__header-col" key={header}>
                                <button onClick={(event) => sortByColumn(event)} value={header}>
                                    {header}
                                    {
                                        type === "alert"
                                            ? header === alertHeaders[sortedColumn.name]
                                                ? <img className="table__header-sort" src={sortedColumn.arrow} alt={sortedColumn.arrow} onClick={(event) => sortByColumn(event)}/>
                                                : <img className="table__header-sort" src={iconSortUnsorted} alt={unsortedIconAltText}/>
                                            : null
                                    }
                                    {
                                        type === "event"
                                            ? header === eventHeaders[sortedColumn.name]
                                                ? <img className="table__header-sort" src={sortedColumn.arrow} alt={sortedColumn.arrow} onClick={(event) => sortByColumn(event)}/>
                                                : <img className="table__header-sort" src={iconSortUnsorted} alt={unsortedIconAltText}/>
                                            : null
                                    }
                                    {
                                        type === "summary" && entityType !== 'asn'
                                            ? header === summaryHeaders[sortedColumn.name]
                                                ? <img className="table__header-sort" src={sortedColumn.arrow} alt={sortedColumn.arrow} onClick={(event) => sortByColumn(event)}/>
                                                : <img className="table__header-sort" src={iconSortUnsorted} alt={unsortedIconAltText}/>
                                            : null
                                    }
                                    {
                                        type === "summary" && entityType === 'asn'
                                            ? header === summaryHeadersAsn[sortedColumn.name]
                                                ? <img className="table__header-sort" src={sortedColumn.arrow} alt={sortedColumn.arrow} onClick={(event) => sortByColumn(event)}/>
                                                : <img className="table__header-sort" src={iconSortUnsorted} alt={unsortedIconAltText}/>
                                            : null
                                    }
                                    {
                                        type === "signal" && entityType !== 'asn'
                                            ? header === signalHeaders[sortedColumn.name]
                                                ? <img className="table__header-sort" src={sortedColumn.arrow} alt={sortedColumn.arrow} onClick={(event) => sortByColumn(event)}/>
                                                : <img className="table__header-sort" src={iconSortUnsorted} alt={unsortedIconAltText}/>
                                            : null
                                    }
                                    {
                                        type === "signal" && entityType === 'asn'
                                            ? header === signalHeadersAsn[sortedColumn.name]
                                                ? <img className="table__header-sort" src={sortedColumn.arrow} alt={sortedColumn.arrow} onClick={(event) => sortByColumn(event)}/>
                                                : <img className="table__header-sort" src={iconSortUnsorted} alt={unsortedIconAltText}/>
                                            : null
                                    }
                                </button>
                            </th>;
                        })
                    }
                </tr>
                </thead>

                {
                    eventData.length > 0 || alertData.length > 0 ||
                    type === "summary" && data.length > 0 ||
                    type === "signal" && data.length > 0
                        ? <tbody style={data.length > 10 ? {overflowY: "scroll"} : {overflowY: "inherit"}}>
                        {
                            alertData && alertData.map(alert => {
                                return <tr key={generateKeys(type === 'alert' ? 'alert' : 'event')}>
                                    <td className={
                                        alert.level === "normal" ? "table--alert-normal td--center" :
                                            alert.level === 'warning' ? "table--alert-warning td--center" :
                                                alert.level === 'critical' ? "table--alert-critical td--center" :
                                                    "td--center"
                                    }>
                                        {
                                            alert.level === "normal"
                                                ? <img className="table--alert-level-img" src={iconCheckmark} alt="✗"/>
                                                : <img className="table--alert-level-img" src={iconCancel} alt="✓"/>
                                        }
                                    </td>
                                    <td>
                                        <p>{alert.date.month} {alert.date.day}, {alert.date.year}</p>
                                        <p>{alert.date.hours}:{alert.date.minutes} {alert.date.meridian}</p>
                                    </td>
                                    <td>
                                        {
                                            alert.dataSource === "ping-slash24" ? T.translate("table.alertLabels.activeProbing") :
                                                alert.dataSource === "gtr" ? T.translate("table.alertLabels.gtr") :
                                                    alert.dataSource === "bgp" ? T.translate("table.alertLabels.bgp") :
                                                        alert.dataSource === "ucsd-nt" ? T.translate("table.alertLabels.darknet") :
                                                            alert.dataSource === "merit-nt" ? T.translate("table.alertLabels.merit") : null
                                        }
                                    </td>
                                    <td className="table--alert-actualValue td--center">
                                        {alert.actualValue}
                                    </td>
                                    <td className="td--center">
                                        {alert.baselineValue}
                                    </td>
                                </tr>
                            })
                        }
                        {
                            eventData && eventData.map(event => {
                                return <tr key={generateKeys(type === 'alert' ? 'alert' : 'event')}>
                                    <td>
                                        <p>{event.from.month} {event.from.day}, {event.from.year}</p>
                                        <p>{event.from.hours}:{event.from.minutes} {event.from.meridian}</p>
                                    </td>
                                    <td>
                                        <p>{event.until.month} {event.until.day}, {event.until.year}</p>
                                        <p>{event.until.hours}:{event.until.minutes} {event.until.meridian}</p>
                                    </td>
                                    <td>
                                        {event.duration}
                                    </td>
                                    <td className="td--center">
                                        {event.score}
                                    </td>
                                </tr>
                            })
                        }
                        {
                            type === "summary" && data.map(summary => {
                                return <SummaryTableRow key={generateKeys('summary')}
                                                        type={type} entityType={entityType}
                                                        data={summary} handleEntityClick={(entityType, entityCode) => handleEntityClick(entityType, entityCode)}
                                />
                            })
                        }
                        {
                            type === "signal" && data.map(signal => {
                                return <SignalTableRow key={generateKeys('signal')} type={type}
                                                       entityType={entityType} data={signal}
                                                       toggleEntityVisibilityInHtsViz={event => toggleEntityVisibilityInHtsViz(event)}
                                                       handleEntityClick={(entityType, entityCode) => handleEntityClick(entityType, entityCode)}
                                                       handleCheckboxEventLoading={(item) => handleCheckboxEventLoading(item)}
                                />

                            })
                        }
                        </tbody>
                        : <tbody className="table__empty">
                        {
                            type === "event" ? <tr><td colSpan='100%'>{eventNoOutagesMessage}</td></tr>
                                : type === 'alert' ? <tr><td colSpan='100%'>{alertNoOutagesMessage}</td></tr>
                                    : type === "summary" ? <tr><td colSpan='100%'>{summaryNoOutagesMessage}</td></tr>
                                        : type === "signal" ? <tr><td colSpan='100%'>{signalNoOutagesMessage}</td></tr>
                                            : null
                        }
                        </tbody>
                }
            </table>
            {
                eventData.length > 0 || alertData.length > 0 ||
                type === "summary" && data.length > 0 ||
                type === "signal" && data.length > 0
                    ? <div className="table__page">
                        <p className="table__page-text">{displayCountShowing} {totalCount < 300 ? totalCount : data.length} {displayCountOf} {totalCount} {displayCountEntries}</p>
                        {
                            type === "summary"
                                ? <div className="table__page-legend">
                                    <T.span className="table__page-legend-item table__page-legend-item--ping-slash24" text="dashboard.summaryLegendActiveProbing"/>
                                    <T.span className="table__page-legend-item table__page-legend-item--bgp" text="dashboard.summaryLegendBgp"/>
                                    <T.span className="table__page-legend-item table__page-legend-item--ucsd-nt" text="dashboard.summaryLegendTelescope"/>
                                </div>
                                : null

                        }
                    </div>
                    : null
            }

        </div>
    )

}

export default Table;
