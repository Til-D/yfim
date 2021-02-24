import { combineReducers } from "redux";
// Reducers
import roomReducer from "./room-reducer";
import audioReducer from "./audio-reducer";
import videoReducer from "./video-reducer";
import controlReducer from "./control-reducer";
// Combine Reducers
const reducers = combineReducers({
  controlParams: controlReducer,
  rooms: roomReducer,
  video: videoReducer,
  audio: audioReducer,
});
export default reducers;
