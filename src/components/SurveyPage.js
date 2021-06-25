import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { surveyJSON } from "./Survey_JSON";
import { survey_Final } from "./Survey_Final";
import * as Survey from "survey-react";
import "survey-react/survey.css";
import Announcement from "./Announcement";

function SurveyPage(props) {
  const [surveyOn, setSurveyOn] = useState(false);
  const [faceOn, setFaceOn] = useState(false);
  const [content, setContent] = useState("Start");
  const [stage, setStage] = useState(0);
  const { room, user } = props.match.params;
  const [answer, setAnswer] = useState([]);
  const [socket_s, setSocket] = useState();

  useEffect(() => {
    const socket = io.connect();
    socket.emit("survey-connect", {
      room: props.match.params.room,
      user: props.match.params.user,
    });
    socket.on("room-idle", () => {
      console.log("room is idle now");
      resetParams();
    });
    socket.on("survey-start", (data) => {
      const { stage } = data;
      setStage(stage);
      setSurveyOn(true);
    });
    socket.on("face-detected", () => {
      console.log("face detected");
      setFaceOn(true);
    });
    socket.on("process-start", () => {
      console.log("process start");
      setContent("Conversation is in progress...");
    });
    socket.on("process-stop", (data) => {
      const { accident_stop } = data;
      if (!accident_stop) {
        console.log("process-stop", answer);
        socket.emit("data-send", {
          data_type: "question",
          room,
          user,
          data: answer,
        });
      }

      setAnswer([]);
      resetParams();
    });
    socket.on("reset", () => {
      resetParams();
    });
    setSocket(socket);
  }, []);

  function resetParams() {
    setContent("Start");
    setStage(0);
    setSurveyOn(false);
    setFaceOn(false);
  }

  function sendReadyToServer() {
    socket_s.emit("process-ready", { room, user });
    setContent("Waiting remote partner...");
  }
  // socket.join(props.match.params.room);
  // Need to move this to control panel

  Survey.StylesManager.applyTheme("winter");
  const model = new Survey.Model(surveyJSON);
  const final_model = new Survey.Model(survey_Final);

  function sendDataToServer(survey) {
    //   callback function
    setSurveyOn(false);
    socket.emit("survey-end", {
      room,
      user,
    });
    let curr_answer = answer;
    curr_answer.push(survey.data);
    setAnswer(curr_answer);
  }

  return (
    <div>
      {faceOn && !surveyOn && (
        <Announcement handler={sendReadyToServer} stage={content} />
      )}

      {/* <button onClick={restart} className="primary-button">
        Survey On
      </button> */}
      {surveyOn && stage != 4 && (
        <Survey.Survey
          model={model}
          isExpanded={true}
          onComplete={sendDataToServer}
        />
      )}
      {surveyOn && stage == 4 && (
        <Survey.Survey
          model={final_model}
          isExpanded={true}
          onComplete={sendDataToServer}
        />
      )}
    </div>
  );
}
export default SurveyPage;
