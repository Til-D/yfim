import { createStore } from "redux";
import reducers from "./reducers";
const mapStoreToStorage = () =>
  localStorage.setItem("reduxState", JSON.stringify(store.getState()));
// localStorage.getItem("reduxState")
// ? JSON.parse(localStorage.getItem("reduxState"))
// :
const persistedState = {
  rooms: [],
  video: true,
  audio: true,
  controlParams: {
    zoom: 200,
    occlusion_mask: false, //Switch
    feature_show: {
      eyes: {
        toggle: false,
        sliderIndex: 0,
      },
      mouth: {
        toggle: false,
        sliderIndex: 0,
      },
      nose: {
        toggle: false,
        sliderIndex: 0,
      },
      bar: {
        toggle: false,
        direction: false,
        sliderIndex: 0,
        position: 0,
      },
    },
  },
};
const store = createStore(reducers, persistedState);
store.subscribe(mapStoreToStorage);
export default store;
