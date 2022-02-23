import React, { Component } from "react";
import { PropTypes } from "prop-types";
import store from "../store";
import { connect } from "react-redux";
import Clock from "./Clock";
import GYModal from "../components/Modal";
import Introduction from "../components/Introduction";
import IntroFaceDetect from "../components/IntroFaceDetect";
import Thankyou from "../components/Thankyou";
import SideBar from "../components/SideBar";
import * as FaceMesh from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
var FileSaver = require("file-saver");

const RECORD_AUDIO = false;
const RECORD_VIDEO = false;

const introduction =
  "Welcome to `Your Face is Muted`! This experience consists of three stages. In each, the screen in front of you will show a prompt with a topic to discuss with your conversation partner.\
Throughout the discussion, different parts of your face will be obfuscated. The iPad next to you will occasionally prompt you with questions about you and your partner's current emotion. Let's see how accurate you can read how they feel! \
Sounds good? \
Then click the start button on the iPad and converse away!";
const loseface_notify =
  "Ooops! We can not detect your face, please make sure to look at the screen during\
the experience. Otherwise, the conversation may be terminated.";

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
      user: props.user,
      recording: false,
      time_slot: 0,
      time_diff: 0,
      process: false,
      sessionId: "",
      stage: 0,
      side_prompt: "",
      process_cfg: null,
      attention:
        "Ooops! We can not detect your face, please look at the screen during\
      the process. Or the conversation will be terminated.",
      visible: false,
      ready: false,
      loading: false,
      intro: {
        visible: false,
        content: introduction,
      },
      result: "",
      controlData: {},
      survey_in_progress: false,
    };
    this.record = {
      record_count: 0,
      record_detail: [],
    };
    this.emo_result = [];
    this.survey_count = 0;
    this.controlParams = props.controlParams;
    this.detections = null;
    this.process_duration = 10;
    this.endTime = 0;
    this.onResults = this.onResults.bind(this);
    this.onRemoteHangup = this.onRemoteHangup.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.sendData = this.sendData.bind(this);
    this.setupDataHandlers = this.setupDataHandlers.bind(this);
    this.setDescription = this.setDescription.bind(this);
    this.sendDescription = this.sendDescription.bind(this);
    this.hangup = this.hangup.bind(this);
    this.init = this.init.bind(this);
    this.setDescription = this.setDescription.bind(this);
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
    this.onReset = this.onReset.bind(this);
    this.onSurveyEnd = this.onSurveyEnd.bind(this);
    this.onSurveyStart = this.onSurveyStart.bind(this);
    this.onFace = this.onFace.bind(this);
    this.mask_configuration = [];
    this.losingface = 0;

    this.faceDetection = new FaceMesh.FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });
    this.faceDetection.setOptions({
      selfieMode: false,
      maxNumFaces: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    // this.faceDetection.setOptions({
    //   model: "short",
    //   minDetectionConfidence: 0.5,
    // });
    this.faceDetection.onResults(this.onResults);
  }
  componentDidMount() {
    // this.loadModel();
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
      // start detect remote's face and process
      // this.showEmotion();
    });

    // audio recorder initialize
    this.localVideo.addEventListener("play", () => {
      let audio_track = this.localStream.getAudioTracks()[0];
      let audio_stream = new MediaStream();
      audio_stream.addTrack(audio_track);
      this.mediaRecorder = new MediaRecorder(audio_stream, {
        mimeType: "audio/webm",
      });
      this.chunks = [];
      // listen for data from media recorder
      this.mediaRecorder.ondataavailable = (e) => {
        // not record audio during survey
        if (e.data && e.data.size > 0 && !this.state.survey_in_progress) {
          this.chunks.push(e.data);
        }
      };
    });
  }
  componentWillUnmount() {
    this.props.media(null);
    if (this.localStream !== undefined) {
      this.localStream.getVideoTracks()[0].stop();
    }
    this.props.socket.emit("room-idle", { room: this.props.room });
    this.props.socket.emit("leave");
    clearInterval(this.timmer);
  }

  // async showEmotion() {
  //   console.log("++ showEmotion(): start face detection");
  //   // this.detections = this.detectFace();
  // }

  // survey progress control
  // 1. calculate finish time, for clock display
  // 2. update face mask setting and topic
  onSurveyEnd(data) {
    const { duration, stage } = data;
    this.survey_count += 1;
    this.setState({
      ...this.state,
      survey_in_progress: false,
    });
    let startTime = new Date().getTime();
    if (stage == 1) {
      this.endTime = startTime + 1000 * 31;
    }
    if (stage == 2) {
      this.endTime = startTime + 1000 * 60;
    }
    if (stage == 3) {
      this.endTime = startTime + 1000 * 90;
    }
    if (stage == 4) {
      this.endTime = startTime + 1000 * 0;
    }

    const controlData = this.state.controlData.mask;
    const topic = this.state.controlData.topic;
    console.log("print topic", topic);
    let new_topic;
    if (topic.length == 1) {
      new_topic = topic[0];
    } else {
      new_topic = topic[this.state.user == "host" ? 0 : 1];
    }
    console.log("survey-end", stage);
    if (stage != 4 && this.survey_count < 3) {
      this.setState({
        ...this.state,
        side_prompt: new_topic,
        stage: stage,
      });
    }

    setTimeout(() => {
      this.setState({
        ...this.state,
        visible: false,
        attention: loseface_notify,
      });
    }, 5000);
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

  // update sidebar prompt when survey start
  onSurveyStart() {
    this.setState({
      ...this.state,
      survey_in_progress: true,
      side_prompt: "We have some questions for you on Ipad",
    });
  }

  onResults(results) {
    // Draw the overlays.

    let lose_face_f = false;
    const canvasCtx = this.canvasRef.getContext("2d");
    if (results.multiFaceLandmarks) {
      if (results.multiFaceLandmarks.length < 1) {
        console.log("- unable to detect face ", this.losingface);
        if (this.state.survey_in_progress) {
          this.losingface += 0.03;
        } else {
          this.losingface += 0.08;
        }
        console.log("losing face", this.losingface);
        this.losingface %= 21; // why?
        if (this.losingface >= 10 && this.losingface < 20) {
          if (this.state.process) {
            // Restart whole process
            if (!lose_face_f) {
              lose_face_f = true;
              this.sendData("lose-face");
            }
          } else {
            if (!lose_face_f) {
              lose_face_f = true;
              this.sendData("room-idle");
            }
          }

          console.log("WARNING: Lost face tracking for more than 10 secs.");
        }
        if (this.losingface >= 20 && this.state.process) {
          // Restart whole process
          this.onReset();
          console.log("WARNING: Your partner seems to have left.");
        }
        if (this.losingface >= 20 && !this.state.process && !this.state.ready) {
          // Restart whole process
          this.props.socket.emit("room-idle", { room: this.props.room });
          console.log("The room seems to be idle.");
        }

        console.log(
          "WARNING: Can't detect face on remote side",
          this.losingface,
          this.state.process,
          this.state.ready
        );
      }
      for (const landmarks of results.multiFaceLandmarks) {
        if (landmarks[27].x > 0) {
          let user;
          if (this.state.user == "guest") {
            user = "host"; //why?
          } else {
            user = "guest";
          }
          this.props.socket.emit("face-detected", {
            room: this.props.room,
            user,
          });
          this.losingface = 0;
          if (lose_face_f) {
            this.sendData("recover");
            lose_face_f = false;
          }
        }

        this.canvasRef.width = 1280;
        this.canvasRef.height = 720;

        if (this.state.process) {
          canvasCtx.save();
          canvasCtx.clearRect(
            0,
            0,
            this.canvasRef.width,
            this.canvasRef.height
          );
          const {
            eyes: eyesCtrl,
            mouth: mouthCtrl,
            bar: barCtrl,
          } = this.props.controlParams.feature_show;
          canvasCtx.fillStyle = "black";
          if (this.state.stage > 1) {
            canvasCtx.fillRect(
              0,
              0,
              this.canvasRef.width,
              this.canvasRef.height
            );
          }

          if (eyesCtrl.toggle) {
            const mesh = landmarks;

            // Left eye bounds (top, left, bottom, right) are the points (27, 130, 23, 243)
            let lTop = mesh[27].y;
            let lLeft = mesh[130].x;
            let lBot = mesh[23].y;
            let lRig = mesh[243].x;
            let lWid = lRig - lLeft;
            let lHei = lBot - lTop;

            // Right eye bounds (top, left, bottom, right) are the points (257, 463, 253, 359)
            let rTop = mesh[257].y;
            let rLeft = mesh[463].x;
            let rBot = mesh[253].y;
            let rRig = mesh[359].x;
            let rWid = rRig - rLeft;
            let rHei = rBot - rTop;

            canvasCtx.clearRect(
              lLeft * this.canvasRef.width,
              lTop * this.canvasRef.height - 10,
              lWid * this.canvasRef.width,
              lHei * this.canvasRef.height + 10
            );

            canvasCtx.clearRect(
              rLeft * this.canvasRef.width,
              rTop * this.canvasRef.height - 10,
              rWid * this.canvasRef.width,
              rHei * this.canvasRef.height + 10
            );
          }

          if (mouthCtrl.toggle) {
            const mesh = landmarks;
            let mTop = mesh[0].y;
            let mLeft = mesh[76].x;
            let mBot = mesh[17].y;
            let mRig = mesh[291].x;
            let mWid = mRig - mLeft;
            let mHei = mBot - mTop;

            canvasCtx.clearRect(
              mLeft * this.canvasRef.width,
              mTop * this.canvasRef.height,
              mWid * this.canvasRef.width,
              mHei * this.canvasRef.height + 10
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
    }
    canvasCtx.restore();
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
    }
  }
  onReady() {
    console.log("on ready set state");
    this.setState({ ...this.state });
  }

  // accept start time, sync time same with server
  // 1. initilize emotion data variables, endtime(for clock)
  // 2. set up interval that count down the clock

  onProcessStart(data) {
    // hier weitermachen: find the main screen and figure out why it's not triggered by this

    const { startTime, duration, record_by_user, sessionId } = data;
    console.log("set intro invisible");
    console.log("process start", startTime, duration, sessionId);
    console.log("record", record_by_user, record_by_user[this.state.user]);
    if (!this.state.process) {
      //init
      this.record = {
        record_count: 0,
        record_detail: [],
      };
      this.emo_result = [];
      if (record_by_user[this.state.user]) {
        this.startRecording();
      }
      console.log("process start counting");
      this.process_duration = duration;
      this.endTime = startTime + 1000 * 31;

      // set interval
      this.timmer = setInterval(() => {
        let nowTime = new Date().getTime();
        let time_left;
        if (!this.state.survey_in_progress) {
          time_left = Math.round((this.endTime - nowTime) / 1000);
        }
        if (time_left < -5000) {
          clearInterval(this.timmer);
        } else if (!this.state.survey_in_progress & (time_left >= 0)) {
          this.setState({
            ...this.state,
            sessionId: startTime,
            process: true,
            recording: record_by_user[this.state.user],
            time_slot: this.state.time_slot + 1,
            time_diff: time_left,
          });
        }
      }, 1000);
    } else {
    }
  }

  onReset() {
    this.props.socket.emit("reset", { room: this.props.room });
  }
  // reset all parameters when process stop
  onProcessStop(data) {
    const { accident_stop } = data;
    if (this.state.recording) {
      this.stopRecording(accident_stop);
    }

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
      ready: false,
      topic: {
        content: "Welcome! Please have a seat.",
        visible: false,
      },
      intro: {
        content: introduction,
        visible: false,
      },
      survey_in_progress: false,
    });
    this.survey_count = 0;
    this.props.updateAll(init_mask);
    if (!accident_stop) {
      this.sendDataToServer();
      this.setState({
        ...this.state,
        loading: true,
      });
      setTimeout(() => {
        this.setState({
          ...this.state,
          loading: false,
        });
      }, 20000);
      this.record = {
        record_count: 0,
        record_detail: [],
      };
      this.emo_result = [];
    } else {
      this.record = {
        record_count: 0,
        record_detail: [],
      };
      this.emo_result = [];
    }
  }

  // get data from server, show results for users
  onUploadingFinish(data) {
    let partner = "host";
    if (this.state.user == "host") {
      partner = "guest";
    }
    const your_answers = data[this.state.user];
    const partner_answers = data[partner];
    let correct_count = 0;
    console.log("upload, ", data);
    for (let i = 0; i < 3; i++) {
      try {
        if (
          your_answers[i]["result"]["question2"] ==
          partner_answers[i]["result"]["question1"]
        ) {
          correct_count += 1;
        }
      } catch (err) {
        console.log("someone not pick one option");
      }
    }
    const survey_accuracy = `In the conversation, you made ${correct_count} over 3 correct guess `;
    this.setState({
      ...this.state,
      result: survey_accuracy,
    });
  }

  // update mask and topic and clock time for new stage, triggerred by server socket message
  //
  onStageControl(data) {
    console.log("- onStageControl()", data);

    if (this.state.stage != 0) {
      this.emo_result.push(this.record.record_detail);
      console.log("- stage control, ", this.state, this.emo_result);
    }
    this.record = {
      record_count: 0,
      record_detail: [],
    };
    console.log("stage control receiving", this.emo_result);
    const { mask, topic } = data;
    // update mask when stage change
    if (this.state.stage == 0) {
      const controlData = mask[this.state.user];
      if (topic.length == 1) {
        this.setState({
          ...this.state,
          side_prompt: topic[0],
          intro: {
            content: introduction,
            visible: false,
          },
        });
        setTimeout(() => {
          this.setState({
            ...this.state,
            visible: false,
            attention: loseface_notify,
          });
        }, 5000);
      }
      this.props.updateAll(controlData);
    }
    this.setState({
      ...this.state,
      stage: 1,
      time_slot: 0,
      controlData: {
        mask: mask[this.state.user],
        topic: topic,
      },
    });
  }

  // get setting and control(mask) data at the beginning of process
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

  // face detected event listener
  onFace(data) {
    if (this.state.user == data && !this.state.process) {
      this.setState({
        ...this.state,
        ready: true,
        intro: {
          ...this.state.intro,
          visible: true,
        },
      });
    }
  }

  // audio recording

  startRecording() {
    // e.preventDefault();
    if (RECORD_AUDIO) {
      // wipe old data chunks
      this.chunks = [];
      // start recorder with 10ms buffer
      this.mediaRecorder.start(10);
      // say that we're recording
      this.setState({ recording: true });
    } else {
      console.log("- AUDIO RECORDING IS DISABLED");
      this.setState({ recording: false });
    }
  }

  stopRecording(accident_stop) {
    // e.preventDefault();
    if (RECORD_AUDIO) {
      console.log("stopping recording");
      // stop the recorder
      this.mediaRecorder.stop();
      // say that we're not recording
      this.setState({ recording: false });
      // save the video to memory
      if (!accident_stop) {
        this.saveVideo();
      }
    }
  }

  saveVideo() {
    if (RECORD_VIDEO) {
      // convert saved chunks to blob
      const blob = new Blob(this.chunks, { type: "video/webm" });
      // generate video url from blob
      // const videoURL = window.URL.createObjectURL(blob);
      // append videoURL to list of saved videos for rendering
      let filename = this.state.sessionId + "_" + this.state.user;
      FileSaver.saveAs(blob, filename);
      // const videos = this.state.videos.concat([videoURL]);
      // this.setState({ videos });
    } else {
      console.log("- VIDEO RECORDING IS DISABLED");
    }
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
      // ctx.fillStyle = "black";
      // ctx.fillRect(0, 0, this.canvasRef.width, this.canvasRef.height);
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
    this.setState({ ...this.state, bridge: "host-hangup" });
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
  // transfer data from peers
  setupDataHandlers() {
    this.dc.onmessage = (e) => {
      var msg = JSON.parse(e.data);
      if (msg == "lose-face") {
        this.setState({
          ...this.state,
          visible: true,
          ready: this.state.process,
        });
      }
      if (msg == "recover") {
        this.setState({
          ...this.state,
          visible: false,
          ready: true,
        });
      }
      if (msg == "room-idle") {
        this.setState({
          ...this.state,
          ready: false,
        });
      }
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
    this.setState({ ...this.state, bridge: "guest-hangup" });
    this.pc.close();
    this.props.socket.emit("room-idle", { room: this.props.room });
    this.props.socket.emit("leave");
  }
  handleError(e) {
    console.log(e);
  }
  sendDataToServer() {
    let eresult = this.record;
    this.emo_result.push(this.record.record_detail);
    console.log("+ finish, sending data, ", this.emo_result, eresult);
    const emo_record = this.emo_result;
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
    try {
      // wait for local media to be ready
      const attachMediaIfReady = () => {
        this.dc = this.pc.createDataChannel("chat");
        this.setupDataHandlers();
        console.log("attachMediaIfReady");
        this.pc
          .createOffer({ iceRestart: true })
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
      this.pc.addEventListener("iceconnectionstatechange", (event) => {
        let pcstate = this.pc.iceConnectionState;
        console.log("iceconnection change ", pcstate);
        if (
          pcstate === "failed" ||
          pcstate === "closed" ||
          pcstate === "disconnected"
        ) {
          /* possibly reconfigure the connection in some way here */
          /* then request ICE restart */
          this.reconnecttimer = setInterval(() => {
            console.log("iceconnection trying to reconnect");
            location.reload();
          }, 5000);
        } else {
          clearInterval(this.reconnecttimer);
        }
      });
      // when our browser gets a candidate, send it to the peer
      this.pc.onicecandidate = (e) => {
        // console.log(e, "onicecandidate");
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
        console.log("sending cam");
        console.log("setting camera");

        setInterval(async () => {
          await this.faceDetection.send({
            image: this.remoteVideo,
          });
        }, 100);
        // this.camera = new Camera(this.remoteVideo, {
        //   onFrame: async () => {
        //     await this.faceDetection.send({
        //       image: this.remoteVideo,
        //     });
        //   },
        //   width: 1280,
        //   height: 720,
        // });
        // this.camera.start();
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
    } catch (error) {
      console.log("ERROR: Could not init WebRTC", error);
    }
  }
  // components: SideBar, Clock, GYModal(popup window, loseface attention), Introduction, Introduction when face detected, Thankyou, local and remote video
  render() {
    return (
      <div className={`media-bridge ${this.state.bridge}`}>
        <canvas className="canvas" ref={(ref) => (this.canvasRef = ref)} />
        {this.state.process && (
          <SideBar
            stage={this.state.stage}
            side_prompt={this.state.side_prompt}
          />
        )}
        {/* No face detected, showing introduction */}
        {!this.state.intro.visible && !this.state.process && <Introduction />}
        {/* Face detected before process showing details */}
        {this.state.intro.visible && !this.state.process && <IntroFaceDetect />}
        {this.state.loading && <Thankyou result={this.state.result} />}

        {this.state.process && (
          <div className="clock">
            <Clock
              time_diff={this.state.time_diff}
              end={this.state.survey_in_progress}
            ></Clock>
          </div>
        )}

        <GYModal title="Attention" visible={this.state.visible}>
          <h1 style={{ color: "white" }}>{this.state.attention}</h1>
        </GYModal>

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
