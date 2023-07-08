import d3 from "d3";

export const LOW_COLOR = "#FFCC3D";
export const HIGH_COLOR = "#EE695B";
export const MAX_COLOR = "#EA5362";

export const getThresholdBoundsForCountry = () => {
  return {
    low: 1_200,
    high: 29_000_000,
  };
};

export const getThresholdBoundsForRegion = () => {
  return {
    low: 5_000,
    high: 1_000_000,
  };
};

export const getEntityScaleColor = (score, entityType = "country") => {
  if (entityType === "country") {
    return getCountryScaleColor(score);
  } else if (entityType === "region") {
    return getRegionScaleColor(score);
  } else {
    return "";
  }
};

export const getCountryScaleColor = (score) => {
  if (score < 1_200) {
    return "";
  }

  if (score > 29_000_000) {
    return MAX_COLOR;
  }

  const { low, high } = getThresholdBoundsForCountry();
  return getColorFromLinearScale(score, low, high);
};

export const getRegionScaleColor = (score) => {
  if (score < 5_000) {
    return "";
  }

  if (score > 1_000_000) {
    return MAX_COLOR;
  }

  const { low, high } = getThresholdBoundsForRegion();
  return getColorFromLinearScale(score, low, high);
};

export const getColorFromLinearScale = (
  score,
  minScore,
  maxScore,
  minColor = LOW_COLOR,
  maxColor = HIGH_COLOR
) => {
  const linearScale = d3.scale
    .linear()
    .domain([minScore, maxScore])
    .range([minColor, maxColor]);

  return linearScale(score);
};

// Convert color range for outages that populate on map when hovered (color gets lighter)
export const shadeColor = (color, percent) => {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = parseInt((R * (100 + percent)) / 100);
  G = parseInt((G * (100 + percent)) / 100);
  B = parseInt((B * (100 + percent)) / 100);

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  let RR = R.toString(16).length == 1 ? "0" + R.toString(16) : R.toString(16);
  let GG = G.toString(16).length == 1 ? "0" + G.toString(16) : G.toString(16);
  let BB = B.toString(16).length == 1 ? "0" + B.toString(16) : B.toString(16);

  return "#" + RR + GG + BB;
};
