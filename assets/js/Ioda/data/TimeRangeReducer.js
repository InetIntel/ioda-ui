import { SET_TIME_RANGE } from './TimeRangeAction';
import { getNowAsUTC, getSeconds, getNowAsUTCSeconds } from '../utils/timeUtils';

const initialState = {
    from: getSeconds(getNowAsUTC().subtract(24, "hour")),
    until: getNowAsUTCSeconds()
};

export function timeRangeReducer(state = initialState, action) {
    switch (action.type) {
        case SET_TIME_RANGE:
            return {
                ...state,
                from: action.payload.from || state.from,
                until: action.payload.until || state.until
            };
        default:
            return state;
    }
}