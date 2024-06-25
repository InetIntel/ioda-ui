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

import React, { Component } from "react";
import ReactDOM from "react-dom";
import { humanizeNumber } from "../../utils";
import { Link } from "react-router-dom";
import T from "i18n-react";
import { getDateRangeFromUrl, hasDateRangeInUrl } from "../../utils/urlUtils";

// Each row of the summary table needs it's own component to manage the
// hover state, which controls the table that displays score breakdowns.

class SummaryTableRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      x: 0,
      y: 0,
      displayScores: false,
      pingSlash24ScoreAvailable: false,
      bgpScoreAvailable: false,
      ucsdNtScoreAvailable: false,
      meritNtScoreAvailable: false,
      hoverTime: 600,
      t: null,
    };
    this.handleRowScoreHide = this.handleRowScoreHide.bind(this);
  }

  componentDidMount = () => {
    document.addEventListener("click", this.handleRowScoreHide, {
      passive: true,
    });
    // set states for outage source indicator in score cell

    this.props.data.scores.map((score) => {
      let source = score.source.split('.')[0];
      switch (source) {
        case "ping-slash24":
          this.setState({pingSlash24ScoreAvailable: true});
          break;
        case "bgp":
          this.setState({bgpScoreAvailable: true});
          break;
        case "ucsd-nt":
          this.setState({ucsdNtScoreAvailable: true});
          break;
        case "merit-nt":
          this.setState({meritNtScoreAvailable: true});
          break;
      }
    });
  }

  componentWillUnmount = () => {
    document.removeEventListener("click", this.handleRowScoreHide, true);
  };

  handlePopulateScores(scores) {
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

  handleRowScoreHide() {
    if (this.state.displayScores) {
      const domNode = ReactDOM.findDOMNode(this);
      if (!domNode || !domNode.contains(event.target)) {
        this.setState({
          displayScores: false,
        });
      }
    }
  }

  showScoreTooltipHover() {
    this.setState({
      t: setTimeout(() => {
        this.setState({ displayScores: true });
      }, this.state.hoverTime),
    });
  }

  hideScoreTooltipHover() {
    clearTimeout(this.state.t);
    this.setState({ displayScores: false });
  }

  handleRowHover(event) {
    event.persist();
    this.setState({
      y:
        event.nativeEvent.offsetY < 8
          ? -2
          : event.nativeEvent.offsetY > 20
          ? 14
          : event.nativeEvent.offsetY - 9,
    });
  }

  render() {
    let overallScore = humanizeNumber(this.props.data.score, 2);
    const dataSourceHeading = T.translate(
      "table.scoresTable.dataSourceHeading"
    );
    const scoreHeading = T.translate("table.scoresTable.scoreHeading");
    const entityCode = this.props.data.entityCode;
    const entityType = this.props.data.entityType;

    const dateRangeInUrl = hasDateRangeInUrl();
    const { urlFromDate, urlUntilDate } = getDateRangeFromUrl();
    const linkPath = dateRangeInUrl
      ? `/${entityType}/${entityCode}?from=${urlFromDate}&until=${urlUntilDate}`
      : `/${entityType}/${entityCode}`;

    return (
      <tr
        className="table--summary-row"
        // onMouseMove={(event) => this.handleRowHover(event)}
        // onMouseLeave={(event) => this.handleRowHover(event)}
        onTouchStart={(event) => this.handleRowHover(event)}
      >
        {this.props.signal ? (
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
            <span>{this.props.data.name}</span>
          </Link>
        </td>
        {this.props.entityType === "asn" ? (
          <td className="table__cell--ipCount td--center">
            {this.props.data.ipCount}
          </td>
        ) : null}
        <td
          className="table__cell--overallScore td--center"
          onTouchStart={() => this.handleRowScoreDisplay(event)}
          onMouseEnter={() => this.showScoreTooltipHover()}
          onMouseLeave={() => this.hideScoreTooltipHover()}
          style={{ backgroundColor: this.props.data.color }}
        >
          <div className="table__scores-sourceCount">
            {this.state.pingSlash24ScoreAvailable ? (
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
            {this.state.bgpScoreAvailable ? (
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
            {this.state.meritNtScoreAvailable ? (
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
              this.state.displayScores
                ? "table__scores table__scores--active"
                : "table__scores"
            }
            style={{ top: `${this.state.y}px` }}
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
              {this.handlePopulateScores(this.props.data.scores)}
            </tbody>
          </table>
        </td>
      </tr>
    );
  }
}

export default SummaryTableRow;
