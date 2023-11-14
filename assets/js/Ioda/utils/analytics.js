import ReactGA from "react-ga4";

/**
 * Initialize Google Analytics properties
 */
export function initializeAnalytics() {
  ReactGA.initialize([
    // new property, owned by Georgia Tech
    { trackingId: "G-3J1FMTEGCV" },
    // previous property, owned by CAIDA
    { trackingId: "G-XD5MWMBCF9" },
  ]);
}

/**
 * Register a google analytics event
 *
 * @param {*} category
 * @param {*} eventName
 */
export function registerAnalyticsEvent(category, eventName) {
  const DELIMITER = "-";
  const action = [category, eventName].join(DELIMITER);
  ReactGA.event({ category, action });
}
