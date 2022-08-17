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
import React from "react";
import Table from "../table/Table";
import Loading from "../loading/Loading";
import Tooltip from "../tooltip/Tooltip";
import Tabs from "../tabs/Tabs";
import T from "i18n-react";
import ChartLegendCard from "./ChartLegendCard";

class ChartTabCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { currentTab: 1 };
    this.handleSelectTab = this.handleSelectTab.bind(this);
  }

  handleSelectTab(selectedKey) {
    this.setState({ currentTab: selectedKey });
  }

  render() {
    return (
      <div className="overview__table-config">
        <div className="tabs">
          <Tabs
            tabOptions={
              this.props.simplifiedView
                ? ["Selected Signals"]
                : ["Selected Signals", "Alert", "Event"]
            }
            activeTab={this.state.currentTab}
            handleSelectTab={this.handleSelectTab}
          />
        </div>

        <div
          style={
            this.state.currentTab === 1
              ? { display: "block" }
              : { display: "none" }
          }
        >
          <ChartLegendCard
            legendHandler={this.props.legendHandler}
            checkedMap={this.props.tsDataSeriesVisibleMap}
            updateSourceParams={this.props.updateSourceParams}
            simplifiedView={this.props.simplifiedView}
          />
        </div>

        <div
          style={
            this.state.currentTab === 2
              ? { display: "block" }
              : { display: "none" }
          }
        >
          {this.props.alertDataProcessed ? (
            <Table
              type="alert"
              data={this.props.alertDataProcessed}
              totalCount={this.props.alertDataProcessed.length}
            />
          ) : (
            <Loading />
          )}
        </div>
        <div
          style={
            this.state.currentTab === 3
              ? { display: "block" }
              : { display: "none" }
          }
        >
          {this.props.eventDataProcessed ? (
            <Table
              type={"event"}
              data={this.props.eventDataProcessed}
              totalCount={this.props.eventDataProcessed.length}
            />
          ) : (
            <Loading />
          )}
        </div>
      </div>
    );
  }
}

export default ChartTabCard;
