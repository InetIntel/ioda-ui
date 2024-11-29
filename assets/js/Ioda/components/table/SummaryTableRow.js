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

import React, {useEffect, useState, useRef} from "react";
import { humanizeNumber } from "../../utils";
import { Link } from "react-router-dom";
import T from "i18n-react";
import { getDateRangeFromUrl, hasDateRangeInUrl } from "../../utils/urlUtils";

// Each row of the summary table needs it's own component to manage the
// hover state, which controls the table that displays score breakdowns.

const SummaryTableRow = (props) => {


  const{
    data,
    signal,
    entityType
  } = props;

  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [displayScores, setDisplayScores] = useState(false);
  const [pingSlash24ScoreAvailable, setPingSlash24ScoreAvailable] = useState(false);
  const [bgpScoreAvailable, setBgpScoreAvailable] = useState(false);
  const [ucsdNtScoreAvailable, setucsdNtScoreAvailable] = useState(false);
  const [meritNtScoreAvailable, setMeritNtScoreAvailable] = useState(false);
  const [hoverTime, setHoverTime] = useState(600);
  const [t, setT] = useState(null);

  const timeoutRef = useRef(null);
  const componentRef = useRef(null);

// Combine them
  useEffect(() => {
    document.addEventListener("click", handleRowScoreHide, {
      passive: true,
    });
    return () => {
      document.removeEventListener("click", handleRowScoreHide, true);
    }
  }, [displayScores]);

  useEffect(() => {

    // set states for outage source indicator in score cell
    data.scores.map((score) => {
      let source = score.source.split('.')[0];
      switch (source) {
        case "ping-slash24":
          setPingSlash24ScoreAvailable(true);
          break;
        case "bgp":
          setBgpScoreAvailable(true);
          break;
        case "ucsd-nt":
          setUcsdNtScoreAvailable(true);
          break;
        case "merit-nt":
          setMeritNtScoreAvailable(true);
          break;
        default:
          break;
      }
    })

  }, [data.scores])


  const handleRowScoreDisplay = () => {
    setDisplayScores(!displayScores);
  }

  const handlePopulateScores = (scores) => {
    if (scores !== null) {
      return (
          scores &&
          scores.map((score, index) => {
            let scoreValue = humanizeNumber(score.score, 2);
            return (
                <tr className="table__scores-row" key={index}>
                  <td className="table__scores-cell">{score.source}</td>
                  <td className="table__scores-cell">{scoreValue}</td>
                </tr>
            );
          })
      );
    } else {
      return null;
    }
  }

  const handleRowScoreHide = () => {
    if (displayScores) {
      // const domNode = ReactDOM.findDOMNode(this);
      const domNode = componentRef.current;
      if (!domNode || !domNode.contains(event.target)) {
        setDisplayScores(false);
      }
    }
  }

  const showScoreTooltipHover = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setDisplayScores(true);
    }, hoverTime);
  };

  const hideScoreTooltipHover = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setDisplayScores(false);
  };


  const handleRowHover = (event) => {
    event.persist();
    setY(
        event.nativeEvent.offsetY < 8
            ? -2
            : event.nativeEvent.offsetY > 20
                ? 14
                : event.nativeEvent.offsetY - 9
    );
  }

  let overallScore = humanizeNumber(data.score, 2);
  const dataSourceHeading = T.translate(
      "table.scoresTable.dataSourceHeading"
  );
  const scoreHeading = T.translate("table.scoresTable.scoreHeading");
  const dataEntityCode = data.entityCode;
  const dataEntityType = data.entityType;

  const dateRangeInUrl = hasDateRangeInUrl();
  const { urlFromDate, urlUntilDate } = getDateRangeFromUrl();
  const linkPath = dateRangeInUrl
      ? `/${dataEntityType}/${dataEntityCode}?from=${urlFromDate}&until=${urlUntilDate}`
      : `/${dataEntityType}/${dataEntityCode}`;

  return (
      <tr
          className="table--summary-row"
          // onMouseMove={(event) => this.handleRowHover(event)}
          // onMouseLeave={(event) => this.handleRowHover(event)}
          onTouchStart={(event) => handleRowHover(event)}
      >
        {signal ? (
            <td>
              <input
                  className="table__cell-checkbox"
                  type="checkbox"
                  checked={true}
              />
            </td>
        ) : null}
        <td>
          <Link
              className="table__cell-link"
              to={linkPath}
              // onClick={() =>
              //   this.props.handleEntityClick(
              //     this.props.data.entityType,
              //     this.props.data.entityCode
              //   )
              // }
          >
            <span>{data.name}</span>
          </Link>
        </td>
        {entityType === "asn" ? (
            <td className="table__cell--ipCount td--center">
              {data.ipCount}
            </td>
        ) : null}
        <td
            className="table__cell--overallScore td--center"
            onTouchStart={() => handleRowScoreDisplay(event)}
            onMouseEnter={() => showScoreTooltipHover()}
            onMouseLeave={() => hideScoreTooltipHover()}
            style={{ backgroundColor: data.color }}
        >
          <div className="table__scores-sourceCount">
            {pingSlash24ScoreAvailable ? (
                <div
                    className={`table__scores-sourceCount-unit table__scores-sourceCount-unit--ping-slash24`}
                >
                  &nbsp;
                </div>
            ) : (
                <div className="table__scores-sourceCount-unit table__scores-sourceCount-unit--empty">
                  &nbsp;
                </div>
            )}
            {bgpScoreAvailable ? (
                <div
                    className={`table__scores-sourceCount-unit table__scores-sourceCount-unit--bgp`}
                >
                  &nbsp;
                </div>
            ) : (
                <div className="table__scores-sourceCount-unit table__scores-sourceCount-unit--empty">
                  &nbsp;
                </div>
            )}
            {meritNtScoreAvailable ? (
                <div
                    className={`table__scores-sourceCount-unit table__scores-sourceCount-unit--merit-nt`}
                >
                  &nbsp;
                </div>
            ) : (
                <div className="table__scores-sourceCount-unit table__scores-sourceCount-unit--empty">
                  &nbsp;
                </div>
            )}
          </div>
          {overallScore}
          <span className="table__ellipses">⋮</span>
          <table
              className={
                displayScores
                    ? "table__scores table__scores--active"
                    : "table__scores"
              }
              style={{ top: `${y}px` }}
          >
            <thead>
            <tr className="table__scores-headers">
              <th className="table__scores-cell">{dataSourceHeading}</th>
              <th className="table__scores-cell">{scoreHeading}</th>
            </tr>
            </thead>
            <tbody>
            <tr className="table__scores-row">
              <td className="table__scores-cell">
                <strong>Overall</strong>
              </td>
              <td className="table__scores-cell">
                <strong>{overallScore}</strong>
              </td>
            </tr>
            {handlePopulateScores(data.scores)}
            </tbody>
          </table>
        </td>
      </tr>
  );
}

export default SummaryTableRow;
