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
import RawSignalsModal from "../../components/modal/RawSignalsModal";
import T from "i18n-react";
import Loading from "../../components/loading/Loading";
import Tooltip from "../../components/tooltip/Tooltip";
import TopoMap from "../../components/map/Map";
import Table from "../../components/table/Table";
import { Button } from "antd";

class EntityRelated extends Component {
  constructor(props) {
    super(props);
    this.relatedTableConfig = React.createRef();
  }

  render() {
    const regionalModalButtonText = T.translate(
      "entity.regionalModalButtonText"
    );
    const asnModalButtonText = T.translate("entity.asnModalButtonText");
    const regionalSectionTitleCountryType = T.translate(
      "entity.regionalSectionTitleCountryType"
    );
    const regionalSectionTitleRegionType = T.translate(
      "entity.regionalSectionTitleRegionType"
    );

    const tooltipEntityRegionalSummaryMapTitle = T.translate(
      "tooltip.entityRegionalSummaryMap.title"
    );
    const tooltipEntityRegionalSummaryMapText = T.translate(
      "tooltip.entityRegionalSummaryMap.text"
    );
    const tooltipEntityAsnSummaryTableTitle = T.translate(
      "tooltip.entityAsnSummaryTable.title"
    );
    const tooltipEntityAsnSummaryTableText = T.translate(
      "tooltip.entityAsnSummaryTable.text"
    );
    const noOutagesOnMapMessage = T.translate(
      "entityModal.noOutagesOnMapMessage"
    );

    return (
      <div className="flex items-stretch gap-6 entity-related">
        {/* Region Panel */}
        <div className="card mw-0 p-6 col-1">
          <div className="mb-6">
            <div className="flex items-center">
              <div className="col-1 mw-0 flex items-center">
                <h3 className="text-2xl truncate">
                  {this.props.entityType === "country"
                    ? `${regionalSectionTitleCountryType} ${this.props.entityName}`
                    : this.props.entityType === "region"
                    ? `${regionalSectionTitleRegionType} ${this.props.parentEntityName}`
                    : this.props.entityType === "asn"
                    ? T.translate("entity.regionalSectionTitleAsnType", {
                        asn: this.props.entityName,
                      })
                    : null}
                </h3>
                <Tooltip
                  title={tooltipEntityRegionalSummaryMapTitle}
                  text={tooltipEntityRegionalSummaryMapText}
                />
              </div>
              <Button
                type="primary"
                size="small"
                onClick={() => this.props.toggleModal("map")}
              >
                {regionalModalButtonText}
              </Button>
            </div>
            <RawSignalsModal
              modalLocation={"map"}
              // entity name needed to populate text in headings
              entityName={this.props.entityName}
              // entity type needed to determine which time series count text to use
              entityType={this.props.entityType}
              // tracking when the modal should be visible
              showModal={this.props.showMapModal}
              // tracking when the close button is clicked
              toggleModal={this.props.toggleModal}
              // to populate outage map
              topoData={this.props.topoData}
              bounds={this.props.bounds}
              topoScores={this.props.topoScores}
              handleEntityShapeClick={(entity) =>
                this.props.handleEntityShapeClick(entity)
              }
              // render function that populates the ui
              totalCount={
                this.props.regionalSignalsTableSummaryDataProcessed.length
              }
              toggleEntityVisibilityInHtsViz={(event) =>
                this.props.toggleEntityVisibilityInHtsViz(event, "region")
              }
              handleCheckboxEventLoading={(item) =>
                this.props.handleCheckboxEventLoading(item)
              }
              regionalSignalsTableSummaryDataProcessed={
                this.props.regionalSignalsTableSummaryDataProcessed
              }
              // data that draws polygons on map
              summaryDataMapRaw={this.props.summaryDataMapRaw}
              // check max and uncheck all button functionality
              handleSelectAndDeselectAllButtons={(event) =>
                this.props.handleSelectAndDeselectAllButtons(event)
              }
              // Current number of entities checked in table
              regionalSignalsTableEntitiesChecked={
                this.props.regionalSignalsTableEntitiesChecked
              }
              // to detect when loading bar should appear in modal
              // and to populate data in modal for chart
              rawRegionalSignalsProcessedPingSlash24={
                this.props.rawRegionalSignalsProcessedPingSlash24
              }
              rawRegionalSignalsProcessedBgp={
                this.props.rawRegionalSignalsProcessedBgp
              }
              rawRegionalSignalsProcessedUcsdNt={
                this.props.rawRegionalSignalsProcessedUcsdNt
              }
              rawRegionalSignalsProcessedMeritNt={
                this.props.rawRegionalSignalsProcessedMeritNt
              }
              // Error message when max entities are checked
              rawSignalsMaxEntitiesHtsError={
                this.props.rawSignalsMaxEntitiesHtsError
              }
              // For use in the string that populates when there are more than 300 entities that could load
              initialTableLimit={this.props.initialTableLimit}
              // count used to determine if text to populate remaining entities beyond the initial Table load limit should display
              regionalSignalsTableTotalCount={
                this.props.regionalSignalsTableTotalCount
              }
              // function used to call api to load remaining entities
              handleLoadAllEntitiesButton={(event) =>
                this.props.handleLoadAllEntitiesButton(event)
              }
              // Used to determine if load all message should display or not
              regionalRawSignalsLoadAllButtonClicked={
                this.props.regionalRawSignalsLoadAllButtonClicked
              }
              // Used for triggering the load all button loading icon once clicked
              loadAllButtonEntitiesLoading={
                this.props.loadAllButtonEntitiesLoading
              }
              handleAdditionalEntitiesLoading={() =>
                this.props.handleAdditionalEntitiesLoading()
              }
              // manage loading bar for when loadAll button is clicked and
              // additional raw signals are requested beyond what was initially loaded
              additionalRawSignalRequestedPingSlash24={
                this.props.additionalRawSignalRequestedPingSlash24
              }
              additionalRawSignalRequestedBgp={
                this.props.additionalRawSignalRequestedBgp
              }
              additionalRawSignalRequestedUcsdNt={
                this.props.additionalRawSignalRequestedUcsdNt
              }
              additionalRawSignalRequestedMeritNt={
                this.props.additionalRawSignalRequestedMeritNt
              }
              // used for tracking when check max/uncheck all loading icon should appear and not
              checkMaxButtonLoading={this.props.checkMaxButtonLoading}
              uncheckAllButtonLoading={this.props.uncheckAllButtonLoading}
              // used to check if there are no entities available to load (to control when loading bar disappears)
              rawRegionalSignalsRawBgpLength={
                this.props.rawRegionalSignalsRawBgpLength
              }
              rawRegionalSignalsRawPingSlash24Length={
                this.props.rawRegionalSignalsRawPingSlash24Length
              }
              rawRegionalSignalsRawUcsdNtLength={
                this.props.rawRegionalSignalsRawUcsdNtLength
              }
              rawRegionalSignalsRawMeritNtLength={
                this.props.rawRegionalSignalsRawMeritNtLength
              }
            />
          </div>
          <div className="map" style={{ display: "block", height: "40.5rem" }}>
            {this.props.topoData &&
            this.props.bounds &&
            this.props.topoScores ? (
              <TopoMap
                topoData={this.props.topoData}
                bounds={this.props.bounds}
                scores={this.props.topoScores}
                handleEntityShapeClick={(entity) =>
                  this.props.handleEntityShapeClick(entity)
                }
                entityType="region"
              />
            ) : this.props.summaryDataMapRaw &&
              this.props.topoScores &&
              this.props.topoScores.length === 0 ? (
              <div className="related__no-outages">
                <h2 className="related__no-outages-title">
                  {noOutagesOnMapMessage}
                </h2>
                <Button
                  className="mt-4"
                  type="primary"
                  onClick={() => this.props.toggleModal("map")}
                >
                  {regionalModalButtonText}
                </Button>
              </div>
            ) : (
              <Loading />
            )}
          </div>
        </div>

        {/* ASN Panel */}
        <div className="card mw-0 p-6 col-1">
          <div className="related__heading">
            <div className="flex items-center gap-3 mb-6">
              <div className="col-1 mw-0 flex items-center">
                <h3 className="text-2xl truncate">
                  {this.props.entityType === "country"
                    ? `Outages of ASNs/ISPs operating in ${this.props.entityName}`
                    : this.props.entityType === "region"
                    ? `Outages of ASNs/ISPs operating in ${this.props.parentEntityName}`
                    : this.props.entityType === "asn"
                    ? `Countries where ${this.props.entityName} operates that experienced outages`
                    : null}
                </h3>
                <Tooltip
                  title={tooltipEntityAsnSummaryTableTitle}
                  text={tooltipEntityAsnSummaryTableText}
                />
              </div>
              <Button
                type="primary"
                size="small"
                onClick={() => this.props.toggleModal("table")}
              >
                {asnModalButtonText}
              </Button>
            </div>
            <RawSignalsModal
              modalLocation={"table"}
              // tracking when the modal should be visible
              showModal={this.props.showTableModal}
              // entity name needed to populate text in headings
              entityName={this.props.entityName}
              // entity type needed to determine which time series count text to use
              entityType={this.props.entityType}
              // tracking when the close button is clicked
              toggleModal={this.props.toggleModal}
              // render function that populates the ui

              // data that populates in table
              asnSignalsTableSummaryDataProcessed={
                this.props.asnSignalsTableSummaryDataProcessed
              }
              // render function that populates the ui
              toggleEntityVisibilityInHtsViz={(event) =>
                this.props.toggleEntityVisibilityInHtsViz(event, "asn")
              }
              handleCheckboxEventLoading={(item) =>
                this.props.handleCheckboxEventLoading(item)
              }
              // data for each horizon time series
              rawAsnSignalsProcessedPingSlash24={
                this.props.rawAsnSignalsProcessedPingSlash24
              }
              rawAsnSignalsProcessedBgp={this.props.rawAsnSignalsProcessedBgp}
              rawAsnSignalsProcessedUcsdNt={
                this.props.rawAsnSignalsProcessedUcsdNt
              }
              rawAsnSignalsProcessedMeritNt={
                this.props.rawAsnSignalsProcessedMeritNt
              }
              // Current number of entities checked in table
              asnSignalsTableEntitiesChecked={
                this.props.asnSignalsTableEntitiesChecked
              }
              // check max and uncheck all button functionality
              handleSelectAndDeselectAllButtons={(event) =>
                this.props.handleSelectAndDeselectAllButtons(event)
              }
              // Error message when max entities are checked
              rawSignalsMaxEntitiesHtsError={
                this.props.rawSignalsMaxEntitiesHtsError
              }
              // For use in the string that populates when there are more than 300 entities that could load
              initialTableLimit={this.props.initialTableLimit}
              // count used to determine if text to populate remaining entities beyond the initial Table load limit should display
              asnSignalsTableTotalCount={this.props.asnSignalsTableTotalCount}
              // function used to call api to load remaining entities
              handleLoadAllEntitiesButton={(event) =>
                this.props.handleLoadAllEntitiesButton(event)
              }
              // Used to determine if load all message should display or not
              asnRawSignalsLoadAllButtonClicked={
                this.props.asnRawSignalsLoadAllButtonClicked
              }
              // Used for triggering the load all button loading icon once clicked
              loadAllButtonEntitiesLoading={
                this.props.loadAllButtonEntitiesLoading
              }
              handleAdditionalEntitiesLoading={() =>
                this.props.handleAdditionalEntitiesLoading()
              }
              // manage loading bar for when loadAll button is clicked and
              // additional raw signals are requested beyond what was initially loaded
              additionalRawSignalRequestedPingSlash24={
                this.props.additionalRawSignalRequestedPingSlash24
              }
              additionalRawSignalRequestedBgp={
                this.props.additionalRawSignalRequestedBgp
              }
              additionalRawSignalRequestedUcsdNt={
                this.props.additionalRawSignalRequestedUcsdNt
              }
              additionalRawSignalRequestedMeritNt={
                this.props.additionalRawSignalRequestedMeritNt
              }
              // used for tracking when check max/uncheck all loading icon should appear and not
              checkMaxButtonLoading={this.props.checkMaxButtonLoading}
              uncheckAllButtonLoading={this.props.uncheckAllButtonLoading}
              // used to check if there are no entities available to load (to control when loading bar disappears)
              rawAsnSignalsRawBgpLength={this.props.rawAsnSignalsRawBgpLength}
              rawAsnSignalsRawPingSlash24Length={
                this.props.rawAsnSignalsRawPingSlash24Length
              }
              rawAsnSignalsRawUcsdNtLength={
                this.props.rawAsnSignalsRawUcsdNtLength
              }
              rawAsnSignalsRawMeritNtLength={
                this.props.rawAsnSignalsRawMeritNtLength
              }
            />
          </div>
          <div className="tab__table" ref={this.relatedTableConfig}>
            {this.props.relatedToTableSummaryProcessed ? (
              <Table
                type="summary"
                data={this.props.relatedToTableSummaryProcessed}
                totalCount={this.props.relatedToTableSummaryProcessed.length}
                entityType={this.props.entityType === "asn" ? "country" : "asn"}
              />
            ) : (
              <Loading />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default EntityRelated;
