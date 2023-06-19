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
import { Radio } from "antd";
import Tabs from "../tabs/Tabs";
import T from "i18n-react";
import ChartLegendCard from "./ChartLegendCard";

class ChartTabCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { currentTab: 1 };
  }

  handleSelectTab = (selectedKey) => {
    this.setState({ currentTab: selectedKey });
  };

  render() {
    const { simplifiedView } = this.props;

    const selectedSignal = T.translate("entity.selectedSignal");
    const alertTab = T.translate("entity.alertTab");
    const eventTab = T.translate("entity.eventTab");

    return (
      <div className="overview__table-config flex-column">
        <div className="tabs">
          <Radio.Group
            onChange={(e) => this.handleSelectTab(e?.target?.value)}
            value={this.state.currentTab}
            style={{ marginBottom: 8 }}
          >
            <Radio.Button value={1}>{selectedSignal}</Radio.Button>
            {!simplifiedView && (
              <Radio.Button value={2}>{alertTab}</Radio.Button>
            )}
            {!simplifiedView && (
              <Radio.Button value={3}>{eventTab}</Radio.Button>
            )}
          </Radio.Group>
        </div>

        {this.state.currentTab === 1 && (
          <ChartLegendCard
            legendHandler={this.props.legendHandler}
            checkedMap={this.props.tsDataSeriesVisibleMap}
            updateSourceParams={this.props.updateSourceParams}
            simplifiedView={this.props.simplifiedView}
          />
        )}

        {this.state.currentTab === 2 && (
          <>
            {this.props.alertDataProcessed ? (
              <Table
                type="alert"
                data={this.props.alertDataProcessed}
                totalCount={this.props.alertDataProcessed.length}
              />
            ) : (
              <Loading />
            )}
          </>
        )}

        {this.state.currentTab === 3 && (
          <>
            {this.props.eventDataProcessed ? (
              <Table
                type="event"
                data={this.props.eventDataProcessed}
                totalCount={this.props.eventDataProcessed.length}
              />
            ) : (
              <Loading />
            )}
          </>
        )}
      </div>
    );
  }
}

export default ChartTabCard;
