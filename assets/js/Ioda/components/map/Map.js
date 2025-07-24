import React, { useState, useEffect, useRef, useCallback } from "react";
import { Map, TileLayer, GeoJSON } from "react-leaflet";
import { humanizeNumber } from "../../utils";
import {
  shadeColor,
  getEntityScaleColor,
  getThresholdBoundsForCountry,
  getThresholdBoundsForRegion,
} from "../../utils/mapColors";
import MapLegend from "./MapLegend";

const mapAccessToken = process.env.MAPBOX_TOKEN;

const DEFAULT_NONE = "#f2f2f0";

const TopoMap = (props) => {
  const {
    scores,
    bounds,
    topoData,
    entityType,
    hideLegend,
    handleEntityShapeClick,
  } = props;

  // State declarations
  const [hoverName, setHoverName] = useState("");
  const [hoverScore, setHoverScore] = useState(0);
  const [hoverTooltipDisplay, setHoverTooltipDisplay] = useState(false);
  const [screenWidthBelow680, setScreenWidthBelow680] = useState(false);
  const [mapKey, setMapKey] = useState(Date.now()); // Key for forcing re-renders

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
    setHoverName(feature.properties.name);
    setHoverScore(
      feature.properties.score ? humanizeNumber(feature.properties.score) : 0
    );
    setHoverTooltipDisplay(true);

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
  }, []);

  const mouseOutFeature = useCallback((e) => {
    e.target.setStyle({
      weight: 2,
      fillOpacity: 0.7,
    });

    setHoverName("");
    setHoverScore(0);
    setHoverTooltipDisplay(false);
  }, []);

  const clickFeature = useCallback(
    (feature) => {
      if (handleEntityShapeClick) {
        handleEntityShapeClick(feature);
      }
    },
    [handleEntityShapeClick]
  );

  const onEachFeature = useCallback(
    (feature, layer) => {
      layer.on({
        mouseover: (e) => mouseOverFeature(e, feature),
        mouseout: (e) => mouseOutFeature(e),
        click: () => clickFeature(feature),
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

  return (
    <div
      className="topo-map"
      style={{ position: "relative", height: "inherit", width: "100%" }}
    >
      <div
        className={
          hoverTooltipDisplay
            ? "topo-map__tooltip topo-map__tooltip-visible"
            : "topo-map__tooltip"
        }
      >
        <p>
          {hoverName}
          {hoverScore !== 0 ? ` - ${hoverScore}` : null}
        </p>
      </div>

      {!hideLegend && (
        <MapLegend
          style={{ position: "absolute", bottom: "1rem", left: "1rem" }}
          highThreshold={thresholdBounds.high ?? 0}
          lowThreshold={thresholdBounds.low ?? 0}
        />
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
        style={{ width: "inherit", height: "inherit", overflow: "hidden" }}
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
  );
};

export default TopoMap;
