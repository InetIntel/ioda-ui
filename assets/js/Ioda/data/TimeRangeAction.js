export const SET_TIME_RANGE = 'SET_TIME_RANGE';

export const setTimeRange = (from, until) => ({
    type: SET_TIME_RANGE,
    payload: { from, until }
});