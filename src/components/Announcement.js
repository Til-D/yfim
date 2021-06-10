import React, { useEffect, useState } from "react";

function Announcement(props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "black",
        zIndex: 30,
        height: "100%",
        width: "100%",
      }}
    >
      <div>Hello, here are some questions for you</div>
      <button>Start</button>
    </div>
  );
}
export default Announcement;
