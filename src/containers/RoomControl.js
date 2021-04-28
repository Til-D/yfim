import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Switch from "../components/Switch";
import { Typography, Slider } from "@material-ui/core";
import ReactFileReader from "react-file-reader";

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
    video: true,
    audio: true,
    recording: false,
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
    video: true,
    audio: true,
    recording: false,
  },
};
var FileSaver = require("file-saver");

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

  function onLoadConfiguration(files) {
    var reader = new FileReader();
    reader.onload = (e) => {
      // Use reader.result
      let settingsP = JSON.parse(reader.result);
      setParams(settingsP);
    };
    reader.readAsText(files[0]);
    // socket.emit("survey-start", { room: room });
    // setSurvey_count((count) => count + 1);
  }

  function savingCongfiguration() {
    var blob = new Blob([JSON.stringify(params)], {
      type: "text/plain;charset=utf-8",
    });
    FileSaver.saveAs(blob, "maskConfiguration.json");
  }

  const ToolBar = (props) => {
    const [submitSign, setSubmitSign] = useState(false);
    const { user } = props;
    const videoId = `video${user}`;
    const audioId = `audio${user}`;
    const maskId = `mask${user}`;
    const eyesId = `eyes${user}`;
    const eyeSliderId = `eyes${user}`;
    const mouthId = `mouth${user}`;
    const mouthSliderId = `mouthSlider${user}`;
    const noseId = `nose${user}`;
    const noseSliderId = `noseSlider${user}`;
    const barId = `barId${user}`;
    const barDirectionId = `barDirection${user}`;
    const barSliderId = `barSlider${user}`;
    const barPositionId = `barPosition${user}`;
    const recordId = `recording${user}`;
    useEffect(() => {
      onSubmit(user);
    }, [submitSign]);

    return (
      <div className={classes.toolBar}>
        <div className={classes.toggleSwitch}>
          <Typography style={{ color: "black" }}>
            Freeze {user}'s Video
          </Typography>
          <Switch
            id={videoId}
            isOn={params[user].video}
            handler={() => {
              setParams({
                ...params,
                [user]: {
                  ...params[user],
                  video: !params[user].video,
                },
              });
            }}
          />
          <Typography style={{ color: "black" }}>
            Mute {user}'s Audio
          </Typography>
          <Switch
            id={audioId}
            isOn={params[user].audio}
            handler={() => {
              setParams({
                ...params,
                [user]: {
                  ...params[user],
                  audio: !params[user].audio,
                },
              });
            }}
          />
          <Typography style={{ color: "black" }}>
            Recording {user}'s Audio
          </Typography>
          <Switch
            id={recordId}
            isOn={params[user].recording}
            handler={() => {
              setParams({
                ...params,
                [user]: {
                  ...params[user],
                  recording: !params[user].recording,
                },
              });
            }}
          />
          <Typography style={{ color: "black" }}>Mask for {user}</Typography>
          <Switch
            id={maskId}
            isOn={params[user].occlusion_mask}
            handler={() => {
              setParams({
                ...params,
                [user]: {
                  ...params[user],
                  occlusion_mask: !params[user].occlusion_mask,
                },
              });
              setSubmitSign(!submitSign);
            }}
          />
        </div>
        <div className={classes.toggleSwitch}>
          <Typography style={{ color: "black" }}>Eyes</Typography>
          <Switch
            id={eyesId}
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
            id={eyeSliderId}
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
            id={mouthId}
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
            id={mouthSliderId}
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
            id={noseId}
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
            id={noseSliderId}
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
            id={barId}
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
            id={barDirectionId}
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
            id={barSliderId}
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
            id={barPositionId}
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
      {/* <Link className="primary-button" to={"/survey/" + room}>
        Survey
      </Link> */}

      <ReactFileReader
        handleFiles={(files) => onLoadConfiguration(files)}
        fileTypes={".json"}
      >
        <button className="primary-button">Loading Configuration</button>
      </ReactFileReader>
      <button onClick={() => savingCongfiguration()} className="primary-button">
        Saving Configuration
      </button>
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
          {/* <button onClick={() => onSubmit("host")} className="primary-button">
            Submit
          </button> */}
        </div>
        <div style={{ width: "45%", flexDirection: "col" }}>
          <ToolBar user="guest" />
          {/* <button onClick={() => onSubmit("guest")} className="primary-button">
            Submit
          </button> */}
        </div>
      </div>

      {/* <Link className="primary-button" to={"/compete/" + this.state.room}>
        Compete
      </Link> */}
    </div>
  );
}
