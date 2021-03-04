const initState = {
  occlusion_mask: false, //Switch
  feature_show: {
    eyes: {
      toggle: true,
      sliderIndex: 0,
    },
    mouth: {
      toggle: true,
      sliderIndex: 0,
    },
    nose: {
      toggle: true,
      sliderIndex: 0,
    },
    bar: {
      toggle: true,
      direction: true,
      sliderIndex: 0,
      position: 0,
    },
  },
};

const updateControlParams = (state = initState, action) => {
  switch (action.type) {
    case "UPDATE_MASK": {
      return {
        ...state,
        occlusion_mask: action.payload,
      };
    }
    case "UPDATE_EYE": {
      return {
        ...state,
        feature_show: {
          ...state.feature_show,
          eyes: action.payload,
        },
      };
    }
    case "UPDATE_MOUTH": {
      return {
        ...state,
        feature_show: {
          ...state.feature_show,
          mouth: action.payload,
        },
      };
    }
    case "UPDATE_NOSE": {
      return {
        ...state,
        feature_show: {
          ...state.feature_show,
          nose: action.payload,
        },
      };
    }
    case "UPDATE_BAR": {
      return {
        ...state,
        feature_show: {
          ...state.feature_show,
          bar: action.payload,
        },
      };
    }
    default:
      return state;
  }
};
export default updateControlParams;
