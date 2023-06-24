import d3 from "d3";

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
    return "#EA5362";
  }

  return getColorFromLinearScale(score, 1_200, 29_000_000);
};

export const getRegionScaleColor = (score) => {
  if (score < 5_000) {
    return "";
  }

  if (score > 1_000_000) {
    return "#EA5362";
  }

  return getColorFromLinearScale(score, 5_000, 1_000_000);
};

export const getColorFromLinearScale = (
  score,
  minScore,
  maxScore,
  minColor = "#FFCC3D",
  maxColor = "#EE695B"
) => {
  const linearScale = d3.scale
    .linear()
    .domain([minScore, maxScore])
    .range([minColor, maxColor]);

  return linearScale(score);
};
