import * as _ from 'lodash';

import { ICHING_INTERPRETATION_LOAD, ICHING_INTERPRETATION_LOADED } from '../constants/ActionTypes';

import * as HexagramActions from '../actions/HexagramActions';
import * as IchingTable from '../constants/IchingLookup';

// Single Line KUA Reducer
export function IchingLoaded(state = [], action) {
  switch (action.type) {
    case ICHING_INTERPRETATION_LOADED:
      return action.payload;
    default:
      return state;
  }
}
