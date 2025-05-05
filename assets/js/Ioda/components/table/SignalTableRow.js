import React, {Component, useEffect} from "react";
import ReactDOM from "react-dom";
import {useState} from "react";
import { humanizeNumber } from "../../utils";
import { Link } from "react-router-dom";
import T from "i18n-react";
import { getDateRangeFromUrl, hasDateRangeInUrl } from "../../utils/urlUtils";

// Each row of the summary table needs it's own component to manage the
// hover state, which controls the table that displays score breakdowns.

const SignalTableRow = (props) => {
  const {
    data,
    handleCheckboxEventLoading,
    type,
    entityType
  } = props
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [displayScores, setDisplayScores] = useState(false);
  const [visibility, setVisibility] = useState(data.visibility || false);

  useEffect(() => {
    if (data && data.visibility != null) {
      setVisibility(data.visibility);
    }
  }, [data.visibility]);

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

  // handleRowScoreHide() {
  //     const domNode = ReactDOM.findDOMNode(this);
  //
  //     if (!domNode || !domNode.contains(event.target)) {
  //         this.setState({
  //             displayScores: false
  //         });
  //     }
  // }

  const handleRowScoreDisplay = () => {
    setDisplayScores(!displayScores);
  }

  const handleRowHover = (event) => {
    event.persist();
    // console.log(event);
    // console.log(event.nativeEvent.offsetY);
    // Keep the hover table aligned with the corresponding ellipses

    setY(
        event.nativeEvent.offsetY < 8
            ? -2
            : event.nativeEvent.offsetY > 20
                ? 14
                : event.nativeEvent.offsetY - 9);
  }

  // controls checkbox visibility UI, having it wait on props is taking too long
  const handleVisibilityState = (event, item) => {
    // update checkbox and call props function
    setVisibility(event.target.checked);
    setTimeout(() => {
      handleCheckboxEventLoading(item);
    }, 1000);
  }

  let overallScore = humanizeNumber(data.score, 2);

  const dataSourceHeading = T.translate(
      "table.scoresTable.dataSourceHeading"
  );
  const scoreHeading = T.translate("table.scoresTable.scoreHeading");

  const item = data;
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
        {type === "signal" ? (
            <td>
              <input
                  className="table__cell-checkbox"
                  type="checkbox"
                  name={entityCode}
                  checked={visibility}
                  onChange={(event) => handleVisibilityState(event, item)}
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
            <td className="td--center">{data.ipCount}</td>
        ) : null}
        <td
            className="table__cell--overallScore td--center"
            onClick={() => this.handleRowScoreDisplay()}
            style={{ backgroundColor: data.color }}
        >
          {overallScore}
          {/*<span className="table__ellipses">⋮</span>*/}
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
            <tbody>{handlePopulateScores(data.scores)}</tbody>
          </table>
        </td>
      </tr>
  );
}

export default SignalTableRow;
