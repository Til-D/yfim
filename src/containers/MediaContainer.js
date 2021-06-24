import React, { Component } from "react";
import { PropTypes } from "prop-types";
import store from "../store";
import * as faceapi from "face-api.js";
import getFeatureAttributes from "../utils/getFeatureAttributes";
import ToolBar from "../components/ToolBar";
import { connect } from "react-redux";
import Clock from "./Clock";
import GYModal from "../components/Modal";
import Announcement from "../components/Announcement";
var FileSaver = require("file-saver");

const introduction =
  "Hi, welcome to Your Face is Mute, the whole process contains three stages, for each stage, we will provide you a topic to discuss or debate with your partner,\
and you will have 30 seconds for each stage. During the discussion, different part of your face will be muted. Finally, after each stage, you may need to answer two \
questions on the Ipad. The questions are about how much you know about your partner's facial expression hidden behind different mask. So, if you are interested and ready, \
click the start button on the Ipad and enjoy!";

const init_mask = {
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
};

class MediaBridge extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bridge: "",
      user: "host",
      recording: false,
      time_slot: 0,
      time_diff: 0,
      process: false,
      sessionId: "",
      stage: 0,
      process_cfg: null,
      visible: false,
      ready: false,
      modalContent: "Are you Ready to Start ?",
      loading: false,
      topic: {
        content: "Welcome, please have a seat",
        visible: false,
      },
      intro: {
        visible: false,
        content: introduction,
      },

      controlData: {},
      survey_in_progress: false,
    };
    this.record = {
      record_count: 0,
      record_detail: [],
    };
    this.controlParams = props.controlParams;
    this.detections = null;
    this.process_duration = 10;
    this.endTime = 0;
    this.onRemoteHangup = this.onRemoteHangup.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.sendData = this.sendData.bind(this);
    this.setupDataHandlers = this.setupDataHandlers.bind(this);
    this.setDescription = this.setDescription.bind(this);
    this.sendDescription = this.sendDescription.bind(this);
    this.hangup = this.hangup.bind(this);
    this.init = this.init.bind(this);
    this.setDescription = this.setDescription.bind(this);
    this.showEmotion = this.showEmotion.bind(this);
    this.detectFace = this.detectFace.bind(this);
    this.loadModel = this.loadModel.bind(this);
    this.drawCanvas = this.drawCanvas.bind(this);
    this.onControl = this.onControl.bind(this);
    this.sendDataToServer = this.sendDataToServer.bind(this);
    this.startRecording = this.startRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.saveVideo = this.saveVideo.bind(this);
    this.onProcessStart = this.onProcessStart.bind(this);
    this.onProcessControl = this.onProcessControl.bind(this);
    this.onStageControl = this.onStageControl.bind(this);
    this.onProcessStop = this.onProcessStop.bind(this);
    this.onUploadingFinish = this.onUploadingFinish.bind(this);
    this.onFaceDetect = this.onFaceDetect.bind(this);
    this.onReset = this.onReset.bind(this);
    this.onSurveyEnd = this.onSurveyEnd.bind(this);
    this.onSurveyStart = this.onSurveyStart.bind(this);
    this.onFace = this.onFace.bind(this);
    this.mask_configuration = [];
    this.losingface = 0;

    // this.setControlParams = this.setControlParams.bind(this);
  }
  componentDidMount() {
    this.loadModel();
    this.props.media(this);
    this.props.getUserMedia.then(
      (stream) => (this.localVideo.srcObject = this.localStream = stream)
    );

    this.props.socket.on("process-start", this.onProcessStart);
    this.props.socket.on("process-stop", this.onProcessStop);
    this.props.socket.on("process-control", this.onProcessControl);
    this.props.socket.on("reset", this.onReset);
    this.props.socket.on("stage-control", this.onStageControl);
    this.props.socket.on("upload-finish", this.onUploadingFinish);
    this.props.socket.on("survey-start", this.onSurveyStart);
    this.props.socket.on("survey-end", this.onSurveyEnd);
    this.props.socket.on("face-detected", this.onFace);

    this.props.socket.on("message", this.onMessage);
    this.props.socket.on("hangup", this.onRemoteHangup);
    this.props.socket.on("control", this.onControl);
    this.props.socket.on("recording", this.startRecording);
    this.remoteVideo.addEventListener("play", () => {
      this.showEmotion();
    });
    this.localVideo.addEventListener("play", () => {
      this.mediaRecorder = new MediaRecorder(this.localStream, {
        mimeType: "video/webm",
      });
      this.chunks = [];
      // listen for data from media recorder
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };
    });
    //Canvas
  }
  componentWillUnmount() {
    this.props.media(null);
    if (this.localStream !== undefined) {
      this.localStream.getVideoTracks()[0].stop();
    }
    this.props.socket.emit("leave");
    clearInterval(this.timmer);
  }
  async showEmotion() {
    this.detections = this.detectFace();
  }
  async loadModel() {
    const MODEL_URL = "/models";
    await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
    await faceapi.loadFaceLandmarkModel(MODEL_URL);
    await faceapi.loadFaceRecognitionModel(MODEL_URL);
    await faceapi.loadFaceExpressionModel(MODEL_URL);
  }

  // survey progress control
  onSurveyEnd(data) {
    const { duration } = data;
    this.setState({
      ...this.state,
      survey_in_progress: false,
    });
    let startTime = new Date().getTime();
    this.endTime = startTime + 1000 * duration;

    const controlData = this.state.controlData.mask;
    const topic = this.state.controlData.topic;
    if (topic.length == 1) {
      this.setState({
        ...this.state,
        topic: {
          content: topic[0],
          visible: true,
        },
      });
    } else {
      const index = this.state.user == "host" ? 0 : 1;
      this.setState({
        ...this.state,
        topic: {
          content: topic[index],
          visible: true,
        },
      });
    }
    this.props.updateAll(controlData);

    console.log("survey-end", data, this.endTime);
  }
  onSurveyStart() {
    this.setState({
      ...this.state,
      survey_in_progress: true,
    });
  }
  // configure process setting
  onProcessControl() {
    if (!this.state.process) {
      this.setState(
        {
          ...this.state,
        },
        () => {
          console.log(this.state);
          this.onReady();
        }
      );
    } else {
      this.props.socket.emit("process-in-progress", {
        room: this.props.room,
        time_diff: this.state.time_diff,
      });
    }
  }
  onReady() {
    console.log("on ready set state");
    this.setState({ ...this.state, visible: true });
  }
  onProcessStart(data) {
    const { startTime, duration } = data;
    console.log("set intro invisible");
    this.setState({
      ...this.state,
      intro: {
        content: introduction,
        visible: false,
      },
    });
    console.log("process start", startTime, duration);
    if (!this.state.process) {
      //init
      this.record = {
        record_count: 0,
        record_detail: [],
      };
      console.log("process start counting");
      this.process_duration = duration;
      this.endTime = startTime + 1000 * this.process_duration;
      this.timmer = setInterval(() => {
        let nowTime = new Date().getTime();
        let time_left;
        if (!this.state.survey_in_progress) {
          time_left = Math.round((this.endTime - nowTime) / 1000);
        }
        if (time_left < 0) {
          clearInterval(this.timmer);
        } else if (!this.state.survey_in_progress) {
          this.setState({
            ...this.state,
            process: true,
            time_slot: this.state.time_slot + 1,
            time_diff: time_left,
          });
        }
      }, 1000);
    } else {
      this.props.socket.emit("process-in-progress", {
        room: this.props.room,
        time_diff: this.state.time_diff,
      });
    }
  }
  onReset() {
    this.props.socket.emit("reset", { room: this.props.room });
  }
  onProcessStop(data) {
    this.setState({
      ...this.state,
      intro: {
        content: introduction,
        visible: false,
      },
    });
    const { accident_stop } = data;
    console.log("process stop", accident_stop);
    clearInterval(this.timmer);
    this.setState({
      ...this.state,
      recording: false,
      time_slot: 0,
      time_diff: 0,
      process: false,
      sessionId: "",
      stage: 0,
      visible: false,
      loading: false,
      topic: {
        content: "Welcome, please have a seat",
        visible: false,
      },
      survey_in_progress: false,
    });

    this.props.updateAll(init_mask);
    if (!accident_stop) {
      this.sendDataToServer();
    } else {
      this.record = {
        record_count: 0,
        record_detail: [],
      };
    }
    this.setState({
      ...this.state,
      loading: true,
    });
    // setTimeout(() => {
    //   this.onReady();
    // }, 10000);
  }
  onUploadingFinish() {
    console.log("upload finished");
    this.setState({
      ...this.state,
      loading: false,
      visible: true,
    });
  }

  onStageControl(data) {
    const { mask, topic } = data;
    // update mask when stage change
    // update control data
    if (this.state.stage == 0) {
      const controlData = mask[this.state.user];
      if (topic.length == 1) {
        this.setState({
          ...this.state,
          topic: {
            content: topic[0],
            visible: true,
          },
        });
      } else {
        const index = this.state.user == "host" ? 0 : 1;
        this.setState({
          ...this.state,
          topic: {
            content: topic[index],
            visible: true,
          },
        });
      }
      this.props.updateAll(controlData);
    }
    this.setState({
      ...this.state,
      stage: 1,
      controlData: {
        mask: mask[this.state.user],
        topic: topic,
      },
    });
  }
  onControl(control_data) {
    const { user, controlData } = control_data;
    if (user == this.state.user) {
      this.props.updateAll(controlData);
      if (controlData.video == false) {
        this.localVideo.pause();
      } else this.localVideo.play();

      if (controlData.recording == true && this.state.recording == false) {
        this.startRecording();
      }
      if (controlData.recording == false && this.state.recording == true) {
        this.stopRecording();
      }
      // if (controlData.audio == false) {
      //   this.localVideo.muted = true;
      // } else this.localVideo.muted = false;
    } else {
      if (controlData.video == false) {
        this.remoteVideo.pause();
      } else this.remoteVideo.play();
      if (controlData.audio == false) {
        this.remoteVideo.muted = true;
      } else this.remoteVideo.muted = false;
    }
  }

  onFaceDetect() {
    console.log("face detected");
    let user;
    if (this.state.user == "guest") {
      user = "host";
    } else {
      user = "guest";
    }
    this.props.socket.emit("face-detected", {
      room: this.props.room,
      user,
    });
    this.setState({
      ...this.state,
    });
  }
  onFace(data) {
    if (this.state.user == data && !this.state.process) {
      console.log(this.state.process, "show intro");
      this.setState({
        ...this.state,
        intro: {
          ...this.state.intro,
          visible: true,
        },
      });
    }
  }

  startRecording() {
    // e.preventDefault();
    // wipe old data chunks
    this.chunks = [];
    // start recorder with 10ms buffer
    this.mediaRecorder.start(10);
    // say that we're recording
    this.setState({ recording: true });
  }

  stopRecording() {
    // e.preventDefault();
    console.log("stopping recording");
    // stop the recorder
    this.mediaRecorder.stop();
    // say that we're not recording
    this.setState({ recording: false });
    // save the video to memory
    this.saveVideo();
  }

  saveVideo() {
    // convert saved chunks to blob
    const blob = new Blob(this.chunks, { type: "video/webm" });
    // generate video url from blob
    const videoURL = window.URL.createObjectURL(blob);
    // append videoURL to list of saved videos for rendering
    FileSaver.saveAs(blob, "recording.webm");
    // const videos = this.state.videos.concat([videoURL]);
    // this.setState({ videos });
  }

  detectFace() {
    const canvasTmp = faceapi.createCanvasFromMedia(this.remoteVideo);
    const canvasTmp2 = faceapi.createCanvasFromMedia(this.localVideo);
    console.log("compare", canvasTmp, canvasTmp2);
    const displaySize = {
      width: canvasTmp2.width,
      height: canvasTmp2.height,
    };
    faceapi.matchDimensions(this.canvasRef, displaySize);
    console.log(this.canvasRef.width, this.canvasRef.height);

    return new Promise(
      function (resolve) {
        setInterval(async () => {
          this.detections = await faceapi
            .detectSingleFace(
              this.remoteVideo,
              new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceLandmarks()
            .withFaceExpressions();
          // console.log("detections", this.detections);
          try {
            this.faceAttributes = getFeatureAttributes(this.detections);
            if (!this.state.process) {
              this.onFaceDetect();
            }
            this.losingface = 0;
          } catch (err) {
            this.losingface += 1;
            this.losingface %= 12;
            if (this.losingface >= 10 && this.state.process) {
              // Restart whole process
              this.onReset();
              console.log("You partner seems to leave");
            }
            if (this.losingface >= 10 && !this.state.process) {
              // Restart whole process
              this.props.socket.emit("room-idle", { room: this.props.room });
              console.log("You partner seems to leave");
            }

            console.log("Can't detect face on remote side", this.losingface);
          }

          if (this.state.process) {
            try {
              const emo_data = {
                time_slot: this.state.time_slot,
                emotion: this.detections.expressions,
              };
              this.record.record_detail.push(emo_data);
              this.record.record_count += 1;
            } catch (err) {}
          }

          if (this.props.controlParams.occlusion_mask) this.drawCanvas(true);
          else this.drawCanvas(false);
        }, 1000);
      }.bind(this)
    );
  }
  // Draw a mask over face/screen
  drawCanvas(drawable) {
    const ctx = this.canvasRef.getContext("2d");
    const {
      eyes: eyesCtrl,
      mouth: mouthCtrl,
      nose: noseCtrl,
      bar: barCtrl,
    } = this.props.controlParams.feature_show;
    if (!drawable) {
      ctx.clearRect(0, 0, this.canvasRef.width, this.canvasRef.height);
    } else {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, this.canvasRef.width, this.canvasRef.height);
      const {
        leftEyeAttributes,
        rightEyeAttributes,
        mouthAttributes,
        noseAttributes,
      } = this.faceAttributes;
      // ctx.clearRect(0, 0, this.canvasRef.width, this.canvasRef.height);
      if (eyesCtrl.toggle) {
        const leftCenter = {
          x: (leftEyeAttributes.x + leftEyeAttributes.x_max) / 2,
          y: (leftEyeAttributes.y + leftEyeAttributes.y_max) / 2,
        };
        const leftWidth =
          (eyesCtrl.sliderIndex *
            (leftEyeAttributes.x_max - leftEyeAttributes.x)) /
          2;
        const leftHeight =
          (eyesCtrl.sliderIndex *
            (leftEyeAttributes.y_max - leftEyeAttributes.y)) /
          2;

        ctx.clearRect(
          leftCenter.x - leftWidth / 2,
          leftCenter.y - leftHeight / 2,
          leftWidth,
          leftHeight
        );

        const rightCenter = {
          x: (rightEyeAttributes.x + rightEyeAttributes.x_max) / 2,
          y: (rightEyeAttributes.y + rightEyeAttributes.y_max) / 2,
        };
        const rightWidth =
          (eyesCtrl.sliderIndex *
            (rightEyeAttributes.x_max - rightEyeAttributes.x)) /
          2;
        const rightHeight =
          (eyesCtrl.sliderIndex *
            (rightEyeAttributes.y_max - rightEyeAttributes.y)) /
          2;

        ctx.clearRect(
          rightCenter.x - rightWidth / 2,
          rightCenter.y - rightHeight / 2,
          rightWidth,
          rightHeight
        );
      }

      if (mouthCtrl.toggle) {
        const center = {
          x: (mouthAttributes.x + mouthAttributes.x_max) / 2,
          y: (mouthAttributes.y + mouthAttributes.y_max) / 2,
        };
        const width =
          (mouthCtrl.sliderIndex *
            (mouthAttributes.x_max - mouthAttributes.x)) /
          2;
        const height =
          (mouthCtrl.sliderIndex *
            (mouthAttributes.y_max - mouthAttributes.y)) /
          2;

        ctx.clearRect(
          center.x - width / 2,
          center.y - height / 2,
          width,
          height
        );
      }
      if (barCtrl.toggle) {
        let spanx = this.canvasRef.width / 10;
        let spany = this.canvasRef.height / 10;
        if (barCtrl.direction) {
          ctx.clearRect(
            barCtrl.position * spanx,
            0,
            spanx * barCtrl.sliderIndex,
            this.canvasRef.height
          );
        } else {
          ctx.clearRect(
            0,
            barCtrl.position * spany,
            this.canvasRef.width,
            spany * barCtrl.sliderIndex
          );
        }
      }
    }
  }

  onRemoteHangup() {
    this.setState({ ...this.state, user: "host", bridge: "host-hangup" });
  }
  onMessage(message) {
    if (message.type === "offer") {
      // set remote description and answer
      this.pc
        .setRemoteDescription(new RTCSessionDescription(message))
        .then(() => this.pc.createAnswer())
        .then(this.setDescription)
        .then(this.sendDescription)
        .catch(this.handleError); // An error occurred, so handle the failure to connect
    } else if (message.type === "answer") {
      // set remote description
      this.pc.setRemoteDescription(new RTCSessionDescription(message));
    } else if (message.type === "candidate") {
      // add ice candidate
      this.pc.addIceCandidate(message.candidate);
    }
  }
  sendData(msg) {
    this.dc.send(JSON.stringify(msg));
  }
  // Set up the data channel message handler
  setupDataHandlers() {
    this.dc.onmessage = (e) => {
      var msg = JSON.parse(e.data);
      console.log("received message over data channel:" + msg);
    };
    this.dc.onclose = () => {
      this.remoteStream.getVideoTracks()[0].stop();
      console.log("The Data Channel is Closed");
    };
  }
  setDescription(offer) {
    return this.pc.setLocalDescription(offer);
  }
  // send the offer to a server to be forwarded to the other peer
  sendDescription() {
    this.props.socket.send(this.pc.localDescription);
  }
  hangup() {
    this.setState({ ...this.state, user: "guest", bridge: "guest-hangup" });
    this.pc.close();
    this.props.socket.emit("leave");
  }
  handleError(e) {
    console.log(e);
  }
  sendDataToServer() {
    const emo_record = this.record;
    console.log(
      "sending data to server ",
      JSON.parse(JSON.stringify(emo_record))
    );
    this.props.socket.emit("data-send", {
      room: this.props.room,
      data_type: "emotion",
      user: this.state.user,
      data: emo_record,
    });
    this.record.record_detail = [];
    this.record.record_count = 0;
  }
  init() {
    // wait for local media to be ready
    const attachMediaIfReady = () => {
      this.dc = this.pc.createDataChannel("chat");
      this.setupDataHandlers();
      console.log("attachMediaIfReady");
      this.pc
        .createOffer()
        .then(this.setDescription)
        .then(this.sendDescription)
        .catch(this.handleError); // An error occurred, so handle the failure to connect
    };
    // set up the peer connection
    // this is one of Google's public STUN servers
    // make sure your offer/answer role does not change. If user A does a SLD
    // with type=offer initially, it must do that during  the whole session
    this.pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: "turn:139.180.183.4:3478",
          username: "hao",
          credential: "158131hh2232A",
        },
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });
    // when our browser gets a candidate, send it to the peer
    this.pc.onicecandidate = (e) => {
      console.log(e, "onicecandidate");
      if (e.candidate) {
        this.props.socket.send({
          type: "candidate",
          candidate: e.candidate,
        });
      }
    };
    // when the other side added a media stream, show it on screen
    this.pc.onaddstream = (e) => {
      console.log("onaddstream", e);
      this.remoteStream = e.stream;
      this.remoteVideo.srcObject = this.remoteStream = e.stream;
      this.setState({ ...this.state, bridge: "established" });
    };
    this.pc.ondatachannel = (e) => {
      // data channel
      this.dc = e.channel;
      this.setupDataHandlers();
      this.sendData({
        peerMediaStream: {
          video: this.localStream.getVideoTracks()[0].enabled,
        },
      });
      //sendData('hello');
    };
    // attach local media to the peer connection
    this.localStream
      .getTracks()
      .forEach((track) => this.pc.addTrack(track, this.localStream));
    // call if we were the last to connect (to increase
    // chances that everything is set up properly at both ends)
    if (this.state.user === "host") {
      this.props.getUserMedia.then(attachMediaIfReady);
    }
  }
  render() {
    return (
      <div className={`media-bridge ${this.state.bridge}`}>
        <canvas className="canvas" ref={(ref) => (this.canvasRef = ref)} />
        {this.state.intro.visible && (
          <div className="topic">
            <p
              style={{
                color: "white",
                fontSize: "30px",
                margin: "0 auto",
                fontWeight: "bold",
              }}
            >
              {this.state.intro.content}
            </p>
          </div>
        )}
        {this.state.process && (
          <div className="chatblock">
            <p
              style={{
                color: "#EC7500",
                fontSize: "30px",
                margin: "0 auto",
                fontWeight: "bold",
              }}
            >
              {this.state.topic.content}
            </p>
          </div>
        )}
        {/* <text className="clock">{this.state.time_diff}</text> */}
        <div className="clock">
          <Clock time_diff={this.state.time_diff}></Clock>
        </div>
        <GYModal title="Attention" visible={this.state.survey_in_progress}>
          <h1 style={{ color: "black" }}>
            We have some quesions for you on Ipad!
          </h1>
        </GYModal>

        {/* <GYModal
          title="Enjoy your talk"
          visible={this.state.topic.visible}
          onOk={() => {}}
          onCancel={() => {}}
        >
          <h1 style={{ color: "black" }}>{this.state.topic.content}</h1>
        </GYModal> */}
        <video
          className="remote-video"
          ref={(ref) => (this.remoteVideo = ref)}
          autoPlay
        ></video>
        <video
          className="local-video"
          ref={(ref) => (this.localVideo = ref)}
          autoPlay
          muted
        ></video>
      </div>
    );
  }
}
MediaBridge.propTypes = {
  socket: PropTypes.object.isRequired,
  getUserMedia: PropTypes.object.isRequired,
  media: PropTypes.func.isRequired,
};
const mapStateToProps = (store) => ({
  video: store.video,
  audio: store.audio,
  controlParams: store.controlParams,
});
const mapDispatchToProps = (dispatch) => ({
  updateAll: (payload) => store.dispatch({ type: "UPDATE_ALL", payload }),
  setVideo: (boo) => store.dispatch({ type: "SET_VIDEO", video: boo }),
  setAudio: (boo) => store.dispatch({ type: "SET_AUDIO", audio: boo }),
});
export default connect(mapStateToProps, mapDispatchToProps)(MediaBridge);
