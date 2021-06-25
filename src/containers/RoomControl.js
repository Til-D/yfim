import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Switch from "../components/Switch";
import { Slider } from "@material-ui/core";
import ReactFileReader from "react-file-reader";
import GYModal from "../components/Modal";
import Select from "react-select";

const colourStyles = {
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    // const color = chroma(data.color);
    return {
      ...styles,
      backgroundColor: isFocused ? "#999999" : null,
      color: "#0052CC",
    };
  },
};

const maskOptions = [
  { value: "endWithEyes", label: "EndWithEyes", color: "#0052CC" },
  { value: "endWithMouth", label: "EndWithMouth", color: "#0052CC" },
  { value: "opposite", label: "Opposite", color: "#0052CC" },
  { value: "upload", label: "Upload", color: "#0052CC" },
];
const groupOptions = [
  { value: "general", label: "General", color: "#0052CC" },
  { value: "kids", label: "Kids", color: "#0052CC" },
  { value: "mature", label: "Mature", color: "#0052CC" },
];
const groupStyles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};
const groupBadgeStyles = {
  backgroundColor: "#EBECF0",
  borderRadius: "2em",
  color: "#172B4D",
  display: "inline-block",
  fontSize: 12,
  fontWeight: "normal",
  lineHeight: "1",
  minWidth: 1,
  padding: "0.16666666666667em 0.5em",
  textAlign: "center",
};

const useStyles = makeStyles((theme) => ({
  toolBarContainer: {
    display: "flex",
    flexDirection: "row",
  },
  toolBar: {
    paddingRight: 20,
    paddingLeft: 20,
    width: "90%",
    top: "50px",
    backgroundColor: "#C7EDCC",
  },
  toggleSwitch: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: "1 1",
  },
  controlText: {
    color: "black",
    flex: "1",
  },
}));

const initState = {
  host: {
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
    video: true,
    audio: true,
    recording: false,
  },
  guest: {
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
    video: true,
    audio: true,
    recording: false,
  },
};
var FileSaver = require("file-saver");

export default function RoomControl(props) {
  const [params, setParams] = useState(initState);
  const [visible, setVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [upload, setUpload] = useState(false);
  const [maskOption, setMaskOption] = useState(null);
  const [maskConfig, setMaskConfig] = useState(null);
  const classes = useStyles();
  const room = props.match.params.room;
  useEffect(() => {
    const socket = io.connect();
    socket.emit("control-room", { room: room });
    socket.on("process-in-progress", (data) => {
      console.log(data);
      let time_diff = data.time_diff;
      alert(`process in ongoing, ${time_diff} seconds left`);
    });
    socket.on("process-stop", () => {
      alert("process stop");
    });
  }, []);

  useEffect(() => {
    console.log(maskOption);
    if (maskOption != null) {
      if (maskOption.value == "upload") {
        setUpload(true);
      } else if (upload) {
        setUpload(false);
      }
    }
  }, [maskOption]);

  useEffect(() => {
    if (JSON.stringify(params.guest) != JSON.stringify(initState.guest)) {
      console.log("guest params change");
      onSubmit("guest");
    }
  }, [params.guest]);

  useEffect(() => {
    if (JSON.stringify(params.host) != JSON.stringify(initState.host)) {
      console.log("host change");
      onSubmit("host");
    }
  }, [params.host]);

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

  function onProcessStart() {
    console.log("process start, asking for ready");
    let cfg;
    if (maskOption.value == "upload") {
      cfg = maskConfig;
    } else {
      cfg = require("../../assets/MaskSetting/" + maskOption.value + ".json");
    }
    console.log(cfg);
    if (maskOption != null && selectedOption != null) {
      socket.emit("process-control", {
        room: room,
        cfg: cfg,
        topic: selectedOption.value,
      });
    } else {
      alert("please select topics and mask type");
    }
  }

  function onUploadConfig(files) {
    console.log("uploading config file");
    var reader = new FileReader();
    reader.onload = (e) => {
      // Use reader.result
      let cfg = JSON.parse(reader.result);
      setMaskConfig(cfg);
    };
    reader.readAsText(files[0]);
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
    const zoomSliderId = `zoom${user}`;

    return (
      <div className={classes.toolBar}>
        <div className={classes.toggleSwitch}>
          {/* <div style={{ display: "flex", flexDirection: "row" }}> */}
          <Slider
            id={zoomSliderId}
            defaultValue={params[user].zoom}
            step={25}
            marks
            min={100}
            max={500}
            valueLabelDisplay="auto"
            onChange={(e, val) => {
              setParams({
                ...params,
                [user]: {
                  ...params[user],
                  zoom: val,
                },
              });
            }}
          />
          <text className={classes.controlText}>Freeze {user}'s Video</text>
          <Switch
            style={{ justifyContent: "right" }}
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
          {/* </div> */}
        </div>
        <div className={classes.toggleSwitch}>
          <text className={classes.controlText}>Mute {user}'s Audio</text>
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
        </div>
        <div className={classes.toggleSwitch}>
          <text className={classes.controlText}>Recording {user}'s Video</text>
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
        </div>
        <div className={classes.toggleSwitch}>
          <text className={classes.controlText}>Mask for {user}</text>
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
          <text className={classes.controlText}>Eyes</text>
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
        </div>
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
        <div className={classes.toggleSwitch}>
          <text className={classes.controlText}>Mouth</text>
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
        </div>
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
        <div className={classes.toggleSwitch}>
          <text className={classes.controlText}>Nose</text>
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
        </div>
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
        <div className={classes.toggleSwitch}>
          <text className={classes.controlText}>Bar Zone</text>
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
          <text className={classes.controlText}>Horizontal/Vertical</text>
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
        </div>
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
    );
  };

  return (
    <>
      <div
        style={{
          top: "10px",
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

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyItems: "center",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <p>Topics : </p>
          <div
            style={{
              display: "inline-block",
              width: "8em",
              height: "5em",
              lineHeight: "2ex",
              fontSize: "0.8em",
            }}
          >
            <Select
              defaultValue={selectedOption}
              onChange={setSelectedOption}
              options={groupOptions}
              // formatGroupLabel={formatGroupLabel}
              styles={colourStyles}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          {" "}
          <p>Mask Type: </p>
          <div
            style={{
              display: "inline-block",
              width: "8em",
              height: "5em",
              lineHeight: "2ex",
              fontSize: "0.8em",
            }}
          >
            <Select
              defaultValue={maskOption}
              onChange={setMaskOption}
              options={maskOptions}
              styles={colourStyles}
            />
          </div>
          {upload && (
            <ReactFileReader
              handleFiles={(files) => onUploadConfig(files)}
              fileTypes={".json"}
            >
              {/* <button className="primary-button">Loading Configuration</button> */}
              Upload Mask
            </ReactFileReader>
          )}
        </div>

        <GYModal
          title="Title"
          visible={visible}
          onOk={() => setVisible(false)}
          onCancel={() => setVisible(false)}
        >
          <h1>Are you ready?</h1>
        </GYModal>

        <button onClick={() => onProcessStart()} className="primary-button">
          Process Start
        </button>

        <button
          onClick={() => savingCongfiguration()}
          className="primary-button"
        >
          Saving setting
        </button>
      </div>
    </>
  );
}
