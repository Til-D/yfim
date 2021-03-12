import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Switch from "../components/Switch";
import { Typography, Slider } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  toolBarContainer: {
    display: "flex",
    flexDirection: "row",
  },
  toolBar: {
    // zIndex: 20,
    // right: 0,
    paddingRight: 20,
    paddingLeft: 20,
    width: "70%",
    top: "50px",
    backgroundColor: "#C7EDCC",
    // flexDirection:"column"
    // position: "absolute",
  },
  toggleSwitch: {
    // display: "flex",
    flexDirection: "row",
  },
}));
const initState = {
  host: {
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
  guest: {
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

export default function RoomControl(props) {
  const [params, setParams] = useState(initState);
  const [survey_count, setSurvey_count] = useState(0);
  const socket = io.connect();
  const classes = useStyles();
  // socket.emit("survey", props);
  const room = props.match.params.room;
  function onSubmit(user) {
    const data = {
      room: room,
      data: {
        user: user,
        controlData: params[user],
      },
    };
    console.log(data);
    socket.emit("control", data);
  }
  function onSurveyStart() {
    console.log(survey_count);
    socket.emit("survey-start", { room: room });
    setSurvey_count((count) => count + 1);
  }
  const ToolBar = (props) => {
    const { user } = props;
    return (
      <div className={classes.toolBar}>
        <div className={classes.toggleSwitch}>
          <Typography style={{ color: "black" }}>Mask for {user}</Typography>
          <Switch
            id="mask"
            isOn={params[user].occlusion_mask}
            handler={() => {
              setParams({
                ...params,
                [user]: {
                  ...params[user],
                  occlusion_mask: !params[user].occlusion_mask,
                },
              });
            }}
          />
        </div>
        <div className={classes.toggleSwitch}>
          <Typography style={{ color: "black" }}>Eyes</Typography>
          <Switch
            id="eyes"
            isOn={params[user].feature_show.eyes.toggle}
            handler={() => {
              const payload = {
                toggle: !params[user].feature_show.eyes.toggle,
                sliderIndex: params[user].feature_show.eyes.sliderIndex,
              };
              setParams({
                ...params,
                [user]: {
                  ...params[user],
                  feature_show: {
                    ...params[user].feature_show,
                    eyes: payload,
                  },
                },
              });
            }}
          />
          <Slider
            id="eyeSlider"
            defaultValue={params[user].feature_show.eyes.sliderIndex}
            step={1}
            marks
            min={0}
            max={10}
            valueLabelDisplay="auto"
            onChange={(e, val) => {
              const payload = {
                toggle: params[user].feature_show.eyes.toggle,
                sliderIndex: val,
              };
              setParams({
                ...params,
                [user]: {
                  ...params[user],
                  feature_show: {
                    ...params[user].feature_show,
                    eyes: payload,
                  },
                },
              });
            }}
          />
        </div>
        <div className={classes.toggleSwitch}>
          <Typography style={{ color: "black" }}>Mouth</Typography>
          <Switch
            id="mouth"
            isOn={params[user].feature_show.mouth.toggle}
            handler={() => {
              const payload = {
                toggle: !params[user].feature_show.mouth.toggle,
                sliderIndex: params[user].feature_show.mouth.sliderIndex,
              };
              setParams({
                ...params,
                [user]: {
                  ...params[user],
                  feature_show: {
                    ...params[user].feature_show,
                    mouth: payload,
                  },
                },
              });
            }}
          />
          <Slider
            id="mouthSlider"
            defaultValue={params[user].feature_show.mouth.sliderIndex}
            step={1}
            marks
            min={0}
            max={10}
            valueLabelDisplay="auto"
            onChange={(e, val) => {
              const payload = {
                toggle: params[user].feature_show.mouth.toggle,
                sliderIndex: val,
              };
              setParams({
                ...params,
                [user]: {
                  ...params[user],
                  feature_show: {
                    ...params[user].feature_show,
                    mouth: payload,
                  },
                },
              });
            }}
          />
        </div>
        <div className={classes.toggleSwitch}>
          <Typography style={{ color: "black" }}>Nose</Typography>
          <Switch
            id="nose"
            isOn={params[user].feature_show.nose.toggle}
            handler={() => {
              const payload = {
                toggle: !params[user].feature_show.nose.toggle,
                sliderIndex: params[user].feature_show.nose.sliderIndex,
              };
              setParams({
                ...params,
                [user]: {
                  ...params[user],
                  feature_show: {
                    ...params[user].feature_show,
                    nose: payload,
                  },
                },
              });
            }}
          />
          <Slider
            id="noseSlider"
            defaultValue={params[user].feature_show.nose.sliderIndex}
            step={1}
            marks
            min={0}
            max={10}
            valueLabelDisplay="auto"
            onChange={(e, val) => {
              const payload = {
                toggle: params[user].feature_show.nose.toggle,
                sliderIndex: val,
              };
              setParams({
                ...params,
                [user]: {
                  ...params[user],
                  feature_show: {
                    ...params[user].feature_show,
                    nose: payload,
                  },
                },
              });
            }}
          />
        </div>
        <div className={classes.toggleSwitch}>
          <Typography style={{ color: "black" }}>bar</Typography>
          <Switch
            id="bar"
            isOn={params[user].feature_show.bar.toggle}
            handler={() => {
              const payload = {
                ...params[user].feature_show.bar,
                toggle: !params[user].feature_show.bar.toggle,
              };
              setParams({
                ...params,
                [user]: {
                  ...params[user],
                  feature_show: {
                    ...params[user].feature_show,
                    bar: payload,
                  },
                },
              });
            }}
          />
          <Typography style={{ color: "black" }}>direction</Typography>
          <Switch
            id="barDirection"
            isOn={params[user].feature_show.bar.direction}
            handler={() => {
              const payload = {
                ...params[user].feature_show.bar,
                direction: !params[user].feature_show.bar.direction,
              };
              setParams({
                ...params,
                [user]: {
                  ...params[user],
                  feature_show: {
                    ...params[user].feature_show,
                    bar: payload,
                  },
                },
              });
            }}
          />
          <Slider
            id="barSlider"
            defaultValue={params[user].feature_show.bar.sliderIndex}
            step={1}
            marks
            min={0}
            max={10}
            valueLabelDisplay="auto"
            onChange={(e, val) => {
              const payload = {
                ...params[user].feature_show.bar,
                sliderIndex: val,
              };
              setParams({
                ...params,
                [user]: {
                  ...params[user],
                  feature_show: {
                    ...params[user].feature_show,
                    bar: payload,
                  },
                },
              });
            }}
          />
          <Slider
            id="barPositionSlider"
            defaultValue={params[user].feature_show.bar.position}
            step={1}
            marks
            min={0}
            max={10}
            valueLabelDisplay="auto"
            onChange={(e, val) => {
              const payload = {
                ...params[user].feature_show.bar,
                position: val,
              };
              setParams({
                ...params,
                [user]: {
                  ...params[user],
                  feature_show: {
                    ...params[user].feature_show,
                    bar: payload,
                  },
                },
              });
            }}
          />
        </div>
      </div>
    );
  };
  return (
    <div>
      <Link className="primary-button" to={"/survey/" + room}>
        Survey
      </Link>
      <button onClick={() => onSurveyStart()} className="primary-button">
        Survey Start No.{survey_count}
      </button>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "45%", flexDirection: "col", marginRight: 10 }}>
          <ToolBar user="host" />
          <button onClick={() => onSubmit("host")} className="primary-button">
            Submit
          </button>
        </div>
        <div style={{ width: "45%", flexDirection: "col" }}>
          <ToolBar user="guest" />
          <button onClick={() => onSubmit("guest")} className="primary-button">
            Submit
          </button>
        </div>
      </div>

      {/* <Link className="primary-button" to={"/compete/" + this.state.room}>
        Compete
      </Link> */}
    </div>
  );
}
// class RoomControl extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       room: props.match.params.room,
//     };
//   }
// }
