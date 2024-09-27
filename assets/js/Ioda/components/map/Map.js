import React, {useEffect} from "react";
import { useState } from "react";
import { Map, TileLayer, GeoJSON } from "react-leaflet";
import { humanizeNumber } from "../../utils";
import {
  shadeColor,
  getEntityScaleColor,
  getThresholdBoundsForCountry,
  getThresholdBoundsForRegion,
} from "../../utils/mapColors";
import MapLegend from "./MapLegend";

const mapAccessToken =
    "pk.eyJ1Ijoid2ViZXIwMjUiLCJhIjoiY2tmNXp5bG0wMDAzaTMxbWQzcXQ1Y3k2eCJ9.NMu5bfrybATuYQ7HdYvq-g";

const DEFAULT_NONE = "#f2f2f0";

const TopoMap = ({ handleEntityShapeClick, hideLegend, propBounds, topoData, scores, entityType }) => {
  const [hoverName, setHoverName] = useState("");
  const [hoverScore, setHoverScore] = useState(0);
  const [hoverTooltipDisplay, setHoverTooltipDisplay] = useState(false);
  const [screenWidthBelow680, setScreenWidthBelow680] = useState(false);

  useEffect(() => {
    window.addEventListener('resize', resize, { passive: true });

    // Cleanup function
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  const resize = () => {
    let screenWidthBelow680 = window.innerWidth <= 680;
    if (screenWidthBelow680 !== screenWidthBelow680) {
      setScreenWidthBelow680(screenWidthBelow680)
    }
  }

  const onEachFeature = (feature, layer) => {
    layer.on({
      mouseover: (e) => mouseOverFeature(e, feature),
      mouseout: (e) => mouseOutFeature(e),
      click: () => clickFeature(feature),
    });
  };

  const mouseOverFeature = (e, feature) => {

    setHoverName(feature.properties.name);
    setHoverScore(feature.properties.score ? humanizeNumber(feature.properties.score) : 0);
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
  };

  const mouseOutFeature = (e) => {
    e.target.setStyle({
      weight: 2,
      fillOpacity: 0.7,
    });

    setHoverName("");
    setHoverScore(0);
    setHoverTooltipDisplay(false);
  };

  const  clickFeature = (feature) => {
    handleEntityShapeClick(feature);
  };


  let position = [20, 0];
  let zoom = screenWidthBelow680 ? 1 : 2;

  let bounds = {};
  if (entityType === "country") {
    bounds = getThresholdBoundsForCountry();
  } else if (entityType === "region") {
    bounds = getThresholdBoundsForRegion();
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
                highThreshold={bounds.high ?? 0}
                lowThreshold={bounds.low ?? 0}
            />
        )}

        <Map
            center={propBounds ? null : position}
            zoom={propBounds ? null : zoom}
            bounds={propBounds ? propBounds : null}
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

}

export default TopoMap;