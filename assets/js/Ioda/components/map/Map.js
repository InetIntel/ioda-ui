import React, { useState, useEffect, useRef, useCallback } from "react";
import { Map, TileLayer, GeoJSON } from "react-leaflet";
import countryData from "../../constants/countries.json";
import { humanizeNumber } from "../../utils";
import Tooltip from "../tooltip/Tooltip";
import {
  shadeColor,
  getEntityScaleColor,
  getThresholdBoundsForCountry,
  getThresholdBoundsForRegion,
} from "../../utils/mapColors";
import MapLegend from "./MapLegend";

const mapAccessToken = process.env.MAPBOX_TOKEN;

const DEFAULT_NONE = "#f2f2f0";
const countryFlagMap = countryData.reduce((acc, country) => {
  acc[country.code] = country.emoji;
  return acc;
}, {});

const TopoMap = (props) => {
  const {
    scores,
    bounds,
    topoData,
    entityType,
    hideLegend,
    handleEntityShapeClick,
    enableClickPopover = false,
  } = props;
  // State declarations
  const [hoverFlag, setHoverFlag] = useState("");
  const [hoverName, setHoverName] = useState("");
  const [hoverScore, setHoverScore] = useState(0);
  const [hoverTooltipDisplay, setHoverTooltipDisplay] = useState(false);
  const [screenWidthBelow680, setScreenWidthBelow680] = useState(false);
  const [mapKey, setMapKey] = useState(Date.now()); // Key for forcing re-renders
  const [activeFeature, setActiveFeature] = useState(null);
  const [clickTooltipDisplay, setClickTooltipDisplay] = useState(false);
  const [clickTooltipPos, setClickTooltipPos] = useState({ x: 0, y: 0 });
  const [clickTooltipKey, setClickTooltipKey] = useState(0);

  const mapRef = useRef(null);

  // Check screen width on mount and resize
  const checkScreenWidth = useCallback(() => {
    const isBelow680 = window.innerWidth <= 680;
    if (isBelow680 !== screenWidthBelow680) {
      setScreenWidthBelow680(isBelow680);
    }
  }, [screenWidthBelow680]);

  // Add resize listener on mount
  useEffect(() => {
    checkScreenWidth();

    const handleResize = () => checkScreenWidth();
    window.addEventListener("resize", handleResize, { passive: true });

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [checkScreenWidth]);

  // Update mapKey when bounds change to force Map remount
  useEffect(() => {
    setMapKey(Date.now());
  }, [bounds]);

  // GeoJSON feature interactions
  const mouseOverFeature = useCallback((e, feature) => {
    if (!enableClickPopover) {
      const iso2cc = feature.properties?.iso2cc?.toUpperCase();
      setHoverFlag(iso2cc ? countryFlagMap[iso2cc] ?? "" : "");
      setHoverName(feature.properties.name);
      setHoverScore(
        feature.properties.score ? humanizeNumber(feature.properties.score) : 0
      );
      setHoverTooltipDisplay(true);
    }

    let hoverColor =
      e.target.options && e.target.options.fillColor
        ? shadeColor(e.target.options.fillColor, -10)
        : shadeColor(DEFAULT_NONE, -10);

    e.target.setStyle({
      fillColor: hoverColor,
      color: "#fff",
      opacity: 1,
      fillOpacity: 0.4,
      weight: 3,
      dashArray: "2",
    });
  }, [enableClickPopover]);

  const mouseOutFeature = useCallback((e, feature) => {
    const baseFillColor = !feature.properties?.score
        ? DEFAULT_NONE
        : getEntityScaleColor(feature.properties.score, entityType);

    e.target.setStyle({
      color: "transparent",
      weight: 2,
      fillColor: baseFillColor,
      fillOpacity: !feature.properties?.score ? 0.2 : 0.5,
      dashArray: "2",
    });

    if (!enableClickPopover) {
      setHoverFlag("");
      setHoverName("");
      setHoverScore(0);
      setHoverTooltipDisplay(false);
    }
  }, [enableClickPopover, entityType]);

  const clickFeature = useCallback(
    (e, feature) => {
      if (enableClickPopover) {
        if (e?.originalEvent?.stopPropagation) {
          e.originalEvent.stopPropagation();
        }
        setActiveFeature(feature);
        setClickTooltipPos({
          x: e.containerPoint?.x ?? 0,
          y: e.containerPoint?.y ?? 0,
        });
        // Force popover to realign to the newly clicked feature.
        setClickTooltipDisplay(false);
        setClickTooltipKey((prev) => prev + 1);
        window.requestAnimationFrame(() => {
          setClickTooltipDisplay(true);
        });
        return;
      }

      if (handleEntityShapeClick) {
        handleEntityShapeClick(feature);
      }
    },
    [enableClickPopover, handleEntityShapeClick]
  );

  const closeClickTooltip = useCallback(() => {
    setClickTooltipDisplay(false);
  }, []);

  const showEntityDetails = useCallback(() => {
    if (handleEntityShapeClick && activeFeature) {
      handleEntityShapeClick(activeFeature);
    }
    setClickTooltipDisplay(false);
  }, [activeFeature, handleEntityShapeClick]);

  const onEachFeature = useCallback(
    (feature, layer) => {
      layer.on({
        mouseover: (e) => mouseOverFeature(e, feature),
        mouseout: (e) => mouseOutFeature(e, feature),
        click: (e) => clickFeature(e, feature),
      });
    },
    [mouseOverFeature, mouseOutFeature, clickFeature]
  );

  // Determine map position and zoom
  let position = [20, 0];
  let zoom = screenWidthBelow680 ? 1 : 2;

  // Get color threshold bounds based on entity type
  let thresholdBounds = {};
  if (entityType === "country") {
    thresholdBounds = getThresholdBoundsForCountry();
  } else if (entityType === "region") {
    thresholdBounds = getThresholdBoundsForRegion();
  }

  // return (
  //     <div
  //         className="topo-map"
  //         style={{ position: "relative", height: "inherit", width: "100%" }}
  //     >
  //       <div
  //           className={
  //             hoverTooltipDisplay
  //                 ? "topo-map__tooltip topo-map__tooltip-visible"
  //                 : "topo-map__tooltip"
  //           }
  //       >
  //         <p>
  //           {hoverName}
  //           {hoverScore !== 0 ? ` - ${hoverScore}` : null}
  //         </p>
  //       </div>

  //       {!hideLegend && (
  //           <MapLegend
  //               style={{ position: "absolute", bottom: "1rem", left: "1rem" }}
  //               highThreshold={thresholdBounds.high ?? 0}
  //               lowThreshold={thresholdBounds.low ?? 0}
  //           />
  //       )}

  //       <Map
  //           key={mapKey}
  //           ref={mapRef}
  //           center={bounds ? null : position}
  //           zoom={bounds ? null : zoom}
  //           bounds={bounds ? bounds : null}
  //           minZoom={1}
  //           scrollWheelZoom={false}
  //           touchZoom={true}
  //           dragging={!screenWidthBelow680}
  //           style={{ width: "inherit", height: "inherit", overflow: "hidden" }}
  //       >
  //         <TileLayer
  //             id="mapbox/light-v10"
  //             url={`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${mapAccessToken}`}
  //         />
  //         <GeoJSON
  //             data={topoData}
  //             onEachFeature={onEachFeature}
  //             style={(feature) => ({
  //               color: "transparent",
  //               weight: 2,
  //               fillColor: !scores
  //                   ? DEFAULT_NONE
  //                   : !feature.properties.score
  //                       ? DEFAULT_NONE
  //                       : getEntityScaleColor(feature.properties.score, entityType),
  //               fillOpacity: !feature.properties.score ? 0.2 : 0.5,
  //               dashArray: "2",
  //             })}
  //         />
  //       </Map>
  //     </div>
  // );
  return (
    <div
      className="topo-map"
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <div
        className={
          !enableClickPopover && hoverTooltipDisplay
            ? "topo-map__tooltip topo-map__tooltip-visible"
            : "topo-map__tooltip"
        }
      >
        <p>
          {hoverFlag ? `${hoverFlag} ` : null}
          {hoverName}
          {hoverScore !== 0 ? ` - ${hoverScore}` : null}
        </p>
      </div>

      <div style={{ flexGrow: 1 }}>
        {enableClickPopover && activeFeature && (
          <div
            className="topo-map__click-tooltip-anchor"
            style={{
              left: `${clickTooltipPos.x}px`,
              top: `${clickTooltipPos.y}px`,
            }}
          >
            <Tooltip
              key={clickTooltipKey}
              trigger="click"
              placement="top"
              open={clickTooltipDisplay}
              onOpenChange={(open) => setClickTooltipDisplay(open)}
              title=""
              customCode={
                <div className="topo-map__click-tooltip-content">
                  <p>
                    {activeFeature.properties?.iso2cc
                      ? `${countryFlagMap[activeFeature.properties.iso2cc.toUpperCase()] ?? ""} `
                      : ""}
                    {activeFeature.properties?.name}
                    {activeFeature.properties?.score
                      ? ` - ${humanizeNumber(activeFeature.properties.score)}`
                      : ""}
                  </p>
                  <a
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      showEntityDetails();
                    }}
                  >
                    Show details
                  </a>
                </div>
              }
              overlayStyle={{ maxWidth: "275px" }}
            >
              <button
                type="button"
                className="topo-map__click-tooltip-trigger"
                aria-label="Selected entity details"
              />
            </Tooltip>
          </div>
        )}
        <Map
          key={mapKey}
          ref={mapRef}
          center={bounds ? null : position}
          zoom={bounds ? null : zoom}
          bounds={bounds ? bounds : null}
          minZoom={1}
          scrollWheelZoom={false}
          touchZoom={true}
          dragging={!screenWidthBelow680}
          onClick={enableClickPopover ? closeClickTooltip : undefined}
          style={{ width: "100%", height: "100%", overflow: "hidden" }}
        >
          <TileLayer
            id="mapbox/light-v10"
            url={`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${mapAccessToken}`}
          />
          <GeoJSON
            data={topoData}
            onEachFeature={onEachFeature}
            style={(feature) => ({
              color: "transparent",
              weight: 2,
              fillColor: !scores
                ? DEFAULT_NONE
                : !feature.properties.score
                  ? DEFAULT_NONE
                  : getEntityScaleColor(feature.properties.score, entityType),
              fillOpacity: !feature.properties.score ? 0.2 : 0.5,
              dashArray: "2",
            })}
          />
        </Map>
      </div>

      {!hideLegend && (
        <div style={{ width: "100%" }}>
          <MapLegend
            highThreshold={thresholdBounds.high ?? 0}
            lowThreshold={thresholdBounds.low ?? 0}
          />
        </div>
      )}
    </div>
  );
};

export default TopoMap;
