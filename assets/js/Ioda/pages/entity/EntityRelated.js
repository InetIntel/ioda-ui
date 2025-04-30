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

import React, {useRef} from "react";
import RawSignalsModal from "../../components/modal/RawSignalsModal";
import T from "i18n-react";
import Loading from "../../components/loading/Loading";
import Tooltip from "../../components/tooltip/Tooltip";
import TopoMap from "../../components/map/Map";
import Table from "../../components/table/Table";
import { Button } from "antd";
import LatencyComponent from "./components/LatencyComponent";
import ApPacketLossComponent from "./components/ApPacketLossComponent";

const EntityRelated = (props) => {

  const {
    bounds,
    entityName,
    entityType,
    parentEntityName,
    showMapModal,
    toggleModal,
    topoData,
    topoScores,
    handleEntityShapeClick,
    regionalSignalsTableSummaryDataProcessed,
    asnSignalsTableSummaryDataProcessed,
    summaryDataMapRaw,
    toggleEntityVisibilityInHtsViz,
    handleCheckboxEventLoading,
    handleSelectAndDeselectAllButtons,
    regionalSignalsTableEntitiesChecked,
    rawRegionalSignalsProcessedPingSlash24,
    rawRegionalSignalsProcessedBgp,
    rawRegionalSignalsProcessedMeritNt,
    rawSignalsMaxEntitiesHtsError,
    initialTableLimit,
    regionalSignalsTableTotalCount,
    handleLoadAllEntitiesButton,
    regionalRawSignalsLoadAllButtonClicked,
    loadAllButtonEntitiesLoading,
    handleAdditionalEntitiesLoading,
    additionalRawSignalRequestedPingSlash24,
    additionalRawSignalRequestedBgp,
    additionalRawSignalRequestedMeritNt,
    checkMaxButtonLoading,
    uncheckAllButtonLoading,
    rawRegionalSignalsRawBgpLength,
    rawRegionalSignalsRawPingSlash24Length,
    rawRegionalSignalsRawMeritNtLength,
    showTableModal,
    rawAsnSignalsProcessedPingSlash24,
    rawAsnSignalsProcessedBgp,
    rawAsnSignalsProcessedMeritNt,
    asnSignalsTableEntitiesChecked,
    asnSignalsTableTotalCount,
    asnRawSignalsLoadAllButtonClicked,
    rawAsnSignalsRawBgpLength,
    rawAsnSignalsRawPingSlash24Length,
    rawAsnSignalsRawMeritNtLength,
    relatedToTableSummaryProcessed,
    handleGlobalAsnSignals,
    handleGlobalRegionalAsnSignals,
    rawAsnSignalsUpstreamDelayLatency,
    rawAsnSignalsUpstreamDelayPenultAsnCount,
    rawAsnSignalsApPacketLoss,
    rawAsnSignalsApPacketDelay,
    showApPacketGraph,
    globalRegionalAsnConnectivity,
      globalSwitch,
      isLoading
  } = props;


  const updatedRelatedToTableSummaryProcessed = (relatedToTableSummaryProcessed ?? []).map(summary => ({
    ...summary,
    ipCount: summary.ipCount === "NaN" ? "Unknown" : summary.ipCount,
  }));

  const relatedTableConfig = useRef();

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
        <div>
      <div className="flex items-stretch gap-6 entity-related">
        {/* Region Panel */}
        <div className="card mw-0 p-6 col-1">
          <div className="mb-6">
            <div className="flex items-center">
              <div className="col-1 mw-0 flex items-center">
                <h3 className="text-2xl">
                  {entityType === "country"
                    ? `${regionalSectionTitleCountryType} ${entityName}`
                    : entityType === "region"
                    ? `${regionalSectionTitleRegionType} ${parentEntityName}`
                    : (entityType === "asn" || entityType === "geoasn")
                    ? T.translate("entity.regionalSectionTitleAsnType", {
                        asn: entityName,
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
                onClick={() => toggleModal("map")}
              >
                {regionalModalButtonText}
              </Button>
            </div>
            {showMapModal && <RawSignalsModal
              modalLocation={"map"}
              // entity name needed to populate text in headings
              entityName={entityName}
              // entity type needed to determine which time series count text to use
              entityType={entityType}
              // tracking when the modal should be visible
              showModal={showMapModal}
              // tracking when the close button is clicked
              toggleModal={toggleModal}
              // to populate outage map
              topoData={topoData}
              bounds={bounds}
              topoScores={topoScores}
              handleEntityShapeClick={(entity) =>
                handleEntityShapeClick(entity)
              }
              // render function that populates the ui
              totalCount={
                regionalSignalsTableSummaryDataProcessed?.length
              }
              toggleEntityVisibilityInHtsViz={(event) =>
                toggleEntityVisibilityInHtsViz(event, "region")
              }
              handleCheckboxEventLoading={(item) =>
                handleCheckboxEventLoading(item)
              }
              regionalSignalsTableSummaryDataProcessed={
                regionalSignalsTableSummaryDataProcessed
              }
              // data that draws polygons on map
              summaryDataMapRaw={summaryDataMapRaw}
              // check max and uncheck all button functionality
              handleSelectAndDeselectAllButtons={(event) =>
                handleSelectAndDeselectAllButtons(event)
              }
              // Current number of entities checked in table
              regionalSignalsTableEntitiesChecked={
               regionalSignalsTableEntitiesChecked
              }
              // to detect when loading bar should appear in modal
              // and to populate data in modal for chart
              rawRegionalSignalsProcessedPingSlash24={
               rawRegionalSignalsProcessedPingSlash24
              }
              rawRegionalSignalsProcessedBgp={
                rawRegionalSignalsProcessedBgp
              }
              rawRegionalSignalsProcessedMeritNt={
                rawRegionalSignalsProcessedMeritNt
              }
              // Error message when max entities are checked
              rawSignalsMaxEntitiesHtsError={
                rawSignalsMaxEntitiesHtsError
              }
              // For use in the string that populates when there are more than 300 entities that could load
              initialTableLimit={initialTableLimit}
              // count used to determine if text to populate remaining entities beyond the initial Table load limit should display
              regionalSignalsTableTotalCount={
                regionalSignalsTableTotalCount
              }
              // function used to call api to load remaining entities
              handleLoadAllEntitiesButton={(event) =>
                handleLoadAllEntitiesButton(event)
              }
              // Used to determine if load all message should display or not
              regionalRawSignalsLoadAllButtonClicked={
                regionalRawSignalsLoadAllButtonClicked
              }
              // Used for triggering the load all button loading icon once clicked
              loadAllButtonEntitiesLoading={
                loadAllButtonEntitiesLoading
              }
              handleAdditionalEntitiesLoading={() =>
                handleAdditionalEntitiesLoading()
              }
              // manage loading bar for when loadAll button is clicked and
              // additional raw signals are requested beyond what was initially loaded
              additionalRawSignalRequestedPingSlash24={
                additionalRawSignalRequestedPingSlash24
              }
              additionalRawSignalRequestedBgp={
                additionalRawSignalRequestedBgp
              }
              additionalRawSignalRequestedMeritNt={
                additionalRawSignalRequestedMeritNt
              }
              // used for tracking when check max/uncheck all loading icon should appear and not
              checkMaxButtonLoading={checkMaxButtonLoading}
              uncheckAllButtonLoading={uncheckAllButtonLoading}
              // used to check if there are no entities available to load (to control when loading bar disappears)
              rawRegionalSignalsRawBgpLength={
                rawRegionalSignalsRawBgpLength
              }
              rawRegionalSignalsRawPingSlash24Length={
                rawRegionalSignalsRawPingSlash24Length
              }
              rawRegionalSignalsRawMeritNtLength={
                rawRegionalSignalsRawMeritNtLength
              }
              handleGlobalAsnSignals={handleGlobalAsnSignals}
              handleGlobalRegionalAsnSignals={handleGlobalRegionalAsnSignals}
              parentEntityName={parentEntityName}
              globalRegionalAsnConnectivity={globalRegionalAsnConnectivity}
                isLoading={isLoading}
            />}
          </div>
          <div className="map" style={{ display: "block", height: "40.5rem" }}>
            {topoData &&
            bounds &&
            topoScores ? (
              <TopoMap
                topoData={topoData}
                bounds={bounds}
                scores={topoScores}
                handleEntityShapeClick={(entity) =>
                  handleEntityShapeClick(entity)
                }
                entityType="region"
              />
            ) : summaryDataMapRaw &&
              topoScores &&
              topoScores.length === 0 ? (
              <div className="h-full flex-column items-center justify-center">
                <h2 className="text-2xl">{noOutagesOnMapMessage}</h2>
                <Button
                  className="mt-4"
                  type="primary"
                  onClick={() => toggleModal("map")}
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
                <h3 className="text-2xl">
                  {entityType === "country"
                    ? `Outages of ASNs/ISPs operating in ${entityName}`
                    : entityType === "region"
                    ? `Outages of ASNs/ISPs related to ${entityName}`
                    : entityType === "asn"
                    ? `Countries where ${entityName} operates that experienced outages`
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
                onClick={() => toggleModal("table")}
              >
                {asnModalButtonText}
              </Button>
            </div>
            {showTableModal && <RawSignalsModal
              modalLocation={"table"}
              // tracking when the modal should be visible
              showModal={showTableModal}
              // entity name needed to populate text in headings
              entityName={entityName}
              // entity type needed to determine which time series count text to use
              entityType={entityType}
              // tracking when the close button is clicked
              toggleModal={toggleModal}
              // render function that populates the ui

              // data that populates in table
              asnSignalsTableSummaryDataProcessed={
                asnSignalsTableSummaryDataProcessed
              }
              // render function that populates the ui
              toggleEntityVisibilityInHtsViz={(event) =>
                toggleEntityVisibilityInHtsViz(event, "asn")
              }
              handleCheckboxEventLoading={(item) =>
                handleCheckboxEventLoading(item)
              }
              // data for each horizon time series
              rawAsnSignalsProcessedPingSlash24={
                rawAsnSignalsProcessedPingSlash24
              }
              rawAsnSignalsProcessedBgp={rawAsnSignalsProcessedBgp}
              rawAsnSignalsProcessedMeritNt={
                rawAsnSignalsProcessedMeritNt
              }
              // Current number of entities checked in table
              asnSignalsTableEntitiesChecked={
                asnSignalsTableEntitiesChecked
              }
              // check max and uncheck all button functionality
              handleSelectAndDeselectAllButtons={(event) =>
                handleSelectAndDeselectAllButtons(event)
              }
              // Error message when max entities are checked
              rawSignalsMaxEntitiesHtsError={
                rawSignalsMaxEntitiesHtsError
              }
              // For use in the string that populates when there are more than 300 entities that could load
              initialTableLimit={initialTableLimit}
              // count used to determine if text to populate remaining entities beyond the initial Table load limit should display
              asnSignalsTableTotalCount={asnSignalsTableTotalCount}
              // function used to call api to load remaining entities
              handleLoadAllEntitiesButton={(event) =>
                handleLoadAllEntitiesButton(event)
              }
              // Used to determine if load all message should display or not
              asnRawSignalsLoadAllButtonClicked={
                asnRawSignalsLoadAllButtonClicked
              }
              // Used for triggering the load all button loading icon once clicked
              loadAllButtonEntitiesLoading={
                loadAllButtonEntitiesLoading
              }
              handleAdditionalEntitiesLoading={() =>
                handleAdditionalEntitiesLoading()
              }
              // manage loading bar for when loadAll button is clicked and
              // additional raw signals are requested beyond what was initially loaded
              additionalRawSignalRequestedPingSlash24={
                additionalRawSignalRequestedPingSlash24
              }
              additionalRawSignalRequestedBgp={
                additionalRawSignalRequestedBgp
              }
              additionalRawSignalRequestedMeritNt={
                additionalRawSignalRequestedMeritNt
              }
              // used for tracking when check max/uncheck all loading icon should appear and not
              checkMaxButtonLoading={checkMaxButtonLoading}
              uncheckAllButtonLoading={uncheckAllButtonLoading}
              // used to check if there are no entities available to load (to control when loading bar disappears)
              rawAsnSignalsRawBgpLength={rawAsnSignalsRawBgpLength}
              rawAsnSignalsRawPingSlash24Length={
                rawAsnSignalsRawPingSlash24Length
              }
              rawAsnSignalsRawMeritNtLength={
                rawAsnSignalsRawMeritNtLength
              }
              handleGlobalAsnSignals={handleGlobalAsnSignals}
              handleGlobalRegionalAsnSignals={handleGlobalRegionalAsnSignals}
              parentEntityName={parentEntityName}
              globalSwitch={globalSwitch}
              isLoading={isLoading}
            />}
          </div>
          <div className="tab__table" ref={relatedTableConfig}>
            {relatedToTableSummaryProcessed ? (
              <Table
                type="summary"
                data={updatedRelatedToTableSummaryProcessed}
                totalCount={updatedRelatedToTableSummaryProcessed.length}
                entityType={entityType === "asn" ? "country" : "asn"}
              />
            ) : (
              <Loading />
            )}
          </div>
        </div>
      </div>
          {/*{*/}
          {/*    showApPacketGraph &&*/}
          {/*    <ApPacketLossComponent*/}
          {/*        rawAsnSignalsApPacketLoss={rawAsnSignalsApPacketLoss}*/}
          {/*        rawAsnSignalsApPacketDelay={rawAsnSignalsApPacketDelay}*/}
          {/*        entityName={entityName}*/}
          {/*    />}*/}
          {/*{entityType && entityType === 'asn' && <LatencyComponent*/}
          {/*    rawAsnSignalsUpstreamDelayLatency={rawAsnSignalsUpstreamDelayLatency}*/}
          {/*    rawAsnSignalsUpstreamDelayPenultAsnCount={rawAsnSignalsUpstreamDelayPenultAsnCount}*/}
          {/*    entityName={entityName}*/}
          {/*/>}*/}

    </div>
    );
}

export default React.memo(EntityRelated);
