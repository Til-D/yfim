import React, { useState } from "react";
import { PropTypes } from "prop-types";

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
  const { initParams, handleToggle } = props;
  const [params, setParams] = useState(initParams);

  return (
    <div className={classes.toolBar}>
      <div className={classes.toggleSwitch}>
        <Typography style={{ color: "black" }}>Occlusion mask</Typography>
        <Switch
          id="mask"
          isOn={params.occlusion_mask}
          handler={() => {
            console.log(params);
            // modify current state
            setParams({
              ...params,
              occlusion_mask: !params.occlusion_mask,
            });
            // change parents' state
            handleToggle({
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

export default ToolBar;
