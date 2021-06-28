import React, { useEffect, useState } from "react";

function Announcement(props) {
  const [rating, setRating] = useState("general");
  const onSubmit = props.handler(rating);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "black",
        zIndex: 100,
        height: "100%",
        width: "100%",
        position: "fixed",
      }}
    >
      <div>
        <h>Introduction</h>
        <p>This experience will go for 5 minutes broken into 3 sections</p>
        <p>
          During each section you will receive a talking prompt and a survey
          question to answer on this ipad
        </p>
      </div>

      <button onClick={onSubmit}>{props.stage}</button>
    </div>
  );
}
export default Announcement;
