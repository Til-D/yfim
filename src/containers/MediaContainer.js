import React, { Component } from "react";
import { PropTypes } from "prop-types";
import store from "../store";
import * as faceapi from "face-api.js";
import getFeatureAttributes from "../utils/getFeatureAttributes";
import ToolBar from "../components/ToolBar";
import { connect } from "react-redux";
import { surveyJSON } from "../components/Survey_JSON";
import * as Survey from "survey-react";

class MediaBridge extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bridge: "",
      user: "host",
      survey: false,
    };
    this.record = {
      user: this.state.user,
      record_count: 0,
      record_detail: [],
    };
    this.controlParams = props.controlParams;
    this.detections = null;
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
    this.onSurveyStart = this.onSurveyStart.bind(this);
    this.onControl = this.onControl.bind(this);
    this.sendDataToServer = this.sendDataToServer.bind(this);

    Survey.StylesManager.applyTheme("winter");
    this.model = new Survey.Model(surveyJSON);
    // this.setControlParams = this.setControlParams.bind(this);
  }
  componentDidMount() {
    this.loadModel();
    this.props.media(this);
    this.props.getUserMedia.then(
      (stream) => (this.localVideo.srcObject = this.localStream = stream)
    );
    console.log("socket", this.props.socket);
    this.props.socket.on("message", this.onMessage);
    this.props.socket.on("hangup", this.onRemoteHangup);
    this.props.socket.on("survey-start", this.onSurveyStart);
    this.props.socket.on("control", this.onControl);
    this.localVideo.addEventListener("play", () => {
      this.showEmotion();
    });
    //Canvas
  }
  componentWillUnmount() {
    this.props.media(null);
    if (this.localStream !== undefined) {
      this.localStream.getVideoTracks()[0].stop();
    }
    this.props.socket.emit("leave");
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
  onSurveyStart() {
    console.log("survey start");
    this.record.user = this.state.user;
    this.setState({
      ...this.state,
      record_count: 0,
      survey: true,
    });
    let mydate = new Date();
    var datestr = "";
    datestr +=
      mydate.getHours() + "/" + mydate.getMinutes() + "/" + mydate.getSeconds();
    this.record.record_detail.push(datestr);
  }
  onControl(control_data) {
    const { user, controlData } = control_data;
    if (user == this.state.user) {
      this.props.updateAll(controlData);
      if (controlData.video == false) {
        this.localVideo.pause();
      } else this.localVideo.play();
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

    console.log("control", controlData);
  }
  detectFace() {
    const canvasTmp = faceapi.createCanvasFromMedia(this.localVideo);
    const displaySize = {
      width: canvasTmp.width,
      height: canvasTmp.height,
    };
    faceapi.matchDimensions(this.canvasRef, displaySize);

    return new Promise(
      function (resolve) {
        setInterval(async () => {
          this.detections = await faceapi
            .detectSingleFace(
              this.localVideo,
              new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceLandmarks()
            .withFaceExpressions();
          // console.log("detections", this.detections);
          try {
            this.faceAttributes = getFeatureAttributes(this.detections);
          } catch (err) {
            console.log(err);
          }

          if (this.state.survey) {
            this.record.record_detail.push(this.detections.expressions);
            this.record.record_count += 1;
            if (this.record.record_count == 10) {
              this.setState({ ...this.state, survey: false });
              // survey end and restore data in database
              this.props.socket.emit("emotion-send", {
                room: this.props.room,
                data: this.record,
              });

              this.record.record_detail = [];
              this.record.record_count = 0;
            }
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
      //  ctx.clearRect(
      //   leftEyeAttributes.x,
      //   leftEyeAttributes.y,
      //   leftEyeAttributes.x_max - leftEyeAttributes.x,
      //   leftEyeAttributes.y_max - leftEyeAttributes.y + 20
      // );

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
  sendDataToServer(survey) {
    //   callback function
    alert("The results are:" + JSON.stringify(survey.data));
    let mydate = new Date();
    var datestr = "";
    datestr +=
      mydate.getHours() + "/" + mydate.getMinutes() + "/" + mydate.getSeconds();

    const sendData = {
      user: this.state.user,
      submit_time: datestr,
      result: survey.data,
    };
    this.props.socket.emit("survey-end", {
      room: this.props.room,
      data: sendData,
    });
    // this.setState({ survey: false });
    this.model = new Survey.Model(surveyJSON);
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
          urls: "turn:149.28.164.18:3478",
          username: "hao",
          credential: "0x820492f231157aa798b4b48f8baa697e",
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
        {/* <ToolBar /> */}
        <div style={{ zIndex: 100, position: "absolute" }}>
          {this.state.survey && (
            <Survey.SurveyWindow
              model={this.model}
              isExpanded={true}
              onComplete={this.sendDataToServer}
            />
          )}
        </div>
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
