import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { surveyJSON } from "./Survey_JSON";
import * as Survey from "survey-react";

function SurveyPage(props) {
  const [surveyOn, setSurveyOn] = useState(true);
  const [user, setUser] = useState("host");
  console.log("survey", props);
  const socket = io.connect();
  // Need to move this to control panel
  const handleStart = () => {
    socket.emit("survey-start", { room: props.match.params.room });
  };
  const restart = () => {
    setSurveyOn(true);
  };

  Survey.StylesManager.applyTheme("winter");
  const model = new Survey.Model(surveyJSON);
  console.log(model);
  console.log(surveyJSON);
  function sendDataToServer(survey) {
    //   callback function
    setSurveyOn(false);
    alert("The results are:" + JSON.stringify(survey.data));
    let mydate = new Date();
    var datestr = "";
    datestr +=
      mydate.getHours() + "/" + mydate.getMinutes() + "/" + mydate.getSeconds();

    const sendData = {
      user: user,
      submit_time: datestr,
      result: survey.data,
    };
    console.log("emit");
    socket.emit("survey-end", {
      room: props.match.params.room,
      data: sendData,
    });
  }
  return (
    <div>
      <div>Control Tools</div>
      <div>Hello, welcome to {props.match.params.room}</div>
      <button onClick={handleStart} className="primary-button">
        Survey Start
      </button>
      <button onClick={restart} className="primary-button">
        Survey On
      </button>
      {surveyOn && (
        <Survey.Survey model={model} onComplete={sendDataToServer} />
      )}
    </div>
  );
}
export default SurveyPage;
