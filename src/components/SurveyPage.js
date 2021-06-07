import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { surveyJSON } from "./Survey_JSON";
import * as Survey from "survey-react";
import "survey-react/survey.css";

function SurveyPage(props) {
  const [surveyOn, setSurveyOn] = useState(true);
  const [user, setUser] = useState("host");
  const socket = io.connect({ transports: ["websocket"], upgrade: false });
  socket.emit("survey-connect", {
    room: props.match.params.room,
    user: props.match.params.user,
  });
  socket.on("survey-start", () => {
    setSurveyOn(true);
  });
  // socket.join(props.match.params.room);
  // Need to move this to control panel

  useEffect(() => {});

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
      <div>Hello, here are some questions for you</div>

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
