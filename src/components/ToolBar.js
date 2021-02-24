import React, { useState } from "react";
import { PropTypes } from "prop-types";
import store from "../store";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import Switch from "./Switch";
import { Typography } from "@material-ui/core";
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
    // flexDirection: "row",
  },
}));

const ToolBar = (props) => {
  const classes = useStyles();
  const { controlParams } = props;
  const [params, setParams] = useState(controlParams);
  console.log("params", params);
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
      {/* <div className={classes.toggleSwitch}>
        <Typography style={{ color: "black" }}>Eyes</Typography>
        <Switch
          id="eyes"
          isOn={eyeSwitch}
          handleToggle={() => setEyeSwitch(!eyeSwitch)}
        />
      </div>
      <div className={classes.toggleSwitch}>
        <Typography style={{ color: "black" }}>Mouth</Typography>
        <Switch
          id="mouth"
          isOn={mouthSwitch}
          handleToggle={() => setMouthSwitch(!mouthSwitch)}
        />
      </div>
      <div className={classes.toggleSwitch}>
        <Typography style={{ color: "black" }}>Nose</Typography>
        <Switch
          id="nose"
          isOn={noseSwitch}
          handleToggle={() => setNoseSwitch(!noseSwitch)}
        />
      </div> */}
    </div>
  );
};

const mapStateToProps = (store) => ({ controlParams: store.controlParams });
const mapDispatchToProps = (dispatch) => ({
  updateMask: (payload) => store.dispatch({ type: "UPDATE_MASK", payload }),
});
export default connect(mapStateToProps, mapDispatchToProps)(ToolBar);
