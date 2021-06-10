import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { surveyJSON } from "./Survey_JSON";
import * as Survey from "survey-react";
import "survey-react/survey.css";
import Announcement from "./Announcement";

function SurveyPage(props) {
  const [surveyOn, setSurveyOn] = useState(false);
  const [faceOn, setFaceOn] = useState(false);
  const [stage, setStage] = useState("Start");
  const { room, user } = props.match.params;
  const socket = io.connect({ transports: ["websocket"], upgrade: false });

  socket.emit("survey-connect", {
    room: props.match.params.room,
    user: props.match.params.user,
  });
  socket.on("survey-start", () => {
    setSurveyOn(true);
  });
  socket.on("face-detected", () => {
    console.log("face detected");
    setFaceOn(true);
  });
  socket.on("process-start", () => {
    setStage("Conversation is in progress...");
  });
  socket.on("process-stop", () => {
    setStage("Start");
    setSurveyOn(false);
    setFaceOn(false);
  });
  socket.on("reset", () => {
    setStage("Start");
    setSurveyOn(false);
  });
  // socket.join(props.match.params.room);
  // Need to move this to control panel

  useEffect(() => {});
  function sendReadyToServer() {
    socket.emit("process-ready", { room, user });
    setStage("Waiting remote partner...");
  }
  Survey.StylesManager.applyTheme("winter");
  const model = new Survey.Model(surveyJSON);
  console.log(model);
  function sendDataToServer(survey) {
    //   callback function
    setSurveyOn(false);
    let mydate = new Date();
    var datestr = "";
    datestr +=
      mydate.getHours() + "/" + mydate.getMinutes() + "/" + mydate.getSeconds();

    const sendData = {
      user: user,
      submit_time: datestr,
      result: survey.data,
    };
    socket.emit("survey-end", {
      room: props.match.params.room,
      data: sendData,
    });
  }
  return (
    <div>
      {faceOn && !surveyOn && (
        <Announcement handler={sendReadyToServer} stage={stage} />
      )}

      {/* <button onClick={restart} className="primary-button">
        Survey On
      </button> */}
      {surveyOn && (
        <Survey.Survey
          model={model}
          isExpanded={true}
          onComplete={sendDataToServer}
        />
      )}
    </div>
  );
}
export default SurveyPage;
