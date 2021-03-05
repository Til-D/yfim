import React, { useState } from "react";
import { PropTypes } from "prop-types";
import store from "../store";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import Switch from "./Switch";
import { Typography, Slider } from "@material-ui/core";
const useStyles = makeStyles((theme) => ({
  toolBar: {
    zIndex: 20,
    right: 0,
    top: "50px",
    backgroundColor: "white",
    position: "absolute",
    flexDirection: "col",
  },
  toggleSwitch: {
    // display: "flex",
    flexDirection: "row",
  },
}));

const ToolBar = (props) => {
  const classes = useStyles();
  const { controlParams } = props;
  const [params, setParams] = useState(controlParams);
  return (
    <div className={classes.toolBar}>
      <div className={classes.toggleSwitch}>
        <Typography style={{ color: "black" }}>Occlusion mask</Typography>
        <Switch
          id="mask"
          isOn={params.occlusion_mask}
          handler={() => {
            // modify current state
            props.updateMask(!params.occlusion_mask);
            setParams({
              ...params,
              occlusion_mask: !params.occlusion_mask,
            });
          }}
        />
      </div>
      <div className={classes.toggleSwitch}>
        <Typography style={{ color: "black" }}>Eyes</Typography>
        <Switch
          id="eyes"
          isOn={params.feature_show.eyes.toggle}
          handler={() => {
            const payload = {
              toggle: !params.feature_show.eyes.toggle,
              sliderIndex: params.feature_show.eyes.sliderIndex,
            };
            props.updateEye(payload);
            setParams({
              ...params,
              feature_show: {
                ...params.feature_show,
                eyes: payload,
              },
            });
          }}
        />
        <Slider
          id="eyeSlider"
          defaultValue={params.feature_show.eyes.sliderIndex}
          step={1}
          marks
          min={0}
          max={10}
          valueLabelDisplay="auto"
          onChange={(e, val) => {
            console.log("value change", val);
            const payload = {
              toggle: params.feature_show.eyes.toggle,
              sliderIndex: val,
            };
            props.updateEye(payload);
            setParams({
              ...params,
              feature_show: {
                ...params.feature_show,
                eyes: payload,
              },
            });
          }}
        />
      </div>
      <div className={classes.toggleSwitch}>
        <Typography style={{ color: "black" }}>Mouth</Typography>
        <Switch
          id="mouth"
          isOn={params.feature_show.mouth.toggle}
          handler={() => {
            const payload = {
              toggle: !params.feature_show.mouth.toggle,
              sliderIndex: params.feature_show.mouth.sliderIndex,
            };
            props.updateMouth(payload);
            setParams({
              ...params,
              feature_show: {
                ...params.feature_show,
                mouth: payload,
              },
            });
          }}
        />
        <Slider
          id="mouthSlider"
          defaultValue={params.feature_show.mouth.sliderIndex}
          step={1}
          marks
          min={0}
          max={10}
          valueLabelDisplay="auto"
          onChange={(e, val) => {
            console.log("value change", val);
            const payload = {
              toggle: params.feature_show.mouth.toggle,
              sliderIndex: val,
            };
            props.updateMouth(payload);
            setParams({
              ...params,
              feature_show: {
                ...params.feature_show,
                mouth: payload,
              },
            });
          }}
        />
      </div>
      <div className={classes.toggleSwitch}>
        <Typography style={{ color: "black" }}>Nose</Typography>
        <Switch
          id="nose"
          isOn={params.feature_show.nose.toggle}
          handler={() => {
            const payload = {
              toggle: !params.feature_show.nose.toggle,
              sliderIndex: params.feature_show.nose.sliderIndex,
            };
            props.updateNose(payload);
            setParams({
              ...params,
              feature_show: {
                ...params.feature_show,
                nose: payload,
              },
            });
          }}
        />
        <Slider
          id="noseSlider"
          defaultValue={params.feature_show.nose.sliderIndex}
          step={1}
          marks
          min={0}
          max={10}
          valueLabelDisplay="auto"
          onChange={(e, val) => {
            console.log("value change", val);
            const payload = {
              toggle: params.feature_show.nose.toggle,
              sliderIndex: val,
            };
            props.updateNose(payload);
            setParams({
              ...params,
              feature_show: {
                ...params.feature_show,
                nose: payload,
              },
            });
          }}
        />
      </div>
      <div className={classes.toggleSwitch}>
        <Typography style={{ color: "black" }}>bar</Typography>
        <Switch
          id="bar"
          isOn={params.feature_show.bar.toggle}
          handler={() => {
            const payload = {
              ...params.feature_show.bar,
              toggle: !params.feature_show.bar.toggle,
            };
            props.updateBar(payload);
            setParams({
              ...params,
              feature_show: {
                ...params.feature_show,
                bar: payload,
              },
            });
          }}
        />
        <Typography style={{ color: "black" }}>direction</Typography>
        <Switch
          id="barDirection"
          isOn={params.feature_show.bar.direction}
          handler={() => {
            const payload = {
              ...params.feature_show.bar,
              direction: !params.feature_show.bar.direction,
            };
            props.updateBar(payload);
            setParams({
              ...params,
              feature_show: {
                ...params.feature_show,
                bar: payload,
              },
            });
          }}
        />
        <Slider
          id="barSlider"
          defaultValue={params.feature_show.bar.sliderIndex}
          step={1}
          marks
          min={0}
          max={10}
          valueLabelDisplay="auto"
          onChange={(e, val) => {
            console.log("value change", val);
            const payload = {
              ...params.feature_show.bar,
              sliderIndex: val,
            };
            props.updateBar(payload);
            setParams({
              ...params,
              feature_show: {
                ...params.feature_show,
                bar: payload,
              },
            });
          }}
        />
        <Slider
          id="barPositionSlider"
          defaultValue={params.feature_show.bar.position}
          step={1}
          marks
          min={0}
          max={10}
          valueLabelDisplay="auto"
          onChange={(e, val) => {
            const payload = {
              ...params.feature_show.bar,
              position: val,
            };
            props.updateBar(payload);
            setParams({
              ...params,
              feature_show: {
                ...params.feature_show,
                bar: payload,
              },
            });
          }}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (store) => ({ controlParams: store.controlParams });
const mapDispatchToProps = (dispatch) => ({
  updateMask: (payload) => store.dispatch({ type: "UPDATE_MASK", payload }),
  updateEye: (payload) => store.dispatch({ type: "UPDATE_EYE", payload }),
  updateMouth: (payload) => store.dispatch({ type: "UPDATE_MOUTH", payload }),
  updateNose: (payload) => store.dispatch({ type: "UPDATE_NOSE", payload }),
  updateBar: (payload) => store.dispatch({ type: "UPDATE_BAR", payload }),
});
export default connect(mapStateToProps, mapDispatchToProps)(ToolBar);
